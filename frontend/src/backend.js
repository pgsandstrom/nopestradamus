const port = location.port ? `:${location.port}` : '';
const SERVER_URL = `${window.location.protocol}//${window.location.hostname}${port}`;
const getServerUrl = function getServerUrl() {
  return SERVER_URL;
};

export { getServerUrl }; // eslint-disable-line import/prefer-default-export
