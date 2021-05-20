const rules = require('./.eslint.rules');

module.exports = {
  overrides: [
    {
      env: {
        browser: true,
        es6: true,
        jasmine: true,
        node: true
      },
      files: [ '*.ts' ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        createDefaultProgram: true,
        ecmaVersion: 2020,
        project: [
          'tsconfig.app.json',
          'tsconfig.spec.json',
          'e2e/tsconfig.json'
        ],
        sourceType: 'module'
      },
      plugins: [
        '@angular-eslint',
        '@typescript-eslint',
        'import',
        'jsdoc'
      ],
      rules: Object.assign({}, rules, {
        '@typescript-eslint/consistent-type-definitions': 'error',
        '@typescript-eslint/explicit-function-return-type': 'error',
        '@typescript-eslint/explicit-member-accessibility': [
          'error',
          {
            accessibility: 'explicit',
            overrides: {
              constructors: 'no-public'
            }
          }
        ],
        '@typescript-eslint/indent': [
          'error',
          2
        ],
        '@typescript-eslint/member-delimiter-style': [
          'error',
          {
            multiline: {
              delimiter: 'semi',
              requireLast: true
            },
            singleline: {
              delimiter: 'semi',
              requireLast: false
            }
          }
        ],
        '@typescript-eslint/member-ordering': 'error',
        '@typescript-eslint/naming-convention': [ 'error',
          {
            format: [ 'camelCase' ],
            leadingUnderscore: 'allow',
            selector: 'default',
            trailingUnderscore: 'allow'
          }, {
            format: [ 'camelCase', 'UPPER_CASE' ],
            leadingUnderscore: 'allow',
            selector: 'variable',
            trailingUnderscore: 'allow'
          }, {
            format: [ 'PascalCase' ],
            selector: 'typeLike'
          }, {
            format: [ 'camelCase', 'PascalCase', 'snake_case', 'UPPER_CASE' ],
            leadingUnderscore: 'allow',
            selector: 'property'
          }, {
            format: [ 'PascalCase' ],
            selector: 'enum'
          }, {
            format: [ 'UPPER_CASE' ],
            selector: 'enumMember'
          }
        ],
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-empty-interface': 'error',
        '@typescript-eslint/no-inferrable-types': 'error',
        '@typescript-eslint/no-misused-new': 'error',
        '@typescript-eslint/no-non-null-assertion': 'error',
        '@typescript-eslint/no-redeclare': 'error',
        '@typescript-eslint/no-shadow': 'error',
        '@typescript-eslint/no-unused-vars': 'error',
        '@typescript-eslint/no-use-before-define': 'error',
        '@typescript-eslint/prefer-function-type': 'error',
        '@typescript-eslint/quotes': [
          'error',
          'single'
        ],
        '@typescript-eslint/semi': [
          'error',
          'always'
        ],
        '@typescript-eslint/type-annotation-spacing': 'error',
        '@typescript-eslint/unified-signatures': 'error'
      })
    },
    {
      extends: [
        'plugin:@angular-eslint/template/recommended'
      ],
      files: [ '*.html' ],
      rules: {}
    },
    {
      env: {
        browser: true,
        es6: true,
        jasmine: true,
        node: true,
        protractor: true
      },
      files: [ '*.js' ],
      parserOptions: {
        ecmaVersion: 2020
      },
      plugins: [
        'import',
        'jsdoc'
      ],
      rules: Object.assign({}, rules, {
        'no-shadow': [
          'error',
          {
            hoist: 'all'
          }
        ],
        'no-undef': 'error'
      })
    }
  ],
  settings: {
    'import/internal-regex': '^src/'
  }
};
