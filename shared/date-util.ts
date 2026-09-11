const DATE_FORMAT = new Intl.DateTimeFormat('sv-SE', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const DATE_TIME_FORMAT = new Intl.DateTimeFormat('sv-SE', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

const MISSING_DATE = '[MISSING DATE]'

// The 'sv-SE' locale renders as 'yyyy-MM-dd' / 'yyyy-MM-dd HH:mm', which is exactly what we want.
export function formatDate(date?: Date): string {
  return isValidDate(date) ? DATE_FORMAT.format(date) : MISSING_DATE
}

export function formatDateTime(date?: Date): string {
  return isValidDate(date) ? DATE_TIME_FORMAT.format(date) : MISSING_DATE
}

export function formatDateString(date?: string): string {
  return formatDate(date !== undefined ? new Date(date) : undefined)
}

export function formatDateTimeString(date?: string): string {
  return formatDateTime(date !== undefined ? new Date(date) : undefined)
}

export function isValidDate(date?: Date | null): date is Date {
  return date != null && !Number.isNaN(date.getTime())
}

/** Formats a Date as 'yyyy-MM-dd' in local time, for <input type="date"> values. */
export function toDateInputValue(date: Date): string {
  return DATE_FORMAT.format(date)
}
