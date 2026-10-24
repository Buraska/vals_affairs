import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { getPayload, records, find, update } = vi.hoisted(() => {
  const records: Array<Record<string, unknown>> = []
  const find = vi.fn(async ({ page, limit }: { page: number; limit: number }) => {
    const start = (page - 1) * limit
    return {
      docs: records.slice(start, start + limit),
      hasNextPage: start + limit < records.length,
    }
  })
  const update = vi.fn(async ({ id, data }: { id: string; data: { archived: boolean } }) => {
    const record = records.find((affair) => affair.id === id)
    if (record) Object.assign(record, data)
    return record
  })
  const payload = { find, update }
  return { getPayload: vi.fn(async () => payload), records, find, update }
})

vi.mock('payload', () => ({ getPayload }))
vi.mock('@payload-config', () => ({ default: {} }))

import { POST } from '@/app/api/cron/archive-past-affairs/route'

const secret = 'test-cron-secret'
const expired = { id: 'expired', archived: false, 'start date': '2030-01-01', 'end date': '2030-01-02' }
const future = { id: 'future', archived: false, 'start date': '2030-01-01', 'end date': '2030-01-03' }
const alreadyArchived = { id: 'already', archived: true, 'start date': 'invalid' }

function request(token?: string): Request {
  return new Request('http://localhost/api/cron/archive-past-affairs', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
}

describe('archive past affairs cron route', () => {
  beforeEach(() => {
    vi.stubEnv('AFFAIR_ARCHIVE_CRON_SECRET', secret)
    records.splice(
      0,
      records.length,
      { ...expired },
      { ...future },
      { ...alreadyArchived },
      ...Array.from({ length: 98 }, (_, index) => ({ ...future, id: `future-${index}` })),
    )
    vi.useFakeTimers()
    vi.setSystemTime(Date.parse('2030-01-02T12:00:00Z'))
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllEnvs()
  })

  it('requires a configured secret and matching bearer token', async () => {
    vi.stubEnv('AFFAIR_ARCHIVE_CRON_SECRET', '')
    expect((await POST(request(secret))).status).toBe(503)

    vi.stubEnv('AFFAIR_ARCHIVE_CRON_SECRET', secret)
    expect((await POST(request())).status).toBe(401)
    expect((await POST(request('wrong'))).status).toBe(401)
    expect(getPayload).not.toHaveBeenCalled()
  })
  it('paginates all affairs, archives expired records only, and is idempotent', async () => {

    const first = await POST(request(secret))
    expect(first.status).toBe(200)
    expect(await first.json()).toEqual({ ok: true, archivedCount: 1 })
    expect(records.slice(0, 3).map(({ id, archived }) => [id, archived])).toEqual([
      ['expired', true],
      ['future', false],
      ['already', true],
    ])
    expect(find).toHaveBeenCalledTimes(2)
    expect(update).toHaveBeenCalledTimes(1)
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ id: 'expired', data: { archived: true }, overrideAccess: true }))

    find.mockClear()
    update.mockClear()
    const second = await POST(request(secret))
    expect(await second.json()).toEqual({ ok: true, archivedCount: 0 })
    expect(update).not.toHaveBeenCalled()
  })

  it('returns 500 when a record update fails', async () => {
    update.mockRejectedValueOnce(new Error('database failure'))
    const response = await POST(request(secret))
    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ error: 'Failed to archive past affairs' })
  })
})
