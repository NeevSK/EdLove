import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import pluginDeprecation from 'eslint-plugin-deprecation';
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
      deprecation: pluginDeprecation,
    },
    languageOptions: {
      parserOptions: {
        project: true,
      },
    },
    rules: {
      'turbo/no-undeclared-env-vars': 'warn',
      'deprecation/deprecation': 'off',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      'import-x/no-cycle': ['error', { maxDepth: 5 }],
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
  {
    files: ['**/*.d.ts'],
    rules: {
      'deprecation/deprecation': 'off',
    },
  },
  ...eslintPluginOxlint.configs['flat/recommended'],
];
