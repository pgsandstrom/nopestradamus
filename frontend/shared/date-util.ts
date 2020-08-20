import { format } from 'date-fns'

export function formatDateString(date: string) {
  return formatDate(new Date(date))
}

export function formatDate(date: Date) {
  return format(new Date(date), 'yyyy-MM-dd')
}
