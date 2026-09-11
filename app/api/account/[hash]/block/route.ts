import { NextResponse } from 'next/server'

import { setAccountBlocked } from '../../../../../server/account.ts'

interface RouteContext {
  params: Promise<{ hash: string }>
}

/**
 * Kept as a route handler (rather than a server action) because mail clients POST here
 * directly for RFC 8058 List-Unsubscribe one-click, which sends no JSON body.
 */
export async function POST(request: Request, { params }: RouteContext) {
  const { hash } = await params

  let blocked = true
  try {
    const body = (await request.json()) as { blocked?: unknown }
    if (typeof body.blocked === 'boolean') {
      blocked = body.blocked
    }
  } catch {
    // Default to blocking (e.g. List-Unsubscribe one-click POST)
  }

  const updated = await setAccountBlocked(hash, blocked)
  if (!updated) {
    return NextResponse.json({ status: 'error', error: 'Account not found.' }, { status: 404 })
  }

  return NextResponse.json({ status: 'ok' })
}
