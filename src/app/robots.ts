import type { MetadataRoute } from 'next'
import { getServerSideURL } from '@/utilities/getURL'

export default function robots(): MetadataRoute.Robots {
  const base = getServerSideURL()
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Admin/API are not content; order pages are transactional (also noindex).
      disallow: ['/admin', '/api', '/*/affair/*/order'],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
