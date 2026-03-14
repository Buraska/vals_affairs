'use client'

import { useRouter } from 'next/navigation'
import { useLanguage } from '@/app/contexts/LanguageContext'
import { useCallback } from 'react'
import type { Tag } from '@/payload-types'


export function TagFilters({
  tags,
  selectedTagIds,
  baseUrl,
  sort,
  query,
}: {
  tags: Tag[]
  selectedTagIds: string[]
  baseUrl: string
  sort: string
  query: string
}) {
  const { t } = useLanguage()
  const router = useRouter()

  const toggleTag = useCallback(
    (tagId: string) => {
      const newSelected = selectedTagIds.includes(tagId)
        ? selectedTagIds.filter((id) => id !== tagId)
        : [...selectedTagIds, tagId]

      const params = new URLSearchParams()
      if (sort !== 'date') params.set('sort', sort)
      if (query) params.set('q', query)
      if (newSelected.length > 0) params.set('tags', newSelected.join(','))

      router.replace(`${baseUrl}${params.toString() ? `?${params.toString()}` : ''}`)
    },
    [selectedTagIds, baseUrl, sort, query, router]
  )
  const tagDict = new Map<string, Tag[]>()
  let tagGroupName: string
  tags.forEach((tag) => {
    const group = tag["tag group"]
    if (group && typeof group === 'object' && "name" in group) {
      if (tagDict.has(group.name)) {
        tagDict.get(group.name)?.push(tag);
      } else {
        tagDict.set(group.name, [tag])
      }
    }
  })


  // if (tags.length === 0) return null
  // let tagGroups = tags.map((tag) => tag.taggroup)

  return (
    <div className="rounded border border-[var(--border)] bg-[var(--card-bg)] p-4">
      <h2 className="mb-4 text-xs font-medium text-[var(--muted)] tracking-widest uppercase">{t.category.filters}</h2>
      <div className="space-y-6">
        {[...tagDict.keys()].map((groupName) => {
          const groupTags = tagDict.get(groupName) ?? []
          return (
            <div key={groupName}>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                {groupName}
              </h3>
              <div className="space-y-1.5">
                {groupTags.map((tag) => {
                  const isChecked = selectedTagIds.includes(tag.id)
                  return (
                    <label
                      key={tag.id}
                      className="flex cursor-pointer items-center gap-2 text-sm text-[var(--dark)] hover:text-[var(--rust)]"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleTag(tag.id)}
                        className="h-4 w-4 rounded border-[var(--border)] text-[var(--rust)] focus:ring-[var(--warm)]"
                      />
                      <span>{tag.name}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      {selectedTagIds.length > 0 && (
        <button
          onClick={() => {
            const params = new URLSearchParams()
            if (sort !== 'date') params.set('sort', sort)
            if (query) params.set('q', query)
            router.replace(`${baseUrl}${params.toString() ? `?${params.toString()}` : ''}`)
          }}
          className="mt-4 text-xs text-[var(--muted)] underline hover:text-[var(--dark)]"
        >
          {t.category.resetFilters}
        </button>
      )}
    </div>
  )
}
