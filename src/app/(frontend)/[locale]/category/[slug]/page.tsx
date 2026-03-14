import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'
import type { Tag } from '@/payload-types'
import { CategoryPageClient } from '@/app/components/CategoryPageClient'
import { getTranslations } from '@/app/lib/localization/translations'
import type { Lang } from '@/app/lib/localization/translations'
import { isValidLocale, locales } from '@/app/lib/localization/i18n'

export const dynamic = 'force-static'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const { docs: categories } = await payload.find({
    collection: 'category',
    depth: 0,
    limit: 500,
  })
  const slugs = categories.map((c) => c.id)
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
}

const payload = await getPayload({ config: configPromise })

const SORT_VALUES = ['date', 'price', '-price'] as const

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug: categoryId } = await params
  const lang = (isValidLocale(locale) ? locale : 'ee') as Lang
  const t = getTranslations(lang)

  const sortOptions = [
    { value: 'date', label: t.category.sortByDate },
    { value: 'price', label: t.category.sortByPriceAsc },
    { value: '-price', label: t.category.sortByPriceDesc },
  ] as const

  const category = await payload
    .findByID({
      collection: 'category',
      id: categoryId,
      depth: 0,
    })
    .catch(() => notFound())

  const whereClause: Where = { category: { equals: categoryId } }
  let { docs: initialAffairs } = await payload.find({
    collection: 'Affair',
    depth: 2,
    locale: lang,
    where: whereClause,
    sort: 'date',
    limit: 200,
  })


  initialAffairs = initialAffairs.filter(
    (affair) => affair.title != null && String(affair.title).trim() !== ''
  )

  const tagsSet = new Set<Tag>()
  initialAffairs.forEach((affair) => {
    if (affair.tags) {
      affair.tags.forEach((ref) => {
        const tag = ref.tag as Tag
        if (tag) tagsSet.add(tag)
      })
    }
  })

  const baseUrl = `/${locale}/category/${categoryId}`

  return (
    <main className="min-h-screen">
      <div className="px-4 sm:px-8 lg:px-16 py-10">
        <div className="flex items-end gap-4 mb-6 pb-4 border-b border-[var(--border)]">
          <h1
            className="text-2xl mx-auto font-bold text-[var(--dark)] text-left"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            {category.title}
          </h1>
        </div>

        <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center text-[var(--muted)]">Loading…</div>}>
          <CategoryPageClient
            initialAffairs={initialAffairs}
            tags={[...tagsSet]}
            categoryTitle={category.title ?? ''}
            baseUrl={baseUrl}
            locale={locale}
            sortOptions={sortOptions}
            tCategory={{
              search: t.category.search,
              sort: t.category.sort,
              sortByDate: t.category.sortByDate,
              sortByPriceAsc: t.category.sortByPriceAsc,
              sortByPriceDesc: t.category.sortByPriceDesc,
              searchPlaceholder: t.category.searchPlaceholder,
              noResultsQuery: t.category.noResultsQuery,
              noResultsCategory: t.category.noResultsCategory,
              filters: t.category.filters,
              resetFilters: t.category.resetFilters,
              countEvents: t.category.countEvents,
            }}
          />
        </Suspense>
      </div>
    </main>
  )
}
