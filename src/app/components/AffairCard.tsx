'use client'
import type { Affair} from "@/payload-types"
import { formatDateRange } from "@/utilities/utility"
import { lexicalToPlainText } from "@/utilities/lexicalToPlainText"
import Link from "next/link"
import { useLanguage } from "@/app/contexts/LanguageContext"
import clsx from 'clsx'
import SmartImage from "@/app/components/SmartImage"
import { pickMediaSize } from "@/utilities/pickMediaSize"


export const AffairCard = ({ affair, locale, className = "" }: { affair: Affair; locale: string, className: string }) => {
  const { t } = useLanguage()
  const firstImage = affair.images?.[0].image
  const isAvailable = affair.isAvailable !== false

  const descriptionText = lexicalToPlainText(affair.description)
  const categoryTitle = typeof affair.category === 'object' && affair.category != null ? affair.category.title : null
  const tagItems = (affair.tags ?? [])
    .map((t) => (typeof t.tag === 'object' && t.tag != null ? t.tag : null))
    .filter((tag): tag is NonNullable<typeof tag> => tag != null && 'name' in tag)

  return (
    <Link
      href={`/${locale}/affair/${affair.id}`}
      className={clsx(className, "group relative flex flex-col bg-[var(--card-bg)] transition hover:bg-[#FFFDF6] overflow-hidden")}
    >
      {(firstImage && typeof firstImage !== 'string') ? (
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-[var(--border)]">
          <SmartImage
            src={pickMediaSize(firstImage, 'medium').url || firstImage.url || ''}
            alt={firstImage.alt ?? ''}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
          />
        </div>
      ) : (
        <div className="w-full aspect-[16/9] flex items-center justify-center bg-[var(--border)] text-[var(--muted)]" aria-hidden>→</div>
      )}
      <div className="relative flex flex-col p-6 overflow-hidden">
        <span className="absolute bottom-0 left-0 right-0 h-0 bg-[var(--rust)] opacity-[0.06] transition-[height] duration-300 group-hover:h-full" aria-hidden />
        <div className="relative z-10 flex items-start justify-between gap-4 mb-4">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            {categoryTitle ? (
              <span className="text-[0.65rem] font-semibold tracking-widest uppercase px-2.5 py-1 rounded-sm bg-[var(--sage)]/15 text-[var(--sage)] shrink-0">
                {categoryTitle}
              </span>
            ) : null}
            {tagItems.length > 0 ? (
              tagItems.map((tag) => (
                <span
                  key={tag.id}
                  className="text-[0.65rem] font-semibold tracking-widest uppercase px-2.5 py-1 rounded-sm bg-[var(--warm)]/15 text-[var(--warm)] shrink-0"
                >
                  {tag.name}
                </span>
              ))
            ) : null}
          </div>
          <span className="text-xs text-[var(--muted)] font-light tracking-wide shrink-0">
            {formatDateRange(affair['start date'], affair['end date'], locale)}
          </span>
        </div>
        <h2 className="relative z-10 text-lg font-bold leading-tight text-[var(--dark)] mb-2" style={{ fontFamily: "var(--font-playfair)" }}>
          {affair.title}
        </h2>
        {descriptionText ? (
          <p className="relative z-10 line-clamp-2 text-sm text-[var(--muted)] font-light leading-relaxed mb-4">
            {descriptionText}
          </p>
        ) : null}
        <div className="relative z-10 flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2 text-xs text-[var(--muted)] font-light">
            <span>{affair.price} €</span>
            {!isAvailable && (
              <span className="ml-2 text-[var(--rust)] font-medium">{t.card.noSlots}</span>
            )}
          </div>
          <span className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center group-hover:bg-[var(--dark)] group-hover:border-[var(--dark)] transition-colors">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="group-hover:[&_path]:stroke-[var(--cream)]">
              <path d="M2 7H12M8 3L12 7L8 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  )
}