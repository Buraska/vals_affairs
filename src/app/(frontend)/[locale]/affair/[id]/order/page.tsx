import Link from 'next/link'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { AffairOrderForm } from '@/app/components/AffairOrderForm'
import { AffairOrderSummary } from '@/app/components/AffairOrderSummary'
import { getTranslations } from '@/app/lib/localization/translations'
import type { Lang } from '@/app/lib/localization/translations'
import { isValidLocale, Locale, locales } from '@/app/lib/localization/i18n'
import { formatDateRange } from '@/utilities/utility'

const payload = await getPayload({ config: configPromise })

export async function generateStaticParams() {
  const { docs: affairs } = await payload.find({
    collection: 'Affair',
    depth: 0,
    limit: 500,
  })
  const ids = affairs.map((a) => a.id)
  return locales.flatMap((locale) => ids.map((id) => ({ locale, id })))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>
}) {
  const { locale, id } = await params
  const t = getTranslations(locale as Lang)
  const affair = await payload
    .findByID({ collection: 'Affair', id, depth: 0, locale: locale})
    .catch(() => null)
  if (!affair) return { title: t.common.notFoundOrder }
  return {
    title: `${t.order.pageTitle}: ${affair.title} | Vals`,
    description: `${t.order.pageTitle} — "${affair.title}"`,
  }
}

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale; id: string }>
  searchParams: Promise<{ q?: string }>
}) {
  const { locale, id } = await params
  const { q } = await searchParams
  const lang = (isValidLocale(locale) ? locale : 'ee') as Lang
  const t = getTranslations(lang)

  const affair = await payload
    .findByID({
      collection: 'Affair',
      id,
      depth: 1,
      locale: lang
    })
    .catch(() => null)

  if (!affair) notFound()
  if (!affair.title) notFound()

  const tickets = affair.tickets ?? []
  const dateRangeText = formatDateRange(affair['start date'], affair['end date'], locale)
  const ticketQuery = typeof q === 'string' ? q : ''

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 lg:px-16">
        <Link
          href={`/${locale}/affair/${id}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--rust)] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 11L5 7L9 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t.common.backToEvent}
        </Link>

        <h1 className="mb-8 text-2xl font-bold text-[var(--dark)]" style={{ fontFamily: "var(--font-playfair)" }}>
          {t.order.pageTitle}
        </h1>

        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          <div className="min-w-0 flex-1">
          <Suspense fallback={<p className="text-[var(--muted)]">{t.affair.noTicketsNote}</p>}>
            <AffairOrderForm
              affair={affair}
              locale={locale}
              tickets={tickets}
              dateRangeText={dateRangeText}
            />
            </Suspense>
            
          </div>
        </div>
      </div>
    </main>
  )
}
