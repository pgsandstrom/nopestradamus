'use client'

import { type ComponentProps, type Ref, useId, useLayoutEffect, useRef } from 'react'

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
  /** Grow with the content instead of scrolling, up to a cap set in CSS. */
  autoGrow?: boolean
}

// `field-sizing: content` does the growing where it is supported; elsewhere (Firefox) the height is
// set from `scrollHeight` whenever the value changes.
const supportsFieldSizing = () =>
  typeof CSS !== 'undefined' && CSS.supports('field-sizing', 'content')

export function TextAreaField({
  label,
  error,
  wrapperClassName,
  autoGrow = false,
  ref,
  ...props
}: TextAreaFieldProps) {
  const id = useId()
  const own = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    const el = own.current
    if (!autoGrow || el === null || supportsFieldSizing()) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight + el.offsetHeight - el.clientHeight}px`
  }, [autoGrow, props.value])

  const setRef = (el: HTMLTextAreaElement | null) => {
    own.current = el
    assignRef(ref, el)
  }

  return (
    <FieldShell label={label} error={error} id={id} className={wrapperClassName}>
      <textarea
        id={id}
        ref={setRef}
        className={[controlClass(error), autoGrow ? styles.autoGrow : undefined]
          .filter(Boolean)
          .join(' ')}
        aria-invalid={error !== undefined}
        aria-describedby={error !== undefined ? `${id}-error` : undefined}
        {...props}
      />
    </FieldShell>
  )
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') ref(value)
  else if (ref) ref.current = value
}
