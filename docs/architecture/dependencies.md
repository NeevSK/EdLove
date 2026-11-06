---
title: "Dependencies"
status: "active"
created: 2026-11-06
updated: 2026-11-06
author: "Naveen"
scribe: "Claude"
tags: [architecture, dependencies, upgrades, babel, esm, vitest, reference]
---

# Dependencies

The one place to read before updating anything. It says where versions live, what is held
back and why, and when to re-check. It holds no version table on purpose, because copies of
versions in docs are what went stale last time.

## Where versions live

| Question | Source |
| --- | --- |
| What does a package declare? | Its `package.json` |
| What is forced across the workspace? | `overrides` in `pnpm-workspace.yaml` |
| Which versions move together? | [`scripts/lib/dependency-cohorts.mjs`](../../scripts/lib/dependency-cohorts.mjs), read by the harmonizer, drift gate and radar |
| What is actually installed? | `pnpm-lock.yaml` |
| Rules, tiers and native integrity | [`AGENTS.md`](../../AGENTS.md) section 2 |

Never write a version number into a doc or a skill. Point here instead.

## How to update

1. Run `pnpm outdated -r --format json` to list what's behind.
2. Change `package.json`, the matching `overrides` entry and the cohort file together.
3. Run `pnpm install --no-frozen-lockfile`, then `pnpm dedupe`.
4. Run `pnpm run deps:check` and fix what it reports. `harmonize --write` moves manifests to the
   cohort values, so a stale cohort downgrades real packages.
5. Check nothing moved backwards. `pnpm outdated` follows the `latest` tag, so it will suggest
   going down from a prerelease we chose on purpose (this happened to Hono).
6. Typecheck and test the API, web and mobile, then run the Android Metro bundle.

**`deps:upgrade` only scans.** Despite its name, `smart-upgrade-deps.mjs` runs a `taze` scan and
`syncpack fix`. It doesn't apply upgrades.

A 24-hour release-age guard (`minimumReleaseAge`) blocks brand-new versions. Owner-approved
exceptions sit at the top of `minimumReleaseAgeExclude`, with a comment. Remove those once the
packages have matured.

## Held back, and why

| Package | Held at | Why | Re-check when |
| --- | --- | --- | --- |
| `@op-engineering/op-sqlite`, `@journeyapps/wa-sqlite`, `@powersync/*`, `expo-sqlite` | Current | Owner decision. These move together with the sync work | Sync connector is rebuilt |
| `supabase` CLI | 2.x | Owner decision. 3.0 is a new major | Deliberate CLI migration |
| `@babel/*` | 7.x | See [Babel 8](#babel-8) | Metro depends on `@babel/core ^8` |
| `@react-native-async-storage/async-storage` | 2.2.0 | Expo SDK 58 expects exactly this. 3.x renames APIs and needs a device test because it holds auth data | Expo SDK moves, or a planned migration |
| `@sentry/browser` | 10.x | `@sentry/react-native` is built on the 10 line; v11 would put two Sentry cores in one tree | `@sentry/react-native` moves to 11 |
| `react-native-web` | 0.21 | Latest, and pulled in by Expo. Brings `inline-style-prefixer`, which looks old but is its latest (last published 2024) | RN Web is retired |
| TypeScript 6 alias | `overrides` | ESLint and ZenStack tooling need the TS 6 API. Everything else is on 7 | Those tools support 7 |

Duplicates that remain come from tools, not the app: `eas-cli` brings older `@expo/*` packages,
`vercel` brings its own `esbuild`, `rolldown` and `@types/node`, and `@rozenite/ui` brings older
`lucide-react` and `tailwindcss`.

## Babel 8

**Not possible yet. Checked 2026-11-06, against upstream as well as releases.**

Babel 7 plugins peer on `@babel/core ^7` and Babel 8 plugins on `^8`, so the two can't share a
transform, and an override would break the build. These all still need Babel 7, on their `main`
branches and newest builds as well as their published versions:

| Package | Depends on |
| --- | --- |
| `metro`, `metro-transform-worker` | `@babel/core ^7.25.2` and `@babel/traverse ^7` |
| `@react-native/babel-preset` | `@babel/core ^7.25.2` |
| `babel-preset-expo` | `@babel/core ^7.26.0` |
| `react-native-worklets` | `@babel/traverse ^7.27.1` |
| `react-native-css-interop` | `@babel/traverse ^7.23.0` |

Going ESM doesn't change this. The blocker is those packages' dependencies, not our module type.
To re-check, run this, then look at the same field on Metro's `main`:

```bash
npm view metro dependencies --json
```

The direct `@babel/traverse` in `apps/gurudevi-mobile` and `packages/ui` stays until Worklets
resolves it itself. Its plugin requires it from the consumer, which pnpm's strict layout blocks.

## ESM

Every package under `packages/` and the web and API apps are `"type": "module"` (G4 Metro bundle
verified on 2026-11-06). What stays CommonJS, and why:

- `apps/gurudevi-mobile`, until Expo's handling of an `.mjs` Metro config and Babel config is
  verified. The Worklets Babel plugin is a CommonJS bundle.
- Tool config that only supports CommonJS, named `.cjs` so it stays explicit.

## Tests

- **Vitest is the only test runner.** Jest was removed on 2026-11-06. No script or workflow ran
  it. Its three test files moved to Vitest.
- `vitest.config.mts` in the mobile app runs most tests, with hand-written native mocks.
- `*.rn.test.tsx` files run through `vitest.native.config.mts`, on `vitest-native`. The two there
  fail today: `vi.mock` doesn't reach modules loaded with `require()` under the native engine.
  No script ran them under Jest either.
- `*.native.test.tsx` is an older naming convention that runs under jsdom in the main config. The
  name is misleading; don't assume those files use a native engine.

## Traps already hit

- **Lucide renamed icons.** `*-alert` became `*-exclamation-point` in per-icon paths, while the
  barrel kept the old names as aliases. Mobile imports per-icon paths, so these break at bundle
  time. Run `scripts/check-icons.mjs` after a Lucide upgrade.
- **`pnpm outdated` follows `latest`.** See Hono above.
- **Old store folders.** `node_modules/.pnpm` keeps folders from earlier installs that the
  lockfile no longer lists. They look like ghost versions. The lockfile is the truth.
- **pnpm 12's lockfile has two YAML documents.** Tools that read it must use the second.
- **`allowBuilds` also lists package names.** A scripted edit of `pnpm-workspace.yaml` can hit
  the wrong block.
