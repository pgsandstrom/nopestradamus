// this is the entry point for the process that handles cron jobs.
// Node runs this TypeScript file directly via type stripping, so there is no build step.

import { startCronStuff } from "./server/cron-controller.ts"

const stopCronStuff = startCronStuff()

// docker stop sends SIGTERM: let a running job finish instead of cutting it off mid-batch
process.once("SIGTERM", () => {
  console.log("SIGTERM received, waiting for running cron jobs to finish")
  void stopCronStuff().then(() => process.exit(0))
})
