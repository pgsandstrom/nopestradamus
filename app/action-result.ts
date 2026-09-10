// Plain module (not 'use server'), because files with the 'use server' directive
// may only export async functions.

export interface ActionResult {
  ok: boolean
  error?: string
}

export const OK: ActionResult = { ok: true }

/** Logs the real error server-side and returns a message that is safe to show a visitor. */
export const failed = (e: unknown, fallback: string): ActionResult => {
  console.error(fallback, e)
  return { ok: false, error: fallback }
}
