import { isMailValid } from './mail-util'
import { isValid } from 'date-fns'

export const validateTitle = (title?: string): title is string => {
  return title !== undefined && title.length > 0
}

export const validateDescription = (description?: string): description is string => {
  return description !== undefined && description.length > 0
}

export const validateDateString = (date?: string): date is string => {
  return validateDate(date !== undefined ? new Date(date) : undefined)
}

export const validateDate = (date?: Date | null): date is Date => {
  if (date == null) {
    return false
  }

  return isValid(date)
}

export const validateCreaterMail = (mail?: string): mail is string => {
  return mail !== undefined && isMailValid(mail)
}

export const validateParticipant = (participant: string, participantList: string[]) => {
  if (participantList.filter((p) => p === participant).length > 1) {
    return false
  }
  return isMailValid(participant)
}
