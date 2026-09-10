// @ts-check

import eslint from '@eslint/js'
import nextPlugin from '@next/eslint-plugin-next'
import prettierConfig from 'eslint-config-prettier'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['.next/**', 'dist*/**', 'next-env.d.ts'],
  },
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  reactHooks.configs.flat['recommended-latest'],
  {
    plugins: { '@next/next': nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // turn off unwanted rules:
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off', // this feels too verbose
      '@typescript-eslint/no-inferrable-types': 'off', // this brings very little value
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off', // complains when we have type unknown
      '@typescript-eslint/only-throw-error': 'off', // needlessly strict
      '@typescript-eslint/prefer-promise-reject-errors': 'off', // extension of 'only-throw-error' rule
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'off', // this is just stylistic

      // activate extra rules:
      eqeqeq: ['error', 'smart'],
      curly: ['error'],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'next/router',
              message: 'This project uses the app router. Import from next/navigation.',
            },
          ],
        },
      ],
      '@typescript-eslint/strict-boolean-expressions': ['error', { allowNullableBoolean: true }],
      '@typescript-eslint/prefer-enum-initializers': ['error'],
      'sort-imports': [
        'error',
        {
          ignoreCase: true,
          ignoreDeclarationSort: true, // disabled since it does not have a '--fix' option
        },
      ],

      // change config of activated rules
      '@typescript-eslint/no-unused-vars': ['error', { vars: 'all', args: 'none' }],
      '@typescript-eslint/no-confusing-void-expression': [
        'error',
        { ignoreArrowShorthand: true }, // having this active is too verbose
      ],
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],
    },
  },
  {
    // config files are not part of the typechecked project
    files: ['*.mjs', '*.config.ts'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  prettierConfig,
)
