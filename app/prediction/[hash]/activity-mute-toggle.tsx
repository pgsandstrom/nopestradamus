'use client'

import { useState, useTransition } from 'react'

import { Button } from '../../../components/ui/button.tsx'
import { setActivityMailMutedAction } from '../../actions.ts'
import styles from './comments.module.css'

interface ActivityMuteToggleProps {
  predictionHash: string
  muted: boolean
}

/**
 * Whether new comments and answers here are mailed to the viewer. Those mails only — the text
 * says so, because "mute" next to a prediction reads as muting all of it, finish mail included.
 * The new state arrives with the page.
 */
export default function ActivityMuteToggle({ predictionHash, muted }: ActivityMuteToggleProps) {
  const [error, setError] = useState<string>()
  const [isSaving, startSaving] = useTransition()

  const toggle = () => {
    startSaving(async () => {
      const result = await setActivityMailMutedAction(predictionHash, !muted)
      setError(result.ok ? undefined : result.error)
    })
  }

  return (
    <div className={styles.mute}>
      <p className={styles.muteText}>
        {muted
          ? 'Activity muted: you get no mail about new comments or answers here.'
          : 'New comments and answers here are mailed to everybody who has accepted.'}
      </p>
      <Button onClick={toggle} disabled={isSaving}>
        {muted ? 'Unmute activity' : 'Mute activity'}
      </Button>
      {error !== undefined && <p className={styles.muteError}>{error}</p>}
    </div>
  )
}
