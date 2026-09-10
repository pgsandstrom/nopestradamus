'use client'

import { type ComponentProps, useId } from 'react'

import styles from './text-field.module.css'

interface FieldShellProps {
  label: string
  error?: string | undefined
  id: string
  className?: string | undefined
  children: React.ReactNode
}

function FieldShell({ label, error, id, className, children }: FieldShellProps) {
  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      {children}
      {error !== undefined && (
        <span className={styles.error} id={`${id}-error`}>
          {error}
        </span>
      )}
    </div>
  )
}

const controlClass = (error?: string) =>
  [styles.control, error !== undefined ? styles.invalid : undefined].filter(Boolean).join(' ')

interface TextFieldProps extends Omit<ComponentProps<'input'>, 'id'> {
  label: string
  error?: string | undefined
  wrapperClassName?: string | undefined
}

export function TextField({ label, error, wrapperClassName, ...props }: TextFieldProps) {
  const id = useId()
  return (
    <FieldShell label={label} error={error} id={id} className={wrapperClassName}>
      <input
        id={id}
        className={controlClass(error)}
        aria-invalid={error !== undefined}
        aria-describedby={error !== undefined ? `${id}-error` : undefined}
        {...props}
      />
    </FieldShell>
  )
}

interface TextAreaFieldProps extends Omit<ComponentProps<'textarea'>, 'id'> {
  label: string
  error?: string | undefined
  wrapperClassName?: string | undefined
}

export function TextAreaField({ label, error, wrapperClassName, ...props }: TextAreaFieldProps) {
  const id = useId()
  return (
    <FieldShell label={label} error={error} id={id} className={wrapperClassName}>
      <textarea
        id={id}
        className={controlClass(error)}
        aria-invalid={error !== undefined}
        aria-describedby={error !== undefined ? `${id}-error` : undefined}
        {...props}
      />
    </FieldShell>
  )
}
