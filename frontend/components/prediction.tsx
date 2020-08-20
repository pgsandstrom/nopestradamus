import { PredictionCensored } from '../shared'
import { Typography, Button } from '@material-ui/core'
import { formatDateString } from '../shared/date-util'
import Link from 'next/link'

interface PredictionProps {
  prediction: PredictionCensored
  style?: React.CSSProperties
}

export default function Prediction({ prediction, style }: PredictionProps) {
  return (
    <div style={style}>
      <Link href="/">
        <Button variant="outlined">Go Back</Button>
      </Link>
      <Typography variant="h5" style={{ marginTop: '20px' }}>
        {prediction.title}
      </Typography>
      <Typography variant="subtitle2">
        created on {formatDateString(prediction.created)} by {prediction.creater.mail}
      </Typography>
      <Typography variant="body1" style={{ marginTop: '40px' }}>
        {prediction.body}
      </Typography>
      <Typography
        variant="body1"
        style={{ marginTop: '60px', borderTop: '1px solid gray', paddingTop: '10px' }}
      >
        The predictions finishes on {formatDateString(prediction.finish_date)}
      </Typography>
      {prediction.participants.length === 0 ? (
        <div>No other participants</div>
      ) : (
        <div>
          <Typography variant="h6" style={{ marginTop: '20px' }}>
            Other participants
          </Typography>
          {prediction.participants.map((participant) => {
            return <div key={participant.mail}>{participant.mail}</div>
          })}
        </div>
      )}
    </div>
  )
}
