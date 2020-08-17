import DateFnsUtils from '@date-io/date-fns'
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers'
import { useState } from 'react'
import { Button, TextField } from '@material-ui/core'
import getServerUrl from '../../util/serverUrl'

export default function CreatePrediction() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState<Date | null>(() => new Date())
  // const [date, setDate] = useState<Date | null>(null)

  const onCreate = async () => {
    // await fetch(`http://localhost:8088/api/v1/prediction`, {
    await fetch(`${getServerUrl()}/api/v1/prediction`, {
      method: 'PUT',
      body: JSON.stringify({ TODO: 'todo' }),
      credentials: 'same-origin',
    })
  }

  return (
    <div>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <TextField
          label="Description"
          value={description}
          variant="outlined"
          onChange={(e) => setDescription(e.target.value)}
        />
        <KeyboardDatePicker
          disableToolbar
          variant="inline"
          format="MM/dd/yyyy"
          margin="normal"
          id="date-picker-inline"
          label="Date picker inline"
          value={date}
          onChange={(date) => setDate(date)}
          KeyboardButtonProps={{
            'aria-label': 'change date',
          }}
        />
      </MuiPickersUtilsProvider>
      <Button onClick={onCreate}>Create</Button>
    </div>
  )
}
