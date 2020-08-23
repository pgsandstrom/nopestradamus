import { PredictionCensored } from '../shared'
import { Typography } from '@material-ui/core'
import { formatDateString } from '../shared/date-util'
import CropSquareIcon from '@material-ui/icons/CropSquare'
import CheckIcon from '@material-ui/icons/Check'
import ClearIcon from '@material-ui/icons/Clear'

interface PredictionProps {
  prediction: PredictionCensored
  suppressNotAcceptedWarning?: boolean
  style?: React.CSSProperties
}

export default function Prediction({
  prediction,
  suppressNotAcceptedWarning,
  style,
}: PredictionProps) {
  return (
    <div style={style}>
      {prediction.creater.accepted !== true && suppressNotAcceptedWarning !== true && (
        <div style={{ marginTop: '20px', color: 'red' }}>
          <Typography variant="caption">
            NOTICE: This prediction has not yet been accepted by the creater, therefore it is set to
            private and not shown anywhere else on the page.
          </Typography>
        </div>
      )}
      <Typography variant="h5" style={{ marginTop: '20px' }}>
        {prediction.title}
      </Typography>
      <Typography variant="subtitle2">created on {formatDateString(prediction.created)}</Typography>
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
            Participants
          </Typography>
          <ParticipantRow
            accepted={prediction.creater.accepted}
            name={prediction.creater.mail}
            extraText="(creater)"
          />
          {prediction.participants.map((p) => (
            <ParticipantRow key={p.mail} accepted={p.accepted} name={p.mail} />
          ))}
        </div>
      )}
    </div>
  )
}

interface ParticipantRowProps {
  accepted?: boolean
  name: string
  extraText?: string
}

const ParticipantRow = ({ accepted, name, extraText }: ParticipantRowProps) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ position: 'relative' }}>
        {accepted === true && (
          <CheckIcon
            style={{
              position: 'absolute',
              top: '7px',
              left: '6px',
              fontSize: '1.2em',
              color: 'green',
            }}
          />
        )}
        {accepted === false && (
          <ClearIcon
            style={{
              position: 'absolute',
              top: '7px',
              left: '6px',
              fontSize: '1.2em',
              color: 'red',
            }}
          />
        )}
        <CropSquareIcon style={{ fontSize: '2em' }} />
      </div>

      <span>{name}</span>
      {extraText !== undefined && (
        <Typography variant="caption" style={{ marginLeft: '10px' }}>
          {extraText}
        </Typography>
      )}
      {accepted === undefined && (
        <Typography variant="caption" style={{ marginLeft: '10px' }}>
          (waiting for confirmation)
        </Typography>
      )}
    </div>
  )
}
