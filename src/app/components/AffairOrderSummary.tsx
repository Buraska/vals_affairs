'use client'

import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import { useLanguage } from '@/app/contexts/LanguageContext'
import { Affair } from '@/payload-types'

type Ticket = Affair['tickets'][0]

export function AffairOrderSummary({
  affairTitle,
  affairPrice,
  dateRangeText,
  tickets,
}: {
  affairTitle: string | null | undefined
  affairPrice: number | null | undefined
  dateRangeText: string
  tickets: Ticket[]
}) {
  const searchParams = useSearchParams()
  const { t } = useLanguage()
  const qParam = searchParams.get('q') ?? ''

  const { lines, total, hasTicketSelection } = useMemo(() => {
    const quantities = qParam
      ? qParam.split(',').map((s) => Math.max(0, parseInt(s, 10) || 0))
      : tickets.map(() => 0)
    const paddedQuantities = tickets.map((_, i) => quantities[i] ?? 0)
    let totalCents = 0
    const lineList = tickets.map((ticket, i) => {
      const qty = paddedQuantities[i] ?? 0
      const price = ticket['ticket price'] ?? 0
      const subtotal = qty * price
      totalCents += subtotal
      return {
        name: ticket['ticket name'] ?? '—',
        qty,
        price,
        subtotal,
      }
    })
    return {
      lines: lineList,
      total: totalCents,
      hasTicketSelection: lineList.some((l) => l.qty > 0),
    }
  }, [qParam, tickets])

  return (
    <>
      <p className="mb-1 font-medium text-[var(--dark)]">{affairTitle}</p>
      <p className="mb-4 text-sm text-[var(--muted)]">{dateRangeText}</p>
      {tickets.length > 0 ? (
        <>
          <ul className="space-y-2 border-t border-[var(--border)] pt-4">
            {lines.map((line, i) => {
              if (line.qty === 0) return null
              return (
                <li
                  key={i}
                  className="flex justify-between gap-4 text-sm text-[var(--muted)]"
                >
                  <span>
                    {line.name} × {line.qty}
                  </span>
                  <span className="font-medium text-[var(--dark)]">
                    {line.subtotal} €
                  </span>
                </li>
              )
            })}
          </ul>
          {hasTicketSelection && (
            <p className="mt-3 border-t border-[var(--border)] pt-3 text-right font-semibold text-[var(--dark)]">
              {t.affair.total}: {total} €
            </p>
          )}
          {!hasTicketSelection && (
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
