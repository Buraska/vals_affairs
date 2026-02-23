'use client'
import type { Affair } from "@/payload-types"
import { formatDateRange } from "@/utilities/utility"
import { lexicalToPlainText } from "@/utilities/lexicalToPlainText"
import Link from "next/link"
import NextImage from 'next/image'
import { getMediaUrl } from "@/utilities/getMediaUrl"
import { useLanguage } from "@/app/contexts/LanguageContext"

export type AffairCardData = Pick<Affair, 'id' | 'images' | 'title' | 'description' | 'price' | 'isAvailable' | 'start date' | 'end date'>

export const AffairCard = ({ affair, locale }: { affair: AffairCardData; locale: string }) => {
  const { t } = useLanguage()
  const firstImage = affair.images?.[0].image
  const isAvailable = affair.isAvailable !== false

  const cardPicture = typeof firstImage === 'object' && firstImage ? firstImage.sizes?.card : null
  const imgUrl = cardPicture?.url
  const descriptionText = lexicalToPlainText(affair.description)

  return (
    <Link
      href={`/${locale}/affair/${affair.id}`}
      className="flex flex-col  gap-3 border border-amber-100 bg-amber-50/30 transition hover:border-amber-200 hover:bg-amber-50"
    >
      <div className="relative mt:mb-40 overflow-hidden bg-amber-100 m-5 aspect-[4/3]">
        {firstImage && typeof firstImage !== 'string' && imgUrl ? (
          <NextImage
            src={getMediaUrl(imgUrl, firstImage.updatedAt)}
            fill
            sizes="(max-width: 640px) 100vw, 400px"
            alt={firstImage.alt ?? ""}
            className="object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-2xl text-amber-300" aria-hidden>→</span>
        )}
      </div>

      <div className="flex flex-wrap items-start justify-between gap-2 p-4 pt-0">
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-amber-900">{affair.title}</h2>
          <p className="mt-0.5 text-sm text-stone-600">
            {formatDateRange(affair['start date'], affair['end date'])}
          </p>
          {descriptionText ? (
            <p className="mt-1 line-clamp-2 text-sm text-stone-600">
              {descriptionText}
            </p>
          ) : null}
          <p className="mt-1 text-xl font-semibold text-amber-800">{affair.price} €</p>
        </div>
        <div className="shrink-0 text-right">
          {isAvailable ? (
            <span className="text-sm font-medium text-amber-800">{t.card.available}</span>
          ) : (
            <span className="text-sm font-semibold text-rose-700">{t.card.noSlots}</span>
          )}
        </div>
      </div>
    </Link>
  )
}