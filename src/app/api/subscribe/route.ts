import { NextResponse } from 'next/server'
import { MailServce } from '@/app/lib/mail/mailService'
import { checkTypeAndSlice, isValidEmail } from '@/utilities/utility'

const LIMITS = {
  name: 200,
  email: 254,
} as const

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { name, email } = body as { name?: unknown; email?: unknown }
  const cleanName = checkTypeAndSlice(name, LIMITS.name).trim()
  const cleanEmail = checkTypeAndSlice(email, LIMITS.email).trim()

  if (!isValidEmail(cleanEmail) || cleanName.length === 0) {
    return NextResponse.json({ error: 'Invalid name or email' }, { status: 400 })
  }

  try {
    const res = await MailServce.subscribeUser(cleanEmail, cleanName)
    if (!res.ok) {
      return NextResponse.json({ error: 'Subscription failed' }, { status: 502 })
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Subscription failed' }, { status: 502 })
  }
}
