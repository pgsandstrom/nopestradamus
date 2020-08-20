import getServerUrl from '../util/serverUrl'
import { Button, TextField } from '@material-ui/core'
import { useState } from 'react'

export default function Admin() {
  const [password, setPassword] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [mail, setMail] = useState('')

  const doTriggerCron = async () => {
    await fetch(`${getServerUrl()}/api/v1/admin/checkmail`, {
      method: 'POST',
      body: JSON.stringify({
        password,
      }),
      credentials: 'same-origin',
    })
  }

  const doSendMail = async () => {
    await fetch(`${getServerUrl()}/api/v1/admin/sendmail`, {
      method: 'POST',
      body: JSON.stringify({
        password,
        title,
        body,
        mail,
      }),
      credentials: 'same-origin',
    })
  }

  return (
    <div>
      <TextField
        label="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ marginTop: '10px' }}
      />
      <div style={{ border: '1px solid red' }}>
        <div>here be admin stuff</div>
        <Button variant="outlined" onClick={doTriggerCron}>
          Trigger cron job
        </Button>
      </div>
      <div style={{ border: '1px solid red' }}>
        <div>test send mail</div>
        <TextField
          label="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ marginTop: '10px' }}
        />
        <TextField
          label="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          style={{ marginTop: '10px' }}
        />
        <TextField
          label="mail"
          value={mail}
          onChange={(e) => setMail(e.target.value)}
          style={{ marginTop: '10px' }}
        />
        <Button variant="outlined" onClick={doSendMail}>
          send mail
        </Button>
      </div>

      <div style={{ border: '1px solid red' }}></div>
    </div>
  )
}
