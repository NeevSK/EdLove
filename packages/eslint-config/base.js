import js from '@eslint/js';
import pluginImport from 'eslint-plugin-import-x';
import eslintPluginOxlint from 'eslint-plugin-oxlint';
import turboPlugin from 'eslint-plugin-turbo';
import tseslint from 'typescript-eslint';

/**
 * A shared ESLint configuration for the repository.
 *
 * ESLint serves as the niche/specialized linter for:
 * - TypeScript deep type-aware linting
 * - React Native and Expo specific rules
 * - Import/export analysis with import-x
 * - Turbo monorepo specific rules
 * - React hooks and component rules
 *
 * Primary linting is handled by Oxlint for general JS/TS patterns.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  pluginImport.flatConfigs.recommended,
  pluginImport.flatConfigs.typescript,
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      'turbo/no-undeclared-env-vars': 'warn',
      'no-unused-vars': 'off',
      'import-x/no-cycle': ['error', { maxDepth: 5 }],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
    languageOptions: {
      parserOptions: {
        project: true,
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
  {
    ignores: [
      'dist/**',
      '**/*.config.js',
      '**/*.config.mjs',
      '**/*.config.ts',
      '**/.astro/**',
      'docs/**',
      '**/__tests__/**',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.test.js',
      '**/*.test.jsx',
      '**/__mocks__/**',
    ],
  },
  ...eslintPluginOxlint.configs['flat/recommended'],
];
