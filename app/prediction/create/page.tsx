import type { Metadata } from 'next'

import GoBackWrapper from '../../../components/go-back-wrapper.tsx'
import CreateForm from './create-form.tsx'

export const metadata: Metadata = {
  title: 'Create a prediction | Nopestradamus',
}

export default function CreatePredictionPage() {
  return (
    <GoBackWrapper>
      <CreateForm />
    </GoBackWrapper>
  )
}
