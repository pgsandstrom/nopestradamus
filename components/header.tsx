import Link from 'next/link'

import { logOutAction } from '../app/actions.ts'
import { getCurrentUserMail } from '../server/session-cookie.ts'
import styles from './header.module.css'
import SessionNegotiator from './session-negotiator.tsx'
import { Button } from './ui/button.tsx'

/**
 * The one bar on every page. For now it only answers "am I logged in", and carries the client
 * side of the fragment login — it has to be somewhere that renders on every route, because a
 * secret link can be opened at any URL.
 */
export default async function Header() {
  const mail = await getCurrentUserMail()

  return (
    <header className={styles.header}>
      <Link className={styles.brand} href="/">
        Nopestradamus
      </Link>
      <div className={styles.session}>
        <SessionNegotiator>
          {mail === undefined ? (
            <span className={styles.status}>Not logged in</span>
          ) : (
            <>
              <span className={styles.status}>
                Logged in as <strong className={styles.mail}>{mail}</strong>
              </span>
              <form action={logOutAction}>
                <Button type="submit" className={styles.logout}>
                  Log out
                </Button>
              </form>
            </>
          )}
        </SessionNegotiator>
      </div>
    </header>
  )
}
