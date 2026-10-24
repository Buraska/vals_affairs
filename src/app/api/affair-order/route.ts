import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { invoiceService } from '@/app/lib/ZohoClient/ZohoClient'
import { MailServce } from '@/app/lib/mail/mailService'
import type { affairOrderPostJson, TicketOrderDTO } from '@/app/lib/affairOrderTypes'
import { checkTypeAndSlice, generateOrderRef, isValidEmail } from '@/utilities/utility'
import type { Invoice } from '@trieb.work/zoho-ts/dist/types/invoice'

const LIMITS = {
  name: 200,
  email: 254,
  phone: 40,
  age: 50,
  notes: 5000,
  affairTitle: 500,
  ticketQuery: 500,
} as const



export type { affairOrderPostJson, TicketOrderDTO } from '@/app/lib/affairOrderTypes'

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const b = body as affairOrderPostJson
  
  const orderRef = generateOrderRef()
  const date = Date()
  const affairId = checkTypeAndSlice(b.affairId, 200)
  const name = checkTypeAndSlice(b.customerName, LIMITS.name)
  const email = checkTypeAndSlice(b.email, LIMITS.email)
  const phone = checkTypeAndSlice(b.phone, LIMITS.phone)
  const age = checkTypeAndSlice(b.age, LIMITS.age)
  const notes = checkTypeAndSlice(b.notes, LIMITS.notes)
  const agree = b.agree === true
  const affairTitle = checkTypeAndSlice(b.affairTitle, LIMITS.affairTitle)
  const ticketDTOs: TicketOrderDTO[] = b.ticketDTOs

  if (!affairId || !name || !email || !phone || !agree || !affairTitle) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const payload = await getPayload({ config: configPromise })
  const affairResult = await payload.find({
    collection: 'Affair',
    depth: 0,
    limit: 1,
    where: { id: { equals: affairId } },
  })
  const affair = affairResult.docs[0]
  if (!affair) {
    return NextResponse.json({ error: 'Affair not found' }, { status: 404 })
  }
  if (affair.archived === true) {
    return NextResponse.json({ error: 'Affair is archived and no longer available' }, { status: 409 })
  }

  MailServce.subscribeUser(email, name)

  const items = (ticketDTOs ?? [])
    .filter((t) => (t?.qty ?? 0) > 0)
    .map((t) => ({
      ticketName: `${b.affairTitle}: ${String(t.name ?? '')}`.slice(0, 500),
      qty: t.qty ?? 0,
      unitPrice: t.price ?? 0,
      subtotal: t.subtotal ?? 0,
    }))

  const con = await invoiceService.contact.create({contact_name: `${name}`, customer_sub_type: 'individual', phone})
  const conPerson = await invoiceService.contactperson.create({contact_id: con.contact_id, email, phone, last_name: name})

  const invoice: Invoice = await invoiceService.invoice.create({
    customer_id: con.contact_id,
    contact_persons: [conPerson.contact_person_id],
    line_items: items.map((i) => ({item_id: "", name: i.ticketName, quantity: i.qty, rate: i.unitPrice})),
    is_inclusive_tax: true},)
  
  await invoiceService.invoice.sentEmail(invoice.invoice_id)
  await payload.sendEmail({
    to: 'valseAffairs@gmail.com, gulnaravals@gmail.com',
    subject: `Новая заявка: ${affairTitle} (${orderRef})`,
    text: [
      `Номер заявки: ${orderRef}`,
      `Дата: ${date}`,
      `Мероприятие: ${affairTitle}`,
      `ID мероприятия: ${affairId}`,
      '',
      'Контактные данные:',
      `Имя: ${name}`,
      `Email: ${email}`,
      `Телефон: ${phone}`,
      `Возраст: ${age || 'не указан'}`,
      `Дополнительная информация: ${notes || 'не указана'}`,
      `Согласие: ${agree ? 'да' : 'нет'}`,
      '',
      'Билеты:',
      ...(items.length
        ? items.flatMap((item) => [
            `${item.ticketName}`,
            `  Количество: ${item.qty}`,
            `  Цена: ${item.unitPrice}`,
            `  Сумма: ${item.subtotal}`,
          ])
        : ['Билеты не выбраны']),
    ].join('\n'),
  })

  return NextResponse.json({ ok: true, orderRef })
}
