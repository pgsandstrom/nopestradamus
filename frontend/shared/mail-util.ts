export const censorMail = (mail: string): string => {
  if (isMailValid(mail) === false) {
    return mail
  }
  const [firstPart, secondPart] = mail.split('@')
  if (firstPart.length > 2) {
    return `${censorString(firstPart)}@${secondPart}`
  } else if (secondPart.length > 2) {
    return `${firstPart}@${censorString(secondPart)}`
  } else {
    return mail
  }
}

const censorString = (string: string) => {
  const censorLength = Math.ceil(string.length / 3)
  const partLength = (string.length - censorLength) / 2
  const beforeCensorLength = Math.floor(partLength)
  return (
    string.substr(0, beforeCensorLength) +
    '*'.repeat(censorLength) +
    string.substr(Math.ceil(beforeCensorLength + censorLength), string.length)
  )
}

// eslint-disable-next-line no-useless-escape
const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export const isMailValid = (rawMail: string) => {
  const mail = rawMail.trim()
  return re.test(String(mail).toLowerCase())
}
