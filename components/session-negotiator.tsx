'use client'

import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { logInWithHashAction } from '../app/actions.ts'
import { isLoginFragment } from '../shared/index.ts'
import styles from './header.module.css'
import { LOGIN_COVER_ATTRIBUTE } from './login-cover-script.ts'

type Status = 'idle' | 'working' | 'failed'

/**
 * Turns the fragment of a secret URL into a session.
 *
 * A fragment is never sent to the server, which is the point: the hash that used to sit in the
 * path of /prediction/x/creater/y — and so ended up in access logs, referrers and link
 * prefetchers along the way — now only ever reaches the server as the argument of one action,
 * and is wiped from the address bar the moment that action succeeds.
 *
 * `children` is the logged-in state rendered on the server. It is shown whenever there is no
 * fragment to deal with, which is every visit after the first one.
 */
export default function SessionNegotiator({ children }: { children: ReactNode }) {
  // Matches what the inline script in the root layout decided a moment ago, so this component
  // agrees with the DOM from its very first render. 'idle' and 'working' render the same thing,
  // so reading the fragment here cannot cause a hydration mismatch.
  const [status, setStatus] = useState<Status>(() =>
    typeof window !== 'undefined' && isLoginFragment(window.location.hash.slice(1))
      ? 'working'
      : 'idle',
  )
  // one attempt per fragment, so a failed login is not retried on every re-render
  const attempted = useRef<string | undefined>(undefined)

  // The cover is the inline script's to raise and this component's to lower, so nothing but a
  // real answer can take it down. Before paint rather than after, and re-asserted rather than
  // assumed: React's dev-only Strict Mode remount resets the attributes on <html> to the ones it
  // manages itself, which drops the one the script set.
  useLayoutEffect(() => {
    if (status === 'working') {
      document.documentElement.setAttribute(LOGIN_COVER_ATTRIBUTE, '')
    } else {
      document.documentElement.removeAttribute(LOGIN_COVER_ATTRIBUTE)
    }
  }, [status])

  useEffect(() => {
    const negotiate = () => {
      const fragment = window.location.hash.slice(1)
      if (!isLoginFragment(fragment) || attempted.current === fragment) {
        return
      }
      attempted.current = fragment
      setStatus('working')
      void logInWithHashAction(fragment).then((result) => {
        if (!result.ok) {
          setStatus('failed')
          return
        }
        // Drop the secret from the address bar, then fetch the page again as the person we now
        // are. A whole reload rather than router.refresh(): the cover has to stay up until the
        // right page has actually painted, and a reload ends exactly there — the new document
        // has no fragment, so the inline script leaves it uncovered.
        window.history.replaceState(null, '', window.location.pathname + window.location.search)
        window.location.reload()
      })
    }

    negotiate()
    // a link to the same page with a different fragment changes no route, so React would not
    // re-run this on its own
    window.addEventListener('hashchange', negotiate)
    return () => {
      window.removeEventListener('hashchange', negotiate)
    }
  }, [])

  if (status === 'failed') {
    return <span className={styles.error}>That link did not log you in.</span>
  }
  return children
}
