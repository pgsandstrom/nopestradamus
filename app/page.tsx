import Image from 'next/image'
import Link from 'next/link'

import { LinkButton } from '../components/ui/button.tsx'
import { getLatestPredictions } from '../server/prediction.ts'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const predictionShallowList = await getLatestPredictions()

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/logo.png"
          alt="Nopestradamus"
          width={400}
          height={400}
          priority
        />

        <div className={styles.intro}>
          <h1 className={styles.heading}>Trying to predict the future, are we?</h1>

          <div className={styles.introBody}>
            <p>
              So here is how this site works: You describe a prediction and an end date. If you
              want, you can add other participants that have to accept what you have written.
            </p>
            <p>
              When the end date is upon us, you all receive a mail. And that&apos;s it. No need to
              create an account or stuff like that.
            </p>
            <p>
              So what&apos;s the point? Well, sometimes people are very confident when they predict
              the future. I hope being reminded of these long term predictions will humble people.
              Predicting the future is hard.
            </p>
            <p>You can also just use it as a bet tracker.</p>
            <LinkButton href="/prediction/create">Create a prediction</LinkButton>
          </div>
        </div>

        <div className={styles.latest}>
          <div className={styles.latestCard}>
            <h2 className={styles.latestHeading}>Latest predictions</h2>
            {predictionShallowList.length === 0 ? (
              <p className={styles.empty}>No public predictions yet.</p>
            ) : (
              <ul className={styles.latestList}>
                {predictionShallowList.map((predictionShallow) => (
                  <li key={predictionShallow.hash}>
                    <Link href={`/prediction/${predictionShallow.hash}`}>
                      {predictionShallow.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <span>
          Bugs or suggestions? Project is on{' '}
          <a href="https://github.com/pgsandstrom/nopestradamus">Github</a>.
        </span>
      </footer>
    </div>
  )
}
