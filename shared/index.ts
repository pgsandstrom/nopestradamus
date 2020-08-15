interface PredictionShallow {
  title: string
  body: string
  hash: string
}

interface PredictionCensored {
  creater: {
    mail: string
    hash: undefined // 'undefined' to make sure we dont accidentally leave the hash
  }
  title: string
  body: string
  hash: string
  finish_date: string
  participants: {
    mail: string
    isCurrentUser: boolean
    accepted?: boolean
    accepted_date?: string
    accepted_mail_sent: boolean
    end_mail_sent: boolean
  }[]
}
