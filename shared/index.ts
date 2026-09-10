// Domain types shared by the Next.js app and the standalone cron process.

/** A prediction as stored, including the secret hashes. Never send this to a client. */
export interface Prediction {
  created: string
  creater: Creater
  title: string
  body: string
  hash: string
  finish_date: string
  participants: Participant[]
}

export interface Creater {
  mail: string
  hash: string
  accepted?: boolean
  accepted_date?: string
  accepted_mail_sent: boolean
  end_mail_sent: boolean
}

export interface Participant {
  mail: string
  hash: string
  accepted?: boolean
  accepted_date?: string
  accepted_mail_sent: boolean
  end_mail_sent: boolean
}

export const ROLES = ['creater', 'participant'] as const
export type Role = (typeof ROLES)[number]

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value)
}

export interface PredictionShallow {
  title: string
  body: string
  hash: string
}

/** A prediction safe to hand to a client: hashes stripped, mails censored. */
export interface PredictionCensored {
  created: string
  creater: {
    mail: string
    accepted?: boolean
    hash: undefined // 'undefined' to make sure we dont accidentally leave the hash
  }
  title: string
  body: string
  hash: string
  finish_date: string
  participants: {
    mail: string
    isCurrentUser: boolean
    accepted?: boolean
    accepted_date?: string
    accepted_mail_sent: boolean
    end_mail_sent: boolean
  }[]
}

export interface AppAccount {
  mail: string
  validated: boolean
  blocked: boolean
}
