'use client'
import { useLanguage } from '@/app/contexts/LanguageContext'

import { Affair } from '@/payload-types'

export type Ticket = Affair['tickets'][0]

export function AffairTicketsBlock({
  tickets,
  quantities,
  setQuantities,
}: {
  tickets: Ticket[]
  quantities: number[]
  setQuantities: React.Dispatch<React.SetStateAction<number[]>>
}) {
  const updateQuantity = (index: number, value: number) => {
    const next = Math.max(0, Math.floor(value))
    setQuantities((prev) => {
      const nextQuantities = [...prev]
      nextQuantities[index] = next
      return nextQuantities
    })
  }
  const { t } = useLanguage()

  return (
    <div className="flex flex-col gap-2.5">
      {tickets.map((ticket, i) => {
        const qty = quantities[i] ?? 0
        const name =
          typeof ticket.ticket === 'string' ? t.affair.ticket : ticket.ticket.name
        const price = ticket['ticket price']
        const selected = qty > 0

        return (
          <div
            key={ticket.id ?? i}
            className={`flex items-center justify-between gap-3 rounded-xl border p-3 transition-colors ${
              selected
                ? 'border-[var(--rust)] bg-[var(--rust)]/[0.06]'
                : 'border-[var(--border)] hover:border-[var(--muted)]'
            }`}
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-[var(--dark)]">{name}</p>
              {price != null && (
                <p className="mt-0.5 text-sm font-medium text-[var(--rust)]">{price} €</p>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-1 rounded-full border border-[var(--border)] bg-white p-1">
              <button
                type="button"
                aria-label="-"
                disabled={qty === 0}
                className="flex h-8 w-8 items-center justify-center rounded-full text-lg leading-none text-[var(--dark)] transition-colors hover:bg-[var(--rust)] hover:text-white disabled:cursor-not-allowed disabled:text-[var(--border)] disabled:hover:bg-transparent"
                onClick={() => updateQuantity(i, qty - 1)}
              >
                −
              </button>
              <input
                min={0}
                inputMode="numeric"
                className="h-8 w-10 border-0 bg-transparent text-center font-semibold text-[var(--dark)] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                value={qty}
                onChange={(e) => updateQuantity(i, Number(e.target.value) || 0)}
              />
              <button
                type="button"
                aria-label="+"
                className="flex h-8 w-8 items-center justify-center rounded-full text-lg leading-none text-[var(--dark)] transition-colors hover:bg-[var(--rust)] hover:text-white"
                onClick={() => updateQuantity(i, qty + 1)}
              >
                +
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
