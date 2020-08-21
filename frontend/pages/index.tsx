import { useRouter } from 'next/router'
import Link from 'next/link'
import { GetServerSideProps } from 'next'
import { PredictionShallow } from '../shared'
import getServerUrl from '../util/serverUrl'
import { Button } from '@material-ui/core'

export const getServerSideProps: GetServerSideProps<HomeProps> = async (_context) => {
  const response = await fetch(`${getServerUrl()}/api/v1/prediction`, {
    method: 'GET',
  })

  const predictionShallowList = (await response.json()) as PredictionShallow[]
  return { props: { predictionShallowList } }
}

interface HomeProps {
  predictionShallowList: PredictionShallow[]
}

export default function Home({ predictionShallowList }: HomeProps) {
  const router = useRouter()

  const goToCreate = () => {
    void router.push('/prediction/create')
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        maxWidth: '100%',
        height: '100%',
      }}
    >
      <main
        style={{
          display: 'flex',
          flex: '1 0 0',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignSelf: 'center',
            flex: '30 0 0',
          }}
        >
          <div style={{ width: '400px' }}>
            <img src="/logo.png" style={{ width: '100%' }} />
          </div>
        </div>
        <div style={{ flex: '25 0 0', alignSelf: 'center' }}>
          <h1 style={{ fontSize: '2em' }}>Trying to predict the future, are we?</h1>

          <div style={{ fontSize: '1.1em' }}>
            <p>
              So here is how this site works: You describe a prediction and an end date. If you
              want, you can add other participants that have to accept what you have written.
            </p>
            <p>
              When the end date is upon us, you all receive a mail. And that&apos;s it. No need to
              create an account or stuff like that.
            </p>
            <p>
              So whats the point? Well, sometimes people are very confident when they predict the
              future. I hope being reminded of these long term predictions will humble people.
              Predicting the future is hard.
            </p>
            <p>You can also just use it as a bet tracker.</p>
            <p>
              So go ahead:{' '}
              <Button variant="outlined" onClick={goToCreate}>
                Create a prediction
              </Button>
            </p>
          </div>
        </div>
        <div style={{ flex: '45 0 0' }}>
          {predictionShallowList.map((predictionShallow) => {
            return (
              <div key={predictionShallow.hash}>
                <Link href="/prediction/[hash]" as={`/prediction/${predictionShallow.hash}`}>
                  <a>{predictionShallow.title}</a>
                </Link>
              </div>
            )
          })}
        </div>
      </main>

      <footer
        style={{
          display: 'flex',
          padding: '20px 0',
          borderTop: '1px solid #eaeaea',
          justifyContent: 'center',
        }}
      >
        <span>
          Bugs or suggestions? Project is on{' '}
          <a href="https://github.com/pgsandstrom/nopestradamus">Github</a>.
        </span>
      </footer>
    </div>
  )
}
