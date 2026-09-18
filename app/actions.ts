'use server'

import { revalidatePath } from 'next/cache'

import { getAccountByHash, getAccountByMail, setAccountBlocked } from '../server/account.ts'
import { consumeLoginToken, createLoginToken } from '../server/login-token.ts'
import { getLoginMail, sendMail } from '../server/mailer.ts'
import {
  createPrediction,
  type CreatePredictionInput,
  getMailByRoleHash,
  getPrediction,
  updateCreaterAcceptStatus,
  updateParticipantAcceptStatus,
} from '../server/prediction.ts'
import { endUserSession, getCurrentUserMail, startUserSession } from '../server/session-cookie.ts'
import type { AppAccount, Role } from '../shared/index.ts'
import { getRoleForMail } from '../shared/index.ts'
import { isMailValid } from '../shared/mail-util.ts'
import { type ActionResult, failed, OK } from './action-result.ts'

export async function createPredictionAction(input: CreatePredictionInput): Promise<ActionResult> {
  try {
    await createPrediction(input)
  } catch (e) {
    return failed(e, 'Could not create the prediction.')
  }
  revalidatePath('/')
  return OK
}

export interface LogInResult extends ActionResult {
  /** The address the session now belongs to, so the header can say so without a round trip. */
  mail?: string
}

/**
 * Trades the fragment of a secret URL for a session. Two kinds of secret arrive here and both
 * were mailed to exactly one address, which is what makes holding one proof of who you are:
 *
 * - a creater or participant hash, which never expires. The same proof the old
 *   /prediction/x/creater/y URLs accepted, only now it buys a cookie instead of a page.
 * - a login token from the header's "continue with e-mail" form, which is spent on use.
 *
 * Tried in that order, because looking a token up spends it. They are both 75 bits of random,
 * so nothing distinguishes them by sight and nothing needs to.
 *
 * Presenting a second link simply replaces the session, so following a link as someone else
 * works without logging out first.
 */
export async function logInWithHashAction(fragment: string): Promise<LogInResult> {
  let mail: string | undefined
  try {
    mail = (await getMailByRoleHash(fragment)) ?? (await consumeLoginToken(fragment))
  } catch (e) {
    return failed(e, 'Could not log you in.')
  }
  if (mail === undefined) {
    return { ok: false, error: 'That link is not valid.' }
  }
  await startUserSession(mail)
  revalidatePath('/', 'layout')
  return { ...OK, mail }
}

/**
 * Mails a one-time login link. The answer is the same whatever happens — sent, unknown address,
 * blocked address, still inside the cooldown — because anything else turns an open form into a
 * way of asking whether a given person uses the site.
 */
export async function requestLoginMailAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const typed = formData.get('mail')
  const mail = typeof typed === 'string' ? typed.trim() : ''
  // the one thing worth saying out loud, since it is about what they typed rather than about
  // who exists
  if (!isMailValid(mail)) {
    return { ok: false, error: 'That does not look like an e-mail address.' }
  }
  try {
    await sendLoginMail(mail)
  } catch (e) {
    return failed(e, 'Could not send the mail.')
  }
  return OK
}

const sendLoginMail = async (mail: string): Promise<void> => {
  const account = await getAccountByMail(mail)
  if (account === undefined) {
    // There is no sign-up: an address is known because a prediction named it. Creating a row
    // here would let anybody fill the mail table with addresses of their choosing.
    return
  }
  // the address as stored, not as typed, so the session matches its own prediction rows
  const token = await createLoginToken(account.mail)
  if (token === undefined) {
    return
  }
  // sendMail declines to write to a blocked address, and a login mail does not override that:
  // somebody who unsubscribed still has their original prediction links.
  await sendMail(account.mail, getLoginMail(token))
}

export async function logOutAction(): Promise<void> {
  await endUserSession()
  revalidatePath('/', 'layout')
}

export interface AnswerResult extends ActionResult {
  /** The participants' uncensored mails, so the creater can see who is about to be mailed. */
  participantMails?: string[]
}

/**
 * Accepts or rejects on behalf of whoever the session says is here. Nothing is taken from the
 * caller but the prediction and the answer: the role is looked up from the address in the
 * session, so a client cannot claim one it does not hold.
 */
export async function answerPredictionAction(
  predictionHash: string,
  accept: boolean,
): Promise<AnswerResult> {
  const mail = await getCurrentUserMail()
  if (mail === undefined) {
    return { ok: false, error: 'You are not logged in.' }
  }
  let participantMails: string[]
  try {
    const prediction = await getPrediction(predictionHash)
    if (prediction === undefined) {
      return { ok: false, error: 'That prediction does not exist.' }
    }
    const role = getRoleForMail(prediction, mail)
    if (role === undefined) {
      return { ok: false, error: 'You are not part of this prediction.' }
    }
    participantMails = await answerAs(role, predictionHash, mail, accept)
  } catch (e) {
    return failed(e, 'Could not register your answer.')
  }
  revalidatePath('/')
  revalidatePath(`/prediction/${predictionHash}`)
  return { ...OK, participantMails }
}

const answerAs = async (
  role: Role,
  predictionHash: string,
  mail: string,
  accept: boolean,
): Promise<string[]> => {
  if (role === 'participant') {
    await updateParticipantAcceptStatus(predictionHash, mail, accept)
    return []
  }
  return updateCreaterAcceptStatus(predictionHash, mail, accept)
}

export async function setBlockedAction(
  hash: string,
  blocked: boolean,
): Promise<ActionResult & { account?: AppAccount }> {
  try {
    await setAccountBlocked(hash, blocked)
    const account = await getAccountByHash(hash)
    return account === undefined
      ? { ok: false, error: 'Account not found.' }
      : { ok: true, account }
  } catch (e) {
    return failed(e, 'Could not update your mail settings.')
  }
}
