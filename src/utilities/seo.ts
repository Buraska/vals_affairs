import type { Metadata } from 'next'
import type { Affair, Category, Media } from '@/payload-types'
import { lexicalToPlainText } from '@/utilities/lexicalToPlainText'
import { pickMediaSize } from '@/utilities/pickMediaSize'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { getServerSideURL } from '@/utilities/getURL'
import { defaultLocale, HTML_LANG, locales } from '@/app/lib/localization/i18n'

/** Ultimate brand fallback when the web-info global is unavailable. */
export const SITE_NAME = 'Vals'

/** Ultimate description fallback when the web-info global is unavailable. */
export const SITE_DESCRIPTION = 'Tours and celebrations in Estonia.'

/** Default OG/share image used when nothing more specific is available. */
export const DEFAULT_OG_IMAGE = '/og-image.jpg'

/** Recommended max length for a meta description before it gets truncated in SERPs. */
const MAX_DESCRIPTION_LENGTH = 160

/** OpenGraph locale codes keyed by our internal locale slugs. */
const OG_LOCALES: Record<string, string> = {
  ee: 'et_EE',
  ru: 'ru_RU',
  en: 'en_US',
  fi: 'fi_FI',
}

export function toOgLocale(locale: string): string {
  return OG_LOCALES[locale] ?? OG_LOCALES.ee
}

/**
 * Build canonical + hreflang alternates for a route.
 *
 * `pathWithoutLocale` is the path after the locale segment (e.g. `/affair/123`);
 * pass an empty string for the home page. Every locale gets a language alternate
 * keyed by its BCP-47 code, and the default locale doubles as `x-default`.
 */
export function buildAlternates(
  currentLocale: string,
  pathWithoutLocale = '',
): Metadata['alternates'] {
  const base = getServerSideURL()
  const path =
    pathWithoutLocale && !pathWithoutLocale.startsWith('/')
      ? `/${pathWithoutLocale}`
      : pathWithoutLocale

  const languages: Record<string, string> = {}
  for (const loc of locales) {
    languages[HTML_LANG[loc] ?? loc] = `${base}/${loc}${path}`
  }
  languages['x-default'] = `${base}/${defaultLocale}${path}`

  return {
    canonical: `${base}/${currentLocale}${path}`,
    languages,
  }
}

function truncate(text: string, max = MAX_DESCRIPTION_LENGTH): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return `${clean.slice(0, max - 3).trimEnd()}...`
}

function isMedia(value: unknown): value is Media {
  return typeof value === 'object' && value != null
}

type ResolvedImage = {
  url: string
  width?: number
  height?: number
  alt?: string
}

/**
 * Resolve the OG image for an affair following the precedence:
 * meta.image override -> first gallery image -> none (caller falls back to site default).
 */
function resolveAffairImage(affair: Affair): ResolvedImage | null {
  const candidates: (Media | null)[] = []

  if (isMedia(affair.meta?.image)) candidates.push(affair.meta.image)

  const firstGallery = affair.images?.find((entry) => isMedia(entry?.image))?.image
  if (isMedia(firstGallery)) candidates.push(firstGallery)

  for (const media of candidates) {
    if (!media) continue
    const picked = pickMediaSize(media, 'large')
    const url = getMediaUrl(picked.url)
    if (url) {
      return {
        url,
        width: picked.width || undefined,
        height: picked.height || undefined,
        alt: media.alt ?? undefined,
      }
    }
  }

  return null
}

/**
 * Build Next.js metadata for an affair page.
 *
 * Precedence for every field: the plugin-seo `meta.*` override (set by an editor)
 * -> the affair's own content (auto) -> the site-wide default from `web-info`.
 * The same title/description/image are reused for the OpenGraph and Twitter cards.
 */
export function buildAffairMetadata({
  affair,
  locale,
  siteName,
  defaultDescription,
}: {
  affair: Affair
  locale: string
  /** Brand name, sourced from the `web-info` global. */
  siteName: string
  /** Site-wide default description, sourced from the `web-info` global. */
  defaultDescription?: string | null
}): Metadata {
  const categoryTitle =
    typeof affair.category === 'object' && affair.category != null
      ? affair.category.title
      : null

  const title = affair.meta?.title || `${affair.title} | ${siteName}`

  const autoDescription = truncate(lexicalToPlainText(affair.description))
  const description =
    affair.meta?.description || autoDescription || defaultDescription || undefined

  const image = resolveAffairImage(affair)
  const imageUrl = image?.url || `${getServerSideURL()}${DEFAULT_OG_IMAGE}`
  const images = [
    { url: imageUrl, width: image?.width, height: image?.height, alt: image?.alt },
  ]

  const affairSlug = affair.slug ?? affair.id
  const url = `${getServerSideURL()}/${locale}/affair/${affairSlug}`

  return {
    // `absolute` bypasses the layout's title template so the brand isn't duplicated.
    title: { absolute: title },
    description,
    alternates: buildAlternates(locale, `/affair/${affairSlug}`),
    openGraph: {
      type: 'website',
      title,
      description,
      url,
      siteName,
      locale: toOgLocale(locale),
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.map((i) => i.url),
    },
  }
}

/**
 * Resolve the OG image for a category following the precedence:
 * meta.image override -> the category's own image -> none (caller falls back to
 * the site default).
 */
function resolveCategoryImage(category: Category): ResolvedImage | null {
  const candidates: (Media | null)[] = []

  if (isMedia(category.meta?.image)) candidates.push(category.meta.image)
  if (isMedia(category.image)) candidates.push(category.image)

  for (const media of candidates) {
    if (!media) continue
    const picked = pickMediaSize(media, 'large')
    const url = getMediaUrl(picked.url)
    if (url) {
      return {
        url,
        width: picked.width || undefined,
        height: picked.height || undefined,
        alt: media.alt ?? undefined,
      }
    }
  }

  return null
}

/**
 * Build Next.js metadata for a category page.
 *
 * Precedence for every field: the plugin-seo `meta.*` override (set by an editor)
 * -> the category's own content (auto) -> the site-wide default from `web-info`.
 * The same title/description/image are reused for the OpenGraph and Twitter cards.
 */
export function buildCategoryMetadata({
  category,
  locale,
  siteName,
  defaultDescription,
}: {
  category: Category
  locale: string
  /** Brand name, sourced from the `web-info` global. */
  siteName: string
  /** Site-wide default description, sourced from the `web-info` global. */
  defaultDescription?: string | null
}): Metadata {
  const title = category.meta?.title || `${category.title} | ${siteName}`

  const autoDescription = category.description ? truncate(category.description) : ''
  const description =
    category.meta?.description || autoDescription || defaultDescription || undefined

  const image = resolveCategoryImage(category)
  const imageUrl = image?.url || `${getServerSideURL()}${DEFAULT_OG_IMAGE}`
  const images = [
    { url: imageUrl, width: image?.width, height: image?.height, alt: image?.alt },
  ]

  const categorySlug = category.slug ?? category.id
  const url = `${getServerSideURL()}/${locale}/category/${categorySlug}`

  return {
    // `absolute` bypasses the layout's title template so the brand isn't duplicated.
    title: { absolute: title },
    description,
    alternates: buildAlternates(locale, `/category/${categorySlug}`),
    openGraph: {
      type: 'website',
      title,
      description,
      url,
      siteName,
      locale: toOgLocale(locale),
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.map((i) => i.url),
    },
  }
}
