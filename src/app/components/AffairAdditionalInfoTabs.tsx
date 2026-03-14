'use client'

import { useState } from 'react'
import { useLanguage } from '@/app/contexts/LanguageContext'

export type TabItem = { id: string; title: string; contentHtml: string }

export function AffairAdditionalInfoTabs({ tabs }: { tabs: TabItem[] }) {
  const { t } = useLanguage()
  const [activeId, setActiveId] = useState(tabs[0]?.id ?? '')

  if (tabs.length === 0) return null

  const activeTab = tabs.find((tab) => tab.id === activeId) ?? tabs[0]

  return (
    <div className="mb-10 mt-8 pt-8 border-t border-[var(--border)]">
      <div
        className="flex gap-1 border-b border-[var(--border)]"
        role="tablist"
        aria-label={t.tabs.ariaLabel}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeId === tab.id}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => setActiveId(tab.id)}
            className={`rounded-t-sm px-4 py-2.5 text-sm font-medium transition ${activeId === tab.id
              ? "border border-b-0 border-[var(--border)] border-b-transparent bg-[var(--card-bg)] text-[var(--dark)]"
              : "text-[var(--muted)] hover:bg-[var(--cream)] hover:text-[var(--dark)]"
              }`}
          >
            <div className="line-clamp-2">{tab.title}</div>
          </button>
        ))}
      </div>
      <div
        id={`panel-${activeTab.id}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab.id}`}
        className="bg-[var(--card-bg)] pt-4 pr-4 pb-4 pl-0"
      >
        <div
          className="affair-rich-text px-5 [&_p]:mb-4 [&_p]:text-[var(--muted)] [&_strong]:text-[var(--dark)] [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:text-[var(--muted)] [&_h2]:mt-4 [&_h2]:mb-4 [&_h2]:text-lg [&_h2]:font-semibold [&_a]:text-[var(--rust)] [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: activeTab.contentHtml }}
        />
      </div>
    </div>
  )
}
