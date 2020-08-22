import Link from 'next/link'
import { Button } from '@material-ui/core'

interface GoBackWrapperProps {
  children: React.ReactNode
}

// TODO use this in more places
export default function GoBackWrapper({ children }: GoBackWrapperProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        alignItems: 'center',
        paddingTop: '20px',
      }}
    >
      <div style={{ maxWidth: '600px', width: '600px' }}>
        <Link href="/">
          <Button variant="outlined" style={{ marginBottom: '20px' }}>
            Go Back
          </Button>
        </Link>
        {children}
      </div>
    </div>
  )
}
