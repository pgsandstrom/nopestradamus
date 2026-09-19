'use client'

import { useState, useTransition } from 'react'

import { Button } from '../../../components/ui/button.tsx'
import { setCommentMailMutedAction } from '../../actions.ts'
import styles from './comments.module.css'

interface CommentMuteToggleProps {
  predictionHash: string
  muted: boolean
}

/**
 * Whether new comments here are mailed to the viewer. Comment mails only — the label says so,
 * because "mute" next to a prediction reads as muting all of it. The new state arrives with the
 * page.
 */
export default function CommentMuteToggle({ predictionHash, muted }: CommentMuteToggleProps) {
  const [error, setError] = useState<string>()
  const [isSaving, startSaving] = useTransition()

  const toggle = () => {
    startSaving(async () => {
      const result = await setCommentMailMutedAction(predictionHash, !muted)
      setError(result.ok ? undefined : result.error)
    })
  }

  return (
    <div className={styles.mute}>
      <p className={styles.muteText}>
        {muted
          ? 'Comments muted: you get no mail about new comments here.'
          : 'New comments here are mailed to everybody who has accepted.'}
      </p>
      <Button onClick={toggle} disabled={isSaving}>
        {muted ? 'Unmute comments' : 'Mute comments'}
      </Button>
      {error !== undefined && <p className={styles.muteError}>{error}</p>}
    </div>
  )
}
