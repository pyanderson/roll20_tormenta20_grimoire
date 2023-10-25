module.exports = {
  extends: ['semistandard', 'plugin:prettier/recommended'],
  env: {
    browser: true,
    webextensions: true,
    jquery: true,
  },
  plugins: ['prefer-arrow'],
  rules: {
    'prefer-arrow/prefer-arrow-functions': [
      'error',
      { disallowPrototype: true, allowStandaloneDeclarations: true },
    ],
    'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
    'prettier/prettier': ['warn', { singleQuote: true }],
  },
};
