import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { AffairOrderForm } from '@/app/components/AffairOrderForm'
import { getTranslations } from '@/app/lib/localization/translations'
import type { Lang } from '@/app/lib/localization/translations'
import { isValidLocale } from '@/app/lib/localization/i18n'

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
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>
  searchParams: Promise<{ q?: string }>
}) {
  const { locale, id } = await params
  const { q: qParam } = await searchParams
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

  const quantities = qParam
    ? qParam.split(',').map((s) => Math.max(0, parseInt(s, 10) || 0))
    : affair.tickets?.map(() => 0) ?? []

  const tickets = affair.tickets ?? []
  const paddedQuantities = tickets.map((_, i) => quantities[i] ?? 0)

  let totalCents = 0
  const lines = tickets.map((ticket, i) => {
    const qty = paddedQuantities[i] ?? 0
    const price = ticket['ticket price'] ?? 0
    const subtotal = qty * price
    totalCents += subtotal
    return {
      name: ticket['ticket name'] ?? '—',
      qty,
      price,
      subtotal,
    }
  })
  const hasTicketSelection = lines.some((l) => l.qty > 0)
  const total = totalCents

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href={`/${locale}/affair/${id}`}
          className="mb-4 inline-block text-sm font-medium text-amber-700 hover:text-amber-900"
        >
          {t.common.backToEvent}
        </Link>

        <h1 className="mb-6 text-2xl font-bold text-amber-900">
          {t.order.pageTitle}
        </h1>

        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          <div className="min-w-0 flex-1">
            <AffairOrderForm />
          </div>

          <aside className="lg:w-[380px] lg:shrink-0">
            <section className="sticky top-[calc(var(--header-height)+1rem)] rounded-sm border border-amber-200 bg-amber-50/30 p-4">
              <h2 className="mb-3 text-lg font-semibold text-amber-900">
                {t.affair.yourOrder}
              </h2>
              <p className="mb-1 font-medium text-stone-800">{affair.title}</p>
              <p className="mb-3 text-sm text-stone-600">
                {formatDateRange(affair['start date'], affair['end date'], locale)}
              </p>
              {tickets.length > 0 ? (
                <>
                  <ul className="space-y-2 border-t border-amber-200 pt-3">
                    {lines.map((line, i) => {
                      if (line.qty === 0) return null
                      return (
                        <li
                          key={i}
                          className="flex justify-between gap-4 text-sm text-stone-700"
                        >
                          <span>
                            {line.name} × {line.qty}
                          </span>
                          <span className="font-medium text-amber-900">
                            {line.subtotal} €
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                  {hasTicketSelection && (
                    <p className="mt-2 border-t border-amber-200 pt-2 text-right font-semibold text-amber-900">
                      {t.affair.total}: {total} €
                    </p>
                  )}
                  {!hasTicketSelection && (
                    <p className="mt-2 text-sm text-stone-500">
                      {t.affair.noTicketsNote}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-stone-700">
                  {t.affair.participation}: <strong>{affair.price} €</strong>
                </p>
              )}
            </section>
          </aside>
        </div>
      </div>
    </main>
  )
}
