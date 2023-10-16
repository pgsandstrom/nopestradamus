/* eslint-disable no-console */
const express = require('express')
const next = require('next')

// file mostly copied from https://github.com/vercel/next.js/tree/canary/examples/with-custom-reverse-proxy

// this file will ONLY be used in development. In production, nginx or whatever you use should proxy all /api requests to the proper backend instead

const env = process.env.NODE_ENV ?? 'development'
const dev = env !== 'production'
const app = next({
  dir: '.', // base directory where everything is, could move to src later
  dev,
})

const handle = app.getRequestHandler()

let server
app
  .prepare()
  .then(() => {
    server = express()

    // Default catch-all handler to allow Next.js to handle all other routes
    server.all('*', (req, res) => handle(req, res))

    const port = parseInt(process.env.PORT, 10) || 3000
    server.listen(port, (err) => {
      if (err) {
        throw err
      }
      console.log(`> Ready on port ${port} [${env}]`)
    })
  })
  .catch((err) => {
    console.log('An error occurred, unable to start the server')
    console.log(err)
  })
