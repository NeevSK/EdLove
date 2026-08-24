import { config } from '@repo/eslint-config/base';

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...config,
  {
    // This package exists to stub legacy peer dependencies whose real
    // implementations supply their own types; `any` here is the contract,
    // not slop. Scoped to this package's .d.ts only.
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
