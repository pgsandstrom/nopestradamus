import { isValidDate } from './date-util.ts'
import { isMailValid } from './mail-util.ts'

export const validateTitle = (title?: string): title is string =>
  title !== undefined && title.trim().length > 0

export const validateDescription = (description?: string): description is string =>
  description !== undefined && description.trim().length > 0

export const validateDateString = (date?: string): date is string =>
  date !== undefined && isValidDate(new Date(date))

export const validateCreaterMail = (mail?: string): mail is string =>
  mail !== undefined && isMailValid(mail)

export const validateParticipant = (participant: string, participantList: string[]): boolean => {
  const isDuplicate = participantList.filter((p) => p === participant).length > 1
  return !isDuplicate && isMailValid(participant)
}
