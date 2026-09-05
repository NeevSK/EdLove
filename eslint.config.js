import { config } from './packages/eslint-config/base.js';

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...config,
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.astro/**',
      '**/.turbo/**',
      '**/reports/**',
      '**/legacy/**',
      '**/*-legacy/**',
      '**/*_archive/**',
      'docs/archive/**',
      '**/*.mjs',
      '**/*.cjs',
      'scripts/**',
    ],
  },
  {
    plugins: {
      react: {
        rules: {
          'react-compiler': {
            create() {
              return {};
            },
          },
        },
      },
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
];
