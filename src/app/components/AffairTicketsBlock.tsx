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
    <div className="flex flex-col gap-3">
      {tickets.map((ticket, i) => (
        <div
          key={ticket.id ?? i}
          className="flex flex-wrap  items-center justify-start gap-2 "
        >

          <div className="flex border border-amber-400  rounded-lg items-center ">
            <button
              type="button"
              aria-label="-"
              className="h-8 w-8 rounded-sm bg-white text-amber-800 transition hover:bg-gray-100"
              onClick={() => updateQuantity(i, (quantities[i] ?? 0) - 1)}
            >
              −
            </button>
            <input
              min={0}
              className="h-8 w-8  bg-white text-center text-amber-900"
              value={quantities[i] ?? 0}
              onChange={(e) =>
                updateQuantity(i, Number(e.target.value) || 0)
              }
            />
            <button
              type="button"
              aria-label="Увеличить"
              className="h-8 w-8 rounded-sm bg-white text-amber-800 transition hover:bg-gray-100"
              onClick={() => updateQuantity(i, (quantities[i] ?? 0) + 1)}
            >
              +
            </button>
          </div>
          <div>
            <span className="font-medium text-amber-900">
              {ticket['ticket name'] ?? t.affair.ticket}
            </span>
            {ticket['ticket price'] != null && (
              <span className="ml-2 text-amber-800">
                {ticket['ticket price']} €
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
