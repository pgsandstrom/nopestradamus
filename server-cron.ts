// this is the entry point for the process that handles cron jobs.
// Node runs this TypeScript file directly via type stripping, so there is no build step.

import { startCronStuff } from './server/cron-controller.ts'

startCronStuff()
