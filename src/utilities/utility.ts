import crypto from 'crypto'

/** Locale for date formatting: 'et' for ee, 'en-US' for en, etc. */

function getLocaleForDate(locale: string): string {
  if (locale === 'ee') return 'et-EE'
  if (locale === 'en') return 'en-GB'
  if (locale === 'fi') return 'fi-FI'
  return 'ru-RU'
}

/** Numeric date (dd.mm.yyyy), no month names. Pass locale (e.g. from page). */
export function formatDate(dateStr: string | null | undefined, locale?: string): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  const loc = locale ? getLocaleForDate(locale) : 'et-EE'
  return d.toLocaleDateString(loc, { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function formatDateRange(start: string, end: string | null | undefined, locale?: string): string {
  const startF = formatDate(start, locale)
  if (!end || end === start) return startF
  return `${startF} – ${formatDate(end, locale)}`
}
  
export function generateOrderRef() {
  // Example: "ORD-20260325-4F9A2C7D"
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const rand = crypto.randomBytes(4).toString('hex').toUpperCase()
  return `ORD-${date}-${rand}`
}
