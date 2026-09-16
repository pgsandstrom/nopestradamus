import { randomBytes } from 'node:crypto'

/**
 * Crockford's base32 in lower case: the ten digits and the alphabet minus i, l, o and u, the
 * letters that are read back as 1, 1, 0 and v when a hash is copied by hand off a screen or a
 * printed mail. Lower case only, so a link is never broken by a reader who upper-cases it.
 *
 * Exactly 32 symbols, which divides 256, so `byte % 32` below is uniform without rejection.
 */
const ALPHABET = '0123456789abcdefghjkmnpqrstvwxyz'

/**
 * 15 symbols is 75 bits. These hashes are the only thing guarding a prediction — anyone holding
 * the link is in — so the length is set by guessability, not by uniqueness: a collision needs
 * 2^37 rows, while blind guessing needs 2^74 tries on average, which no amount of traffic we
 * would survive gets near.
 */
const HASH_LENGTH = 15

/**
 * Replaces `randomUUID` for new rows. Old rows keep their UUIDs and nothing parses a hash, so
 * both shapes are looked up the same way and there is no migration.
 */
export const randomHash = (): string =>
  Array.from(randomBytes(HASH_LENGTH), (byte) => ALPHABET[byte % ALPHABET.length]).join('')
