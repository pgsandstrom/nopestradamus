import { query, querySingle, SQL } from '../util/db.ts'

/**
 * Muting the comment mails of one prediction. Only those: a muted prediction's other mails, the
 * one when it finishes above all, are still sent, and blocking the whole address is what stops
 * everything. Who may mute is the caller's business: a row for an address that is not on the
 * prediction does nothing but sit there.
 */
export const isCommentMailMuted = async (predictionHash: string, mail: string): Promise<boolean> =>
  (await querySingle(
    SQL`SELECT 1 FROM comment_mute WHERE prediction_hash = ${predictionHash} AND mail = ${mail}`,
  )) !== undefined

export const setCommentMailMuted = async (
  predictionHash: string,
  mail: string,
  muted: boolean,
): Promise<void> => {
  await query(
    muted
      ? SQL`INSERT INTO comment_mute (prediction_hash, mail) VALUES (${predictionHash}, ${mail})
ON CONFLICT DO NOTHING`
      : SQL`DELETE FROM comment_mute WHERE prediction_hash = ${predictionHash} AND mail = ${mail}`,
  )
}

/** The addresses that get no comment mails about this prediction. */
export const getCommentMailMutedMails = async (predictionHash: string): Promise<Set<string>> => {
  const cursor = await query<{ mail: string }>(
    SQL`SELECT mail FROM comment_mute WHERE prediction_hash = ${predictionHash}`,
  )
  return new Set(cursor.rows.map((row) => row.mail))
}
