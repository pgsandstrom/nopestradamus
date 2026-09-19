/** Long enough for an argument, short enough that the comment list stays a list. */
export const COMMENT_MAX_LENGTH = 2000

/** Measured after trimming, because that is what gets stored. */
export const validateComment = (body?: string): body is string => {
  const trimmed = body?.trim()
  return trimmed !== undefined && trimmed.length > 0 && trimmed.length <= COMMENT_MAX_LENGTH
}
