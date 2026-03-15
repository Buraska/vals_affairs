import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { lexicalToHtml } from '@/utilities/lexicalToHtml'
import { isValidLocale, locales } from '@/app/lib/localization/i18n'
import type { Locale } from '@/app/lib/localization/i18n'
import { getTranslations } from '@/app/lib/localization/translations'
import { cacheLife, cacheTag } from 'next/cache'


export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

async function getAboutUs(lang: Locale){
  // 'use cache'
  // cacheTag(`${lang}-about-us`)
  // cacheLife("max")

  const payload = await getPayload({ config: configPromise })
  const data = await payload.findGlobal({
    slug: 'about-us',
    depth: 0,
    locale: lang,
  })
  return data
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const lang = (isValidLocale(locale) ? locale : 'ee') as Locale
  const t = getTranslations(lang)
  return { title: `${t.common.aboutPageTitle} | Vals` }
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isValidLocale(locale)) notFound()
  const lang = locale as Locale

  const data = await getAboutUs(lang) 

  const content = data[lang as keyof typeof data]
  const html = content ? lexicalToHtml(content as Parameters<typeof lexicalToHtml>[0]) : ''
  const t = getTranslations(lang)

  return (
    <main className="min-h-screen bg-[var(--cream)]">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-2xl font-bold text-[var(--dark)] sm:text-3xl" style={{ fontFamily: 'var(--font-playfair)' }}>
          {t.common.aboutPageTitle}
        </h1>
        {html ? (
          <section className="prose prose-stone max-w-none [&_p]:mb-4 [&_p]:text-[var(--muted)] [&_strong]:text-[var(--dark)] [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-6 [&_li]:text-[var(--muted)] [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-[var(--dark)] [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-[var(--dark)] [&_a]:text-[var(--rust)] [&_a]:underline [&_a]:hover:text-[var(--dark)]" dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <p className="text-[var(--muted)]">{t.common.contentNotAdded}</p>
        )}
      </div>
    </main>
  )
}
