'use client'

import { useState, useTransition } from 'react'

import { Button } from '../../components/ui/button.tsx'
import { TextAreaField, TextField } from '../../components/ui/text-field.tsx'
import type { ActionResult } from '../action-result.ts'
import {
  deletePredictionAction,
  deleteTestPredictionsAction,
  sendMailAction,
  triggerCronAction,
} from './actions.ts'
import styles from './page.module.css'

export default function AdminConsole() {
  const [password, setPassword] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [mail, setMail] = useState('')
  const [hash, setHash] = useState('')

  const [result, setResult] = useState<ActionResult & { data?: unknown }>()
  const [isRunning, startRunning] = useTransition()

  const run = (action: () => Promise<ActionResult & { data?: unknown }>) => {
    startRunning(async () => {
      setResult(await action())
    })
  }

  return (
    <div className={styles.console}>
      <p>This is the admin console. You need the admin password to actually do anything</p>

      <TextField
        label="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <fieldset className={styles.section} disabled={isRunning}>
        <legend>Cron</legend>
        <Button onClick={() => run(() => triggerCronAction(password))}>Trigger cron job</Button>
      </fieldset>

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
        <Button onClick={() => run(() => sendMailAction(password, mail, { title, body }))}>
          send mail
        </Button>
      </fieldset>

      <fieldset className={styles.section} disabled={isRunning}>
        <legend>Delete a prediction</legend>
        <TextField label="prediction hash" value={hash} onChange={(e) => setHash(e.target.value)} />
        <Button variant="danger" onClick={() => run(() => deletePredictionAction(password, hash))}>
          delete prediction
        </Button>
      </fieldset>

      <fieldset className={styles.section} disabled={isRunning}>
        <legend>Clean up</legend>
        <Button variant="danger" onClick={() => run(() => deleteTestPredictionsAction(password))}>
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
