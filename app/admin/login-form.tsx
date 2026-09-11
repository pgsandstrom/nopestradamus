'use client'

import { useActionState } from 'react'

import { Button } from '../../components/ui/button.tsx'
import { TextField } from '../../components/ui/text-field.tsx'
import type { ActionResult } from '../action-result.ts'
import { logInAction } from './actions.ts'
import styles from './login-form.module.css'

export default function LoginForm() {
  const [result, submit, isSubmitting] = useActionState<ActionResult | undefined, FormData>(
    logInAction,
    undefined,
  )

  return (
    <form className={styles.form} action={submit}>
      <h1>Admin</h1>
      <p>The admin console is behind the admin password.</p>
      <TextField
        label="password"
        name="password"
        type="password"
        autoComplete="current-password"
        autoFocus
        error={result?.error}
      />
      <Button type="submit" disabled={isSubmitting}>
        Log in
      </Button>
    </form>
  )
}
