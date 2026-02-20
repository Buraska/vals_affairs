import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { AffairAdditionalInfoTabs } from '@/app/components/AffairAdditionalInfoTabs'
import { AffairTicketsWithOrderLink } from '@/app/components/AffairTicketsWithOrderLink'
import { lexicalToHtml } from '@/utilities/lexicalToHtml'
import { Media as MediaType } from '@/payload-types'
import { AffairImageCarousel } from '@/app/components/AffairImageCarousel'
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
  if (!affair) return { title: t.common.notFoundEvent }
  return {
    title: `${affair.title} | Vals`,
    description: affair.title,
  }
}

export default async function AffairPage({
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

  const categoryId =
    typeof affair.category === 'string' ? affair.category : affair.category?.id
  const firstImage = affair.images?.[0]?.image
  const descriptionHtml = lexicalToHtml(affair.description)
  const richTextClass =
    'affair-rich-text [&_p]:mb-4 [&_p]:text-stone-700 [&_strong]:text-amber-900 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-6 [&_li]:text-stone-700 [&_h2]:mt-4 [&_h2]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-amber-900 [&_h3]:mt-4 [&_h3]:mb-4 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-amber-900 [&_a]:text-amber-700 [&_a]:underline [&_a]:hover:text-amber-900'

  const slides: MediaType[] = affair.images
    ? affair.images.map((i) => i.image).filter((i): i is MediaType => i != null && typeof i !== 'string')
    : []

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
        {categoryId && (
          <Link
            href={`/${locale}/category/${categoryId}`}
            className="mb-4 inline-block text-sm font-medium text-amber-700 hover:text-amber-900"
          >
            {t.common.back}
          </Link>
        )}

        <div className="flex flex-row gap-4">
          {firstImage && typeof firstImage === 'object' ? (
            <div className="relative mb-4 w-1000 overflow-hidden rounded-sm">
              <AffairImageCarousel
                slides={slides}
                coverResource={firstImage}
                title={affair.title ?? undefined}
              />
            </div>
          ) : (
            <div className="mb-4 flex aspect-[16/10] w-full items-center justify-center rounded-sm bg-amber-100 text-4xl text-amber-300">
              —
            </div>
          )}

          <div>
            <h1 className="mb-4 text-3xl font-bold text-amber-900 sm:text-4xl">
              {affair.title}
            </h1>
            <div className="mb-4 border-b border-amber-200 pb-4">
              <AffairTicketsWithOrderLink
                affairId={id}
                tickets={affair.tickets ?? []}
                hasTickets={Boolean(affair.tickets && affair.tickets.length > 0)}
                price={!affair.tickets?.length ? affair.price : undefined}
                locale={locale}
              />
            </div>
            <div>
              <section className="mb-4">
                <h2 className="mb-4 text-lg font-semibold text-amber-900">
                  {t.affair.scheduleTitle}
                </h2>
                <p className="text-stone-700">
                  <strong>
                    {formatDateRange(affair['start date'], affair['end date'], locale)}
                  </strong>
                </p>
              </section>

              {descriptionHtml && (
                <section
                  className={`mb-4  ${richTextClass}`}
                  dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                />
              )}
            </div>
          </div>
        </div>

        {affair['additional info'] && affair['additional info'].length > 0 && (
          <AffairAdditionalInfoTabs
            tabs={affair['additional info']
              .map((block, i) => {
                const contentHtml = lexicalToHtml(block.content)
                const title = block.title ?? t.common.additional
                if (!title && !contentHtml) return null
                return {
                  id: block.id ?? `tab-${i}`,
                  title,
                  contentHtml: contentHtml || '<p>—</p>',
                }
              })
              .filter(Boolean) as { id: string; title: string; contentHtml: string }[]}
          />
        )}
      </div>
    </main>
  )
}
