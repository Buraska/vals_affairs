'use client'

import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import type { Affair, Tag } from '@/payload-types'
import { AffairCard } from '@/app/components/AffairCard'
import { CategorySortSelect } from '@/app/components/CategorySortSelect'
import { TagFilters } from '@/app/components/TagFilters'
import CategorySearch from '@/app/components/CategorySearch'
import SectionImageReveal from '@/app/components/SectionImageReveal'
import { useLanguage } from '../contexts/LanguageContext'

type SortOption = { value: string; label: string }


const DEFAULT_SORT = 'date'

function getAffairTagIds(affair: Affair): string[] {
  return (affair.tags ?? [])
    .map((t) => (typeof t.tag === 'string' ? t.tag : t.tag?.id))
    .filter((id): id is string => Boolean(id))
}

function compareAffairs(a: Affair, b: Affair, sort: string): number {
  if (sort === 'price') {
    return (a.price ?? 0) - (b.price ?? 0)
  }
  if (sort === '-price') {
    return (b.price ?? 0) - (a.price ?? 0)
  }
  const dateA = a['start date'] ? new Date(a['start date']).getTime() : 0
  const dateB = b['start date'] ? new Date(b['start date']).getTime() : 0
  return dateA - dateB
}

export function CategoryPageClient({
  initialAffairs,
  tags,
  baseUrl,
  locale,
  sortOptions,
}: {
  initialAffairs: Affair[]
  tags: Tag[]
  baseUrl: string
  locale: string
  sortOptions: readonly SortOption[]
}) {
  const {t} = useLanguage()
  const searchParams = useSearchParams()
  const sort = searchParams.get('sort') ?? DEFAULT_SORT
  const query = (searchParams.get('q') ?? '').trim()
  const selectedTagIds = (searchParams.get('tags') ?? '').split(',').filter(Boolean)

  const affairs = useMemo(() => {
    let list = initialAffairs
    if (query) {
      const lower = query.toLowerCase()
      list = list.filter(
        (a) => a.title != null && String(a.title).toLowerCase().includes(lower)
      )
    }
    if (selectedTagIds.length > 0) {
      list = list.filter((a) =>
        selectedTagIds.some((id) => getAffairTagIds(a).includes(id))
      )
    }
    return [...list].sort((a, b) => compareAffairs(a, b, sort))
  }, [initialAffairs, query, selectedTagIds.join(','), sort])

  const noResultsText = query.trim()
    ? t.category.noResultsQuery.replace('{query}', query)
    : t.category.noResultsCategory

  return (
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
        {tags.length > 0 && (
          <TagFilters
            tags={tags}
            selectedTagIds={selectedTagIds}
            baseUrl={baseUrl}
            sort={sort}
            query={query}
          />
        )}
      </aside>

      <div className="min-w-0 flex-1">
        <p className="text-xs text-[var(--muted)] font-light tracking-widest uppercase mb-4">
          {t.category.countEvents.replace('{count}', String(affairs.length))}
        </p>
        {affairs.length === 0 ? (
          <p className="text-[var(--muted)] py-8">{noResultsText}</p>
        ) : (
          <SectionImageReveal
            count={affairs.filter((a) => {
              const first = a.images?.[0]?.image
              return typeof first === 'object' && first != null
            }).length}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-px">
              {affairs.map((affair) => (
                <div key={affair.id} className="bg-[var(--card-bg)]">
                  <AffairCard affair={affair} locale={locale} className="p-5" />
                </div>
              ))}
            </div>
          </SectionImageReveal>
        )}
      </div>
    </div>
  )
}
