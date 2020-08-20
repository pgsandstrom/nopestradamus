import { GetServerSideProps } from 'next'
import { PredictionCensored } from '../../shared'
import getServerUrl from '../../util/serverUrl'
import Prediction from '../../components/prediction'
import Link from 'next/link'
import { Button } from '@material-ui/core'

export const getServerSideProps: GetServerSideProps<PredictionProps> = async (context) => {
  const hash = context.params!.hash as string
  const response = await fetch(`${getServerUrl()}/api/v1/prediction/${hash}`, {
    method: 'GET',
  })
  const predictionCensored = (await response.json()) as PredictionCensored
  return { props: { predictionCensored } }
}

interface PredictionProps {
  predictionCensored: PredictionCensored
}

export default function PredictionHash({ predictionCensored }: PredictionProps) {
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
      <div style={{ maxWidth: '600px' }}>
        <Link href="/">
          <Button variant="outlined">Go Back</Button>
        </Link>
        <Prediction prediction={predictionCensored} />
      </div>
    </div>
  )
}
