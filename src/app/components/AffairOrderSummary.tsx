'use client'

import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import { useLanguage } from '@/app/contexts/LanguageContext'
import { Affair } from '@/payload-types'
import type { TicketOrderDTO } from '@/app/lib/affairOrderTypes'
import { buildGoogleCalendarUrl } from '@/utilities/utility'
import { Ticket } from './AffairTicketsBlock'


export function AffairOrderSummary({
  affairTitle,
  affairPrice,
  startDate,
  endDate,
  dateRangeText,
  tickets,
}: {
  affairTitle: string | null | undefined
  affairPrice: number | null | undefined
  startDate: string
  endDate?: string | null
  dateRangeText: string
  tickets: Ticket[],
}) {
  const { t } = useLanguage()
  const calendarUrl = buildGoogleCalendarUrl({
    title: affairTitle ?? '',
    start: startDate,
    end: endDate,
    details: t.affair.calendarDetails,
    allDay: true,
  })
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
      <p className="mb-3 text-sm text-[var(--muted)]">{dateRangeText}</p>
      <a
        href={calendarUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--rust)] px-4 py-2.5 text-sm font-medium text-[var(--rust)] transition-colors hover:bg-[var(--rust)] hover:text-white"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        {t.affair.addToCalendar}
      </a>
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
