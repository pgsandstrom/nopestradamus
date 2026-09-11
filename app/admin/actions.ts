'use server'

import { redirect } from 'next/navigation'

import { attemptAdminLogin } from '../../server/admin-auth.ts'
import {
  endAdminSession,
  isAdminAuthenticated,
  startAdminSession,
} from '../../server/admin-session.ts'
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

/** Runs `action` only for a logged-in admin, turning any throw into an ActionResult. */
async function asAdmin<T>(action: () => Promise<T>): Promise<AdminResult<T>> {
  if (!(await isAdminAuthenticated())) {
    return { ok: false, error: 'Not logged in' }
  }
  try {
    return { ok: true, data: await action() }
  } catch (e) {
    console.error('admin action failed', e)
    return { ok: false, error: String(e) }
  }
}

/** Never returns on success: the redirect re-renders the layout, which then has a session. */
export async function logInAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const password = formData.get('password')
  const attempt = attemptAdminLogin(typeof password === 'string' ? password : '')
  if (!attempt.ok) {
    return {
      ok: false,
      error:
        attempt.retryInSeconds > 0
          ? `Too many attempts. Try again in ${attempt.retryInSeconds} seconds.`
          : 'Wrong password',
    }
  }
  await startAdminSession()
  redirect('/admin')
}

export async function logOutAction(): Promise<void> {
  await endAdminSession()
  redirect('/admin')
}

export async function triggerCronAction(): Promise<AdminResult<void>> {
  return asAdmin(handleAllUnsentMails)
}

export async function sendMailAction(receiver: string, mail: Mail): Promise<AdminResult<void>> {
  return asAdmin(async () => {
    // the nodemailer result is not serializable across the server-action boundary
    await sendMail(receiver, mail, true)
  })
}

export async function deletePredictionAction(hash: string) {
  return asAdmin(() => deletePrediction(hash))
}

export async function deleteTestPredictionsAction() {
  return asAdmin(async () => {
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
