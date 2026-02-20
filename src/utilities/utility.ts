export function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
  }
  
  export function formatDateRange(start: string, end: string | null | undefined): string {
    const startF = formatDate(start)
    if (!end || end === start) return startF
    return `${startF} – ${formatDate(end)}`
  }
  