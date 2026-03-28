'use client'

import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import { useLanguage } from '@/app/contexts/LanguageContext'
import { Affair } from '@/payload-types'
import { TicketOrderDTO } from './AffairOrderForm'


export function AffairOrderSummary({
  affairTitle,
  affairPrice,
  dateRangeText,
  tickets,
  totalPrice,
}: {
  affairTitle: string | null | undefined
  affairPrice: number | null | undefined
  dateRangeText: string
  tickets: TicketOrderDTO[],
  totalPrice: Number
}) {
  const { t } = useLanguage()

  return (
    <>
      <p className="mb-1 font-medium text-[var(--dark)]">{affairTitle}</p>
      <p className="mb-4 text-sm text-[var(--muted)]">{dateRangeText}</p>
      {tickets.length > 0 ? (
        <>
          <ul className="space-y-2 border-t border-[var(--border)] pt-4">
            {tickets.map((ticket, i) => {
              if (ticket.qty === 0) return null
              return (
                <li
                  key={i}
                  className="flex justify-between gap-4 text-sm text-[var(--muted)]"
                >
                  <span>
                    {ticket.name} × {ticket.qty}
                  </span>
                  <span className="font-medium text-[var(--dark)]">
                    {ticket.subtotal} €
                  </span>
                </li>
              )
            })}
          </ul>
          {tickets.length !== 0 ? (
            <p className="mt-3 border-t border-[var(--border)] pt-3 text-right font-semibold text-[var(--dark)]">
              {t.affair.total}: {totalPrice.toFixed(2)} €
            </p>
          ) : (
            <p className="mt-3 text-sm text-[var(--muted)]">
              {t.affair.noTicketsNote}
            </p>
          )}
        </>
      ) : (
        <p className="text-[var(--muted)]">
          {t.affair.participation}: <strong className="text-[var(--dark)]">{affairPrice} €</strong>
        </p>
      )}
    </>
  )
}
