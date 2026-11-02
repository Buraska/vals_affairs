import type { Locale } from '@/app/lib/localization/i18n'
import type { Affair } from '@/payload-types'

export type TicketOrderDTO = {
  name: string
  qty: number
  price: number
  subtotal: number
}

export function getTicketOrder(
  tickets: Affair['tickets'],
  qParam: string,
): { ticketDTOs: TicketOrderDTO[]; totalPrice: number } {
  const quantities = qParam.split(',').map((value) => Math.max(0, parseInt(value, 10) || 0))
  let totalPrice = 0
  const ticketDTOs = tickets.map((ticket, i) => {
    const qty = quantities[i] ?? 0
    const price = ticket['ticket price'] ?? 0
    const subtotal = qty * price
    const name = typeof ticket.ticket === 'string' ? '—' : ticket.ticket.name ?? '—'
    totalPrice += subtotal
    return { name, qty, price, subtotal }
  })
  return { ticketDTOs, totalPrice }
}

export type affairOrderPostJson = {
  affairId: string
  customerName: string
  affairTitle: string
  email: string
  phone: string
  age: string
  notes: string
  agree: boolean
  locale: Locale
  ticketDTOs: TicketOrderDTO[]
}
