import { Affair, Category, Tag, TagGroup, Team } from "@/payload-types";
import { revalidatePath } from "next/cache";
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload";
import { defaultLocale, locales } from "@/app/lib/localization/i18n";

function isAffair(doc: string | Affair): doc is Affair {
  return typeof doc !== "string";
}

function isTag(doc: string | Tag): doc is Tag {
  return typeof doc !== "string";
}

function addCategoriesOfAffairs(affairs: Affair[], categoryIdsSet: Set<string>): Set<string> {
  for (const a of affairs) {
    if (!isAffair(a)) continue;
    const cat = a.category;
    if (cat != null) categoryIdsSet.add(typeof cat === "string" ? cat : cat.id);
  }
  return categoryIdsSet;
}

/** Resolve affair refs to Affair[]: use as-is if populated, else fetch by ID. */
async function getAffairsFromId(
  payload: import("payload").Payload,
  docs: (string | Affair)[] | undefined
): Promise<Affair[]> {
  const list = docs ?? [];
  if (list.length === 0) return [];
  const populated = list.filter((d): d is Affair => typeof d !== "string");
  if (populated.length === list.length) return populated;
  const ids = list.map((d) => (typeof d === "string" ? d : d?.id)).filter((id): id is string => id != null);
  if (ids.length === 0) return [];
  const { docs: fetched } = await payload.find({
    collection: "Affair",
    where: { id: { in: ids } },
    depth: 1,
    limit: ids.length,
  });
  return ((fetched ?? []).filter((x): x is Affair => x != null)) as Affair[];
}

/** Resolve tag refs to Tag[]: use as-is if populated, else fetch by ID. */
async function getTagsFromIds(
  payload: import("payload").Payload,
  docs: (string | Tag)[] | undefined
): Promise<Tag[]> {
  const list = docs ?? [];
  if (list.length === 0) return [];
  const populated = list.filter((d): d is Tag => typeof d !== "string");
  if (populated.length === list.length) return populated;
  const ids = list.map((d) => (typeof d === "string" ? d : d?.id)).filter((id): id is string => id != null);
  if (ids.length === 0) return [];
  const { docs: fetched } = await payload.find({
    collection: "tag",
    where: { id: { in: ids } },
    depth: 1,
    limit: ids.length,
  });
  return ((fetched ?? []).filter((x): x is Tag => x != null)) as Tag[];
}

function revalidateCategoryIds(categoryIds: Set<string>, locale: string): void {
  categoryIds.forEach((id) => revalidatePath(`/${locale}/category/${id}`));
}

function getCategoryIdFromRef(ref: string | Category | null | undefined): string | null {
  if (ref == null) return null;
  return typeof ref === "string" ? ref : ref.id ?? null;
}

function revalidateAffairPaths(locale: string, affairId: string, categoryRef: string | Category | null | undefined): void {
  revalidatePath(`/${locale}/affair/${affairId}`);
  revalidatePath(`/${locale}/affair/${affairId}/order`);
  const catId = getCategoryIdFromRef(categoryRef);
  if (catId) revalidatePath(`/${locale}/category/${catId}`);
}

function revalidateCategoryPaths(locale: string, categoryId: string): void {
  revalidatePath(`/${locale}/category/${categoryId}`);
  revalidatePath(`/${locale}`, "layout");
  revalidatePath(`/${locale}`);
}

function revalidateAllLocaleRoots(): void {
  for (const locale of locales) {
    revalidatePath(`/${locale}`);
  }
}

async function collectCategoryIdsFromAffairDocs(
  payload: import("payload").Payload,
  affairDocs: (string | Affair)[] | undefined
): Promise<Set<string>> {
  const affairs = await getAffairsFromId(payload, affairDocs);
  const categoryIds = new Set<string>();
  addCategoriesOfAffairs(affairs, categoryIds);
  return categoryIds;
}

async function collectCategoryIdsFromTagGroupDocs(
  payload: import("payload").Payload,
  tagDocs: (string | Tag)[]
): Promise<Set<string>> {
  const allTags = await getTagsFromIds(payload, tagDocs);
  const categoryIds = new Set<string>();
  for (const t of allTags) {
    if (!isTag(t)) continue;
    const affairs = await getAffairsFromId(payload, t.affairs?.docs);
    addCategoriesOfAffairs(affairs, categoryIds);
  }
  return categoryIds;
}

export const afterChangeHookAffair: CollectionAfterChangeHook<Affair> = async ({
  doc,
  previousDoc,
  req,
}) => {
  const locale = req.locale ?? defaultLocale;
  revalidateAffairPaths(locale, doc.id, doc.category);
  const prevCat = previousDoc?.category;
  if (prevCat !== undefined && prevCat !== doc.category) {
    const prevCatId = getCategoryIdFromRef(prevCat);
    if (prevCatId) revalidatePath(`/${locale}/category/${prevCatId}`);
  }
};

export const afterDeleteHookAffair: CollectionAfterDeleteHook<Affair> = async ({ doc, req }) => {
  revalidateAffairPaths(req.locale ?? defaultLocale, doc.id, doc.category);
};

export const afterChangeHookCategory: CollectionAfterChangeHook<Category> = async ({
  doc,
  req,
}) => {
  revalidateCategoryPaths(req.locale ?? defaultLocale, doc.id);
};

export const afterDeleteHookCategory: CollectionAfterDeleteHook<Category> = async ({ doc, req }) => {
  revalidateCategoryPaths(req.locale ?? defaultLocale, doc.id);
};

export const afterChangeHookTeam: CollectionAfterChangeHook<Team> = async () => {
  revalidateAllLocaleRoots();
};

export const afterDeleteHookTeam: CollectionAfterDeleteHook<Team> = async () => {
  revalidateAllLocaleRoots();
};


export const afterChangeHookTag: CollectionAfterChangeHook<Tag> = async ({
  doc,
  previousDoc,
  req,
}) => {
  const affairDocs = (doc.affairs?.docs ?? []).concat(previousDoc?.affairs?.docs ?? []);
  const catIds = await collectCategoryIdsFromAffairDocs(req.payload, affairDocs);
  revalidateCategoryIds(catIds, req.locale ?? defaultLocale);
};

export const afterDeleteHookTag: CollectionAfterDeleteHook<Tag> = async ({ doc, req }) => {
  const catIds = await collectCategoryIdsFromAffairDocs(req.payload, doc.affairs?.docs);
  revalidateCategoryIds(catIds, req.locale ?? defaultLocale);
};

export const afterChangeHookTagGroup: CollectionAfterChangeHook<TagGroup> = async ({
  doc,
  previousDoc,
  req,
}) => {
  const tagDocs = [...(doc.tagGroup?.docs ?? []), ...(previousDoc?.tagGroup?.docs ?? [])];
  const catIds = await collectCategoryIdsFromTagGroupDocs(req.payload, tagDocs);
  revalidateCategoryIds(catIds, req.locale ?? defaultLocale);
};

export const afterDeleteHookTagGroup: CollectionAfterDeleteHook<TagGroup> = async ({ doc, req }) => {
  const tagDocs = doc.tagGroup?.docs ?? [];
  const catIds = await collectCategoryIdsFromTagGroupDocs(req.payload, tagDocs);
  revalidateCategoryIds(catIds, req.locale ?? defaultLocale);
};