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

/** Day + month name, no year (e.g. "15 juuni" / "15 June"). Pass locale (e.g. from page). */
export function formatDayMonth(dateStr: string | null | undefined, locale?: string): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  const loc = locale ? getLocaleForDate(locale) : 'et-EE'
  return d.toLocaleDateString(loc, { day: 'numeric', month: 'long' })
}

/** Day + month name range, no year (e.g. "15 – 18 juuni"). */
export function formatDayMonthRange(start: string, end: string | null | undefined, locale?: string): string {
  const startF = formatDayMonth(start, locale)
  if (!end || end === start) return startF
  return `${startF} – ${formatDayMonth(end, locale)}`
}
  
/** Weekday + day + month name + year (e.g. "Friday, 26 June 2026"). */
export function formatFullDate(dateStr: string | null | undefined, locale?: string): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  const loc = locale ? getLocaleForDate(locale) : 'et-EE'
  return d.toLocaleDateString(loc, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

/** Time of day (e.g. "10:30"). Returns null when the timestamp is midnight (date-only). */
export function formatTime(dateStr: string | null | undefined, locale?: string): string | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (d.getHours() === 0 && d.getMinutes() === 0) return null
  const loc = locale ? getLocaleForDate(locale) : 'et-EE'
  return d.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit' })
}

/** Formats a date as the UTC basic format Google Calendar expects (e.g. "20260626T103000Z"). */
function toGoogleCalendarDate(dateStr: string): string {
  return new Date(dateStr).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

/** Builds an "Add to Google Calendar" template URL for an event. */
export function buildGoogleCalendarUrl({
  title,
  start,
  end,
  details,
  location,
}: {
  title: string
  start: string
  end?: string | null
  details?: string
  location?: string
}): string {
  const startUtc = toGoogleCalendarDate(start)
  const endSource = end ?? new Date(new Date(start).getTime() + 2 * 60 * 60 * 1000).toISOString()
  const endUtc = toGoogleCalendarDate(endSource)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${startUtc}/${endUtc}`,
  })
  if (details) params.set('details', details)
  if (location) params.set('location', location)
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function generateOrderRef() {
  // Example: "ORD-20260325-4F9A2C7D"
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const rand = crypto.randomBytes(4).toString('hex').toUpperCase()
  return `ORD-${date}-${rand}`
}

export function escapeHtml(s: string): string {
  return s
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function checkTypeAndSlice(obj: unknown, limit: number): string {
  return typeof obj === 'string' ? obj.trim().slice(0, limit) : ''
}
