import { config } from '@repo/eslint-config/base';

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...config,
  {
    // Metro injects `process.env` transforms and React Native provides the
    // browser-style globals used by this package's universal engines; the
    // base config's no-undef has no env that models that runtime.
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
      },
    },
  },
];
