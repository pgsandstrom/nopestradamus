interface String {
  repeat(count: number): string
  substr(from: number, length?: number): string
}

// interface ArrayLike {
//   includes(value:any):boolean
// }

interface Prediction {
  creater: Creater
  title: string
  body: string
  hash: string
  finish_date: string
  participants: Participant[]
}

// TODO PredictionCensored is ugly. Do it in a nice way?
interface PredictionCensored {
  creater: {
      mail: string
      hash?: string // TODO remove this row
    }
  title: string
  body: string
  hash: string
  finish_date: string
  participants:

    {
      mail: string
      hash?: string // TODO remove this row
      accepted?: boolean
      accepted_date?: string
      accepted_mail_sent: boolean
      end_mail_sent: boolean
    }[]


}

interface Creater {
  mail: string
  hash: string
}

interface Participant {
  mail: string
  hash: string
  accepted?: boolean
  accepted_date?: string
  accepted_mail_sent: boolean
  end_mail_sent: boolean
}
