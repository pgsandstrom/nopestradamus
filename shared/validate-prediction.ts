import { isValidDate } from './date-util.ts'
import { isMailValid, normalizeMail } from './mail-util.ts'

/**
 * What the create form sends. Every field is optional because it arrives through a server action,
 * which anybody can call with anything: nothing about it is trusted until `validatePrediction`
 * has had a look.
 */
export interface CreatePredictionInput {
  title?: string
  body?: string
  finishDate?: string
  isPublic?: boolean
  createrMail?: string
  participantList?: string[]
}

/** Long enough for a claim, short enough to sit in a mail subject and a list row. */
export const TITLE_MAX_LENGTH = 200

/** Room for the reasoning and the terms of the bet, not for an essay. */
export const DESCRIPTION_MAX_LENGTH = 5000

/** The most participants a prediction may be created with. */
export const MAX_PARTICIPANTS = 10

/**
 * One message per field that is wrong, and nothing for a field that is fine, so the form can put
 * each message under its own field. `participants` lines up index for index with the list sent.
 */
export interface PredictionErrors {
  title?: string
  body?: string
  finishDate?: string
  isPublic?: string
  createrMail?: string
  participantList?: string
  participants?: (string | undefined)[]
}

export const validateDateString = (date?: string): date is string =>
  date !== undefined && isValidDate(new Date(date))

/**
 * A finish date may be today but not before it. `today` is 'yyyy-MM-dd', and the comparison is on
 * the calendar day alone so it cannot be shifted by the time zone a timestamp is parsed in.
 */
export const validateFinishDate = (date: string | undefined, today: string): date is string =>
  validateDateString(date) && /^\d{4}-\d{2}-\d{2}/.test(date) && date.slice(0, 10) >= today

export const isSameMail = (a: string, b: string): boolean => normalizeMail(a) === normalizeMail(b)

/** Measured after trimming, because the ends are not what a reader sees. */
const textError = (text: unknown, name: string, maxLength: number): string | undefined => {
  if (typeof text !== 'string' || text.trim().length === 0) {
    return `The prediction needs a ${name}`
  }
  const length = text.trim().length
  return length > maxLength
    ? `The ${name} can be at most ${maxLength} characters long (it is ${length})`
    : undefined
}

const finishDateError = (date: unknown, today: string): string | undefined => {
  if (typeof date !== 'string' || !validateDateString(date)) {
    return 'Invalid date'
  }
  return validateFinishDate(date, today) ? undefined : 'The end date cannot be in the past'
}

const createrMailError = (mail: unknown): string | undefined =>
  typeof mail === 'string' && isMailValid(mail) ? undefined : 'Invalid mail'

/**
 * The creater is never a participant too: they already answer as creater, and a second row would
 * mean a second mail for everything.
 */
const participantError = (
  participant: unknown,
  participantList: unknown[],
  createrMail: unknown,
): string | undefined => {
  if (typeof participant !== 'string' || !isMailValid(participant)) {
    return 'Invalid participant e-mail'
  }
  if (typeof createrMail === 'string' && isSameMail(participant, createrMail)) {
    return 'You are already part of the prediction as its creater'
  }
  const sameMailCount = participantList.filter(
    (p) => typeof p === 'string' && isSameMail(p, participant),
  ).length
  return sameMailCount > 1 ? 'This participant is already on the list' : undefined
}

const participantListError = (participantList: unknown): string | undefined => {
  if (!Array.isArray(participantList)) {
    return 'Invalid participant list'
  }
  return participantList.length > MAX_PARTICIPANTS
    ? `A prediction can have at most ${MAX_PARTICIPANTS} participants`
    : undefined
}

/**
 * The one set of rules for a new prediction, shared by the create form, which shows the messages
 * under the fields, and the server, which refuses anything the form would have refused.
 * @param today 'yyyy-MM-dd', the earliest allowed end date
 */
export const validatePrediction = (
  input: CreatePredictionInput,
  today: string,
): PredictionErrors => {
  const participantList: unknown[] = Array.isArray(input.participantList)
    ? input.participantList
    : []
  const participants = participantList.map((p) =>
    participantError(p, participantList, input.createrMail),
  )
  const errors: PredictionErrors = {
    title: textError(input.title, 'title', TITLE_MAX_LENGTH),
    body: textError(input.body, 'description', DESCRIPTION_MAX_LENGTH),
    finishDate: finishDateError(input.finishDate, today),
    isPublic: typeof input.isPublic === 'boolean' ? undefined : 'Invalid visibility',
    createrMail: createrMailError(input.createrMail),
    participantList: participantListError(input.participantList),
    participants: participants.some((e) => e !== undefined) ? participants : undefined,
  }
  // drop the fields that passed, so an empty object means a valid prediction
  return Object.fromEntries(Object.entries(errors).filter(([, message]) => message !== undefined))
}

/** Every message, in form order, for when there is one place to say them rather than a field. */
export const listPredictionErrors = (errors: PredictionErrors): string[] =>
  [
    errors.title,
    errors.body,
    errors.finishDate,
    errors.isPublic,
    errors.createrMail,
    errors.participantList,
    ...(errors.participants ?? []),
  ].filter((message): message is string => message !== undefined)
