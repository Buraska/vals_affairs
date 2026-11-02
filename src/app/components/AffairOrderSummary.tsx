'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/app/contexts/LanguageContext'
import { getTicketOrder } from '@/app/lib/affairOrderTypes'
import { buildGoogleCalendarUrl } from '@/utilities/utility'
import type { Ticket } from './AffairTicketsBlock'


export function AffairOrderSummary({
  affairTitle,
  affairPrice,
  startDate,
  endDate,
  dateRangeText,
  tickets,
  archived = false,
}: {
  affairTitle: string | null | undefined
  affairPrice: number | null | undefined
  startDate: string
  endDate?: string | null
  dateRangeText: string
  tickets: Ticket[]
  archived?: boolean
}) {
  const { t } = useLanguage()
  const calendarUrl = buildGoogleCalendarUrl({
    title: affairTitle ?? '',
    start: startDate,
    end: endDate,
    details: t.affair.calendarDetails,
    allDay: true,
  })

  return (
    <>
      {archived && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-950" role="status">
          <svg className="mt-0.5 shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 8v4m0 4h.01M10.3 3.86 2.7 17a2 2 0 0 0 1.73 3h15.14a2 2 0 0 0-3.46 0Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <p className="font-bold">{t.affair.archived}</p>
            <p className="mt-1 text-sm">{t.affair.archivedNotice}</p>
          </div>
        </div>
      )}
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
        <Suspense fallback={<p className="border-t border-[var(--border)] pt-4 text-sm text-[var(--muted)]">…</p>}>
          <SelectedTicketLines tickets={tickets} totalLabel={t.affair.total} />
        </Suspense>
      ) : (
        <p className="text-[var(--muted)]">
          {t.affair.participation}: <strong className="text-[var(--dark)]">{affairPrice} €</strong>
        </p>
      )}
    </>
  )
}

function SelectedTicketLines({ tickets, totalLabel }: { tickets: Ticket[]; totalLabel: string }) {
  const qParam = useSearchParams().get('q') ?? ''
  const { ticketDTOs, totalPrice } = getTicketOrder(tickets, qParam)

  return (
    <>
      <ul className="space-y-2 border-t border-[var(--border)] pt-4">
        {ticketDTOs.map((ticket, i) => {
          if (ticket.qty === 0) return null
          return (
            <li key={i} className="flex justify-between gap-4 text-sm text-[var(--muted)]">
              <span>{ticket.name} × {ticket.qty}</span>
              <span className="font-medium text-[var(--dark)]">{ticket.subtotal} €</span>
            </li>
          )
        })}
      </ul>
      <p className="mt-3 border-t border-[var(--border)] pt-3 text-right font-semibold text-[var(--dark)]">
        {totalLabel}: {totalPrice.toFixed(2)} €
      </p>
    </>
  )
}
