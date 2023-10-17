// TODO why do we have these as global types?

interface Prediction {
  created: string
  creater: Creater
  title: string
  body: string
  hash: string
  finish_date: string
  participants: Participant[]
}

interface Creater {
  mail: string
  hash: string
  accepted?: boolean
  accepted_date?: string
  accepted_mail_sent: boolean
  end_mail_sent: boolean
}

interface Participant {
  mail: string
  hash: string
  accepted?: boolean
  accepted_date?: string
  accepted_mail_sent: boolean
  end_mail_sent: boolean
}
