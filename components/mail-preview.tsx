'use client'

import { useEffect, useRef, useState } from 'react'

import type { RenderedMail } from '../server/mail/render.ts'
import styles from './mail-preview.module.css'

const VIEWS = ['rendered', 'text', 'source'] as const
type View = (typeof VIEWS)[number]

const LABEL: Record<View, string> = {
  rendered: 'Rendered',
  text: 'Plain text',
  source: 'HTML source',
}

/**
 * One mail, shown the three ways it is worth looking at: as a mail client draws it, as the
 * plain-text half reads, and as the source a deliverability tester wants pasted into it.
 */
export default function MailPreview({ mail }: { mail: RenderedMail }) {
  const [view, setView] = useState<View>('rendered')

  return (
    <div className={styles.preview}>
      <div className={styles.subject}>
        <span className={styles.subjectLabel}>Subject</span>
        <span className={styles.subjectValue}>{mail.title}</span>
      </div>
      <div className={styles.tabs} role="tablist">
        {VIEWS.map((candidate) => (
          <button
            key={candidate}
            type="button"
            role="tab"
            aria-selected={view === candidate}
            className={view === candidate ? styles.tabActive : styles.tab}
            onClick={() => setView(candidate)}
          >
            {LABEL[candidate]}
          </button>
        ))}
      </div>
      {view === 'rendered' && <RenderedMailFrame html={mail.html} title={mail.title} />}
      {view === 'text' && <pre className={styles.plain}>{mail.text}</pre>}
      {view === 'source' && <pre className={styles.plain}>{mail.html}</pre>}
    </div>
  )
}

/**
 * An iframe rather than the markup inline, and not for isolation alone: a mail dropped into this
 * page would inherit `globals.css` and look better here than it ever will in an inbox, which is
 * the one thing a preview must not do.
 */
function RenderedMailFrame({ html, title }: { html: string; title: string }) {
  const frame = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(480)

  useEffect(() => {
    const element = frame.current
    if (element === null) {
      return
    }
    // srcDoc frames are same-origin, so the rendered height can simply be read back. It is read
    // on load and again on resize because the mail's own layout reflows with the width.
    const measure = () => {
      const body = element.contentDocument?.body
      if (body != null) {
        setHeight(body.scrollHeight)
      }
    }
    element.addEventListener('load', measure)
    window.addEventListener('resize', measure)
    measure()
    return () => {
      element.removeEventListener('load', measure)
      window.removeEventListener('resize', measure)
    }
  }, [html])

  return (
    <iframe
      ref={frame}
      className={styles.frame}
      style={{ height: `${height}px` }}
      srcDoc={html}
      title={`${title} (rendered)`}
    />
  )
}
