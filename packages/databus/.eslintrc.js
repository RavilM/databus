const path = require('path');

module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
    'plugin:prettier/recommended',
    'plugin:security/recommended',
    'prettier/@typescript-eslint',
  ],
  parserOptions: {
    project: path.resolve('./tsconfig.json'),
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for sthe use of imports
  },
  env: {
    browser: true,
    node: true,
    jest: true,
  },
  plugins: ['import', 'security'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        trailingComma: 'all',
        useTabs: false,
        printWidth: 80,
      },
    ],
    'no-implied-eval': 2,
    'import/prefer-default-export': 0,
    'prefer-destructuring': 0,
    'import/no-unresolved': 0,
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          ['internal', 'unknown'],
          'parent',
          'sibling',
          'index',
        ],
      },
    ],
    'import/no-extraneous-dependencies': 0,
    'no-console': ['error', { allow: ['error','warn'] }],
    quotes: ['error', 'single'],
    'function-paren-newline': 0,
    'consistent-return': 0,
    '@typescript-eslint/indent': 0, // Conflicts with Prettier
    '@typescript-eslint/explicit-member-accessibility': 0,
    '@typescript-eslint/interface-name-prefix': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/explicit-function-return-type': 0,
    'no-case-declarations': 0,
    'no-extra-boolean-cast': 0,
    'no-async-promise-executor': 0,
    'max-classes-per-file': ['error', 2],
    'class-methods-use-this': 0,
    'security/detect-child-process': 0,
    'security/detect-object-injection': 0,
    'security/detect-non-literal-regexp': 0,
    'security/detect-non-literal-fs-filename': 0,
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [['@', './lib']],
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
      },
    },
  },
};
