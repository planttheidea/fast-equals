import eslint from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import tsEslint from 'typescript-eslint';
import eslintImportPlugin from 'eslint-plugin-import';

export default defineConfig([
  globalIgnores([
    '**/!(src|DEV_ONLY)/**/*', // Ignore everything in all directories except src
    '**/!(src|DEV_ONLY)', // Ignore all directories except src
    '!src/**/*', // Don't ignore anything in src directory
    '!DEV_ONLY/**/*', // Don't ignore anything in DEV_ONLY directory
  ]),
  eslint.configs.recommended,
  tsEslint.configs.strictTypeChecked,
  tsEslint.configs.stylisticTypeChecked,
  eslintImportPlugin.flatConfigs.recommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
      'import/enforce-node-protocol-usage': ['error', 'always'],
      'import/export': 'error',
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-commonjs': 'error',
      'import/no-cycle': 'error',
      'import/no-default-export': 'error',
      'import/no-empty-named-blocks': 'error',
      'import/no-self-import': 'off',
      'import/no-unresolved': 'off',
      'import/order': [
        'error',
        {
          alphabetize: {
            order: 'asc',
            orderImportKind: 'asc',
          },
          'newlines-between': 'never',
        },
      ],
      'import/no-absolute-path': 'error',
      'import/no-self-import': 'error',

      '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unnecessary-type-parameters': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/prefer-for-of': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/prefer-optional-chain': 'off',
      '@typescript-eslint/unbound-method': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
]);
