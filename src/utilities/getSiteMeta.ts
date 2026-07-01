import { cache } from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Locale } from '@/app/lib/localization/i18n'
import type { WebInfo } from '@/payload-types'
import { SITE_NAME } from '@/utilities/seo'

export type SiteMeta = {
  /** Brand/site name from the `web-info` global (falls back to the SITE_NAME constant). */
  siteName: string
  /** Localized SEO title from the `web-info` global (falls back to null). */
  title: string | null
  /** Localized site-wide default description from the `web-info` global. */
  description: string | null
  /** Site-wide default event location, used as a fallback for Event structured data. */
  defaultLocation: WebInfo['defaultLocation'] | null
}

/**
 * Read the brand name and the locale's default title/description from the
 * `web-info` global. Memoized per request via React `cache`; statically
 * generated pages pick up changes through the existing path-based revalidation
 * on the global.
 */
export const getSiteMeta = cache(async (locale: Locale): Promise<SiteMeta> => {
  const payload = await getPayload({ config: configPromise })
  const webInfo = await payload
    .findGlobal({ slug: 'web-info', depth: 0 })
    .catch(() => null)

  const siteName = webInfo?.siteName?.trim() || SITE_NAME

  const siteTitle = webInfo?.siteTitle
  const title =
    siteTitle && typeof siteTitle === 'object'
      ? siteTitle[locale]?.trim() || null
      : null

  const siteDescription = webInfo?.siteDescription
  const description =
    siteDescription && typeof siteDescription === 'object'
      ? siteDescription[locale] ?? null
      : null

  const defaultLocation = webInfo?.defaultLocation ?? null

  return { siteName, title, description, defaultLocation }
})
