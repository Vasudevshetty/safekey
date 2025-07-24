module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['eslint:recommended'],
  plugins: [],
  root: true,
  env: {
    node: true,
    es6: true,
  },
  rules: {
    'no-unused-vars': 'error',
    'prefer-const': 'error',
  },
};
