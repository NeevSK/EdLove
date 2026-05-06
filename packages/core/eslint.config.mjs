import { config } from '@repo/eslint-config/base';

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: [
      'babel.config.cjs',
      'eslint.config.mjs',
      'jest.config.cjs',
      'vitest.config.ts',
      'scratch/**',
      'dist/**',
    ],
  },
  ...config,
];
