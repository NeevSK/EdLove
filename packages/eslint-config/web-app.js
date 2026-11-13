import eslintReact from '@eslint-react/eslint-plugin';
import { globalIgnores } from 'eslint/config';
import pluginJsxA11y from 'eslint-plugin-jsx-a11y';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import { config as baseConfig } from './base.js';
import maxUseStateRule from './rules/max-use-state.js';

/**
 * The ESLint configuration for the Gurudevi web app (Vite + React).
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const webAppConfig = [
  ...baseConfig,
  pluginJsxA11y.flatConfigs.recommended,
  globalIgnores(['dist-*/**', 'spa/generated/**']),
  eslintReact.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.serviceworker,
      },
    },
  },
  {
    plugins: {
      'react-hooks': pluginReactHooks,
      local: {
        rules: {
          'max-use-state': maxUseStateRule,
        },
      },
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'local/max-use-state': ['error', { max: 3 }],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-restricted-syntax': [
        'error',
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
];
