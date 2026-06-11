import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import pluginImport from 'eslint-plugin-import-x';
import eslintPluginOxlint from 'eslint-plugin-oxlint';
import turboPlugin from 'eslint-plugin-turbo';
import tseslint from 'typescript-eslint';

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
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
    ],
  },
  ...eslintPluginOxlint.configs['flat/recommended'],
];
