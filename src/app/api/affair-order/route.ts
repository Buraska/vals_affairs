import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { defaultLocale, isValidLocale } from '@/app/lib/localization/i18n'
import { getTranslations } from '@/app/lib/localization/translations'
import { mailTemplateText } from '@/app/lib/mail/mailTemplate'
import { MailServce } from '@/app/lib/mail/mailService'
import type { affairOrderPostJson, TicketOrderDTO } from '@/app/lib/affairOrderTypes'
import { checkTypeAndSlice, generateOrderRef, isValidEmail } from '@/utilities/utility'
import { isAffairArchived } from '@/utilities/affairStatus'

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
  if (isAffairArchived(affair)) {
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

  const locale = isValidLocale(String(b.locale)) ? b.locale : defaultLocale
  const translations = getTranslations(locale).orderEmail
  const webInfo = await payload.findGlobal({ slug: 'web-info', depth: 0 })
  const confirmationText = mailTemplateText(
    translations.applicationReceivedBody,
    translations.applicationReceivedSubject,
    locale,
    { siteName: webInfo.siteName, email: webInfo.email, phone: webInfo.phone },
  )
  await payload.sendEmail({
    to: email,
    subject: translations.applicationReceivedSubject,
    text: confirmationText,
  })
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
