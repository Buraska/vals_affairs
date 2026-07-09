import Link from 'next/link'
import { Suspense } from 'react'
import { notFound, permanentRedirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { getTranslations } from '@/app/lib/localization/translations'
import type { Lang } from '@/app/lib/localization/translations'
import { isValidLocale, Locale, locales } from '@/app/lib/localization/i18n'
import { formatDateRange } from '@/utilities/utility'
import { AffairOrderSummary } from '@/app/components/AffairOrderSummary'
import AffairOrderForm from '@/app/components/AffairOrderForm'
import { OrderContentSkeleton } from '@/app/components/OrderContentSkeleton'
import type { Affair } from '@/payload-types'
import { resolveBySlugOrId } from '@/app/lib/resolveDoc'

const payload = await getPayload({ config: configPromise })

// Transactional checkout page: keep it out of the index.
export const metadata = {
  robots: { index: false, follow: false },
}


export async function generateStaticParams() {
  const { docs: affairs } = await payload.find({
    collection: 'Affair',
    depth: 0,
    limit: 500,
  })
  const params = affairs.map((a) => a.slug ?? a.id)
  return locales.flatMap((locale) => params.map((slug) => ({ locale, slug })))
}


export default async function OrderPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}) {
  const { locale, slug } = await params
  const lang = (isValidLocale(locale) ? locale : 'ee') as Lang
  const t = getTranslations(lang)

  const resolved = await resolveBySlugOrId({ payload, collection: 'Affair', param: slug, locale: lang })
  if (!resolved) notFound()
  // Old id-based URL: redirect to the canonical slug URL.
  if (!resolved.matchedBySlug && resolved.doc.slug) {
    permanentRedirect(`/${locale}/affair/${resolved.doc.slug}/order`)
  }

  const affair = resolved.doc
  const slugForLinks = affair.slug ?? affair.id

      return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 lg:px-16">
        <Link
          href={`/${locale}/affair/${slugForLinks}`}
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

        <Suspense fallback={<OrderContentSkeleton orderLabel={t.affair.yourOrder} />}>
          <OrderContent affair={affair} locale={locale} lang={lang} />
        </Suspense>
      </div>
    </main>
  )
}

async function OrderContent({
  affair,
  locale,
  lang,
}: {
  affair: Affair
  locale: Locale
  lang: Lang
}) {
  const t = getTranslations(lang)


  if (!affair) notFound()
  if (!affair.title) notFound()

  const tickets = affair.tickets ?? []
  const dateRangeText = formatDateRange(affair['start date'], affair['end date'], locale)

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
      <AffairOrderForm
        affair={affair as Affair}
        locale={locale}
        tickets={tickets}
        dateRangeText={dateRangeText}
      />
      <div className="lg:w-[380px] lg:shrink-0">
        <section className="sticky top-24 rounded border border-[var(--border)] bg-[var(--card-bg)] p-6">
          <h2
            className="mb-4 text-lg font-semibold text-[var(--dark)]"
            style={{ fontFamily: 'var(--font-playfair)' }}>
            {t.affair.yourOrder}
          </h2>
          <AffairOrderSummary
            affairTitle={affair.title}
            affairPrice={affair.price}
            startDate={affair['start date']}
            endDate={affair['end date']}
            dateRangeText={dateRangeText}
            tickets={tickets}
          />
        </section>
      </div>
    </div>
  )
}
