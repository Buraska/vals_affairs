import { buildGoogleCalendarUrl, formatFullDate, formatTime } from '@/utilities/utility'

type AffairDateTimeProps = {
  startDate: string
  endDate?: string | null
  locale: string
  label: string
  addToCalendarLabel: string
  eventTitle: string
  details?: string
}

function isSameDay(a: string, b: string): boolean {
  const da = new Date(a)
  const db = new Date(b)
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  )
}

export function AffairDateTime({
  startDate,
  endDate,
  locale,
  label,
  addToCalendarLabel,
  eventTitle,
  details,
}: AffairDateTimeProps) {
  const startFull = formatFullDate(startDate, locale)
  const startTime = formatTime(startDate, locale)
  const endFull = endDate ? formatFullDate(endDate, locale) : null
  const endTime = endDate ? formatTime(endDate, locale) : null
  const singleDay = !endDate || isSameDay(startDate, endDate)

  const calendarUrl = buildGoogleCalendarUrl({
    title: eventTitle,
    start: startDate,
    end: endDate,
    details,
    allDay: true,
  })

  return (
    <section className="mb-6">
      <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-[var(--muted)]">
        {label}
      </h2>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-soft,#faf8f5)] p-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--rust)]/10 text-[var(--rust)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="4.5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
              <path d="M3 9h18M8 2.5v4M16 2.5v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </span>

          <div className="min-w-0">
            {singleDay ? (
              <>
                <p className="font-semibold capitalize text-[var(--dark)]">{startFull}</p>
                {(startTime || endTime) && (
                  <p className="mt-0.5 text-sm text-[var(--muted)]">
                    {startTime}
                    {startTime && endTime ? ` – ${endTime}` : ''}
                  </p>
                )}
              </>
            ) : (
              <div className="space-y-1.5">
                <p className="font-semibold capitalize text-[var(--dark)]">
                  {startFull}
                  {startTime ? <span className="font-normal text-[var(--muted)]"> · {startTime}</span> : null}
                </p>
                <p className="text-sm text-[var(--muted)]">
                  <span className="text-[var(--rust)]">→</span> {endFull}
                  {endTime ? ` · ${endTime}` : ''}
                </p>
              </div>
            )}
          </div>
        </div>

        <a
          href={calendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--rust)] px-4 py-2.5 text-sm font-medium text-[var(--rust)] transition-colors hover:bg-[var(--rust)] hover:text-white"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          {addToCalendarLabel}
        </a>
      </div>
    </section>
  )
}
