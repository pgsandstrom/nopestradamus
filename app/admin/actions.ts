'use server'

import { isAdminPassword } from '../../server/admin-auth.ts'
import { type Mail, sendMail } from '../../server/mailer.ts'
import {
  adminGetPredictionsByTitle,
  deletePrediction,
  getPrediction,
} from '../../server/prediction.ts'
import { handleAllUnsentMails } from '../../server/scheduler.ts'
import type { ActionResult } from '../action-result.ts'

const TEST_PREDICTION_OWNERS = ['hello@persandstrom.com', 'pg.sandstrom@gmail.com']

type AdminResult<T> = ActionResult & { data?: T }

/** Runs `action` only when the password checks out, turning any throw into an ActionResult. */
async function asAdmin<T>(password: string, action: () => Promise<T>): Promise<AdminResult<T>> {
  if (!isAdminPassword(password)) {
    return { ok: false, error: 'Wrong admin password' }
  }
  try {
    return { ok: true, data: await action() }
  } catch (e) {
    console.error('admin action failed', e)
    return { ok: false, error: String(e) }
  }
}

export async function triggerCronAction(password: string): Promise<AdminResult<void>> {
  return asAdmin(password, handleAllUnsentMails)
}

export async function sendMailAction(
  password: string,
  receiver: string,
  mail: Mail,
): Promise<AdminResult<void>> {
  return asAdmin(password, async () => {
    // the nodemailer result is not serializable across the server-action boundary
    await sendMail(receiver, mail, true)
  })
}

export async function deletePredictionAction(password: string, hash: string) {
  return asAdmin(password, () => deletePrediction(hash))
}

export async function deleteTestPredictionsAction(password: string) {
  return asAdmin(password, async () => {
    let deleted = 0
    for (const shallow of await adminGetPredictionsByTitle('test')) {
      const prediction = await getPrediction(shallow.hash)
      if (prediction === undefined) {
        throw new Error(`Prediction not found: ${shallow.hash}`)
      }
      if (TEST_PREDICTION_OWNERS.includes(prediction.creater.mail)) {
        await deletePrediction(prediction.hash)
        deleted += 1
      }
    }
    return { deleted }
  })
}
