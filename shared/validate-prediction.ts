import { isValidDate } from './date-util.ts'
import { isMailValid, normalizeMail } from './mail-util.ts'

export const validateTitle = (title?: string): title is string =>
  title !== undefined && title.trim().length > 0

export const validateDescription = (description?: string): description is string =>
  description !== undefined && description.trim().length > 0

export const validateDateString = (date?: string): date is string =>
  date !== undefined && isValidDate(new Date(date))

export const validateCreaterMail = (mail?: string): mail is string =>
  mail !== undefined && isMailValid(mail)

export const isSameMail = (a: string, b: string): boolean => normalizeMail(a) === normalizeMail(b)

/**
 * The creater is never a participant too: they already answer as creater, and a second row would
 * mean a second mail for everything.
 */
export const validateParticipant = (
  participant: string,
  participantList: string[],
  createrMail: string,
): boolean => {
  const isDuplicate = participantList.filter((p) => isSameMail(p, participant)).length > 1
  return !isDuplicate && !isSameMail(participant, createrMail) && isMailValid(participant)
}
