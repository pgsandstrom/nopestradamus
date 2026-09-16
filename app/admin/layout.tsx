import Link from 'next/link'
import type { ReactNode } from 'react'

import GoBackWrapper from '../../components/go-back-wrapper.tsx'
import { Button } from '../../components/ui/button.tsx'
import { isAdminAuthenticated } from '../../server/admin-session.ts'
import { currentSchemaVersion } from '../../server/schema-version.ts'
import { formatDateTime } from '../../shared/date-util.ts'
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
        <div className={styles.title}>
          <h1>Admin</h1>
          <SchemaVersion />
        </div>
        <form action={logOutAction}>
          <Button type="submit">Log out</Button>
        </form>
      </header>
      <nav className={styles.nav}>
        <Link href="/admin">Console</Link>
        <Link href="/admin/predictions">Answered predictions</Link>
        <Link href="/admin/mails">Awaiting creater</Link>
      </nav>
      {children}
    </GoBackWrapper>
  )
}

/**
 * Which migration the database is on. It sits in the layout rather than on a page because it
 * describes the database every admin screen is reading, and the answer only changes on a
 * release — the layout not re-rendering between those screens costs nothing here.
 */
async function SchemaVersion() {
  const version = await currentSchemaVersion()

  if (version === undefined) {
    return <span className={styles.schema}>db not migrated</span>
  }

  return (
    <span className={styles.schema} title={`applied ${formatDateTime(version.applied)}`}>
      db {version.name.replace(/\.sql$/, '')}
    </span>
  )
}
