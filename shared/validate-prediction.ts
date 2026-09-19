import { isValidDate } from './date-util.ts'
import { isMailValid, normalizeMail } from './mail-util.ts'

export const validateTitle = (title?: string): title is string =>
  title !== undefined && title.trim().length > 0

export const validateDescription = (description?: string): description is string =>
  description !== undefined && description.trim().length > 0

export const validateDateString = (date?: string): date is string =>
  date !== undefined && isValidDate(new Date(date))

/**
 * A finish date may be today but not before it. `today` is 'yyyy-MM-dd', and the comparison is on
 * the calendar day alone so it cannot be shifted by the time zone a timestamp is parsed in.
 */
export const validateFinishDate = (date: string | undefined, today: string): date is string =>
  validateDateString(date) && /^\d{4}-\d{2}-\d{2}/.test(date) && date.slice(0, 10) >= today

export const validateCreaterMail = (mail?: string): mail is string =>
  mail !== undefined && isMailValid(mail)

/** The most participants a prediction may be created with. */
export const MAX_PARTICIPANTS = 10

export const validateParticipantCount = (participantList: string[]): boolean =>
  participantList.length <= MAX_PARTICIPANTS

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
