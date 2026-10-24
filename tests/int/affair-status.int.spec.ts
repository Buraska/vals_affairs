import { afterEach, describe, expect, it, vi } from 'vitest'
import { isAffairArchived } from '@/utilities/affairStatus'

describe('isAffairArchived', () => {
  const now = Date.parse('2030-06-15T12:00:00.000Z')

  afterEach(() => vi.useRealTimers())

  it('uses the end date when present, including the current timestamp as expired', () => {
    expect(isAffairArchived({ 'start date': '2030-06-01', 'end date': '2030-06-15T11:59:00Z' }, now)).toBe(true)
    expect(isAffairArchived({ 'start date': '2030-06-01', 'end date': '2030-06-15T12:00:00Z' }, now)).toBe(true)
    expect(isAffairArchived({ 'start date': '2030-06-01', 'end date': '2030-06-15T12:01:00Z' }, now)).toBe(false)
  })

  it('falls back to the start date and honors explicit archive state', () => {
    expect(isAffairArchived({ 'start date': '2030-06-15T11:59:00Z' }, now)).toBe(true)
    expect(isAffairArchived({ 'start date': '2030-06-16' }, now)).toBe(false)
    expect(isAffairArchived({ archived: true, 'start date': 'invalid' }, now)).toBe(true)
  })

  it('treats missing and invalid effective dates as active', () => {
    expect(isAffairArchived({} as { 'start date': string }, now)).toBe(false)
    expect(isAffairArchived({ 'start date': 'invalid' }, now)).toBe(false)
    expect(isAffairArchived({ 'start date': 'invalid', 'end date': 'also-invalid' }, now)).toBe(false)
  })

  it('uses the current clock by default', () => {
    vi.useFakeTimers()
    vi.setSystemTime(now)
    expect(isAffairArchived({ 'start date': '2030-06-15T11:59:00Z' })).toBe(true)
    expect(isAffairArchived({ 'start date': '2030-06-15T12:01:00Z' })).toBe(false)
  })
})
