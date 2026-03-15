import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'
import type { Tag } from '@/payload-types'
import { CategoryPageClient } from '@/app/components/CategoryPageClient'
import { getTranslations } from '@/app/lib/localization/translations'
import type { Lang } from '@/app/lib/localization/translations'
import { isValidLocale, Locale, locales } from '@/app/lib/localization/i18n'
import { cacheLife, cacheTag } from 'next/cache'

const payload = await getPayload({ config: configPromise })

export async function generateStaticParams() {
  const { docs: categories } = await payload.find({
    collection: 'category',
    depth: 0,
    limit: 500,
  })
  const slugs = categories.map((c) => c.id)
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
}

async function getCategory(lang:Locale, categoryId: string|number){
  // "use cache"
  // cacheLife('max')
  // cacheTag(`${lang}-category-${categoryId}`)

  const category = await payload
  .findByID({
    collection: 'category',
    id: categoryId,
    depth: 0,
    locale: lang
  })
  .catch(() => notFound())
  return category
}

async function getAffairs(lang:Locale, whereClause: Where | undefined) {
  const affairs = (await payload.find({
    collection: 'Affair',
    depth: 1,
    locale: lang,
    where: whereClause,
    sort: 'date',
    limit: 200,
  })).docs
  return affairs.filter(
    (affair) => affair.title != null && String(affair.title).trim() !== ''
  )
  
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug: categoryId } = await params
  const lang = (isValidLocale(locale) ? locale : 'ee') as Lang
  const t = getTranslations(lang)
  const category = await getCategory(lang, categoryId)
  const whereClause: Where = { category: { equals: categoryId } }
  let affairs = await getAffairs(lang, whereClause)


  const sortOptions = [
    { value: 'date', label: t.category.sortByDate },
    { value: 'price', label: t.category.sortByPriceAsc },
    { value: '-price', label: t.category.sortByPriceDesc },
  ] as const

  const tagsSet = new Set<Tag>()
  affairs.forEach((affair) => {
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
            initialAffairs={affairs}
            tags={[...tagsSet]}
            baseUrl={baseUrl}
            locale={locale}
            sortOptions={sortOptions}
          />
        </Suspense>
      </div>
    </main>
  )
}
