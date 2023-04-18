import { useRouter } from 'next/router'
import Link from 'next/link'
import { GetServerSideProps } from 'next'
import { PredictionShallow } from '../shared'
import getServerUrl from '../util/serverUrl'
import { Button, Typography } from '@mui/material'

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
        className="main"
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
          <div className="logo-container" style={{ maxWidth: '400px' }}>
            <img src="/logo.png" style={{ width: '100%' }} />
          </div>
        </div>
        <div className="main-text" style={{ flex: '25 0 0', alignSelf: 'center' }}>
          <div style={{ margin: '0 40px' }}>
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
              <Button variant="outlined" onClick={goToCreate}>
                Create a prediction
              </Button>
            </div>
          </div>
        </div>
        <div style={{ flex: '45 0 0', alignSelf: 'center', display: 'flex' }}>
          <div
            style={{
              margin: '50px',
              padding: '50px',
              background: 'lightblue',
              justifySelf: 'start',
            }}
          >
            <Typography variant="h6">Latest predictions</Typography>
            {predictionShallowList.map((predictionShallow) => {
              return (
                <Typography
                  key={predictionShallow.hash}
                  variant="body1"
                  style={{ marginTop: '10px' }}
                >
                  <Link href="/prediction/[hash]" as={`/prediction/${predictionShallow.hash}`}>
                    <a>{predictionShallow.title}</a>
                  </Link>
                </Typography>
              )
            })}
          </div>
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
      <style jsx>{`
        @media (max-width: 1280px) {
          .logo-container {
            margin: 40px 40px 0 40px;
          }
          .main {
            flex-direction: column;
          }
          .main-text {
            max-width: 600px;
          }
        }
      `}</style>
    </div>
  )
}
