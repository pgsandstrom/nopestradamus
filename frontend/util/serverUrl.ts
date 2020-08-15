export default function getServerUrl() {
  if (typeof window === 'undefined') {
    return `http://localhost:${process.env.PORT}`
  } else {
    const port = location.port ? `:${location.port}` : ''
    return `${window.location.protocol}//${window.location.hostname}${port}`
  }
}
