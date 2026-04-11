import { Affair, Category, Tag, TagGroup, Ticket, Order as OrderType} from "@/payload-types";
import { revalidatePath} from "next/cache";
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
  revalidateGalleryPaths,
  revalidateAllLocalesWithPaths,
} from "./hookUtility";
import { buildOrderStatusEmailHtml, buildOrderStatusEmailText } from "@/app/lib/MailTemlates/orderStatusEmailTemplate";
import { getTranslations, Lang } from "../localization/translations";


export const afterChangeHookOrder: CollectionAfterChangeHook<OrderType> = async ({
  doc,
  previousDoc,
  operation,
  req,
  context,
}) => {
  if (operation !== 'update') return
  if (!previousDoc) return
  if (context?.skipStatusEmail) return
  if (previousDoc.status === doc.status) return

  const locale = (doc.locale ?? 'ee') as Lang
  const t = getTranslations(locale).orderEmail

  const customerEmail = doc.customer?.email
  const customerName = doc.customer?.name ?? ''
  const customerPhone = doc.customer?.phone ?? ''
  if (!customerEmail) return

  const affairId = (typeof doc.affair === 'string' ? doc.affair : doc.affair?.title) ?? ""
  const affair = await req.payload.findByID({
    collection: 'Affair',
    id: affairId,
    locale
  })

  const webInfo = await req.payload.findGlobal({
    slug: 'web-info',
    locale,
    depth: 0,
    overrideAccess: true,
    req,
  })

  const items =
    doc.items?.map((i) => ({
      ticketName: i.ticketName ?? '',
      qty: i.qty ?? 0,
      subtotal: i.subtotal ?? 0,
    })) ?? []

  const mailParams = {
    locale: locale as any,
    orderRef: doc.orderRef ?? doc.id,
    statusPrev: String(previousDoc.status ?? ''),
    statusNext: String(doc.status ?? ''),
    updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    affairTitle: affair.title ?? '',
    customerName,
    customerEmail,
    customerPhone,
    items,
    total: doc.amounts?.total ?? 0,
    currency: doc.amounts?.currency ?? 'EUR',
    paymentMethod: String(doc.payment?.method ?? ''),
    transactionId: doc.payment?.transactionId ?? null,
    provider: doc.payment?.provider ?? null,
    paidAt: doc.payment?.paidAt ?? null,
    branding: {
      siteName: webInfo.siteName,
      email: webInfo.email,
      phone: webInfo.phone,
    },
  }
  const html = buildOrderStatusEmailHtml(mailParams)
  const text = buildOrderStatusEmailText(mailParams)
  
  let mailErr = null;

  try {
    await req.payload.sendEmail({
      from: 'The Next Chance <no-reply@thenextchance.eu>',
      to: customerEmail,
      subject: `${t.statusUpdateTitle}: ${doc.orderRef ?? doc.id}`.slice(0, 250),
      html,
      text,
    })

  } catch (err) {
    mailErr = String(err)
  }
  doc.statusEmail = {
    lastSentAt: new Date().toISOString(),
    lastError: mailErr,
    lastStatus: String(doc.status ?? ''),
  }
}

// Globals
export const afterChangeHookTeam: GlobalAfterChangeHook = async () => {
  revalidateAllLocaleRoots();
};

export const afterChangeHookAboutUs: GlobalAfterChangeHook = async ({req}) => {
  revalidateAllLocaleRoots()
  revalidateAllLocalesWithPaths("about")
}

export const afterChangeHookWebInfo: GlobalAfterChangeHook = async () => {
  revalidateAllLocaleRoots()
}

export const afterChangeHookBankCredentials: GlobalAfterChangeHook = async () => {
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
  revalidateAffairPaths(doc.id, doc.category);
  const prevCat = previousDoc?.category;
  if (prevCat !== undefined && prevCat !== doc.category) {
    const prevCatId = getCategoryIdFromRef(prevCat);
    if (prevCatId) revalidatePath(`/${locale}/category/${prevCatId}`);
  }
};

export const afterDeleteHookAffair: CollectionAfterDeleteHook<Affair> = async ({ doc, req }) => {
  revalidateAffairPaths(doc.id, doc.category);
};

export const afterChangeHookTicket: CollectionAfterChangeHook<Ticket> = async ({doc, previousDoc, req}) => {
  const affairDocs = (doc.affairs?.docs ?? []).concat(previousDoc?.affairs?.docs ?? []);

  affairDocs.forEach((affairId) => {
    
    if (typeof(affairId) === 'string' && req.locale) revalidateAffairPaths(affairId, null)
    else console.log("afterChangeHookTicket error.")
  })
};

export const afterDeleteHookTicket: CollectionAfterDeleteHook<Ticket> = async ({doc, req}) => {
  doc.affairs?.docs?.forEach((affairId) => {

    if (typeof(affairId) === 'string' && req.locale) revalidateAffairPaths(affairId, null)
    else console.log("afterChangeHookTicket error.")})
}

export const afterChangeHookCategory: CollectionAfterChangeHook<Category> = async ({
  doc,
  req,
}) => {
  revalidateCategoryPaths(req.locale ?? defaultLocale, doc.id);
};

export const afterDeleteHookCategory: CollectionAfterDeleteHook<Category> = async ({ doc, req }) => {
  revalidateAllLocaleRoots()
  revalidateAllLocalesWithPaths(`category/${doc.id}`)
};

export const afterChangeHookGallery: CollectionAfterChangeHook = async () => {
  revalidateGalleryPaths()
}

export const afterDeleteHookGallery: CollectionAfterDeleteHook = async () => {
  revalidateGalleryPaths()
}


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