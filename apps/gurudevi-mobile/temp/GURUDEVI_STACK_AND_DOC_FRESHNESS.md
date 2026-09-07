# Gurudevi Stack Baseline and Documentation Freshness

## Current stack

| Area | Current evidence |
|---|---|
| Mobile runtime | Expo SDK 57; resolved React Native 0.86.3; resolved/installed React 19.2.3 |
| Language/build | TypeScript 7.0.2, pnpm workspace, Turbo tooling |
| Navigation | Expo Router 57 |
| Architecture | React Native New Architecture; native dependencies managed through Expo/config plugins |
| UI | `@repo/ui`, NativeWind 5 preview, CSS interop, Skia, FlashList |
| Client state | Zustand and TanStack Query |
| Local persistence | MMKV/Nitro and SQLite adapters |
| Offline sync | PowerSync with Drizzle and local mutation queue patterns |
| Backend/domain | `@repo/core`, Supabase, ZenStack, Zod |
| Auth/security | Supabase auth, secure storage, biometric/device-security helpers |
| Observability | Sentry, PostHog, GrowthBook, structured logging |
| Delivery | Doppler, Expo Dev Client, EAS, generated native projects |
| Quality | Oxlint, ESLint, Biome, TypeScript, Vitest, Playwright, custom audit scripts |

## Freshness assessment

The generated dependency catalog is dated 2026-09-04. The generated stack-map
overview is dated 2026-08-31, while package and mobile configuration changes
continued through 2026-09-05 and the latest commits are dated 2026-09-06.

The dependency declarations are also internally split:

- Root `package.json` declares React `19.2.8` and React Native `~0.86.3`.
- `apps/gurudevi-mobile/package.json` declares React `19.2.3` and React Native
  `0.86.2`.
- `pnpm-lock.yaml` resolves React `19.2.3` and React Native `0.86.3`.
- Installed package metadata resolves React `19.2.3` and React Native `0.86.3`.

This is a confirmed stack-integrity discrepancy, not a memory issue. It should
be tracked separately from the audit findings because it can affect reproducible
builds, type-checking, and runtime conclusions.

Therefore:

- Package manifests and the lockfile are the authoritative dependency evidence.
- The dependency catalog is a useful near-current summary, but needs a fresh
  generation check.
- The stack-map overview is stale until `stack-map:bootstrap`/`stack-map` is
  run and the generated diff is reviewed.
- No dependency or stack changes are being made as part of this audit pass.

## Guardrails carried into the audit

- Do not run `expo install --fix` or `expo install --check`.
- Do not run `expo prebuild --clean` without explicit approval.
- Do not edit generated `android/` or `ios/` files directly.
- Treat sacred native versions and existing Expo exclusions as intentional.
- Preserve unrelated dirty-worktree changes.
