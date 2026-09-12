import Link from 'next/link'
import type { ReactNode } from 'react'

import GoBackWrapper from '../../components/go-back-wrapper.tsx'
import { Button } from '../../components/ui/button.tsx'
import { isAdminAuthenticated } from '../../server/admin-session.ts'
import { logOutAction } from './actions.ts'
import styles from './layout.module.css'
import LoginForm from './login-form.tsx'

/**
 * The gate for everything under /admin, so a new admin screen is a page.tsx and nothing else.
 * It is the gate for the UI only — each page and action under here checks the session again,
 * since this layout is not re-rendered when the visitor moves between those pages.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  if (!(await isAdminAuthenticated())) {
    return (
      <GoBackWrapper>
        <LoginForm />
      </GoBackWrapper>
    )
  }

  return (
    <GoBackWrapper>
      <header className={styles.header}>
        <h1>Admin</h1>
        <form action={logOutAction}>
          <Button type="submit">Log out</Button>
        </form>
      </header>
      <nav className={styles.nav}>
        <Link href="/admin">Console</Link>
        <Link href="/admin/predictions">Predictions</Link>
        <Link href="/admin/mails">Pending mails</Link>
      </nav>
      {children}
    </GoBackWrapper>
  )
}
