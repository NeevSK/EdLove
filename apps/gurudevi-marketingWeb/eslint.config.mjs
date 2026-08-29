import { config } from '@repo/eslint-config/base';

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...config,
  {
    // `astro:*` modules are injected by the Astro build/runtime and have no
    // on-disk entry for the import resolver to find; TypeScript resolves them
    // through ambient types instead.
    files: ['**/*.{ts,tsx,mjs,js}'],
    rules: {
      'import-x/no-unresolved': ['error', { ignore: ['astro:'] }],
    },
  },
  {
    // Service workers run in a worker global scope: importScripts/workbox are
    // runtime-provided, not imports.
    files: ['**/sw.js'],
    languageOptions: {
      globals: {
        importScripts: 'readonly',
        workbox: 'readonly',
        console: 'readonly',
      },
    },
  },
];
