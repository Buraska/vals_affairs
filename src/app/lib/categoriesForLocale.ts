import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Category } from '@/payload-types'
import type { Locale } from '@/app/lib/localization/i18n'

/**
 * Fetches root categories that have a translation (non-empty title) for the given locale.
 */
export async function getCategoriesForLocale(locale: Locale): Promise<Category[]> {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'category',
    depth: 1,
    overrideAccess: false,
    locale,
    where: {
      'parent category': { exists: false },
    },
  })
  return result.docs.filter((doc) => doc.title != null && String(doc.title).trim() !== '')
}
