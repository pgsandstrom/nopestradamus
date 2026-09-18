'use server'

import { revalidatePath } from 'next/cache'

import { getAccountByHash, setAccountBlocked } from '../server/account.ts'
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
 * Trades the fragment of a secret URL for a session. The creater and participant hashes were
 * only ever sent to one address each, so holding one is the proof of identity — the same proof
 * the old /prediction/x/creater/y URLs accepted, only now it buys a cookie instead of a page.
 *
 * Presenting a second link simply replaces the session, so following a link as someone else
 * works without logging out first.
 */
export async function logInWithHashAction(roleHash: string): Promise<LogInResult> {
  let mail: string | undefined
  try {
    mail = await getMailByRoleHash(roleHash)
  } catch (e) {
    return failed(e, 'Could not log you in.')
  }
  if (mail === undefined) {
    return { ok: false, error: 'That link does not belong to a prediction.' }
  }
  await startUserSession(mail)
  revalidatePath('/', 'layout')
  return { ...OK, mail }
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
