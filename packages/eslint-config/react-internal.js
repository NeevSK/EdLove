import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';
import eslintReact from '@eslint-react/eslint-plugin';
import pluginRnxKit from '@rnx-kit/eslint-plugin';
import pluginJsxA11y from 'eslint-plugin-jsx-a11y';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginReactNative from 'eslint-plugin-react-native';
import sonarjs from 'eslint-plugin-sonarjs';
import globals from 'globals';
import { config as baseConfig } from './base.js';
import maxUseStateRule from './rules/max-use-state.js';

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
  pluginReactHooks.configs.flat.recommended,
  pluginJsxA11y.flatConfigs.recommended,
  eslintReact.configs.recommended,
  ...compat.extends('plugin:react-native-a11y/all'),
  {
    plugins: {
      'react-native': pluginReactNative,
      '@rnx-kit': pluginRnxKit,
    },
    rules: {
      'react-native/no-unused-styles': 'warn',
      'react-native/no-inline-styles': 'warn',
      'react-native/no-color-literals': 'warn',
      '@rnx-kit/no-export-all': 'warn',
      '@rnx-kit/no-const-enum': 'error',
    },
  },
  {
    languageOptions: {
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },
  {
    plugins: {
      local: {
        rules: {
          'max-use-state': maxUseStateRule,
        },
      },
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'local/max-use-state': ['error', { max: 3 }],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-restricted-imports': [
        'error',
        {
          name: 'lucide-react-native',
          message:
            'Import icons from @repo/ui/icons instead of directly from lucide-react-native. See 2026-07-16-icon-bridge-contract.md.',
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "CallExpression[callee.name='t'][arguments.length=2][arguments.1.type='Literal'], CallExpression[callee.name='t'][arguments.length=2][arguments.1.type='TemplateLiteral']",
          message:
            "Avoid inline default text in t('key', 'default'). Define fallback text in locale files and use i18n fallbackLng.",
        },
        {
          selector:
            "JSXOpeningElement[name.name='Button'] > JSXAttribute[name.name='onPress'] > JSXExpressionContainer > :matches(ArrowFunctionExpression[async=true], FunctionExpression[async=true])",
          message:
            'Unsafe async handler detected on Button. This can lead to idempotency bugs (double-clicks). Use <SafeButton onSafePress={...} /> or the useSafeAction() hook instead.',
        },
        {
          selector: "CallExpression[callee.object.name='Math'][callee.property.name='random']",
          message:
            'Math.random() is non-deterministic and causes hydration mismatches in 2026. Use useId() for IDs or generate random values outside the render cycle.',
        },
        {
          selector: "CallExpression[callee.object.name='Date'][callee.property.name='now']",
          message:
            'Date.now() is non-deterministic during hydration. Use a stable timestamp prop or wrap in useEffect.',
        },
      ],
    },
  },
  // --- Sonar: Cognitive Complexity & Code Smell Sentinel ---
  // Threshold 15: permissive enough for React hooks/JSX patterns,
  // strict enough to catch God Functions before they propagate.
  {
    plugins: { sonarjs },
    rules: {
      'sonarjs/cognitive-complexity': ['error', 15],
      'sonarjs/no-duplicate-string': ['warn', { threshold: 5 }],
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/no-collapsible-if': 'warn',
      'sonarjs/no-redundant-boolean': 'error',
      'sonarjs/prefer-immediate-return': 'warn',
    },
  },
];
