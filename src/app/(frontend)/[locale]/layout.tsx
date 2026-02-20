import { notFound } from 'next/navigation'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { Header } from '@/app/components/Header'
import type { Lang } from '@/app/lib/localization/translations'
import { isValidLocale } from '@/app/lib/localization/i18n'
import { getCategoriesForLocale } from '@/app/lib/categoriesForLocale'
import { Footer } from '@/app/components/Footer'

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
  const categories = await getCategoriesForLocale(lang)

  return (
    <LanguageProvider key={locale} initialLocale={lang}>
      <Header categories={categories} />
      {children}
      <Footer/>
    </LanguageProvider>
  )
}
