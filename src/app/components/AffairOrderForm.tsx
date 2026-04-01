'use client'

import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { useMemo, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/app/contexts/LanguageContext'
import { affairOrderPostJson } from '../api/affair-order/route'
import { AffairOrderSummary } from './AffairOrderSummary'
import { Affair} from '@/payload-types'
import { useRouter, useSearchParams } from 'next/navigation'
import { Locale } from '../lib/localization/i18n'

type Ticket = Affair['tickets'][0]

export type TicketOrderDTO = {
  name: string,
  qty:number,
  price: number,
  subtotal: number,
}


export function AffairOrderForm({
  affair,
  locale,
  tickets,
  dateRangeText,
}: {
  affair: Affair
  locale: Locale
  tickets: Ticket[]
  dateRangeText: string
}) {
  const { t, lang } = useLanguage()
  const router = useRouter()
  const [phone, setPhone] = useState<string | undefined>()
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [successModalOpen, setSuccessModalOpen] = useState(false)

  function goHome() {
    router.push(`/${lang}`)
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)

    const customerName = String(fd.get('name') ?? '').trim()
    const email = String(fd.get('email') ?? '').trim()
    const age = String(fd.get('age') ?? '').trim()
    const notes = String(fd.get('notes') ?? '').trim()
    const agree = fd.get('agree') === 'on'

    if (!phone?.trim() || !agree) {
      setStatus('error')
      return
    }
    
    const postBody: affairOrderPostJson = {
      customerName,
      email,
      phone: phone.trim(),
      age,
      notes,
      agree: true,
      affairTitle: affair.title ?? "---",
      locale,
      ticketDTOs
    }

    setStatus('sending')
    try {
      const res = await fetch('/api/affair-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postBody),
      })

      if (!res.ok) {
        setStatus('error')
        return
      }

      setStatus('success')
      setSuccessModalOpen(true)
      form.reset()
      setPhone(undefined)
    } catch {
      setStatus('error')
    }
  }

  const searchParams = useSearchParams()
  const qParam = searchParams.get('q') ?? ''


  const {ticketDTOs, totalPrice} = useMemo(() => {
    const quantities = qParam
      ? qParam.split(',').map((s) => Math.max(0, parseInt(s, 10) || 0))
      : tickets.map(() => 0)
    const paddedQuantities = tickets.map((_, i) => quantities[i] ?? 0)
    let totalPrice = 0
    const ticketDTOs: TicketOrderDTO[] = tickets.map((ticket, i) => {
      const qty = paddedQuantities[i] ?? 0
      const price = ticket['ticket price'] ?? 0
      const subtotal = qty * price
      const name = typeof ticket.ticket === 'string' ? '—' : ticket.ticket.name ?? '—'
      totalPrice += subtotal
      return {
        name,
        qty,
        price,
        subtotal,
      }
    })
    return {ticketDTOs, totalPrice}
  }, [qParam])

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
      <div className="min-w-0 flex-1">
        <section id="order" className="scroll-mt-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="order-name" className="mb-1 block text-sm font-medium text-[var(--dark)]">
            {t.order.formName}
          </label>
          <input
            id="order-name"
            type="text"
            name="name"
            required
            disabled={status === 'sending'}
            className="w-full max-w-md rounded border border-[var(--border)] bg-[var(--card-bg)] px-3 py-2 text-[var(--dark)] placeholder:text-[var(--muted)] focus:border-[var(--warm)] focus:outline-none disabled:opacity-60"
            placeholder={t.order.placeholderName}
          />
        </div>

        <div>
          <label htmlFor="order-email" className="mb-1 block text-sm font-medium text-[var(--dark)]">
            {t.order.formEmail}
          </label>
          <input
            id="order-email"
            type="email"
            name="email"
            required
            disabled={status === 'sending'}
            className="w-full max-w-md rounded border border-[var(--border)] bg-[var(--card-bg)] px-3 py-2 text-[var(--dark)] placeholder:text-[var(--muted)] focus:border-[var(--warm)] focus:outline-none disabled:opacity-60"
          />
        </div>

        <div>
          <label htmlFor="order-phone" className="mb-1 block text-sm font-medium text-[var(--dark)]">
            {t.order.formPhone}
          </label>
          <div className="w-full max-w-md rounded border border-[var(--border)] bg-[var(--card-bg)] px-3 py-2 text-[var(--dark)] placeholder:text-[var(--muted)] focus-within:border-[var(--warm)] has-[:disabled]:opacity-60">
            <PhoneInput
              id="order-phone"
              name="phone"
              defaultCountry="EE"
              value={phone}
              onChange={setPhone}
              required
              disabled={status === 'sending'}
            />
          </div>
        </div>

        <div>
          <label htmlFor="order-age" className="mb-1 block text-sm font-medium text-[var(--dark)]">
            {t.order.formAge}
          </label>
          <input
            id="order-age"
            type="text"
            name="age"
            required
            disabled={status === 'sending'}
            className="w-full max-w-md rounded border border-[var(--border)] bg-[var(--card-bg)] px-3 py-2 text-[var(--dark)] placeholder:text-[var(--muted)] focus:border-[var(--warm)] focus:outline-none disabled:opacity-60"
            placeholder={t.order.placeholderAge}
          />
        </div>

        <div>
          <label htmlFor="order-notes" className="mb-1 block text-sm font-medium text-[var(--dark)]">
            {t.order.formNotes}
          </label>
          <textarea
            id="order-notes"
            name="notes"
            rows={3}
            disabled={status === 'sending'}
            className="w-full max-w-md rounded border border-[var(--border)] bg-[var(--card-bg)] px-3 py-2 text-[var(--dark)] placeholder:text-[var(--muted)] focus:border-[var(--warm)] focus:outline-none disabled:opacity-60"
            placeholder={t.order.placeholderNotes}
          />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <input
              id="order-agree"
              type="checkbox"
              name="agree"
              required
              disabled={status === 'sending'}
              className="h-4 w-4 rounded border-[var(--border)] text-[var(--rust)] focus:ring-[var(--warm)] disabled:opacity-60"
            />
            <label htmlFor="order-agree" className="text-sm text-[var(--dark)]">
              {t.order.formAgree}
            </label>
          </div>
          <Link
            href={`/${lang}/terms`}
            className="text-sm text-[var(--rust)] underline hover:text-[var(--dark)]"
          >
            {t.order.termsLink}
          </Link>
        </div>

        {status === 'error' && (
          <p className="text-sm font-medium text-[var(--rust)]" role="alert">
            {t.order.submitError}
          </p>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={status === 'sending'}
            className="rounded bg-[var(--dark)] px-6 py-3 text-sm font-medium text-[var(--cream)] transition hover:bg-[var(--rust)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === 'sending' ? t.order.submitSending : t.order.submit}
          </button>
        </div>

        <p className="text-sm text-[var(--muted)]">{t.order.rules}</p>
          </form>
        </section>

        {successModalOpen  && (
          <div
            className="fixed w inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label="Order submitted"
            onClick={() => {
              setSuccessModalOpen(false)
              goHome()
            }}
          >
            <div
              className="w-full max-w-xl rounded-2xl border border-emerald-200/60 bg-[var(--card-bg)] p-8 text-[var(--dark)] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-emerald-800" role="status">
                      {t.order.submitSuccess}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-7">
                <div className="flex justify-center">
                <button
                  type="button"
                  className="rounded-lg bg-emerald-600 px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
                  onClick={() => {
                    setSuccessModalOpen(false)
                    goHome()
                  }}
                >
                  {t.order.goHome}
                </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <aside className="lg:w-[380px] lg:shrink-0">
        <section className="sticky top-24 rounded border border-[var(--border)] bg-[var(--card-bg)] p-6">
          <h2
            className="mb-4 text-lg font-semibold text-[var(--dark)]"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            {t.affair.yourOrder}
          </h2>
          <AffairOrderSummary
            affairTitle={affair.title}
            affairPrice={affair.price}
            dateRangeText={dateRangeText}
            tickets={ticketDTOs}
            totalPrice={totalPrice}
          />
        </section>
      </aside>
  </div>
  )
}
