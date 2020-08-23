import Link from 'next/link'
import { Button } from '@material-ui/core'

interface GoBackWrapperProps {
  children: React.ReactNode
}

export default function GoBackWrapper({ children }: GoBackWrapperProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      <div style={{ maxWidth: '600px', width: '100%' }}>
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
