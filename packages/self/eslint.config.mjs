import { config } from '@repo/eslint-config/react-internal';

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...config,
  {
    ignores: [
      'eslint.config.mjs',
      'vitest.config.ts',
      'scripts/**/*',
      // Archived UI kept for reference; not maintained, not linted.
      'src/components/archive/**',
    ],
  },
  {
    // ── Documented lint-debt families (mirror of @repo/ui's block) ──────────
    // Legacy self-package screens predate the shared preset's strictness.
    // Rules stay 'warn' so debt stays visible and countable while the
    // sovereign gate tracks errors only; each family gets a dedicated
    // cleanup task before being re-errored. rules-of-hooks is NOT downgraded:
    // those are real bugs fixed on sight (see VoiceJournaling waveform).
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': 'warn',
      'react-native-a11y/has-valid-accessibility-descriptors': 'warn',
      'react-native-a11y/has-accessibility-hint': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-misused-promises': 'warn',
      '@eslint-react/unsupported-syntax': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      'local/max-use-state': 'warn',
      'sonarjs/cognitive-complexity': 'warn',
      'jsx-a11y/no-autofocus': 'warn',
      // Barrel re-export duplicates; pending the repo-wide barrel rewrite task.
      'import-x/export': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];
