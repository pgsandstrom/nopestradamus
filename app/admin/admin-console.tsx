'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'

import { Button } from '../../components/ui/button.tsx'
import { TextAreaField, TextField } from '../../components/ui/text-field.tsx'
import { isDev } from '../../util/env.ts'
import type { ActionResult } from '../action-result.ts'
import {
  createLoginLinkAction,
  deletePredictionAction,
  deleteTestPredictionsAction,
  type LoginLink,
  sendMailAction,
  triggerCronAction,
} from './actions.ts'
import styles from './page.module.css'

export default function AdminConsole() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [mail, setMail] = useState('')
  const [hash, setHash] = useState('')

  const [loginMail, setLoginMail] = useState('')
  // its own state rather than the shared `result` below: this one is a link to click, not a line
  // of JSON to read
  const [loginLink, setLoginLink] = useState<LoginLink>()
  const [loginError, setLoginError] = useState<string>()

  const [result, setResult] = useState<ActionResult & { data?: unknown }>()
  const [isRunning, startRunning] = useTransition()

  const makeLoginLink = () => {
    startRunning(async () => {
      const outcome = await createLoginLinkAction(loginMail)
      setLoginLink(outcome.data)
      setLoginError(outcome.ok ? undefined : outcome.error)
    })
  }

  const run = (action: () => Promise<ActionResult & { data?: unknown }>) => {
    startRunning(async () => {
      setResult(await action())
    })
  }

  return (
    <div className={styles.console}>
      <p>This is the admin console.</p>

      <fieldset className={styles.section} disabled={isRunning}>
        <legend>Cron</legend>
        <Button onClick={() => run(() => triggerCronAction())}>Trigger cron job</Button>
      </fieldset>

      {/*
        Only in dev, because /dev/mails does not exist in production — NODE_ENV is inlined into
        the client bundle, so this agrees with what the route itself decides.
      */}
      {isDev() && (
        <fieldset className={styles.section}>
          <legend>Mail previews</legend>
          <div className={styles.linkNote}>
            <Link href="/dev/mails">/dev/mails</Link>
            <span className={styles.muted}>
              every mail the service sends, rendered from the same templates the mailer uses,
              against fixtures rather than real rows.
            </span>
          </div>
        </fieldset>
      )}

      <fieldset className={styles.section} disabled={isRunning}>
        <legend>Test send mail</legend>
        <TextField label="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <TextAreaField label="body" value={body} onChange={(e) => setBody(e.target.value)} />
        <TextField
          label="mail"
          type="email"
          value={mail}
          onChange={(e) => setMail(e.target.value)}
        />
        <Button onClick={() => run(() => sendMailAction(mail, title, body))}>send mail</Button>
      </fieldset>

      <fieldset className={styles.section} disabled={isRunning}>
        <legend>Log in as somebody</legend>
        <TextField
          label="mail"
          type="email"
          value={loginMail}
          onChange={(e) => setLoginMail(e.target.value)}
        />
        <Button onClick={makeLoginLink}>make a login link</Button>
        {loginLink !== undefined && (
          <div className={styles.loginLink}>
            {/*
              A plain anchor, not next/link. A client-side navigation sets the URL with
              pushState, which fires no event the session negotiator can hear; a real one loads
              the document, so the inline script raises the login cover before anything paints.
            */}
            <a href={loginLink.path}>{loginLink.path}</a>
            <span className={styles.muted}>
              logs you in as {loginLink.mail}. Works once, then expires within the half hour.
            </span>
          </div>
        )}
        {loginError !== undefined && <span className={styles.error}>{loginError}</span>}
      </fieldset>

      <fieldset className={styles.section} disabled={isRunning}>
        <legend>Delete a prediction</legend>
        <TextField label="prediction hash" value={hash} onChange={(e) => setHash(e.target.value)} />
        <Button variant="danger" onClick={() => run(() => deletePredictionAction(hash))}>
          delete prediction
        </Button>
      </fieldset>

      <fieldset className={styles.section} disabled={isRunning}>
        <legend>Clean up</legend>
        <Button variant="danger" onClick={() => run(() => deleteTestPredictionsAction())}>
          delete predictions named &quot;test&quot; created by your mail, you know.
        </Button>
      </fieldset>

      {result !== undefined && (
        <output className={result.ok ? styles.ok : styles.error}>
          {result.ok
            ? `ok${result.data === undefined ? '' : `: ${JSON.stringify(result.data)}`}`
            : result.error}
        </output>
      )}
    </div>
  )
}
