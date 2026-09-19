'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'

import { Button } from '../../../../components/ui/button.tsx'
import { setCommentMailMutedByAccountAction } from '../../../actions.ts'
import styles from './mute-controls.module.css'

interface MuteCommentsControlsProps {
  hash: string
  predictionHash: string
  mail: string
  title: string
  initialMuted: boolean
}

export default function MuteCommentsControls({
  hash,
  predictionHash,
  mail,
  title,
  initialMuted,
}: MuteCommentsControlsProps) {
  const [muted, setMuted] = useState(initialMuted)
  const [error, setError] = useState<string>()
  const [isLoading, startLoading] = useTransition()

  const doMute = (nextMuted: boolean) => {
    startLoading(async () => {
      const result = await setCommentMailMutedByAccountAction(hash, predictionHash, nextMuted)
      if (result.ok) {
        setMuted(nextMuted)
        setError(undefined)
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <div>
      <p>
        Your mail is <strong>{mail}</strong>
      </p>
      <p>
        The prediction is <strong>{title}</strong>
      </p>
      {muted ? (
        <>
          <p>
            Comments on this prediction are <span className={styles.muted}>MUTED</span>. You get no
            mail when somebody comments.
          </p>
          <Button onClick={() => doMute(false)} disabled={isLoading}>
            Unmute comments
          </Button>
        </>
      ) : (
        <>
          <p>You get a mail whenever somebody comments on this prediction.</p>
          <Button onClick={() => doMute(true)} disabled={isLoading}>
            Mute comments
          </Button>
        </>
      )}
      <p className={styles.other}>
        This only affects comment mails. You still get the mail when the prediction finishes.
      </p>
      {error !== undefined && <p className={styles.error}>{error}</p>}
      <p className={styles.other}>
        To stop every mail from Nopestradamus instead,{' '}
        <Link href={`/blockme/${hash}`}>block yourself</Link>.
      </p>
    </div>
  )
}
