import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Affair } from '@/payload-types'
import { AffairCard } from '@/app/components/AffairCard'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { sortAffairs } from '@/utilities/sortAffairs'
import { isAffairArchived } from '@/utilities/affairStatus'

vi.mock('next/link', () => ({ default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a href={href as string} {...props}>{children}</a> }))
vi.mock('@/app/components/SmartImage', () => ({ default: () => <img alt="event" /> }))
vi.mock('@/app/components/AffairCarousel', () => ({
  AffairCarousel: ({ affairs }: { affairs: Affair[] }) => <div>{affairs.map((affair) => <span key={affair.id}>{affair.title}</span>)}</div>,
}))

import CategoryPreview from '@/app/components/CategoryPreview'

const now = Date.parse('2030-06-15T12:00:00Z')

function affair(id: string, data: Partial<Affair>): Affair {
  return {
    id,
    title: id,
    archived: false,
    'start date': '2030-06-20',
    price: 20,
    ...data,
  } as Affair
}

afterEach(() => vi.useRealTimers())

describe('effective archive listing behavior', () => {
  it('keeps completed events after active events for date and both price sorts', () => {
    vi.useFakeTimers()
    vi.setSystemTime(now)
    const active = affair('active', { 'start date': '2030-06-16', price: 100 })
    const completed = affair('completed', { 'start date': '2030-06-30', 'end date': '2030-06-15T11:59:00Z', price: 1 })
    const sortBy = {
      date: (a: Affair, b: Affair) => Date.parse(a['start date']) - Date.parse(b['start date']),
      price: (a: Affair, b: Affair) => (a.price ?? 0) - (b.price ?? 0),
      '-price': (a: Affair, b: Affair) => (b.price ?? 0) - (a.price ?? 0),
    }

    for (const compare of Object.values(sortBy)) {
      expect(sortAffairs([completed, active], compare, isAffairArchived).map(({ id }) => id)).toEqual(['active', 'completed'])
    }
  })

  it('omits completed events from category previews', () => {
    vi.useFakeTimers()
    vi.setSystemTime(now)
    render(
      <CategoryPreview
        title="Category"
        categorySlug="category"
        locale="en"
        affairs={[
          affair('active-event', { title: 'Active event' }),
          affair('past-event', { title: 'Past event', 'end date': '2030-06-15T11:59:00Z' }),
        ]}
      />,
    )

    expect(screen.getByText('Active event')).toBeTruthy()
    expect(screen.queryByText('Past event')).toBeNull()
  })

  it('renders completed category cards with the archived label and gray styling', () => {
    vi.useFakeTimers()
    vi.setSystemTime(now)
    const completed = affair('completed', { 'end date': '2030-06-15T11:59:00Z' })
    const { container } = render(
      <LanguageProvider initialLocale="en">
        <AffairCard affair={completed} locale="en" />
      </LanguageProvider>,
    )

    const card = container.querySelector('a')
    expect(card?.className).toContain('grayscale')
    expect(card?.className).toContain('opacity-70')
    expect(screen.getByText('Archived')).toBeTruthy()
  })
})
