'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState, useTransition } from 'react'

import { Button } from '../../../../components/ui/button.tsx'
import { deletePredictionAction } from '../../actions.ts'
import styles from './delete-prediction.module.css'

interface DeletePredictionProps {
  hash: string
  title: string
  participantCount: number
}

export default function DeletePrediction({ hash, title, participantCount }: DeletePredictionProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [error, setError] = useState<string>()
  const [isDeleting, startDeleting] = useTransition()
  const router = useRouter()

  const open = () => {
    setError(undefined)
    dialog.current?.showModal()
  }

  const doDelete = () => {
    startDeleting(async () => {
      const result = await deletePredictionAction(hash)
      if (result.ok) {
        dialog.current?.close()
        // the list is a server component, so it needs a re-render to lose the deleted row
        router.replace('/admin/predictions')
        router.refresh()
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <>
      <p className={styles.warning}>
        Deleting removes the prediction, its creater and participant rows and its comments. It
        cannot be undone.
      </p>
      <Button variant="danger" onClick={open}>
        Delete prediction
      </Button>

      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-labelledby="delete-prediction-heading"
        // esc closes a dialog without going through the buttons, so it needs the same guard
        onCancel={(event) => {
          if (isDeleting) {
            event.preventDefault()
          }
        }}
      >
        <h2 className={styles.dialogHeading} id="delete-prediction-heading">
          Delete this prediction?
        </h2>
        <p className={styles.dialogBody}>
          <strong>{title}</strong>
        </p>
        <p className={styles.dialogBody}>
          This deletes the prediction, its creater row and{' '}
          {participantCount === 1 ? '1 participant row' : `${participantCount} participant rows`}.
          There is no undo.
        </p>
        {error !== undefined && <p className={styles.error}>{error}</p>}
        <div className={styles.actions}>
          <Button disabled={isDeleting} onClick={() => dialog.current?.close()}>
            Cancel
          </Button>
          <Button variant="danger" disabled={isDeleting} onClick={doDelete}>
            {isDeleting ? 'Deleting…' : 'Yes, delete it'}
          </Button>
        </div>
      </dialog>
    </>
  )
}
