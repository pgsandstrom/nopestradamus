export default function getServerUrl() {
  if (typeof window === 'undefined') {
    if (process.env.BACKEND_PORT === undefined) {
      throw new Error('BACKEND_PORT is undefined')
    }

    return `http://localhost:${process.env.BACKEND_PORT}`
  } else {
    const port = location.port ? `:${location.port}` : ''
    return `${window.location.protocol}//${window.location.hostname}${port}`
  }
}
