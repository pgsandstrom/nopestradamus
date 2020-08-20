import { isMailValid } from './mail-util'

// TODO use this in backend as well
export const validateTitle = (title?: string) => {
  return title !== undefined && title.length > 0
}

export const validateDescription = (description?: string) => {
  return description !== undefined && description.length > 0
}

export const validateDate = (date?: Date | null) => {
  if (date == null) {
    return false
  }

  return true
}

export const validateCreaterMail = (mail?: string) => {
  return mail !== undefined && isMailValid(mail)
}

export const validateParticipant = (participant: string, participantList: string[]) => {
  if (participantList.filter((p) => p === participant).length > 1) {
    return false
  }
  return isMailValid(participant)
}
