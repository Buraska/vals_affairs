'use client'

import { useRouter } from 'next/navigation'
import { useLanguage } from '@/app/contexts/LanguageContext'

type Option = { value: string; label: string }


export default function CategorySearch({
  baseUrl,
  sort,
  query,
  selectedTags,
  options,
}: {
  baseUrl: string
  sort: string
  query: string
  selectedTags: string[]
  options: readonly Option[]
}) {
  const router = useRouter()
  const { t } = useLanguage()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const params = new URLSearchParams()
    const query = e.target.value
    if (query) params.set('q', query)
    if (sort && sort !== 'date') params.set('sort', sort)
    if (selectedTags.length > 0) params.set('tags', selectedTags.join(','))
    router.replace(`${baseUrl}${params.toString() ? `?${params.toString()}` : ''}`)
  }

  return (
    <form
      method="get"
      action={baseUrl}
      className="flex gap-2"
    >
      <input type="hidden" name="sort" value={sort} />
      <label htmlFor="category-search" className="sr-only">
        {t.category.search}
      </label>
      <input
        id="category-search"
        onChange={handleChange}
        type="search"
        name="q"
        defaultValue={query}
        placeholder={t.category.searchPlaceholder}
        className="w-full sm:w-64 rounded border border-[var(--border)] bg-[var(--card-bg)] px-3 py-2 text-sm text-[var(--dark)] placeholder:text-[var(--muted)] focus:border-[var(--warm)] focus:outline-none"
      />
    </form>
  )

}