import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Playfair_Display, Onest } from 'next/font/google'
import Script from 'next/script'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import '../globals.css'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { Header } from '@/app/components/Header'
import type { Lang } from '@/app/lib/localization/translations'
import {
  defaultLocale,
  HTML_LANG,
  isValidLocale,
  locales,
} from '@/app/lib/localization/i18n'
import { getCategoriesForLocale } from '@/app/lib/categoriesForLocale'
import { Footer } from '@/app/components/Footer'
import type { AboutUs, GalleryInfo } from '@/payload-types'
import { getSiteMeta } from '@/utilities/getSiteMeta'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { buildAlternates, SITE_NAME, toOgLocale } from '@/utilities/seo'
import { buildOrganizationJsonLd, buildWebSiteJsonLd } from '@/utilities/structuredData'

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '700', '900'],
  style: ['normal', 'italic'],
})

const onest = Onest({
  variable: '--font-onest',
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600'],
})

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const lang = isValidLocale(locale) ? locale : defaultLocale
  const { siteName, title, description } = await getSiteMeta(lang)
  const homeTitle = title ?? siteName
  return {
    title: {
      default: homeTitle,
      template: `%s | ${siteName}`,
    },
    description: description ?? undefined,
    alternates: buildAlternates(lang, ''),
    openGraph: mergeOpenGraph({
      siteName,
      title: homeTitle,
      description: description ?? undefined,
      locale: toOgLocale(lang),
    }),
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isValidLocale(locale)) notFound()
  const lang = locale as Lang
  const [categories, webInfo, galleryInfo, aboutUs] = await Promise.all([
    getCategoriesForLocale(lang),
    getPayload({ config: configPromise }).then((payload) =>
      payload.findGlobal({ slug: 'web-info', depth: 0, locale: lang })
    ),
    getPayload({ config: configPromise }).then((payload) =>
      payload.findGlobal({ slug: 'gallery-info', depth: 0, locale: lang, fallbackLocale: 'ee' })
    ) as Promise<GalleryInfo>,
    getPayload({ config: configPromise }).then((payload) =>
      payload.findGlobal({ slug: 'about-us', depth: 0, locale: lang, fallbackLocale: 'ee' })
    ) as Promise<AboutUs>,
  ])

  const headerWebInfo =
    webInfo != null
      ? {
          ...webInfo,
          siteDescription:
            webInfo.siteDescription != null &&
            typeof webInfo.siteDescription === 'object'
              ? (webInfo.siteDescription[lang as keyof typeof webInfo.siteDescription])
              : null,
        }
      : null

  const siteName = webInfo?.siteName?.trim() || SITE_NAME
  const organizationJsonLd = buildOrganizationJsonLd({ siteName, webInfo })
  const webSiteJsonLd = buildWebSiteJsonLd({
    siteName,
    inLanguage: HTML_LANG[lang] ?? HTML_LANG[defaultLocale],
  })

  return (
    <html
      lang={HTML_LANG[lang] ?? HTML_LANG[defaultLocale]}
      className={`${playfair.variable} ${onest.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen font-sans antialiased bg-[var(--cream)] text-[var(--dark)]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
        />
        <LanguageProvider
          key={locale}
          initialLocale={lang}
          initialSiteDescription={headerWebInfo?.siteDescription ?? null}
        >
          <Header
            categories={categories}
            webInfo={headerWebInfo}
            galleryInfo={galleryInfo}
            aboutUs={aboutUs}
          />
          {children}
          <Footer webInfo={headerWebInfo} />
        </LanguageProvider>
        <Script
          defer
          src="https://stat.thenextchance.eu/script.js"
          data-website-id="e0b618cd-0c92-4873-975c-7ca5d6da35e6"
          strategy="afterInteractive"
        />
        <SpeedInsights />
      </body>
    </html>
  )
}
