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
            return (
              <div key={participant.mail} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  {participant.accepted === true && (
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
                  {participant.accepted === false && (
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

                <span>{participant.mail}</span>
                {participant.accepted === undefined && (
                  <Typography variant="caption" style={{ marginLeft: '10px' }}>
                    (waiting for confirmation)
                  </Typography>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
