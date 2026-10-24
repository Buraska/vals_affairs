type AffairArchiveFields = {
  archived?: boolean | null
  'start date'?: string | null
  'end date'?: string | null
}

/** Returns whether an affair is explicitly archived or its effective date has passed. */
export function isAffairArchived(affair: AffairArchiveFields, now: number = Date.now()): boolean {
  if (affair.archived === true) return true

  const effectiveDate = affair['end date'] || affair['start date']
  if (!effectiveDate) return false

  const timestamp = new Date(effectiveDate).getTime()
  return Number.isFinite(timestamp) && timestamp <= now
}
