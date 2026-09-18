'use client'

import { useActionState } from 'react'

import type { ActionResult } from '../app/action-result.ts'
import { requestLoginMailAction } from '../app/actions.ts'
import styles from './header.module.css'
import { Button } from './ui/button.tsx'

/**
 * The logged-out half of the header. There is nothing to sign up for, so this is not a
 * registration: it mails a one-time link to an address the site already knows, which is the same
 * way a prediction's own links work.
 *
 * The confirmation deliberately says "if we know that address" rather than "sent". The action
 * cannot tell a stranger whether an address exists here without turning this into a way to ask.
 */
export default function LoginForm() {
  const [result, submit, isSubmitting] = useActionState<ActionResult | undefined, FormData>(
    requestLoginMailAction,
    undefined,
  )

  if (result?.ok === true) {
    return (
      <span className={styles.status}>
        If we know that address, a login link is on its way. Check your spam folder.
      </span>
    )
  }

  return (
    <form className={styles.loginForm} action={submit}>
      <input
        className={styles.mailInput}
        type="email"
        name="mail"
        placeholder="you@example.com"
        aria-label="Your e-mail address"
        autoComplete="email"
        required
        disabled={isSubmitting}
      />
      <Button type="submit" className={styles.loginButton} disabled={isSubmitting}>
        Continue with e-mail
      </Button>
      {result?.error !== undefined && <span className={styles.error}>{result.error}</span>}
    </form>
  )
}
