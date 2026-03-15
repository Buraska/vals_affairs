import { Affair, Category, Tag, TagGroup } from "@/payload-types";
import { revalidatePath, revalidateTag } from "next/cache";
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from "payload";
import { defaultLocale } from "@/app/lib/localization/i18n";
import {
  collectCategoryIdsFromAffairDocs,
  collectCategoryIdsFromTagGroupDocs,
  getCategoryIdFromRef,
  revalidateAffairPaths,
  revalidateCategoryIds,
  revalidateCategoryPaths,
  revalidateAllLocaleRoots,
} from "./hookUtility";

// Globals
export const afterChangeHookTeam: GlobalAfterChangeHook = async () => {
  revalidateAllLocaleRoots();
};

export const afterChangeHookAboutUs: GlobalAfterChangeHook = async ({req}) => {
  const locale = req.locale ?? defaultLocale;
  revalidatePath(`/${locale}/about`)
}

export const afterChangeHookWebInfo: GlobalAfterChangeHook = async () => {
  revalidateAllLocaleRoots()
}

export const afterChangeHookTerms: GlobalAfterChangeHook = async ({req}) => {
  const locale = req.locale ?? defaultLocale;
  revalidatePath(`/${locale}/terms`)
}

//Collections
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