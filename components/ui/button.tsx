import Link from 'next/link'
import type { ComponentProps } from 'react'

import styles from './button.module.css'

type Variant = 'primary' | 'danger'

const classesFor = (variant: Variant = 'primary', className?: string) =>
  [styles.button, variant === 'danger' ? styles.danger : undefined, className]
    .filter(Boolean)
    .join(' ')

interface ButtonProps extends ComponentProps<'button'> {
  variant?: Variant
}

export function Button({ variant, className, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={classesFor(variant, className)} {...props} />
}

interface LinkButtonProps extends ComponentProps<typeof Link> {
  variant?: Variant
}

export function LinkButton({ variant, className, ...props }: LinkButtonProps) {
  return <Link className={classesFor(variant, className)} {...props} />
}
