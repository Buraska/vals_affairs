import { Affair, Category, Tag, TagGroup, Team } from "@/payload-types";
import { revalidatePath } from "next/cache";
import { CollectionAfterChangeHook } from "payload";
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
    categoryIdsSet.add(typeof cat === "string" ? cat : cat.id);
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
  const ids = list.map((d) => (typeof d === "string" ? d : d.id));
  const { docs: fetched } = await payload.find({
    collection: "Affair",
    where: { id: { in: ids } },
    depth: 1,
    limit: ids.length,
  });
  return (fetched ?? []) as Affair[];
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
  const ids = list.map((d) => (typeof d === "string" ? d : d.id));
  const { docs: fetched } = await payload.find({
    collection: "tag",
    where: { id: { in: ids } },
    depth: 1,
    limit: ids.length,
  });
  return (fetched ?? []) as Tag[];
}

function revalidateCategoryIds(categoryIds: Set<string>, locale: string): void {
  categoryIds.forEach((id) => revalidatePath(`/${locale}/category/${id}`));
}

export const afterChangeHookAffair: CollectionAfterChangeHook<Affair> = async ({
  doc,
  previousDoc,
  req,
}) => {
  revalidatePath(`/${req.locale}/affair/${doc.id}`);
  revalidatePath(`/${req.locale}/affair/${doc.id}/order`);
  revalidatePath(`/${req.locale}/category/${doc.category}`);

  const prevCat = previousDoc?.category;
  if (prevCat !== undefined && prevCat !== doc.category) {
    revalidatePath(`/${req.locale}/category/${typeof prevCat === "string" ? prevCat : prevCat.id}`);
  }
};

export const afterChangeHookCategory: CollectionAfterChangeHook<Category> = async ({
  doc,
  req,
}) => {
  revalidatePath(`/${req.locale}/category/${doc.id}`);
  revalidatePath(`/${req.locale}`, "layout");
  revalidatePath(`/${req.locale}`);
};

export const afterChangeHookTeam: CollectionAfterChangeHook<Team> = async () => {
  for (const locale of locales) {
    revalidatePath(`/${locale}`);
  }
};


export const afterChangeHookTag: CollectionAfterChangeHook<Tag> = async ({
  doc,
  previousDoc,
  req,
}) => {
  const affairs = await getAffairsFromId(req.payload, (doc.affairs?.docs ?? []).concat( previousDoc?.affairs?.docs ?? []));

  const categoryIds = new Set<string>();
  addCategoriesOfAffairs(affairs, categoryIds);
  revalidateCategoryIds(categoryIds, req.locale ?? defaultLocale);
};

export const afterChangeHookTagGroup: CollectionAfterChangeHook<TagGroup> = async ({
  doc,
  previousDoc,
  req,
}) => {
  const currentTagsIds = doc.tagGroup?.docs ?? [];
  const previousTagsIds = previousDoc?.tagGroup?.docs ?? [];
  const allTagsIds = [...currentTagsIds, ...previousTagsIds];
  const allTags = await getTagsFromIds(req.payload, allTagsIds)

  const categoryIds = new Set<string>();
  for (const t of allTags) {
    if (!isTag(t)) continue;
    addCategoriesOfAffairs(t.affairs?.docs?.filter(isAffair) ?? [], categoryIds);
  }
  revalidateCategoryIds(categoryIds, req.locale ?? defaultLocale);
};