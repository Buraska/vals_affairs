import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { AffairAdditionalInfoTabs } from '@/app/components/AffairAdditionalInfoTabs'
import { AffairTicketsWithOrderLink } from '@/app/components/AffairTicketsWithOrderLink'
import { lexicalToHtml } from '@/utilities/lexicalToHtml'
import { Media as MediaType } from '@/payload-types'
import { AffairImageCarousel } from '@/app/components/AffairImageCarousel'
import { AffairCarousel } from '@/app/components/AffairCarousel'
import { AffairDateTime } from '@/app/components/AffairDateTime'
import { getTranslations } from '@/app/lib/localization/translations'
import type { Lang } from '@/app/lib/localization/translations'
import { isValidLocale, Locale, locales } from '@/app/lib/localization/i18n'

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
  const t = getTranslations(locale)
  const affair = await payload
    .findByID({ collection: 'Affair', id, depth: 0, locale: locale })
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
      locale: lang,
    })
    .catch(() => null)

  if (!affair) notFound()
  if (!affair.title) notFound()

  const categoryId =
    typeof affair.category === 'string' ? affair.category : affair.category?.id
  const categoryTitle =
    typeof affair.category === 'object' && affair.category != null
      ? affair.category.title
      : null
  const descriptionHtml = lexicalToHtml(affair.description)

  const related = (
    await payload.find({
      collection: 'Affair',
      depth: 1,
      locale: lang,
      where: { id: { not_equals: id } },
      limit: 50,
    })
  ).docs
  const randomRelated = [...related].sort(() => Math.random() - 0.5).slice(0, 5)

  const slides: MediaType[] = affair.images
    ? affair.images.map((i) => i.image).filter((i): i is MediaType => i != null && typeof i !== 'string')
    : []

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 lg:px-16">
        <nav className="mb-6 flex items-center gap-4 text-sm text-[var(--muted)]">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-[var(--rust)]"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M9 11L5 7L9 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t.common.home}
          </Link>
          {categoryId && (
            <Link
              href={`/${locale}/category/${categoryId}`}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-[var(--rust)]"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M9 11L5 7L9 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {categoryTitle ?? t.common.toCategory}
            </Link>
          )}
        </nav>

        <h1
          className="mb-6 text-3xl font-bold leading-tight text-[var(--dark)] sm:text-4xl lg:text-5xl"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          {affair.title}
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {slides.length !== 0 ? (
            <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden  lg:flex-[2]">
              <AffairImageCarousel
                slides={slides}
                title={affair.title ?? undefined}
              />
            </div>
          ) : (
            <div className="flex aspect-[16/10] w-full items-center justify-center bg-[var(--border)] text-2xl text-[var(--muted)]">
              —
            </div>
          )}

          <div className="lg:flex-[1] lg:min-w-0">
            <div className="mb-6 border-b border-[var(--border)] pb-6">
              {affair.isAvailable === true ? (
                <AffairTicketsWithOrderLink
                  affairId={id}
                  tickets={affair.tickets}
                  locale={locale}
                />
              ) : (
                <p className="text-[var(--muted)] font-medium">{t.affair.notAvailable}</p>
              )}
            </div>
            <div>
              <AffairDateTime
                startDate={affair['start date']}
                endDate={affair['end date']}
                locale={locale}
                label={t.affair.scheduleTitle}
                addToCalendarLabel={t.affair.addToCalendar}
                eventTitle={affair.title}
                details={t.affair.calendarDetails}
              />
            </div>
          </div>
        </div>

        {descriptionHtml && (
          <section className="mb-6">
            <div className="mb-4 flex items-center gap-3">
              <h2
                className="text-2xl font-bold text-[var(--dark)]"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {t.affair.descriptionTitle}
              </h2>
              <span className="h-px flex-1 bg-[var(--border)]" />
            </div>
            <div
              className={`affair-rich-text [&_p]:mb-4 [&_p]:text-[var(--muted)] [&_strong]:text-[var(--dark)] [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-6 [&_li]:text-[var(--muted)] [&_h2]:mt-4 [&_h2]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-[var(--dark)] [&_h3]:mt-4 [&_h3]:mb-4 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-[var(--dark)] [&_a]:text-[var(--rust)] [&_a]:underline [&_a]:hover:text-[var(--dark)]`}
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          </section>
        )}
              
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

        {randomRelated.length > 0 && (
          <section className="mt-12">
            <div className="mb-6 flex items-center gap-3">
              <h2
                className="text-2xl font-bold text-[var(--dark)]"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {t.affair.relatedTitle}
              </h2>
              <span className="h-px flex-1 bg-[var(--border)]" />
            </div>

            <AffairCarousel affairs={randomRelated} locale={lang} />

            <div className="mt-8 flex justify-center">
              <Link
                href={`/${lang}`}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--rust)] px-6 py-2.5 text-sm font-medium text-[var(--rust)] transition-colors hover:bg-[var(--rust)] hover:text-white"
              >
                {t.affair.seeMore}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
