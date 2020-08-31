import { GetServerSideProps } from 'next'
import getServerUrl from '../../util/serverUrl'
import GoBackWrapper from '../../components/goBackWrapper'
import { AppAccount } from '../../shared'
import { Button, Typography } from '@material-ui/core'
import { useState } from 'react'

export const getServerSideProps: GetServerSideProps<BlockMeProps> = async (context) => {
  const hash = context.params!.hash as string
  const response = await fetch(`${getServerUrl()}/api/v1/account/${hash}`, {
    method: 'GET',
  })

  if (response.status >= 400) {
    return { props: { hash } }
  }

  const initAccount = (await response.json()) as AppAccount
  return { props: { hash, initAccount } }
}

interface BlockMeProps {
  hash: string
  initAccount?: AppAccount
}

export default function BlockMe({ hash, initAccount }: BlockMeProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [account, setAccount] = useState(initAccount)

  const doBlock = async (blocked: boolean) => {
    setIsLoading(true)

    try {
      await fetch(`${getServerUrl()}/api/v1/account/${hash}/block`, {
        method: 'POST',
        body: JSON.stringify({
          blocked,
        }),
      })
      const response = await fetch(`${getServerUrl()}/api/v1/account/${hash}`, {
        method: 'GET',
      })
      const account = (await response.json()) as AppAccount
      setAccount(account)
    } finally {
      // TODO handle error
      setIsLoading(false)
    }
  }

  if (account === undefined) {
    return (
      <GoBackWrapper>
        <div>Account not found</div>
      </GoBackWrapper>
    )
  }

  return (
    <GoBackWrapper>
      <Typography variant="body1">
        <p>
          Your mail is <span style={{}}>{account.mail}</span>
        </p>
        {account.blocked ? (
          <>
            <p>
              You are currently <span style={{ color: 'red' }}>BLOCKED</span> from receiving mail
              from nopestradamus.
            </p>
            <p>Would you like to unblock yourself from receiving mail from nopestradamus?</p>
            <Button variant="outlined" onClick={() => doBlock(false)} disabled={isLoading}>
              Unblock me
            </Button>
          </>
        ) : (
          <>
            <p>
              You are currently <span style={{ color: 'green' }}>NOT BLOCKED</span> from receiving
              mail from nopestradamus.
            </p>
            <p>Would you like to block yourself from receiving mail?</p>
            <Button variant="outlined" onClick={() => doBlock(true)} disabled={isLoading}>
              Block me
            </Button>
          </>
        )}
      </Typography>
    </GoBackWrapper>
  )
}
