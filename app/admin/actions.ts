'use server'

import { redirect } from 'next/navigation'

import { getAccountByMail } from '../../server/account.ts'
import { attemptAdminLogin } from '../../server/admin-auth.ts'
import {
  endAdminSession,
  isAdminAuthenticated,
  startAdminSession,
} from '../../server/admin-session.ts'
import { createLoginToken } from '../../server/login-token.ts'
import { textDocument } from '../../server/mail/blocks.ts'
import { sendMail } from '../../server/mailer.ts'
import {
  adminGetPredictionsByTitle,
  deletePrediction,
  getPrediction,
} from '../../server/prediction.ts'
import { handleAllUnsentMails } from '../../server/scheduler.ts'
import type { ActionResult } from '../action-result.ts'

const TEST_PREDICTION_OWNERS = ['hello@persandstrom.com', 'pg.sandstrom@gmail.com']

/** mail-tester.com hands out a throwaway address per run, on a rotating subdomain. */
const MAIL_TESTER_PATTERN = /@([a-z0-9-]+\.)*mail-tester\.com$/

const isTestPredictionOwner = (mail: string): boolean => {
  const normalized = mail.trim().toLowerCase()
  return TEST_PREDICTION_OWNERS.includes(normalized) || MAIL_TESTER_PATTERN.test(normalized)
}

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

export interface LoginLink {
  /** Relative on purpose — see the note on {@link createLoginLinkAction}. */
  path: string
  /** The address as stored, which may differ in case from what the admin typed. */
  mail: string
}

/**
 * A login link for any address, handed to the admin instead of mailed. Meant for looking at the
 * site as somebody who has written in about it, without asking them to forward their own link.
 *
 * Not a new power: every creater and participant hash is already printed on the prediction pages
 * under here, and each of those is a permanent login link for its owner. This one is for an
 * address on its own rather than one seat at one prediction, and unlike those it expires.
 *
 * The path is relative, and has to be. `SITE_URL` points at production, so an absolute link would
 * send an admin working on localhost to the live site carrying a token only the local database
 * has ever heard of.
 */
export async function createLoginLinkAction(mail: string): Promise<AdminResult<LoginLink>> {
  return asAdmin(async () => {
    const typed = mail.trim()
    // An unknown address would mint a session belonging to nobody: logged in, with no creater or
    // participant row anywhere to match it. The admin is not a stranger, so say so plainly rather
    // than going quiet the way the public form has to.
    const account = await getAccountByMail(typed)
    if (account === undefined) {
      throw new Error(`No account in the mail table for "${typed}"`)
    }
    const token = await createLoginToken(account.mail, { ignoreCooldown: true })
    if (token === undefined) {
      throw new Error('Could not mint a login token')
    }
    return { path: `/#${token}`, mail: account.mail }
  })
}

export async function triggerCronAction(): Promise<AdminResult<void>> {
  return asAdmin(handleAllUnsentMails)
}

export async function sendMailAction(
  receiver: string,
  title: string,
  body: string,
): Promise<AdminResult<void>> {
  return asAdmin(async () => {
    // the nodemailer result is not serializable across the server-action boundary
    await sendMail(receiver, textDocument(title, body), { overrideBlock: true })
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
      if (isTestPredictionOwner(prediction.creater.mail)) {
        await deletePrediction(prediction.hash)
        deleted += 1
      }
    }
    return { deleted }
  })
}
