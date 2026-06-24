'use client'

import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import { useLanguage } from '@/app/contexts/LanguageContext'
import { Affair } from '@/payload-types'
import type { TicketOrderDTO } from '@/app/lib/affairOrderTypes'
import { Ticket } from './AffairTicketsBlock'


export function AffairOrderSummary({
  affairTitle,
  affairPrice,
  dateRangeText,
  tickets,
}: {
  affairTitle: string | null | undefined
  affairPrice: number | null | undefined
  dateRangeText: string
  tickets: Ticket[],
}) {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const qParam = searchParams.get('q') ?? ''


  const {ticketDTOs, totalPrice} = useMemo(() => {
    const quantities = qParam
      ? qParam.split(',').map((s) => Math.max(0, parseInt(s, 10) || 0))
      : tickets.map(() => 0)
    const paddedQuantities = tickets.map((_, i) => quantities[i] ?? 0)
    let totalPrice = 0
    const ticketDTOs: TicketOrderDTO[] = tickets.map((ticket, i) => {
      const qty = paddedQuantities[i] ?? 0
      const price = ticket['ticket price'] ?? 0
      const subtotal = qty * price
      const name = typeof ticket.ticket === 'string' ? '—' : ticket.ticket.name ?? '—'
      totalPrice += subtotal
      return {
        name,
        qty,
        price,
        subtotal,
      }
    })
    return {ticketDTOs, totalPrice}
  }, [qParam])

  return (
    <>
      <p className="mb-1 font-medium text-[var(--dark)]">{affairTitle}</p>
      <p className="mb-4 text-sm text-[var(--muted)]">{dateRangeText}</p>
      {tickets.length > 0 ? (
        <>
          <ul className="space-y-2 border-t border-[var(--border)] pt-4">
            {ticketDTOs.map((ticket, i) => {
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
