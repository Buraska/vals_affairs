import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { Header } from '@/app/components/Header'
import { NavigationOverlay } from '@/app/components/NavigationOverlay'
import type { Lang } from '@/app/lib/localization/translations'
import { isValidLocale, locales } from '@/app/lib/localization/i18n'
import { getCategoriesForLocale } from '@/app/lib/categoriesForLocale'
import { Footer } from '@/app/components/Footer'

export const dynamic = 'force-static'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
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
  const [categories, webInfo] = await Promise.all([
    getCategoriesForLocale(lang),
    getPayload({ config: configPromise }).then((payload) =>
      payload.findGlobal({ slug: 'web-info', depth: 0, locale: lang })
    ),
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

  return (
    <LanguageProvider
      key={locale}
      initialLocale={lang}
      initialSiteDescription={headerWebInfo?.siteDescription ?? null}
    >
      <Header categories={categories} webInfo={headerWebInfo} />
      {children}
      <Footer />
      {/* <NavigationOverlay /> */}
    </LanguageProvider>
  )
}
