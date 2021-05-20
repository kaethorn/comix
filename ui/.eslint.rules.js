module.exports = {
  'array-bracket-spacing': [
    'error',
    'always',
    {
      arraysInArrays: false,
      objectsInArrays: false
    }
  ],
  'arrow-body-style': 'error',
  'arrow-parens': [ 'error', 'as-needed' ],
  camelcase: [
    'error',
    {
      allow: [ 'id_token', 'client_id', '__Zone_disable_customElements' ]
    }
  ],
  'comma-dangle': 'error',
  'constructor-super': 'error',
  curly: 'error',
  'dot-notation': 'off',
  'eol-last': 'error',
  eqeqeq: [
    'error',
    'smart'
  ],
  'for-direction': 'error',
  'getter-return': 'error',
  'guard-for-in': 'error',
  'id-blacklist': 'off',
  'id-match': 'off',
  indent: [
    'error',
    2,
    {
      SwitchCase: 1,
      flatTernaryExpressions: false,
      ignoreComments: false
    }
  ],
  'jsdoc/no-types': 'error',
  'linebreak-style': [
    'error',
    'unix'
  ],
  'max-len': [
    'error',
    {
      code: 140
    }
  ],
  'no-async-promise-executor': 'error',
  'no-bitwise': 'error',
  'no-caller': 'error',
  'no-case-declarations': 'error',
  'no-class-assign': 'error',
  'no-compare-neg-zero': 'error',
  'no-cond-assign': 'error',
  'no-console': [ 'error', { allow: [ 'warn', 'error' ] }],
  'no-const-assign': 'error',
  'no-constant-condition': 'error',
  'no-control-regex': 'error',
  'no-debugger': 'error',
  'no-delete-var': 'error',
  'no-dupe-args': 'error',
  'no-dupe-class-members': 'error',
  'no-dupe-keys': 'error',
  'no-duplicate-case': 'error',
  'no-empty': 'off',
  'no-empty-character-class': 'error',
  'no-eval': 'error',
  'no-ex-assign': 'error',
  'no-extra-boolean-cast': 'error',
  'no-extra-semi': 'error',
  'no-fallthrough': 'error',
  'no-func-assign': 'error',
  'no-global-assign': 'error',
  'no-inner-declarations': 'error',
  'no-invalid-regexp': 'error',
  'no-irregular-whitespace': 'error',
  'no-misleading-character-class': 'error',
  'no-mixed-spaces-and-tabs': 'error',
  'no-new-symbol': 'error',
  'no-new-wrappers': 'error',
  'no-obj-calls': 'error',
  'no-octal': 'error',
  'no-prototype-builtins': 'error',
  'no-redeclare': 'error',
  'no-regex-spaces': 'error',
  'no-restricted-globals': [ 'error', 'fit', 'fdescribe' ],
  'no-restricted-imports': [ 'error', { patterns: [ '../*' ] }],
  'no-return-await': 'error',
  'no-self-assign': 'error',
  'no-shadow-restricted-names': 'error',
  'no-sparse-arrays': 'error',
  'no-this-before-super': 'error',
  'no-throw-literal': 'error',
  'no-trailing-spaces': 'error',
  'no-undef-init': 'error',
  'no-underscore-dangle': [
    'error',
    {
      allow: [ '_embedded', '_links', '__Zone_disable_customElements' ]
    }
  ],
  'no-unexpected-multiline': 'error',
  'no-unreachable': 'error',
  'no-unsafe-finally': 'error',
  'no-unsafe-negation': 'error',
  'no-unused-expressions': 'error',
  'no-unused-labels': 'error',
  'no-unused-vars': 'off',
  'no-useless-catch': 'error',
  'no-useless-escape': 'error',
  'no-var': 'error',
  'no-with': 'error',
  'object-curly-spacing': [ 'error', 'always' ],
  'object-shorthand': 'error',
  'prefer-arrow-callback': 'error',
  'prefer-const': 'error',
  'quote-props': [ 'error', 'as-needed' ],
  quotes: [
    'error',
    'single'
  ],
  radix: 'error',
  'require-atomic-updates': 'error',
  'require-await': 'error',
  'require-yield': 'error',
  semi: [
    'error',
    'always'
  ],
  'sort-keys': [
    'error',
    'asc',
    {
      minKeys: 2
    }
  ],
  'space-before-function-paren': [
    'error',
    {
      anonymous: 'never',
      asyncArrow: 'always',
      named: 'never'
    }
  ],
  'space-in-parens': 'error',
  'spaced-comment': 'error',
  'switch-colon-spacing': 'error',
  'template-curly-spacing': [ 'error', 'always' ],
  'use-isnan': 'error',
  'valid-typeof': 'error',
  'import/no-deprecated': 'warn',
  'import/no-duplicates': 'error',
  'import/order': [
    'error',
    {
      alphabetize: {
        order: 'asc'
      },
      groups: [ 'builtin', 'external', 'internal', [ 'index', 'sibling', 'parent', 'object', 'type' ]],
      'newlines-between': 'always'
    }
  ]
};
