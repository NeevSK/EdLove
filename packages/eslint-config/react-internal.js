import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginReactNativeA11y from 'eslint-plugin-react-native-a11y';
import globals from 'globals';
import path from 'path';
import tseslint from 'typescript-eslint';
import { fileURLToPath } from 'url';
import { config as baseConfig } from './base.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/**
 * A custom ESLint configuration for libraries that use React.
 *
 * @type {import("eslint").Linter.Config[]} */
export const config = [
  ...baseConfig,
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReactHooks.configs.flat.recommended,
  ...compat.extends('plugin:react-native-a11y/all'),
  {
    languageOptions: {
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },
  {
    settings: { react: { version: 'detect' } },
    rules: {
      // React scope no longer necessary with new JSX transform.
      'react/react-in-jsx-scope': 'off',
      'no-restricted-syntax': [
        'warn',
        {
          selector:
            "CallExpression[callee.name='t'][arguments.length=2][arguments.1.type='Literal'], CallExpression[callee.name='t'][arguments.length=2][arguments.1.type='TemplateLiteral']",
          message:
            "Avoid inline default text in t('key', 'default'). Define fallback text in locale files and use i18n fallbackLng.",
        },
      ],
    },
  },
];
