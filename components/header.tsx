import Link from 'next/link'

import { logOutAction } from '../app/actions.ts'
import { getCurrentUserMail } from '../server/session-cookie.ts'
import styles from './header.module.css'
import LoginForm from './login-form.tsx'
import SessionNegotiator from './session-negotiator.tsx'
import { Button } from './ui/button.tsx'

/**
 * The one bar on every page. It answers "am I logged in", offers the way in when the answer is
 * no, and carries the client side of the fragment login — which has to be somewhere that renders
 * on every route, because a secret link can be opened at any URL.
 *
 * There is no "not logged in" label beside the form: a form asking for your address to continue
 * with says that already, and the header is narrow.
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
            <LoginForm />
          ) : (
            <>
              <span className={styles.status}>
                Logged in as{' '}
                <Link className={styles.mail} href="/me">
                  {mail}
                </Link>
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
