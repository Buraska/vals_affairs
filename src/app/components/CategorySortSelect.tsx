'use client'

import { useRouter } from 'next/navigation'
import { useLanguage } from '@/app/contexts/LanguageContext'

type Option = { value: string; label: string }

export function CategorySortSelect({
  baseUrl,
  currentSort,
  query,
  selectedTags,
  options,
}: {
  baseUrl: string
  currentSort: string
  query: string
  selectedTags: string[]
  options: readonly Option[]
}) {
  const { t } = useLanguage()
  const router = useRouter()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const sort = e.target.value
    const params = new URLSearchParams()
    if (sort !== 'date') params.set('sort', sort)
    if (query) params.set('q', query)
    if (selectedTags.length > 0) params.set('tags', selectedTags.join(','))
    router.replace(`${baseUrl}${params.toString() ? `?${params.toString()}` : ''}`)
  }

  return (
    <select
      id="category-sort"
      value={currentSort}
      onChange={handleChange}
      aria-label={t.category.sort}
      className="rounded border border-stone-200 bg-stone-50/50 px-2.5 py-1.5 text-sm text-stone-700 focus:border-stone-400 focus:bg-white focus:outline-none"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
