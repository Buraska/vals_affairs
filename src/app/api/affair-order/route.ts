import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { isValidLocale, type Locale } from '@/app/lib/localization/i18n'
import {
  AffairOrderEmailParams,
  buildAffairOrderEmailHtml,
  buildAffairOrderEmailText,
} from '@/utilities/affairOrderEmailTemplate'
import { lexicalToHtml } from '@/utilities/lexicalToHtml'
import { generateOrderRef } from '@/utilities/utility'
import { TicketOrderDTO } from '@/app/components/AffairOrderForm'
import { MAIL_ENDPOINT_SUBSCRIBE, MAIL_ENDPOINT_SUBSCRIBE_ARGS } from '../endpoints'

const LIMITS = {
  name: 200,
  email: 254,
  phone: 40,
  age: 50,
  notes: 5000,
  affairTitle: 500,
  ticketQuery: 500,
} as const

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function checkTypeAndSlice(obj: any, limit: number): string {
  return typeof obj === 'string' ? obj.trim().slice(0, limit) : ''
}

async function subscribeUser(email: string, name: string): Promise<Response>{
  const errors: string[] = []
  if (!isValidEmail(email)) {
    errors.push("Invalid email")
  }
  if (!name){
    errors.push("Invalid name")
  }
  if (errors.length !== 0){
    return NextResponse.json({ error: errors.join(', ') }, { status: 400 })
  }
  const body = {
    ...MAIL_ENDPOINT_SUBSCRIBE_ARGS,
    email,
    name,
  }

  const res = await fetch(MAIL_ENDPOINT_SUBSCRIBE, {
    method: 'POST',
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(body),
  })

  if (!res.ok) console.log(`Cannot subscribe user: ERROR ${res.status} | ${await res.text()}`)

  return res;
}

export type affairOrderPostJson = {
  customerName: string,
  affairTitle: string,
  email: string,
  phone: string,
  age: string,
  notes: string,
  agree: boolean,
  locale: Locale,
  ticketDTOs: TicketOrderDTO[],
}

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

  const name = checkTypeAndSlice(b.customerName, LIMITS.name)
  const email = checkTypeAndSlice(b.email, LIMITS.email)
  const phone = checkTypeAndSlice(b.phone, LIMITS.phone)
  const age = checkTypeAndSlice(b.age, LIMITS.age)
  const notes = checkTypeAndSlice(b.notes, LIMITS.notes)
  const agree = b.agree === true
  const affairTitle = checkTypeAndSlice(b.affairTitle, LIMITS.affairTitle)
  const ticketDTOs: TicketOrderDTO[] = b.ticketDTOs

  if (!name || !email || !phone || !agree || !affairTitle) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  subscribeUser(email, name);

  const payload = await getPayload({ config: configPromise })
  const bank = await payload.findGlobal({
    slug: 'bank-credentials',
    locale: b.locale,
    depth: 0,
    overrideAccess: true,
  })

  
  const instructionLexical =
    bank.instruction?.[b.locale] ?? bank.instruction?.ee ?? bank.instruction?.en ?? null

  const orderRef = generateOrderRef()
  const date = Date()
  const siteName = (await payload.findGlobal({slug:'web-info'})).siteName

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
    siteName,
    orderRef: orderRef,
    placedAt: date,
  }

  const html = buildAffairOrderEmailHtml(templateParams)
  const text = buildAffairOrderEmailText(templateParams)
  const subject = `Order: ${affairTitle}`.slice(0, 250)

  try {
    await payload.sendEmail({
      from: 'The Next Chance <no-reply@thenextchance.eu>',
      to: email,
      subject,
      text,
      html,
    })
  } catch (err) {
    console.error('affair-order sendMail:', err)
    return NextResponse.json({ error: `Failed to send email: ${err}` }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
