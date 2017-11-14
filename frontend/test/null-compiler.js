// Used by mocha to avoid processing scss-files when testing

function noop() {
  return null;
}

require.extensions['.scss'] = noop;
