import { config } from '@repo/eslint-config/react-internal';

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...config,
  {
    // ── Documented lint-debt families (mirror of @repo/ui's block) ──────────
    // The shared react-internal preset is aspirational for this package's
    // legacy screens. Rules stay 'warn' so debt stays visible and countable
    // while the sovereign gate tracks errors only; each family gets a
    // dedicated cleanup task before being re-errored.
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': 'warn',
      'react-native-a11y/has-valid-accessibility-descriptors': 'warn',
      'react-native-a11y/has-accessibility-hint': 'warn',
      'react-native-a11y/has-valid-accessibility-ignores-invert-colors': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-misused-promises': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      '@eslint-react/static-components': 'warn',
      '@eslint-react/no-nested-component-definitions': 'warn',
      '@eslint-react/unsupported-syntax': 'warn',
      'local/max-use-state': 'warn',
      'sonarjs/cognitive-complexity': 'warn',
      'jsx-a11y/no-autofocus': 'warn',
      'jsx-a11y/label-has-associated-control': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/use-memo': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/incompatible-library': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/globals': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/error-boundaries': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/set-state-in-render': 'warn',
      'react-hooks/unsupported-syntax': 'warn',
      'react-hooks/config': 'warn',
      'react-hooks/gating': 'warn',
      // Platform-shim d.ts re-declares the gesture-handler module surface;
      // its duplicate export declarations are intentional.
      'import-x/export': 'warn',
    },
  },
];
