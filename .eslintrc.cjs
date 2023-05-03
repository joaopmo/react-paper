module.exports = {
  env: {
    browser: true,
    es2022: true
  },
  extends: [
    'plugin:react/recommended',
    'standard-with-typescript',
    'eslint-config-prettier',
  ],
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: [
    'react'
  ],
  rules: {
    "@typescript-eslint/explicit-function-return-type": "off"
  }
}
