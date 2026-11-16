import { config } from '@repo/eslint-config/base';

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: [
      'babel.config.cjs',
      'eslint.config.mjs',
      'jest.config.cjs',
      'vitest.config.ts',
      'scratch/**',
      'dist/**',
      // Retired pre-v1 API files, excluded from tsconfig.json, so typed lint can't parse them.
      // Leaves with the rest of the retired API in Gate 1 (docs/architecture/road-to-v1.md).
      'src/api/*.ts',
      '!src/api/planBridge.orpc.contract.ts',
      'src/api/orchestration/**',
      'src/api/runtimes/**',
      'src/api/hooks/**',
    ],
  },
  ...config,
  {
    // `@cedar-policy/cedar-wasm/web` resolves at runtime through the package's
    // exports map but is invisible to the import resolver; TypeScript handles
    // it via @ts-expect-error at the dynamic-import site.
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'import-x/no-unresolved': ['error', { ignore: ['@cedar-policy/cedar-wasm'] }],
    },
  },
  {
    // Cognitive-complexity debt in core domain logic (18 functions, worst =
    // errorNormalizer.ts:10 at 53 vs 15 allowed). Tracked as warnings until a
    // dedicated burn-down lands; see AGENTS.md Quality Regulation follow-ups.
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'sonarjs/cognitive-complexity': 'warn',
    },
  },
];
