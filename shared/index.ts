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

/**
 * What a mail address is to one prediction, or undefined when it is nothing to it. A mail can be
 * both: nothing stops a creater from also listing their own address as a participant. Creater
 * wins, because that is the role with the answer that gates the whole prediction.
 */
export function getRoleForMail(
  prediction: Pick<Prediction, 'creater' | 'participants'>,
  mail: string,
): Role | undefined {
  if (prediction.creater.mail === mail) {
    return 'creater'
  }
  return prediction.participants.some((p) => p.mail === mail) ? 'participant' : undefined
}

/**
 * The shape of a secret that logs somebody in: a `randomHash` — a creater hash, a participant
 * hash or a login token, all 15 Crockford symbols — or the UUID that rows created before
 * `randomHash` existed still carry. Exported because the inline script in `<head>` has to make
 * the same judgement before React exists — see `components/login-cover-script.ts`.
 */
export const LOGIN_FRAGMENT =
  /^(?:[0-9a-z]{15}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/

/**
 * Whether a URL fragment is worth offering to the server as a login. Anything else is an
 * ordinary anchor, so a plain `#section` link never turns into a login attempt.
 */
export function isLoginFragment(fragment: string): boolean {
  return LOGIN_FRAGMENT.test(fragment)
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

/** The numbers behind the monthly health mail. Snake case because they come straight from SQL. */
export interface PredictionHealth {
  total: number
  awaiting_creater: number
  running: number
  finished: number
  next_finish_date?: string
}

/** A prediction row exactly as stored, including the columns no public view shows. */
export interface PredictionRow {
  created: string
  title: string
  body: string
  hash: string
  finish_date: string
  public: boolean
  creator_validated: boolean
}

/** One row of the admin prediction list: the prediction, its creater and a participant tally. */
export interface PredictionAdminListItem {
  created: string
  title: string
  hash: string
  finish_date: string
  public: boolean
  creater_mail?: string
  creater_accepted?: boolean
  creater_accept_mail_sent?: boolean
  creater_end_mail_sent?: boolean
  participant_count: number
  participant_accepted_count: number
  participant_rejected_count: number
}

/** A row of the mail table, hash included, so the admin can follow the block link. */
export interface AdminAccount extends AppAccount {
  hash: string
}

/**
 * Everything stored about one prediction. The creater is optional on purpose: a delete that
 * fails part way through can leave a prediction without one, and this view has to show that
 * rather than blow up on it.
 */
export interface PredictionAdmin {
  prediction: PredictionRow
  creater?: Creater
  participants: Participant[]
  accounts: AdminAccount[]
}

/** A creater or participant row pointing at a prediction that no longer exists. */
export interface OrphanedRow {
  role: Role
  hash: string
  prediction_hash: string
  mail: string
}

export type PredictionStatus = 'awaiting creater' | 'rejected' | 'running' | 'finished'

/** Where a prediction is in its life: waiting on the creater, running, or over. */
export function getPredictionStatus(
  createrAccepted: boolean | undefined,
  finishDate: string,
): PredictionStatus {
  if (createrAccepted === false) {
    return 'rejected'
  }
  if (createrAccepted !== true) {
    return 'awaiting creater'
  }
  return new Date(finishDate).getTime() <= Date.now() ? 'finished' : 'running'
}
