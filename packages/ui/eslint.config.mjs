import path from 'node:path';
import { config } from '@repo/eslint-config/react-internal';

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    // Vitest setup and scripts are tooling outside the typed app project
    // (tsconfig include covers src/**), so typed linting cannot parse them.
    // src/archive/ is unreferenced dead code kept for design reference only.
    ignores: ['vitest-setup.ts', 'vitest-*.ts', 'scripts/**', 'src/archive/**'],
  },
  ...config,
  {
    // eslint-plugin-react-hooks v7's recommended preset enables the full
    // React Compiler linter suite (static-components, immutability, refs,
    // set-state-in-effect, ...). This package predates compiler adoption and
    // is not compiled by React Compiler yet, so these are aspirational
    // diagnostics; they stay visible as warnings until adoption begins.
    rules: {
      'react-hooks/static-components': 'warn',
      'react-hooks/use-memo': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/incompatible-library': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/globals': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/error-boundaries': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/set-state-in-render': 'warn',
      'react-hooks/unsupported-syntax': 'warn',
      'react-hooks/config': 'warn',
      'react-hooks/gating': 'warn',
    },
  },
  {
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '../gluestack-legacy',
              message: "Please use the hardened primitives in '../gluestack' instead.",
            },
            {
              name: '../components-legacy',
              message:
                "Please use the hardened primitives in '../gluestack' or modern components in '../components' instead.",
            },
            {
              name: '@gluestack-ui/themed',
              message:
                "Legacy Gluestack themed components are deprecated. Use '@repo/ui/gluestack' or NativeWind classes.",
            },
          ],
          patterns: [
            {
              group: ['**/gluestack-legacy/**', '**/components-legacy/**'],
              message:
                'Usage of legacy components is restricted. Please migrate to the hardened UI foundation.',
            },
            {
              group: ['@gluestack-ui/*', '!@gluestack-ui/nativewind-utils'],
              message:
                "Direct use of @gluestack-ui/* is restricted. Use the hardened primitives in '@repo/ui/gluestack'.",
            },
          ],
        },
      ],
    },
  },
  {
    settings: {
      'import/resolver': {
        typescript: {
          project: import.meta.dirname,
        },
      },
      'import-x/resolver': {
        typescript: {
          project: import.meta.dirname,
        },
      },
    },
  },
  {
    // The legacy bridge barrels re-export from components-legacy by design;
    // the migration quarantine applies to hardened code, not to the legacy
    // zone itself.
    files: ['src/gluestack-legacy/**', 'src/components-legacy/**'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  {
    // jsx-a11y's keyboard/tabbability heuristics assume real DOM event
    // handlers; react-native-web's <Modal> has neither onClick nor role, and
    // RN-web synthesizes focus behavior internally.
    files: ['src/components/UniversalModal.tsx', 'src/components/UniversalModal.web.tsx'],
    rules: {
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/interactive-supports-focus': 'off',
    },
  },
  {
    // ── Documented lint-debt families ────────────────────────────────────────
    // Downgraded to 'warn' (not off) so the debt stays visible and countable
    // while the sovereign gate tracks errors only. Each family needs its own
    // dedicated cleanup task; do NOT re-error them until the cleanup lands.
    //
    // Burn-down list (counts from the 2026-08-24 audit):
    //  • import-x/export (286) — barrel wildcard collisions across theme,
    //    haptics and primitives re-exports; Metro resolves last-wins but ESM
    //    calls this ambiguous. Fix = rewrite public barrels with explicit
    //    exclusion lists.
    //  • no-restricted-syntax (69) — Date.now()/Math.random() hydration guards
    //    and inline t('key','default') i18n policy violations.
    //  • react-native-a11y/* (57) — missing hints/roles/actions on legacy
    //    interactive components.
    //  • no-floating-promises (20) — fire-and-forget calls in providers/
    //    screens; each site needs explicit await or `void` with reasoning.
    //  • no-require-imports (16) — platform-conditional requires (web DOM
    //    escape idiom); migrate to platform-file splits or dynamic import.
    //  • sonarjs/cognitive-complexity (16) — same rationale as @repo/core.
    //  • static-components/nested-components/IIFE (~18) — React Compiler
    //    readiness debt; components created during render reset state.
    //  • local/max-use-state (9) — components exceeding the useState budget.
    //  • exhaustive-deps (7) — effect dependency gaps across auth/onboarding/
    //    welcome screens; fixing requires behavioral review per site.
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'import-x/export': 'warn',
      'no-restricted-syntax': 'warn',
      'react-native-a11y/has-accessibility-hint': 'warn',
      'react-native-a11y/has-valid-accessibility-actions': 'warn',
      'react-native-a11y/has-valid-accessibility-ignores-invert-colors': 'warn',
      'react-native-a11y/has-valid-accessibility-role': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      'sonarjs/cognitive-complexity': 'warn',
      '@eslint-react/static-components': 'warn',
      '@eslint-react/no-nested-component-definitions': 'warn',
      '@eslint-react/unsupported-syntax': 'warn',
      'local/max-use-state': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];
