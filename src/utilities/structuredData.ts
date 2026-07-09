import type { Affair, Category, Media, WebInfo } from '@/payload-types'
import { lexicalToPlainText } from '@/utilities/lexicalToPlainText'
import { pickMediaSize } from '@/utilities/pickMediaSize'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { getServerSideURL } from '@/utilities/getURL'
import { DEFAULT_OG_IMAGE } from '@/utilities/seo'

/** ISO-4217 currency used for ticket prices. */
const CURRENCY = 'EUR'

type Location = NonNullable<Affair['location']>

/** Make any media URL absolute so it is valid inside JSON-LD. */
function toAbsolute(url: string): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `${getServerSideURL()}${url.startsWith('/') ? url : `/${url}`}`
}

function isMedia(value: unknown): value is Media {
  return typeof value === 'object' && value != null
}

/** Collect absolute image URLs for an affair (meta image first, then gallery). */
function collectImageUrls(affair: Affair): string[] {
  const urls: string[] = []
  const push = (media: unknown) => {
    if (!isMedia(media)) return
    const picked = pickMediaSize(media, 'large')
    const url = toAbsolute(getMediaUrl(picked.url))
    if (url) urls.push(url)
  }

  push(affair.meta?.image)
  affair.images?.forEach((entry) => push(entry?.image))

  const unique = [...new Set(urls)]
  return unique.length > 0 ? unique : [`${getServerSideURL()}${DEFAULT_OG_IMAGE}`]
}

/**
 * Build a Schema.org `Place` from the affair's own location, falling back to the
 * site-wide default in `web-info`. Returns null when there is no usable address.
 */
function resolvePlace(
  affair: Affair,
  defaultLocation?: WebInfo['defaultLocation'] | null,
): Record<string, unknown> | null {
  const source: Location | WebInfo['defaultLocation'] | undefined = [
    affair.location,
    defaultLocation ?? undefined,
  ].find((loc) => loc && (loc.city))

  if (!source) return null

  const address: Record<string, unknown> = { '@type': 'PostalAddress' }
  if (source.streetAddress) address.streetAddress = source.streetAddress
  if (source.city) address.addressLocality = source.city
  if (source.postalCode) address.postalCode = source.postalCode
  address.addressCountry = source.country || 'EE'

  return {
    '@type': 'Place',
    ...(source.venueName ? { name: source.venueName } : {name: source.city}),
    address,
  }
}

/** Build the AggregateOffer from ticket prices (or the base price as fallback). */
function resolveOffers(affair: Affair, url: string): Record<string, unknown> {
  const prices = (affair.tickets ?? [])
    .map((t) => t['ticket price'])
    .filter((p): p is number => typeof p === 'number')

  if (prices.length === 0 && typeof affair.price === 'number') {
    prices.push(affair.price)
  }

  const availability =
    affair.isAvailable === false
      ? 'https://schema.org/SoldOut'
      : 'https://schema.org/InStock'

  const offer: Record<string, unknown> = {
    '@type': 'AggregateOffer',
    priceCurrency: CURRENCY,
    availability,
    url,
  }

  if (prices.length > 0) {
    offer.lowPrice = Math.min(...prices)
    offer.highPrice = Math.max(...prices)
    offer.offerCount = prices.length
  }

  if (affair.createdAt) offer.validFrom = affair.createdAt

  return offer
}

/**
 * Build Schema.org `Event` JSON-LD for an affair. Exposes everything Google's
 * event experience wants: name, dates, images, location and ticket offers.
 */
export function buildAffairEventJsonLd({
  affair,
  locale,
  siteName,
  defaultLocation,
}: {
  affair: Affair
  locale: string
  siteName: string
  defaultLocation?: WebInfo['defaultLocation'] | null
}): Record<string, unknown> {
  const base = getServerSideURL()
  const url = `${base}/${locale}/affair/${affair.slug ?? affair.id}`
  const description = lexicalToPlainText(affair.description).replace(/\s+/g, ' ').trim()
  const place = resolvePlace(affair, defaultLocation)

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: affair.title ?? siteName,
    startDate: affair['start date'],
    
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    image: collectImageUrls(affair),
    url,
    offers: resolveOffers(affair, url),
    organizer: {
      '@type': 'Organization',
      name: siteName,
      url: base,
    },
    performer: {
      '@type': 'Organization',
      name: siteName,
      url: base,
    },
  }

  if (affair['end date']) jsonLd.endDate = affair['end date'] ?? affair['start date']
  if (description) jsonLd.description = description
  if (place) jsonLd.location = place

  return jsonLd
}

/**
 * Build Schema.org `BreadcrumbList` JSON-LD: Home > Category > Affair.
 */
export function buildBreadcrumbJsonLd({
  locale,
  homeLabel,
  category,
  affair,
}: {
  locale: string
  homeLabel: string
  category?: Pick<Category, 'id' | 'title' | 'slug'> | null
  affair: Pick<Affair, 'id' | 'title' | 'slug'>
}): Record<string, unknown> {
  const base = getServerSideURL()
  const items: Record<string, unknown>[] = [
    { '@type': 'ListItem', position: 1, name: homeLabel, item: `${base}/${locale}` },
  ]

  if (category?.id != null) {
    items.push({
      '@type': 'ListItem',
      position: items.length + 1,
      name: category.title,
      item: `${base}/${locale}/category/${category.slug ?? category.id}`,
    })
  }

  items.push({
    '@type': 'ListItem',
    position: items.length + 1,
    name: affair.title,
    item: `${base}/${locale}/affair/${affair.slug ?? affair.id}`,
  })

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  }
}

/**
 * Build Schema.org `Organization` JSON-LD for the site, including social profiles
 * (`sameAs`) and a contact point when phone/email are configured in `web-info`.
 */
export function buildOrganizationJsonLd({
  siteName,
  webInfo,
}: {
  siteName: string
  webInfo?: Pick<WebInfo, 'instagramUrl' | 'facebookUrl' | 'phone' | 'email'> | null
}): Record<string, unknown> {
  const base = getServerSideURL()
  const sameAs = [webInfo?.instagramUrl, webInfo?.facebookUrl].filter(
    (u): u is string => typeof u === 'string' && u.length > 0,
  )

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: base,
    logo: `${base}/icon.svg`,
  }

  if (sameAs.length > 0) jsonLd.sameAs = sameAs

  if (webInfo?.phone || webInfo?.email) {
    jsonLd.contactPoint = {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      ...(webInfo.phone ? { telephone: webInfo.phone } : {}),
      ...(webInfo.email ? { email: webInfo.email } : {}),
    }
  }

  return jsonLd
}

/**
 * Build Schema.org `WebSite` JSON-LD for the site.
 */
export function buildWebSiteJsonLd({
  siteName,
  inLanguage,
}: {
  siteName: string
  inLanguage: string
}): Record<string, unknown> {
  const base = getServerSideURL()
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: base,
    inLanguage,
  }
}
