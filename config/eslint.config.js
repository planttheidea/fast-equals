import { createEslintConfig } from '@planttheidea/build-tools';

export default createEslintConfig({
  config: 'config',
  configs: [
    {
      rules: {
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-unnecessary-type-parameters': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/prefer-for-of': 'off',
        '@typescript-eslint/prefer-nullish-coalescing': 'off',
        '@typescript-eslint/prefer-optional-chain': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off',
      },
    },
  ],
  development: 'dev',
  react: true,
  source: 'src',
});
