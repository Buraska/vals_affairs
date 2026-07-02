import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getServerSideURL } from '@/utilities/getURL'
import { defaultLocale, HTML_LANG, locales } from '@/app/lib/localization/i18n'

const base = getServerSideURL()

function languagesFor(path: string): Record<string, string> {
  const languages: Record<string, string> = {}
  for (const loc of locales) {
    languages[HTML_LANG[loc] ?? loc] = `${base}/${loc}${path}`
  }
  if (path === '') {
    languages['x-default'] = `${base}/${defaultLocale}${path}`
  }
  return languages
}

/** One sitemap entry per locale for a given path, each carrying hreflang alternates. */
function entriesFor(path: string, lastModified?: string | Date): MetadataRoute.Sitemap {
  const languages = languagesFor(path)
  return locales.map((loc) => ({
    url: `${base}/${loc}${path}`,
    lastModified,
    alternates: { languages },
  }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config: configPromise })

  const [categoriesRes, affairsRes] = await Promise.all([
    payload.find({ collection: 'category', depth: 0, limit: 1000 }).catch(() => null),
    payload.find({ collection: 'Affair', depth: 0, limit: 1000 }).catch(() => null),
  ])

  // Order pages are intentionally excluded (they carry a noindex directive).
  const staticPaths = ['', '/about', '/terms', '/gallery']

  return [
    ...staticPaths.flatMap((path) => entriesFor(path)),
    ...(categoriesRes?.docs ?? []).flatMap((c) =>
      entriesFor(`/category/${c.id}`, c.updatedAt),
    ),
    ...(affairsRes?.docs ?? []).flatMap((a) => entriesFor(`/affair/${a.id}`, a.updatedAt)),
  ]
}
