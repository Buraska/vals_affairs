'use client'

import Link from 'next/link'
import { useState } from 'react'
import { AffairTicketsBlock, type Ticket } from './AffairTicketsBlock'
import { useLanguage } from '@/app/contexts/LanguageContext'

export function AffairTicketsWithOrderLink({
  affairSlug,
  tickets,
  locale,
}: {
  affairSlug: string
  tickets: Ticket[]
  locale: string
}) {
  const { t } = useLanguage()
  const [quantities, setQuantities] = useState<number[]>(tickets.map(() => 0))

  const hasAnyTickets = quantities.some((q) => q > 0)
  const orderHref =
     hasAnyTickets
      ? `/${locale}/affair/${affairSlug}/order?q=${quantities.join(',')}`
      : `/${locale}/affair/${affairSlug}/order`
  const isDisabled = !hasAnyTickets

  return (
    <>
      
        <AffairTicketsBlock
          tickets={tickets}
          quantities={quantities}
          setQuantities={setQuantities}
        />  
      <div className={'mt-4'}>
        {isDisabled ? (
          <span
            role="button"
            aria-disabled="true"
            className="inline-block cursor-not-allowed rounded-sm bg-[var(--border)] px-6 py-3 text-sm font-medium text-[var(--muted)]"
          >
            {t.affair.takePlace}
          </span>
        ) : (
          <Link
            href={orderHref}
            className="inline-block rounded-sm bg-[var(--dark)] px-6 py-3 text-sm font-medium text-[var(--cream)] transition hover:bg-[var(--rust)]"
          >
            {t.affair.takePlace}
          </Link>
        )}
      </div>
    </>
  )
}
