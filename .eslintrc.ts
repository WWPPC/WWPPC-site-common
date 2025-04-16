/* eslint-env node */
import '@rushstack/eslint-patch/modern-module-resolution'

export default {
  root: true,
  'extends': [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript'
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    "no-async-promise-executor": "off"
  }
}
