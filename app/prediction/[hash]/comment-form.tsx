'use client'

import { type SubmitEvent, useEffect, useRef, useState, useTransition } from 'react'

import { Button } from '../../../components/ui/button.tsx'
import { TextAreaField } from '../../../components/ui/text-field.tsx'
import { COMMENT_MAX_LENGTH, validateComment } from '../../../shared/validate-comment.ts'
import { addCommentAction } from '../../actions.ts'
import styles from './comments.module.css'

/** From here the counter turns orange, so the limit is noticed before it stops the typing. */
const NEAR_LIMIT_SHARE = 0.9

/**
 * A controlled textarea driven through a transition rather than a `<form action>`: React resets
 * a form once its action finishes whether or not it worked, and a failed comment should not take
 * the text with it. The new comment itself arrives with the page, which the action revalidates.
 */
export default function CommentForm({ predictionHash }: { predictionHash: string }) {
  const [body, setBody] = useState('')
  const [error, setError] = useState<string>()
  const [isSaving, startSaving] = useTransition()
  const textarea = useRef<HTMLTextAreaElement>(null)

  // Firefox puts a half-written comment back into the textarea on reload, before React hydrates,
  // and React keeps the DOM value without telling the state about it. Until the next keystroke
  // the counter would read 0 and the button stay disabled, so pick the draft up once here.
  useEffect(() => {
    const restored = textarea.current?.value
    if (restored !== undefined && restored !== '') {
      setBody(restored)
    }
  }, [])

  const submit = (event: SubmitEvent) => {
    event.preventDefault()
    startSaving(async () => {
      const result = await addCommentAction(predictionHash, body)
      if (result.ok) {
        setBody('')
        setError(undefined)
      } else {
        setError(result.error)
      }
    })
  }

  const isNearLimit = body.length >= COMMENT_MAX_LENGTH * NEAR_LIMIT_SHARE

  return (
    <form className={styles.form} onSubmit={submit}>
      <TextAreaField
        label="Add a comment"
        ref={textarea}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        maxLength={COMMENT_MAX_LENGTH}
        disabled={isSaving}
        error={error}
      />
      <div className={styles.formFooter}>
        <Button type="submit" disabled={isSaving || !validateComment(body)}>
          Comment
        </Button>
        <span
          className={[styles.counter, isNearLimit ? styles.counterNearLimit : undefined]
            .filter(Boolean)
            .join(' ')}
        >
          {body.length} / {COMMENT_MAX_LENGTH}
        </span>
      </div>
    </form>
  )
}
