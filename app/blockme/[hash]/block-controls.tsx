'use client'

import { useState, useTransition } from 'react'

import { Button } from '../../../components/ui/button.tsx'
import type { AppAccount } from '../../../shared/index.ts'
import { setBlockedAction } from '../../actions.ts'
import styles from './block-controls.module.css'

interface BlockControlsProps {
  hash: string
  initialAccount: AppAccount
}

export default function BlockControls({ hash, initialAccount }: BlockControlsProps) {
  const [account, setAccount] = useState(initialAccount)
  const [error, setError] = useState<string>()
  const [isLoading, startLoading] = useTransition()

  const doBlock = (blocked: boolean) => {
    startLoading(async () => {
      const result = await setBlockedAction(hash, blocked)
      if (result.ok && result.account !== undefined) {
        setAccount(result.account)
        setError(undefined)
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <div>
      <p>
        Your mail is <strong>{account.mail}</strong>
      </p>
      {account.blocked ? (
        <>
          <p>
            You are currently <span className={styles.blocked}>BLOCKED</span> from receiving mail
            from nopestradamus.
          </p>
          <p>Would you like to unblock yourself from receiving mail from nopestradamus?</p>
          <Button onClick={() => doBlock(false)} disabled={isLoading}>
            Unblock me
          </Button>
        </>
      ) : (
        <>
          <p>
            You are currently <span className={styles.notBlocked}>NOT BLOCKED</span> from receiving
            mail from nopestradamus.
          </p>
          <p>Would you like to block yourself from receiving mail?</p>
          <Button variant="danger" onClick={() => doBlock(true)} disabled={isLoading}>
            Block me
          </Button>
        </>
      )}
      {error !== undefined && <p className={styles.error}>{error}</p>}
    </div>
  )
}
