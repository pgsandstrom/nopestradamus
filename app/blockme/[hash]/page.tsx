import GoBackWrapper from '../../../components/go-back-wrapper.tsx'
import { getAccountByHash } from '../../../server/account.ts'
import BlockControls from './block-controls.tsx'

export const dynamic = 'force-dynamic'

interface BlockMePageProps {
  params: Promise<{ hash: string }>
}

export default async function BlockMePage({ params }: BlockMePageProps) {
  const { hash } = await params
  const account = await getAccountByHash(hash)

  return (
    <GoBackWrapper>
      {account === undefined ? (
        <p>Account not found</p>
      ) : (
        <BlockControls hash={hash} initialAccount={account} />
      )}
    </GoBackWrapper>
  )
}
