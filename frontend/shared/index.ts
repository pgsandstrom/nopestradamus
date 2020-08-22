// TODO as soon as nextjs actually supports shared folders in a nice way, move this to outside frontend folder
// follow discussion at https://github.com/vercel/next.js/discussions/15327

export interface PredictionShallow {
  title: string
  body: string
  hash: string
}

export interface PredictionCensored {
  created: string
  creater: {
    mail: string
    accepted?: boolean
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

export type Dictionary<K extends string | number | symbol, V> = { [key in K]: V }

export type PartialDict<K extends string | number | symbol, V> = { [key in K]?: V }
