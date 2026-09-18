import styles from './login-cover.module.css'

/**
 * Covers the page while a secret link is being traded for a session, so the prediction is never
 * shown as a stranger sees it to somebody who is about to be logged in.
 *
 * It is always rendered and is `display: none` until the `data-logging-in` attribute appears on
 * `<html>` — put there before the first paint by the inline script in the root layout, and kept
 * in step with the request after that by `session-negotiator.tsx`. Being plain CSS is the point:
 * it has to work in the window before React has loaded at all.
 */
export default function LoginCover() {
  return (
    <div className={styles.cover}>
      <p className={styles.text}>Logging you in…</p>
    </div>
  )
}
