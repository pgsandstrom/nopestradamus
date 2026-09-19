import { query, querySingle, SQL } from '../util/db.ts'

/**
 * Muting the activity mails of one prediction: new comments, and somebody accepting or rejecting
 * it. Only those: a muted prediction's other mails, the one when it finishes above all, are still
 * sent, and blocking the whole address is what stops everything. Who may mute is the caller's
 * business: a row for an address that is not on the prediction does nothing but sit there.
 */
export const isActivityMailMuted = async (predictionHash: string, mail: string): Promise<boolean> =>
  (await querySingle(
    SQL`SELECT 1 FROM prediction_activity_mute WHERE prediction_hash = ${predictionHash} AND mail = ${mail}`,
  )) !== undefined

export const setActivityMailMuted = async (
  predictionHash: string,
  mail: string,
  muted: boolean,
): Promise<void> => {
  await query(
    muted
      ? SQL`INSERT INTO prediction_activity_mute (prediction_hash, mail) VALUES (${predictionHash}, ${mail})
ON CONFLICT DO NOTHING`
      : SQL`DELETE FROM prediction_activity_mute WHERE prediction_hash = ${predictionHash} AND mail = ${mail}`,
  )
}

/** The addresses that get no activity mails about this prediction. */
export const getActivityMailMutedMails = async (predictionHash: string): Promise<Set<string>> => {
  const cursor = await query<{ mail: string }>(
    SQL`SELECT mail FROM prediction_activity_mute WHERE prediction_hash = ${predictionHash}`,
  )
  return new Set(cursor.rows.map((row) => row.mail))
}
