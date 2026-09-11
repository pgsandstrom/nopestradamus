/**
 * Writes a curl cookie jar holding a valid admin session, so a local agent or script can read
 * the pages under /admin without ever handling the password.
 *
 * The token is signed with `adminPassword` from config.json, exactly like a browser login, so
 * treat the jar as the same secret config.json is: it is gitignored, and if the local password
 * is also the production one the cookie is valid there too.
 */
import fs from 'node:fs'

import {
  adminSessionSecret,
  createSessionToken,
  SESSION_TTL_SECONDS,
} from '../server/admin-auth.ts'
import { isDev } from '../util/env.ts'

const JAR_PATH = '.dev-session'
const COOKIE = 'admin_session'
const DOMAIN = 'localhost'

if (!isDev()) {
  throw new Error(
    'dev-session is a local development helper, refusing to run with NODE_ENV=production',
  )
}

const expiry = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
const token = createSessionToken(adminSessionSecret())

// Netscape cookie jar: domain, include subdomains, path, secure, expiry, name, value — tab separated
const jar = `# Netscape HTTP Cookie File
# Written by scripts/dev-session.ts. Gitignored, and as secret as config.json.
${DOMAIN}\tFALSE\t/\tFALSE\t${expiry}\t${COOKIE}\t${token}
`

fs.writeFileSync(JAR_PATH, jar, { encoding: 'utf8', mode: 0o600 })

// deliberately never prints the token itself, so it cannot leak into a terminal transcript
console.log(`wrote ${JAR_PATH}, valid until ${new Date(expiry * 1000).toISOString()}`)
console.log(`use it with: curl -b ${JAR_PATH} http://localhost:3000/admin`)
