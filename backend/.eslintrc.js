module.exports = {
  env: {
    browser: false,
    es6: true,
  },
  extends: ['eslint:recommended'],
  parser: 'typescript-eslint-parser',
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      generators: false,
      experimentalObjectRestSpread: true,
    },
  },
  plugins: ['typescript'],
  rules: {
    'no-undef': 'off', // Currently does not work with typescript https://github.com/eslint/typescript-eslint-parser/issues/416
    'no-unused-vars': 'off', // Currently mistakes imported interfaces for unused variables
    'no-console': 'off', // Already caught by tslint
  },
};
