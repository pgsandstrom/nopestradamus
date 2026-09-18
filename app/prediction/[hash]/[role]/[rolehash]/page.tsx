import { redirect } from 'next/navigation'

/**
 * The shape of every link in every mail sent before the fragment login existed, and those mails
 * are not recallable — a prediction's end mail can be years away, so this route has to keep
 * working indefinitely. It forwards to the new URL, which logs the visitor in from the fragment.
 *
 * The role in the path is dropped: the hash alone says which table it came from, so the new URL
 * does not need to be told. A 307 rather than a permanent redirect, so nothing caches the answer
 * in a browser we cannot reach if this ever has to change again.
 */
interface LegacyAnswerPageProps {
  params: Promise<{ hash: string; role: string; rolehash: string }>
}

export default async function LegacyAnswerPage({ params }: LegacyAnswerPageProps) {
  const { hash, rolehash } = await params
  redirect(`/prediction/${hash}#${rolehash}`)
}
