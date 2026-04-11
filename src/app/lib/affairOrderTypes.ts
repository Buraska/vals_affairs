import type { Locale } from '@/app/lib/localization/i18n'

export type TicketOrderDTO = {
  name: string
  qty: number
  price: number
  subtotal: number
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
