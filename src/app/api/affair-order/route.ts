import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import {
  AffairOrderEmailParams,
  buildAffairOrderEmailHtml,
  buildAffairOrderEmailText,
} from '@/app/lib/mail/affairOrderEmailTemplate'
import { lexicalToHtml } from '@/utilities/lexicalToHtml'
import { checkTypeAndSlice, generateOrderRef, isValidEmail } from '@/utilities/utility'
import type { affairOrderPostJson, TicketOrderDTO } from '@/app/lib/affairOrderTypes'
import { MAIL_ENDPOINT_SUBSCRIBE, MAIL_ENDPOINT_SUBSCRIBE_ARGS } from '../endpoints'
import { MailServce } from '@/app/lib/mail/mailService'
import { invoiceService } from '@/app/lib/ZohoClient/ZohoClient'
import { CreateContactPerson } from '@trieb.work/zoho-ts/dist/types/contactPerson'
import { CreateContact } from '@trieb.work/zoho-ts'
import { CreateInvoice, Invoice } from '@trieb.work/zoho-ts/dist/types/invoice'

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

  MailServce.subscribeUser(email, name)


  const payload = await getPayload({ config: configPromise })

  const affair = await payload
    .findByID({
      collection: 'Affair',
      id: affairId,
      depth: 0,
      overrideAccess: true,
    })
    .catch(() => null)
  if (!affair) {
    return NextResponse.json({ error: 'Invalid affairId' }, { status: 400 })
  }

  const bank = await payload.findGlobal({
    slug: 'bank-credentials',
    locale: b.locale,
    depth: 0,
    overrideAccess: true,
  })

  const webInfo = await payload.findGlobal({
    slug: 'web-info',
    locale: b.locale,
    depth: 0,
    overrideAccess: true,
  })

  const instructionLexical =
    bank.instruction?.[b.locale] ?? bank.instruction?.ee ?? bank.instruction?.en ?? null



  const items = (ticketDTOs ?? [])
    .filter((t) => (t?.qty ?? 0) > 0)
    .map((t) => ({
      ticketName: String(t.name ?? '').slice(0, 500),
      qty: t.qty ?? 0,
      unitPrice: t.price ?? 0,
      subtotal: t.subtotal ?? 0,
    }))
  const total = items.reduce((sum, i) => sum + (i.subtotal ?? 0), 0)
  const templateParams: AffairOrderEmailParams = {
    customerName: name,
    affairTitle: affairTitle,
    email: email,
    phone: phone,
    locale: b.locale,
    ticketDTOs: b.ticketDTOs,
    bankInstructionHtml: lexicalToHtml(instructionLexical),
    bankInstructionLexical: instructionLexical,
    bankAccountNumber: bank.accountNumber ?? "",
    bankCredentials: bank.credentials ?? "",
    orderRef: orderRef,
    placedAt: date,
    branding: {
      siteName: webInfo.siteName,
      email: webInfo.email,
      phone: webInfo.phone,
    },
  }

  const html = await buildAffairOrderEmailHtml(templateParams)

  const con = await invoiceService.contact.create({contact_name: `${name} ${orderRef}`, customer_sub_type: 'individual', phone})
  const conPerson = await invoiceService.contactperson.create({contact_id: con.contact_id, email, phone, last_name: name})

  const invoice: Invoice = await invoiceService.invoice.create({
    customer_id: con.contact_id,
    contact_persons: [conPerson.contact_person_id],
    line_items: items.map((i) => ({item_id: "", name: i.ticketName, quantity: i.qty, rate: i.unitPrice}))})
  
  await invoiceService.invoice.sentEmail(invoice.invoice_id)

  return NextResponse.json({ ok: true, orderRef })
}
