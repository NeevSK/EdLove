import js from '@eslint/js';
import pluginImport from 'eslint-plugin-import-x';
import onlyWarn from 'eslint-plugin-only-warn';
import eslintPluginOxlint from 'eslint-plugin-oxlint';
import pluginSonarjs from 'eslint-plugin-sonarjs';
import turboPlugin from 'eslint-plugin-turbo';
import tseslint from 'typescript-eslint';
import banUseStore from './rules/ban-use-store.js';

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
      sonarjs: pluginSonarjs,
      polymath: { rules: { 'ban-use-store': banUseStore } },
      'only-warn': onlyWarn,
    },
    rules: {
      'turbo/no-undeclared-env-vars': 'warn',
      'no-unused-vars': 'off',
      'import-x/no-cycle': ['error', { maxDepth: 5 }],
      'sonarjs/cognitive-complexity': ['error', 15],
      'polymath/ban-use-store': 'warn',
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
      '**/.vercel/**',
      '**/.next/**',
      '**/*.config.js',
      '**/*.config.mjs',
      '**/*.config.ts',
      '**/*.config.mts',
      '**/*.config.cts',
      '**/*.native.config.mts',
      '**/.astro/**',
      'docs/**',
      '**/__tests__/**',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.test.js',
      '**/*.test.jsx',
      '**/__mocks__/**',
      '**/test-shims/**',
      'test-shims/**',
    ],
  },
  {
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'lucide-react-native',
              message:
                'Import icons from @repo/ui/icons instead of directly from lucide-react-native. See 2026-07-16-icon-bridge-contract.md.',
            },
            {
              name: 'lucide-react-native/icons',
              message:
                'Import icons from @repo/ui/icons instead of the lucide-react-native/icons barrel.',
            },
            {
              name: 'lucide-react',
              message:
                'Import icons from @repo/ui/icons instead of directly from lucide-react (web). The Metro web shim routes @repo/ui/icons to DOM icons.',
            },
          ],
          patterns: [
            {
              group: ['lucide-react-native/icons/*', 'lucide-react-native/dist/**'],
              message:
                'Only the icon bridge (packages/ui/src/icons.native.ts) may use lucide-react-native subpaths. Import from @repo/ui/icons instead.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/packages/ui/src/icons.native.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },
  ...eslintPluginOxlint.configs['flat/recommended'],
];
