import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Affair, Media } from '@/payload-types'
import { defaultLocale } from '@/app/lib/localization/i18n'
import {
  generateAdvertisingHtml,
  type AdvertisingEvent,
} from '@/app/lib/advertising/generateAdvertisingHtml'
import { lexicalToPlainText } from '@/utilities/lexicalToPlainText'
import { pickMediaSize } from '@/utilities/pickMediaSize'
import { getServerSideURL } from '@/utilities/getURL'
import { formatDateRange } from '@/utilities/utility'
import { debug } from 'console'

function isMedia(value: unknown): value is Media {
  return typeof value === 'object' && value != null
}

function toAbsoluteUrl(url: string | null | undefined): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const base = getServerSideURL()
  return `${base}${url.startsWith('/') ? url : `/${url}`}`
}

function resolveAffairImage(affair: Affair): string {
  const firstGallery = affair.images?.find((entry) => isMedia(entry?.image))?.image
  if (!isMedia(firstGallery)) return toAbsoluteUrl('/og-image.jpg')

  const picked = pickMediaSize(firstGallery, 'large')
  return toAbsoluteUrl(picked.url) || toAbsoluteUrl('/og-image.jpg')
}

function affairToEvent(affair: Affair, locale: string): AdvertisingEvent | null {
  if (!affair.title?.trim()) return null

  const base = getServerSideURL()
  const description = lexicalToPlainText(affair.description).slice(0, 300) + '...'	
  const price =
    typeof affair.price === 'number' ? `${affair.price} €` : '—'

  return {
    title: affair.title.trim(),
    date: formatDateRange(affair['start date'], affair['end date'], locale),
    price,
    image: resolveAffairImage(affair),
    description: description || '—',
    url: `${base}/${locale}/affair/${affair.slug ?? affair.id}`,
  }
}

export async function GET() {
  const payload = await getPayload({ config: configPromise })
  const locale = defaultLocale

  const { docs } = await payload.find({
    collection: 'Affair',
    locale,
    depth: 2,
    limit: 1000,
    sort: 'start date',
    where: {
      isAvailable: {
        not_equals: false,
      },
    },
    select: {
      title: true,
      description: true,
      price: true,
      images: true,
      'start date': true,
      'end date': true,
    },
  })

  const events = docs
    .map((affair) => affairToEvent(affair as Affair, locale))
    .filter((event): event is AdvertisingEvent => event != null)

  const html = generateAdvertisingHtml(events)
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  })
}
