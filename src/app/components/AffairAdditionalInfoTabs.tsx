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
    <div className="mb-10">
      <div
        className="flex gap-1 border-b border-amber-200"
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
            className={` rounded-t-sm px-4 py-2.5 text-sm font-medium transition ${activeId === tab.id
              ? 'border border-b-0 border-amber-200 border-b-transparent bg-white text-amber-900 shadow-sm'
              : 'text-stone-600 hover:bg-amber-50 hover:text-amber-900'
              }`}
          >
            <div className=' line-clamp-4'>
            {tab.title}
            </div>
          </button>
        ))}
      </div>
      <div
        id={`panel-${activeTab.id}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab.id}`}
        className="bg-white pt-4 pr-4 pb-4 pl-0"
      >
        <div
          className="affair-rich-text [&_p]:mb-4 [&_p]:text-stone-700 [&_strong]:text-amber-900 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:text-stone-700 [&_h2]:mt-4 [&_h2]:mb-4 [&_h2]:text-lg [&_h2]:font-semibold [&_a]:text-amber-700 [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: activeTab.contentHtml }}
        />
      </div>
    </div>
  )
}
