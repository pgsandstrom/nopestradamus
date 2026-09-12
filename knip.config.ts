import type { KnipConfig } from 'knip'

// `!` suffix marks a pattern as production. The next plugin finds the app router entries.
// server-cron.ts is only reachable through the `cron` script, which --production ignores,
// so it has to be listed as a production entry itself.
// Tests are entries in default mode only, so --production flags source files that are
// only reachable through tests. scripts/dev-session.ts is listed the same way: it hangs off
// the `dev-session` script, which --production ignores too.
const config: KnipConfig = {
  entry: [
    'server-cron.ts!',
    'scripts/dev-session.ts',
    'scripts/send-health-mail.ts',
    '**/*.test.ts',
  ],
  project: ['**/*.{ts,tsx}!'],
  // husky lives in optionalDependencies so the docker images can skip it with --no-optional
  ignoreBinaries: ['husky'],
  // an export used inside its own file is a style nit, not dead code
  ignoreExportsUsedInFile: true,
}

export default config
