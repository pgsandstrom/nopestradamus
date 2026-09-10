'use server'

import { revalidatePath } from 'next/cache'

import { getAccountByHash, setAccountBlocked } from '../server/account.ts'
import {
  createPrediction,
  type CreatePredictionInput,
  updateCreaterAcceptStatus,
  updateParticipantAcceptStatus,
} from '../server/prediction.ts'
import type { AppAccount, Role } from '../shared/index.ts'
import { isRole } from '../shared/index.ts'
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

export async function answerPredictionAction(
  predictionHash: string,
  role: string,
  roleHash: string,
  accept: boolean,
): Promise<ActionResult> {
  if (!isRole(role)) {
    return { ok: false, error: `Unknown role: "${role}"` }
  }
  try {
    await answerAs(role, predictionHash, roleHash, accept)
  } catch (e) {
    return failed(e, 'Could not register your answer.')
  }
  revalidatePath('/')
  revalidatePath(`/prediction/${predictionHash}`)
  return OK
}

const answerAs = (role: Role, predictionHash: string, roleHash: string, accept: boolean) =>
  role === 'creater'
    ? updateCreaterAcceptStatus(predictionHash, roleHash, accept)
    : updateParticipantAcceptStatus(predictionHash, roleHash, accept)

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
