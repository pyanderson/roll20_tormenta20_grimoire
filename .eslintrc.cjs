module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'semistandard',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  env: {
    browser: true,
    webextensions: true,
    jquery: true,
  },
  plugins: ['@typescript-eslint', 'prefer-arrow'],
  rules: {
    'prefer-arrow/prefer-arrow-functions': [
      'error',
      { disallowPrototype: true, allowStandaloneDeclarations: true },
    ],
    'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
    'prettier/prettier': ['warn', { singleQuote: true }],
    '@typescript-eslint/no-var-requires': 0,
  },
};
