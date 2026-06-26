'use client'
import type { Affair} from "@/payload-types"
import { formatDayMonthRange } from "@/utilities/utility"
import { lexicalToPlainText } from "@/utilities/lexicalToPlainText"
import Link from "next/link"
import { useLanguage } from "@/app/contexts/LanguageContext"
import clsx from 'clsx'
import SmartImage from "@/app/components/SmartImage"
import { pickMediaSize } from "@/utilities/pickMediaSize"


export const AffairCard = ({ affair, locale, className = "", showCategory = false }: { affair: Affair; locale: string, className?: string, showCategory?: boolean }) => {
  const { t } = useLanguage()
  const firstImage = affair.images?.[0].image
  const isAvailable = affair.isAvailable !== false

  const descriptionText = lexicalToPlainText(affair.description)
  const dateLabel = formatDayMonthRange(affair['start date'], affair['end date'], locale)
  const tagItems = (affair.tags ?? [])
    .map((t) => (typeof t.tag === 'object' && t.tag != null ? t.tag : null))
    .filter((tag): tag is NonNullable<typeof tag> => tag != null && 'name' in tag)

  const categoryName =
    typeof affair.category === 'object' && affair.category != null ? affair.category.title : null

  const categoryBadge =
    showCategory && categoryName ? (
      <div className="absolute top-3 left-3 z-10 inline-flex items-center rounded-full bg-[var(--rust)]/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--cream)] shadow-md backdrop-blur-sm">
        {categoryName}
      </div>
    ) : null

  const dateBadge = (
    <div className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-[var(--dark)]/70 px-3 py-1.5 text-sm font-bold text-[var(--cream)] shadow-md backdrop-blur-sm">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="3" y="4.5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3 9H21M8 2.5V6M16 2.5V6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      {dateLabel}
    </div>
  )

  return (
    <Link
      href={`/${locale}/affair/${affair.id}`}
      className={clsx(className, "group relative flex flex-col bg-[var(--card-bg)] transition hover:bg-[#FFFDF6] overflow-hidden")}
    >
      {(firstImage && typeof firstImage !== 'string') ? (
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-[var(--border)]">
          {categoryBadge}
          {dateBadge}
          <SmartImage
            src={pickMediaSize(firstImage, 'small').url || firstImage.url || ''}
            alt={firstImage.alt ?? ''}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
          />
        </div>
      ) : (
        <div className="relative w-full aspect-[16/9] flex items-center justify-center bg-[var(--border)] text-[var(--muted)]" aria-hidden>
          {categoryBadge}
          {dateBadge}
        </div>
      )}
      <div className="relative flex flex-col p-6 overflow-hidden">
        <span className="absolute bottom-0 left-0 right-0 h-0 bg-[var(--rust)] opacity-[0.06] transition-[height] duration-300 group-hover:h-full" aria-hidden />
        {tagItems.length > 0 ? (
          <div className="relative z-10 mb-4 flex flex-wrap items-center gap-1.5 min-w-0">
            {tagItems.map((tag) => (
              <span
                key={tag.id}
                className="text-xs font-semibold tracking-widest uppercase px-2.5 py-1 rounded-sm bg-[var(--warm)]/15 text-[var(--warm)] shrink-0"
              >
                {tag.name}
              </span>
            ))}
          </div>
        ) : null}
        <h2 className="relative z-10 text-xl font-bold leading-tight text-[var(--dark)] mb-2" style={{ fontFamily: "var(--font-playfair)" }}>
          {affair.title}
        </h2>
        {descriptionText ? (
          <p className="relative z-10 line-clamp-2 text-base text-[var(--muted)] font-light leading-relaxed mb-4">
            {descriptionText}
          </p>
        ) : null}
        <div className="relative z-10 flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2 text-base text-[var(--dark)] font-semibold">
            <span>{affair.price} €</span>
            {!isAvailable && (
              <span className="ml-2 text-[var(--rust)] font-medium">{t.card.noSlots}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}