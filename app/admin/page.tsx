import Link from 'next/link'

import { adminGetBlockedAccounts } from '../../server/account.ts'
import { isAdminAuthenticated } from '../../server/admin-session.ts'
import type { AdminAccount } from '../../shared/index.ts'
import AdminConsole from './admin-console.tsx'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  // the layout renders the login form instead of this page, but it does not re-render on a
  // client-side navigation, so the page checks for itself rather than inheriting the answer
  if (!(await isAdminAuthenticated())) {
    return null
  }

  return (
    <>
      <AdminConsole />
      <BlockedMails />
    </>
  )
}

async function BlockedMails() {
  const blocked = await adminGetBlockedAccounts()

  return (
    <section className={styles.blocked}>
      <h2 className={styles.heading}>Blocked mails ({blocked.length})</h2>
      <p className={styles.summary}>
        Accounts that have unsubscribed. The cron job sends them nothing; their block page is where
        that is undone.
      </p>
      {blocked.length === 0 ? (
        <p className={styles.empty}>Nobody has unsubscribed.</p>
      ) : (
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mail</th>
                <th>Validated</th>
                <th>Block page</th>
              </tr>
            </thead>
            <tbody>
              {blocked.map((account) => (
                <BlockedRow key={account.mail} account={account} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function BlockedRow({ account }: { account: AdminAccount }) {
  return (
    <tr>
      <td>{account.mail}</td>
      <td>
        {account.validated ? 'validated' : <span className={styles.muted}>not validated</span>}
      </td>
      <td className={styles.nowrap}>
        <Link href={`/blockme/${account.hash}`}>/blockme/{account.hash}</Link>
      </td>
    </tr>
  )
}
