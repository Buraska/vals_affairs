import type { Payload } from 'payload'
import type { Affair, Category } from '@/payload-types'

type CollectionMap = {
  Affair: Affair
  category: Category
}

type ResolveResult<T> = {
  doc: T
  /** True when matched by slug; false when matched by legacy id (caller should redirect). */
  matchedBySlug: boolean
}

/**
 * Resolve a document by its `slug`, falling back to a legacy id lookup.
 *
 * When a record is matched by id (an old URL), `matchedBySlug` is false so the
 * caller can issue a permanent redirect to the canonical slug URL.
 */
export async function resolveBySlugOrId<C extends keyof CollectionMap>({
  payload,
  collection,
  param,
  locale,
}: {
  payload: Payload
  collection: C
  param: string
  locale: string
}): Promise<ResolveResult<CollectionMap[C]> | null> {
  const bySlug = await payload.find({
    collection,
    where: { slug: { equals: param } },
    depth: 1,
    limit: 1,
    locale: locale as never,
  })

  if (bySlug.docs.length > 0) {
    return { doc: bySlug.docs[0] as CollectionMap[C], matchedBySlug: true }
  }

  const byId = await payload
    .findByID({ collection, id: param, depth: 1, locale: locale as never })
    .catch(() => null)

  if (byId) {
    return { doc: byId as CollectionMap[C], matchedBySlug: false }
  }

  return null
}
