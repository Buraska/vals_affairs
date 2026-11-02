import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { AffairDateTime } from '@/app/components/AffairDateTime'

const baseProps = {
  startDate: '2026-11-21T07:00:00.000Z',
  locale: 'en',
  label: 'Schedule',
  addToCalendarLabel: 'Add to calendar',
  eventTitle: 'Event',
}

afterEach(() => cleanup())

describe('AffairDateTime', () => {
  it('shows the optional event time when provided', () => {
    render(<AffairDateTime {...baseProps} eventTime="07:00" />)

    expect(screen.getByText('07:00')).toBeTruthy()
  })

  it('does not derive or display a time from the date when no event time is set', () => {
    render(<AffairDateTime {...baseProps} />)

    expect(screen.queryByText('07:00')).toBeNull()
  })
})
