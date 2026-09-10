import type { ReactNode } from 'react'

import { LinkButton } from './ui/button.tsx'
import styles from './go-back-wrapper.module.css'

export default function GoBackWrapper({ children }: { children: ReactNode }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <LinkButton href="/" className={styles.back}>
          Go Back
        </LinkButton>
        {children}
      </div>
    </div>
  )
}
