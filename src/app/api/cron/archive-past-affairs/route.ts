import { timingSafeEqual } from 'node:crypto'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { isAffairArchived } from '@/utilities/affairStatus'

function hasValidAuthorization(request: Request, secret: string): boolean {
  const authorization = request.headers.get('authorization')
  if (!authorization?.startsWith('Bearer ')) return false

  const supplied = Buffer.from(authorization.slice('Bearer '.length))
  const expected = Buffer.from(secret)
  return supplied.length === expected.length && timingSafeEqual(supplied, expected)
}

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.AFFAIR_ARCHIVE_CRON_SECRET
  if (!secret) return Response.json({ error: 'Cron secret is not configured' }, { status: 503 })
  if (!hasValidAuthorization(request, secret)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config: configPromise })
    let page = 1
    let archivedCount = 0

    while (true) {
      const result = await payload.find({
        collection: 'Affair',
        depth: 0,
        limit: 100,
        page,
        overrideAccess: true,
      })

      for (const affair of result.docs) {
        if (affair.archived !== true && isAffairArchived(affair)) {
          await payload.update({
            collection: 'Affair',
            id: affair.id,
            data: { archived: true },
            overrideAccess: true,
          })
          archivedCount += 1
        }
      }

      if (!result.hasNextPage) break
      page += 1
    }

    return Response.json({ ok: true, archivedCount })
  } catch {
    return Response.json({ error: 'Failed to archive past affairs' }, { status: 500 })
  }
}
