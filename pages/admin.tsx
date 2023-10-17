import getServerUrl from '../util/serverUrl'
import { Button, TextField } from '@mui/material'
import { useState } from 'react'
import GoBackWrapper from '../components/goBackWrapper'
import { GetServerSideProps } from 'next'
import { getCreaterNotAcceptedPredictions, getPrediction } from '../server/prediction'
import { getCreaterAcceptMail } from '../server/mailer'
import config from '../util/config'

interface AdminProps {
  mails: string
}

export const getServerSideProps: GetServerSideProps<AdminProps> = async (context) => {
  let mails: string
  const password = context.query.password
  if (password === config().adminPassword) {
    const result: string[] = []

    const predictionHashList = await getCreaterNotAcceptedPredictions()
    for (const predictionHash of predictionHashList) {
      const prediction = await getPrediction(predictionHash)
      if (prediction) {
        const mail = getCreaterAcceptMail(prediction)
        result.push(JSON.stringify(mail))
      }
    }
    mails = JSON.stringify(result)
  } else {
    mails = 'invalid password'
  }
  return { props: { mails } }
}

export default function Admin(props: AdminProps) {
  const [password, setPassword] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [mail, setMail] = useState('')
  const [hash, setHash] = useState('')

  const doTriggerCron = async () => {
    await fetch(`${getServerUrl()}/api/admin/checkmail`, {
      method: 'POST',
      body: JSON.stringify({
        password,
      }),
      credentials: 'same-origin',
    })
  }

  const doSendMail = async () => {
    await fetch(`${getServerUrl()}/api/admin/sendmail`, {
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

  const doDeletePrediction = async () => {
    await fetch(`${getServerUrl()}/api/admin/deleteprediction`, {
      method: 'DELETE',
      body: JSON.stringify({
        password,
        hash,
      }),
      credentials: 'same-origin',
    })
  }

  const doDeleteTestPredictions = async () => {
    await fetch(`${getServerUrl()}/api/admin/deletetest`, {
      method: 'POST',
      body: JSON.stringify({
        password,
      }),
      credentials: 'same-origin',
    })
  }

  // const getSomeMailz = async () => {
  //   const result = await fetch(`${getServerUrl()}/api/admin/getsomemailz`, {
  //     method: 'POST',
  //     body: JSON.stringify({
  //       password,
  //     }),
  //     credentials: 'same-origin',
  //   })
  // }

  return (
    <GoBackWrapper>
      <div>This is the admin console. You need the admin password to actually do anything</div>
      <TextField
        label="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ marginTop: '10px' }}
      />
      <div style={{ border: '1px solid red', marginTop: '20px' }}>
        <Button variant="outlined" onClick={doTriggerCron}>
          Trigger cron job
        </Button>
      </div>
      <div style={{ border: '1px solid red', marginTop: '20px' }}>
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

      <div style={{ border: '1px solid red', marginTop: '20px' }}>
        <TextField
          label="prediction hash"
          value={hash}
          onChange={(e) => setHash(e.target.value)}
          style={{ marginTop: '10px' }}
        />
        <Button variant="outlined" onClick={doDeletePrediction}>
          delete prediction
        </Button>
      </div>

      <div style={{ border: '1px solid red', marginTop: '20px' }}>
        <Button variant="outlined" onClick={doDeleteTestPredictions}>
          delete predictions named &quot;test&quot; created by your mail, you know.
        </Button>
      </div>

      <code>{props.mails}</code>
    </GoBackWrapper>
  )
}
