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
          <span className="text-2xl font-semibold text-[var(--dark)]" style={{ fontFamily: "var(--font-playfair)" }}>
            {price} €
          </span>
        </div>
      ) : null}
      <div className={hasTickets ? 'mt-4' : ''}>
        {isDisabled ? (
          <span
            role="button"
            aria-disabled="true"
            className="inline-block cursor-not-allowed rounded-sm bg-[var(--border)] px-6 py-3 text-sm font-medium text-[var(--muted)]"
          >
            {t.affair.takePlace}
          </span>
        ) : (
          <Link
            href={orderHref}
            className="inline-block rounded-sm bg-[var(--dark)] px-6 py-3 text-sm font-medium text-[var(--cream)] transition hover:bg-[var(--rust)]"
          >
            {t.affair.takePlace}
          </Link>
        )}
      </div>
    </>
  )
}
