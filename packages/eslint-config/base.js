import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import turboPlugin from 'eslint-plugin-turbo';
import tseslint from 'typescript-eslint';
import pluginDeprecation from 'eslint-plugin-deprecation';

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
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
      'deprecation/deprecation': 'error',
    },
  },
  {
    ignores: ['dist/**'],
  },
];
