import Link from 'next/link'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { AffairOrderForm } from '@/app/components/AffairOrderForm'
import { AffairOrderSummary } from '@/app/components/AffairOrderSummary'
import { getTranslations } from '@/app/lib/localization/translations'
import type { Lang } from '@/app/lib/localization/translations'
import { isValidLocale, locales } from '@/app/lib/localization/i18n'

export const dynamic = 'force-static'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const { docs: affairs } = await payload.find({
    collection: 'Affair',
    depth: 0,
    limit: 500,
  })
  const ids = affairs.map((a) => a.id)
  return locales.flatMap((locale) => ids.map((id) => ({ locale, id })))
}

const payload = await getPayload({ config: configPromise })

function formatDate(dateStr: string | null | undefined, locale: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString(`${locale === 'ee' ? 'et' : locale}-${locale === 'en' ? 'US' : locale.toUpperCase()}`, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatDateRange(start: string, end: string | null | undefined, locale: string): string {
  const a = formatDate(start, locale)
  if (!end || end === start) return a
  return `${a} – ${formatDate(end, locale)}`
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  const t = isValidLocale(locale) ? getTranslations(locale as Lang) : getTranslations('ee')
  const payloadInstance = await getPayload({ config: configPromise })
  const affair = await payloadInstance
    .findByID({ collection: 'Affair', id, depth: 0 })
    .catch(() => null)
  if (!affair) return { title: t.common.notFoundOrder }
  return {
    title: `${t.order.pageTitle}: ${affair.title} | Vals`,
    description: `${t.order.pageTitle} — "${affair.title}"`,
  }
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  const lang = (isValidLocale(locale) ? locale : 'ee') as Lang
  const t = getTranslations(lang)

  const affair = await payload
    .findByID({
      collection: 'Affair',
      id,
      depth: 1,
    })
    .catch(() => null)

  if (!affair) notFound()

  const tickets = affair.tickets ?? []
  const dateRangeText = formatDateRange(affair['start date'], affair['end date'], locale)

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
            <AffairOrderForm />
          </div>

          <aside className="lg:w-[380px] lg:shrink-0">
            <section className="sticky top-24 rounded border border-[var(--border)] bg-[var(--card-bg)] p-6">
              <h2 className="mb-4 text-lg font-semibold text-[var(--dark)]" style={{ fontFamily: "var(--font-playfair)" }}>
                {t.affair.yourOrder}
              </h2>
              <Suspense fallback={<p className="text-[var(--muted)]">{t.affair.noTicketsNote}</p>}>
                <AffairOrderSummary
                  affairTitle={affair.title}
                  affairPrice={affair.price}
                  dateRangeText={dateRangeText}
                  tickets={tickets}
                />
              </Suspense>
            </section>
          </aside>
        </div>
      </div>
    </main>
  )
}
