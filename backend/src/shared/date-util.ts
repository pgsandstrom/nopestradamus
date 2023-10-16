import { format } from 'date-fns'

export function formatDateString(date?: string) {
  return formatDate(date !== undefined ? new Date(date) : undefined)
}

export function formatDate(date?: Date) {
  if (date) {
    return format(new Date(date), 'yyyy-MM-dd')
  } else {
    return '[MISSING DATE]'
  }
}
