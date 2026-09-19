import { NextResponse } from 'next/server'

import { getAccountByHash } from '../../../../../../server/account.ts'
import { setCommentMailMuted } from '../../../../../../server/comment-mute.ts'

interface RouteContext {
  params: Promise<{ hash: string; predictionHash: string }>
}

/**
 * The one-click unsubscribe of a comment mail: `server/mailer.ts` names this in the
 * `List-Unsubscribe` header of any mail sent with `muteCommentsOf`, so the mail client's
 * unsubscribe button mutes that prediction's comment mails — and only those — instead of blocking
 * every mail. A route handler
 * rather than a server action for the same reason as the block route next to it — mail clients
 * POST here directly, with no JSON body. Must not move: sent mails carry the URL.
 */
export async function POST(request: Request, { params }: RouteContext) {
  const { hash, predictionHash } = await params

  let muted = true
  try {
    const body = (await request.json()) as { muted?: unknown }
    if (typeof body.muted === 'boolean') {
      muted = body.muted
    }
  } catch {
    // Default to muting (e.g. List-Unsubscribe one-click POST)
  }

  const account = await getAccountByHash(hash)
  if (account === undefined) {
    return NextResponse.json({ status: 'error', error: 'Account not found.' }, { status: 404 })
  }
  await setCommentMailMuted(predictionHash, account.mail, muted)

  return NextResponse.json({ status: 'ok' })
}
