import { config as reactInternalConfig } from '@repo/eslint-config/react-internal';
import expoConfig from 'eslint-config-expo/flat.js';
import globals from 'globals';

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...reactInternalConfig,
  ...expoConfig.map((cfg) => {
    if (cfg.plugins) {
      delete cfg.plugins['@typescript-eslint'];
      delete cfg.plugins['react'];
    }
    if (cfg.rules) {
      for (const rule of Object.keys(cfg.rules)) {
        if (rule.startsWith('react/') || rule.startsWith('react-hooks/')) {
          delete cfg.rules[rule];
        }
      }
    }
    return cfg;
  }),
  {
    ignores: [
      '*.config.js',
      '.expo/**',
      'android/**',
      'assets/**',
      'dist/**',
      'node_modules/**',
      'web-build/**',
      'coverage/**',
      'public/sw.js',
    ],
  },
  {
    languageOptions: {
      globals: {
        ...globals.reactNative,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
];
