module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: ['airbnb-typescript/base', 'prettier', 'plugin:jest/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'prettier', 'jest'],
  rules: {
    'prettier/prettier': ['error'],
    'jest/expect-expect': [
      'error',
      {
        assertFunctionNames: ['expect', 'request.**.expect'],
      },
    ],
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: ['**/*.test.ts', './src/test/**'],
      },
    ],
    'no-underscore-dangle': 'off',
    // '@typescript-eslint/naming-convention': [
    //   'error',
    //   { selector: 'variableLike', format: ['camelCase'], leadingUnderscore: 'allow' },
    // ],
    'class-methods-use-this': 'off',
  },
};
