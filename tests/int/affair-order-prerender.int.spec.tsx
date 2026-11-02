import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import AffairOrderForm from '@/app/components/AffairOrderForm'
import { AffairOrderSummary } from '@/app/components/AffairOrderSummary'
import type { Affair } from '@/payload-types'

const route = vi.hoisted(() => ({ q: '1,0', suspended: false }))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => {
    if (route.suspended) throw Promise.resolve()
    return new URLSearchParams({ q: route.q })
  },
}))
vi.mock('next/link', () => ({ default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a> }))
vi.mock('react-phone-number-input', () => ({
  default: ({ onChange, id, name, value, disabled, required }: {
    onChange: (value: string) => void
    id: string
    name: string
    value?: string
    disabled?: boolean
    required?: boolean
  }) => <input id={id} name={name} value={value ?? ''} disabled={disabled} required={required} onChange={(event) => onChange(event.target.value)} />,
}))

const tickets: Affair['tickets'] = [
  { ticket: { id: 'adult', name: 'Adult' } as Affair['tickets'][0]['ticket'], 'ticket price': 105 },
  { ticket: { id: 'student', name: 'Student' } as Affair['tickets'][0]['ticket'], 'ticket price': 99 },
]

function order() {
  return (
    <LanguageProvider initialLocale="ru">
      <AffairOrderForm affairId="trip-1" affairTitle="Trip" locale="ru" tickets={tickets} />
      <AffairOrderSummary affairTitle="Trip" affairPrice={99} startDate="2026-11-21T07:00:00.000Z" dateRangeText="21.11.2026" tickets={tickets} />
    </LanguageProvider>
  )
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  route.suspended = false
  route.q = '1,0'
})

describe('order page client islands', () => {
  it('renders form fields and event summary in initial HTML even while URL quantities suspend', () => {
    route.suspended = true
    const document = new DOMParser().parseFromString(renderToString(order()), 'text/html')

    expect(document.querySelector('#order-name')).not.toBeNull()
    expect(document.querySelector('#order-email')).not.toBeNull()
    expect(document.querySelector('#order-phone')).not.toBeNull()
    expect(document.querySelector('button[type="submit"]')?.hasAttribute('disabled')).toBe(true)
    expect(document.body.textContent).toContain('Trip')
    expect(document.body.textContent).toContain('21.11.2026')
  })

  it('updates the selection when the URL quantities change', () => {
    const view = render(order())
    expect(screen.getByText('Adult × 1')).toBeTruthy()

    route.q = '0,2'
    view.rerender(order())
    expect(screen.queryByText('Adult × 1')).toBeNull()
    expect(screen.getByText('Student × 2')).toBeTruthy()
    expect(screen.getByText('Итого: 198.00 €')).toBeTruthy()
  })

  it('uses the current URL quantities in the displayed total and submitted order', async () => {
    const post = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', post)
    render(order())

    expect(screen.getByText('Adult × 1')).toBeTruthy()
    expect(screen.getByText('Итого: 105.00 €')).toBeTruthy()
    fireEvent.change(document.querySelector('#order-name')!, { target: { value: 'Alex' } })
    fireEvent.change(document.querySelector('#order-email')!, { target: { value: 'alex@example.com' } })
    fireEvent.change(document.querySelector('#order-age')!, { target: { value: '30' } })
    fireEvent.change(document.querySelector('#order-phone')!, { target: { value: '+3725550100' } })
    fireEvent.click(document.querySelector('#order-agree')!)
    fireEvent.submit(document.querySelector('#order form')!)

    await waitFor(() => expect(post).toHaveBeenCalledOnce())
    expect(JSON.parse(post.mock.calls[0][1].body).ticketDTOs).toEqual([
      { name: 'Adult', qty: 1, price: 105, subtotal: 105 },
      { name: 'Student', qty: 0, price: 99, subtotal: 0 },
    ])
  })
})
