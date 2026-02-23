'use client'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/app/contexts/LanguageContext'

export function AffairOrderForm() {
  const { t, lang } = useLanguage()
  const [phone, setPhone] = useState<string | undefined>()

  return (
    <section id="order" className="scroll-mt-4">
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label htmlFor="order-name" className="mb-1 block text-sm font-medium text-stone-700">
            {t.order.formName}
          </label>
          <input
            id="order-name"
            type="text"
            name="name"
            required
            className="w-full max-w-md rounded-sm border border-amber-200 bg-white px-3 py-2 text-stone-800 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            placeholder={t.order.placeholderName}
          />
        </div>

        <div>
          <label htmlFor="order-email" className="mb-1 block text-sm font-medium text-stone-700">
            {t.order.formEmail}
          </label>
          <input
            id="order-email"
            type="email"
            name="email"
            required
            className="w-full max-w-md rounded-sm border border-amber-200 bg-white px-3 py-2 text-stone-800 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className=''>
          <label htmlFor="order-phone" className="mb-1 block text-sm font-medium text-stone-700">
            {t.order.formPhone}
          </label>
          <div className='w-full max-w-md rounded-sm border border-amber-200 bg-white px-3 py-2 text-stone-800 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500'>
            <PhoneInput
              name="phone"
              defaultCountry="EE"
              value={phone}
              onChange={setPhone}
            />
          </div>
        </div>

        <div>
          <label htmlFor="order-age" className="mb-1 block text-sm font-medium text-stone-700">
            {t.order.formAge}
          </label>
          <input
            id="order-age"
            type="text"
            name="age"
            className="w-full max-w-md rounded-sm border border-amber-200 bg-white px-3 py-2 text-stone-800 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            placeholder={t.order.placeholderAge}
          />
        </div>

        <div>
          <label htmlFor="order-notes" className="mb-1 block text-sm font-medium text-stone-700">
            {t.order.formNotes}
          </label>
          <textarea
            id="order-notes"
            name="notes"
            rows={3}
            className="w-full max-w-md rounded-sm border border-amber-200 bg-white px-3 py-2 text-stone-800 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
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
              className="h-4 w-4 rounded-sm border-amber-200 text-amber-600 focus:ring-amber-500"
            />
            <label htmlFor="order-agree" className="text-sm text-stone-700">
              {t.order.formAgree}
            </label>
          </div>
          <Link
            href={`/${lang}/terms`}
            className="text-sm text-amber-700 underline hover:text-amber-900"
          >
            {t.order.termsLink}
          </Link>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            className="rounded-sm bg-amber-600 px-6 py-3 font-medium text-white transition hover:bg-amber-700"
          >
            {t.order.submit}
          </button>
        </div>

        <p className="text-sm text-stone-600">
          {t.order.rules}
        </p>
      </form>
    </section>
  )
}
