import { notFound } from 'next/navigation'
import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'
import type { Tag } from '@/payload-types'
import { AffairCard } from '@/app/components/AffairCard'
import { CategorySortSelect } from '@/app/components/CategorySortSelect'
import { TagFilters } from '@/app/components/TagFilters'
import CategorySearch from '@/app/components/CategorySearch'
import { getTranslations } from '@/app/lib/localization/translations'
import type { Lang } from '@/app/lib/localization/translations'
import { isValidLocale } from '@/app/lib/localization/i18n'

const payload = await getPayload({ config: configPromise })

function getMonthKey(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function formatMonthLabel(dateStr: string, locale: string): string {
  return new Date(dateStr).toLocaleDateString(`${locale === 'ee' ? 'et' : locale}-${locale === 'en' ? 'US' : locale.toUpperCase()}`, {
    month: 'long',
    year: 'numeric',
  })
}

const SORT_VALUES = ['date', 'price', '-price'] as const

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>
  searchParams: Promise<{ sort?: string; q?: string; tags?: string }>
}) {
  const { locale, slug: categoryId } = await params
  const { sort: sortParam = 'date', q: query = '', tags: tagsParam } = await searchParams
  const lang = (isValidLocale(locale) ? locale : 'ee') as Lang
  const t = getTranslations(lang)

  const sortOptions = [
    { value: 'date', label: t.category.sortByDate },
    { value: 'price', label: t.category.sortByPriceAsc },
    { value: '-price', label: t.category.sortByPriceDesc },
  ] as const
  const sort = SORT_VALUES.includes(sortParam as (typeof SORT_VALUES)[number])
    ? sortParam
    : 'date'

  const selectedTagIds = tagsParam ? tagsParam.split(',').filter(Boolean) : []

  const category = await payload
    .findByID({
      collection: 'category',
      id: categoryId,
      depth: 0,
    })
    .catch(() => notFound())



  const conditions: Where[] = [{ category: { equals: categoryId } }]
  if (query.trim()) {
    conditions.push({ title: { contains: query.trim() } })
  }
  const whereClause: Where = conditions.length === 1 ? conditions[0] : { and: conditions }

  let { docs: affairs } = await payload.find({
    collection: 'Affair',
    depth: 2,
    locale: lang,
    where: whereClause,
    sort: sort,
    limit: 200,
  })

  // Only show affairs that have a title for this locale
  affairs = affairs.filter(
    (affair) => affair.title != null && String(affair.title).trim() !== ''
  )

  const tags = new Set<Tag>()
  affairs.forEach((affair) => {
    if (affair.tags) {
      affair.tags.forEach((t) => {
        const tag = t.tag as Tag
        if (tag) tags.add(tag)
      })
    }
  })


  if (selectedTagIds.length > 0) {
    affairs = affairs.filter((affair) => {
      const affairTagIds = (affair.tags || [])
        .map((t) => (typeof t.tag === 'string' ? t.tag : t.tag?.id))
        .filter(Boolean) as string[]
      return selectedTagIds.some((selectedId) => affairTagIds.includes(selectedId))
    })
  }

  const baseUrl = `/${locale}/category/${categoryId}`

  const noResultsText = query
    ? t.category.noResultsQuery.replace('{query}', query)
    : t.category.noResultsCategory

  return (
    <main className="min-h-screen">
      <div className="px-4 sm:px-8 lg:px-16 py-10">
        <div className="flex items-end gap-4 mb-6 pb-4 border-b border-[var(--border)]">
          <p className="text-xs text-[var(--muted)] font-light tracking-widest uppercase">
            {t.category.countEvents.replace('{count}', String(affairs.length))}
          </p>
          <h1 className="text-2xl  mx-auto font-bold text-[var(--dark)] text-left" style={{ fontFamily: "var(--font-playfair)" }}>
            {category.title}
          </h1>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="lg:w-64 lg:shrink-0 space-y-6">
            <div>
              <h2 className="mb-2 text-xs font-medium text-[var(--muted)] tracking-wide uppercase">
                {t.category.search}
              </h2>
              <CategorySearch
                baseUrl={baseUrl}
                sort={sort}
                query={query}
                selectedTags={selectedTagIds}
                options={sortOptions}
              />
            </div>
            <div>
              <h2 className="mb-2 text-xs font-medium text-[var(--muted)] tracking-wide uppercase">
                {t.category.sort}
              </h2>
              <CategorySortSelect
                baseUrl={baseUrl}
                currentSort={sort}
                query={query}
                selectedTags={selectedTagIds}
                options={sortOptions}
              />
            </div>
            {tags.size > 0 && (
              <TagFilters
                tags={[...tags]}
                selectedTagIds={selectedTagIds}
                baseUrl={baseUrl}
                sort={sort}
                query={query}
              />
            )}
          </aside>

          <div className="min-w-0 flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-px ">
              {affairs.length === 0 ? (
                <p className="text-[var(--muted)] py-8">{noResultsText}</p>
              ) : (
                affairs.map((affair) => (
                  <div key={affair.id} className="bg-[var(--card-bg)]">
                    <AffairCard affair={affair} locale={locale} className='p-5' />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
