'use client'

import Link from 'next/link'
import { useState } from 'react'
import { AffairTicketsBlock, type TicketItem } from './AffairTicketsBlock'
import { useLanguage } from '@/app/contexts/LanguageContext'

export function AffairTicketsWithOrderLink({
  affairId,
  tickets,
  hasTickets,
  price,
  locale,
}: {
  affairId: string
  tickets: TicketItem[]
  hasTickets: boolean
  price?: number
  locale: string
}) {
  const { t } = useLanguage()
  const [quantities, setQuantities] = useState<number[]>(tickets.map(() => 0))

  const hasAnyTickets = quantities.some((q) => q > 0)
  const orderHref =
    hasTickets && hasAnyTickets
      ? `/${locale}/affair/${affairId}/order?q=${quantities.join(',')}`
      : `/${locale}/affair/${affairId}/order`
  const isDisabled = hasTickets && !hasAnyTickets

  return (
    <>
      {hasTickets ? (
        <AffairTicketsBlock
          tickets={tickets}
          quantities={quantities}
          setQuantities={setQuantities}
        />
      ) : price != null ? (
        <div className="mb-4 flex items-center gap-4">
          <span className="text-3xl font-semibold text-amber-900">
            {price} €
          </span>
        </div>
      ) : null}
      <div className={hasTickets ? 'mt-4' : ''}>
        {isDisabled ? (
          <span
            role="button"
            aria-disabled="true"
            className="inline-block cursor-not-allowed rounded-md bg-gray-400 px-6 py-3 font-medium text-white"
          >
            {t.affair.takePlace}
          </span>
        ) : (
          <Link
            href={orderHref}
            className="inline-block rounded-sm bg-gray-600 px-6 py-3 font-medium text-white transition hover:bg-gray-800"
          >
            {t.affair.takePlace}
          </Link>
        )}
      </div>
    </>
  )
}
