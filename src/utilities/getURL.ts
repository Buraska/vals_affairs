import canUseDOM from './canUseDOM'

/**
 * Canonical production origin. Used as the definitive base for SEO output
 * (canonical, hreflang, OpenGraph, sitemap, robots, JSON-LD) whenever an
 * explicit `NEXT_PUBLIC_SERVER_URL` / Vercel domain is not provided.
 */
export const CANONICAL_SITE_URL = 'https://www.thenextchance.eu'

export const getServerSideURL = () => {
  return (
    process.env.NEXT_PUBLIC_SERVER_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : CANONICAL_SITE_URL)
  )
}

export const getClientSideURL = () => {
  if (canUseDOM) {
    const protocol = window.location.protocol
    const domain = window.location.hostname
    const port = window.location.port

    return `${protocol}//${domain}${port ? `:${port}` : ''}`
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }

  return process.env.NEXT_PUBLIC_SERVER_URL || ''
}
