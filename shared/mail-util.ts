const MAIL_PATTERN =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

/**
 * The one spelling an address is stored and compared in. Providers ignore case in the part before
 * the @ even though RFC 5321 allows otherwise, so without this one person typing their address
 * two ways became two accounts. The database refuses anything else (007-lowercase-mail.sql), so a
 * typed address must go through here before it is stored or looked up.
 */
export const normalizeMail = (mail: string): string => mail.trim().toLowerCase()

export const isMailValid = (rawMail: string): boolean => MAIL_PATTERN.test(rawMail.trim())

/** Obscures roughly a third of the local part (or the domain, if the local part is tiny). */
export const censorMail = (mail: string): string => {
  if (!isMailValid(mail)) {
    return mail
  }
  const [firstPart = '', secondPart = ''] = mail.split('@')
  if (firstPart.length > 2) {
    return `${censorString(firstPart)}@${secondPart}`
  }
  if (secondPart.length > 2) {
    return `${firstPart}@${censorString(secondPart)}`
  }
  return mail
}

const censorString = (value: string): string => {
  const censorLength = Math.ceil(value.length / 3)
  const beforeCensorLength = Math.floor((value.length - censorLength) / 2)
  return (
    value.slice(0, beforeCensorLength) +
    '*'.repeat(censorLength) +
    value.slice(beforeCensorLength + censorLength)
  )
}
