import type { Metadata } from 'next'

import GoBackWrapper from '../../../components/go-back-wrapper.tsx'
import { getCurrentUserMail } from '../../../server/session-cookie.ts'
import CreateForm from './create-form.tsx'

export const metadata: Metadata = {
  title: 'Create a prediction | Nopestradamus',
}

export default async function CreatePredictionPage() {
  // The one page a visitor without a session cookie reaches without touching the database, so the
  // lookup stays behind the cookie: no cookie, no query, and the form simply starts empty.
  const mail = await getCurrentUserMail()

  return (
    <GoBackWrapper>
      <CreateForm initialCreaterMail={mail} />
    </GoBackWrapper>
  )
}
