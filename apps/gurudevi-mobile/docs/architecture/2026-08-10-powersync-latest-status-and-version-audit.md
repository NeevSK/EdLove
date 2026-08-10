---
title: "PowerSync Latest Status and Version Audit"
status: "active"
created: 2026-08-10
updated: 2026-08-10
author: "Codex"
tags: [powersync, audit, javascript, react-native, expo, dependencies, documentation]
---

# PowerSync Latest Status and Version Audit

## Executive result

PowerSync’s JavaScript SDK v2 is now the current upgrade line, but Gurudevi is still on the v1 JavaScript SDK line. The repository has a meaningful native and web foundation, yet PowerSync is intentionally disabled and the service configuration is not production-complete. The correct next move is a controlled migration and activation program, not an unreviewed dependency bump.

This audit was checked against the repository, the existing PowerSync completeness audit, the PowerSync documentation, and the npm registry on 2026-08-10.

## Version comparison

| Package | Repository declaration | Lockfile resolution | Latest registry version checked | Verdict |
|---|---:|---:|---:|---|
| `@powersync/react-native` | `^1.35.3` | `1.35.3` | `2.0.2` | Major migration required |
| `@powersync/react` | `^1.10.0` | `1.10.0` | `2.0.0` | Major migration required |
| `@powersync/web` | `^1.38.3` | `1.38.3` | `2.1.1` | Major migration required |
| `@powersync/common` | transitive | `1.57.2` | v2 packages require `2.0.0` | Moves transitively with the v2 SDK family |
| `@powersync/op-sqlite` | `^0.9.9` | `0.9.9` | `0.9.16` | Do not bump in isolation; v2 changes the driver arrangement |
| `@op-engineering/op-sqlite` | `^15.2.14` | `15.2.14` | v2 RN peer requires `^17.1.0` | Native compatibility work is required |
| `@powersync/drizzle-driver` | `^0.7.3` | `0.7.3` | `0.8.0` | Upgrade with the SDK migration; v0.8 peers with PowerSync common v2 |
| `drizzle-orm` | `^0.45.2` | `0.45.2` | `0.45.2` stable (`1.0.0-rc.4` release channel) | Stay on 0.x for PowerSync; v1 support is not declared |
| `expo` | `~57.0.11` | `57.0.11` | `57.0.12` | Patch drift only; governed by Expo compatibility |
| `react-native` | `0.86.2` | `0.86.0` in some lock entries | `0.86.2` | Repository declaration is newer than part of the lock graph; verify after any install |

The React Native v2 release removes the old PowerSync Quick SQLite path, changes database construction and connection options, replaces the logger API, removes deprecated hooks, and ships ESM-only packages. The current code uses the old surface in both native and web providers, so a v2 bump without a migration will be build-breaking.

There is a useful Drizzle alignment signal: the current `@powersync/drizzle-driver@0.8.0` package declares `@powersync/common: ^2.0.0`, but its peer range for `drizzle-orm` is still `<1.0.0`. PowerSync JS v2 therefore has an explicit bridge release for the current Drizzle 0.x line; there is no published peer-dependency signal yet that the bridge supports Drizzle ORM v1. The v2 React Native package also requires `@op-engineering/op-sqlite` `^17.1.0`, while this repository currently has `^15.2.14`.

Sources:

- [PowerSync React Native SDK v2 release notes](https://releases.powersync.com/announcements/react-native-client-sdk)
- [PowerSync React Native and Expo SDK reference](https://docs.powersync.com/client-sdks/reference/react-native-and-expo)
- [PowerSync JavaScript Web SDK reference](https://docs.powersync.com/client-sdks/reference/javascript-web)
- [PowerSync feature status](https://docs.powersync.com/resources/feature-status)
- [PowerSync supported platforms](https://docs.powersync.com/resources/supported-platforms)

## Skills and documentation status

### Skill guidance that needs refresh

The local PowerSync skill at `C:\Users\Naween\.codex\skills\powersync-expert\SKILL.md` still presents the v1-era baseline (`@powersync/react-native@1.35.3`, `@powersync/react@1.10.0`, `@powersync/web@1.38.3`, `@powersync/op-sqlite@0.9.9`, and `@powersync/drizzle-driver@0.7.3`). Its architectural principles remain useful, but its package matrix and API examples are no longer the current source of truth.

The skill should be refreshed to include:

- JavaScript SDK v2 constructor, connector, logger, hook, and ESM changes.
- The v2 React Native SQLite arrangement: `@powersync/react-native` plus the direct `@op-engineering/op-sqlite` dependency required for native autolinking, rather than the old `@powersync/op-sqlite` package path.
- Built-in attachment utilities and the deprecation of `@powersync/attachments`.
- Sync Streams as the current recommended and now GA service model.
- A clear distinction between current implementation facts and proposed architecture.

Because that skill lives outside the repository, this document records the required refresh but does not mutate the user’s global Codex skill installation.

### Repository documentation status

| Document | Status | Finding |
|---|---|---|
| `apps/gurudevi-mobile/docs/current_progress/2026-08-11-powersync-completeness-audit.md` | Highest-signal local audit | Correctly reports disabled activation, incomplete web/core convergence, incomplete service configuration, process-local idempotency, and partial domain coverage. |
| `apps/gurudevi-mobile/docs/architecture/2026-06-14-powersync-web-native-boot-boundary.md` | Historical/supporting | Its description of the web provider as a no-op is stale relative to the current `PowerSyncProvider.web.tsx` and `WASQLiteAdapter`. Keep as chronology; do not treat as current implementation truth. |
| `docs/current_progress/2026-06-22-gurudevi-powersync-web-plan.md` | Plan/supporting | The native/OPFS direction remains valid, but API examples and activation assumptions need v2 review. |
| `apps/gurudevi-mobile/docs/architecture/2026-06-13-data-sync-alignment-audit.md` | Active architecture | Still useful for data ownership and dual-lane risks; add v2 API rules before using it as implementation guidance. |
| `apps/gurudevi-mobile/docs/architecture/DATA_HIGHWAYS_AND_SYNC_BOUNDARIES.md` | Active boundary | Still the right product rule: direct API for authoritative workflows, PowerSync for explicitly offline-capable replicated data, and local queues for safe deferred mutations. |

The file name `2026-08-11-powersync-completeness-audit.md` has a date one day ahead of this audit while its frontmatter says 2026-08-10. That naming mismatch should be corrected when the audit is next revised.

## Repository reality

The current implementation contains:

- A native `OPSqliteOpenFactory` adapter with account-scoped database names and SQLCipher key lookup in `packages/core/src/adapters/powersync/opsqlite.adapter.ts`.
- A web `WASQLiteOpenFactory` adapter using `OPFSCoopSyncVFS` and multi-tab flags in `packages/core/src/adapters/powersync/wasqlite.adapter.ts`.
- Native and web provider files that construct a PowerSync database and inject a Drizzle wrapper.
- A Supabase-backed connector that fetches credentials, uploads CRUD batches, applies idempotency keys, retries, and completes the batch only after the server call succeeds.
- A `SecureDrizzleProxy` that checks capability tokens or a permission validator before local writes.
- A Sync Streams file with identity and classroom roster streams.

The completeness audit also confirms the important gaps:

- `isPowerSyncEnabled` defaults to `false`.
- The canonical provider activation path is not yet proven in the root layout.
- `database.web.ts` remains a mock/no-op core fallback even though the app-level web provider now creates a real WASQLite database.
- `powersync/service.yaml` leaves replication and client authentication commented out.
- Server idempotency is process-local and not safe for multi-instance production.
- Only a small portion of the application schema and screen surface is actually offline-capable.
- Account switching and physical-device recovery tests are not complete.

## Decision

1. Keep the current dependency versions until the v2 migration branch has a passing build and test matrix.
2. Do not run `expo install --fix` or `expo install --check`; the repository guardrails explicitly prohibit both.
3. Do not change the sacred React Native, Reanimated, MMKV, Nitro, Skia, or TypeScript pins as part of this work.
4. Treat the existing PowerSync completeness audit as the implementation baseline and this document as the current-version overlay.
5. Use the phased plan in [the implementation roadmap](2026-08-10-powersync-phased-implementation-plan.md) before enabling the feature flag.

## Drizzle v1 decision

Drizzle’s official roadmap and migration guide show an active v1 release stream, with v1 candidates available through the `rc` channel. The stable `latest` tag remains 0.45.2 at this audit point. The PowerSync bridge’s published peer range is the stronger compatibility signal for this repository: keep `drizzle-orm` below 1.0.0 while using `@powersync/drizzle-driver@0.8.x` and PowerSync JS v2.

Do not move this project to `drizzle-orm@rc` or `drizzle-orm@1.x` as part of the PowerSync v2 migration. Wait for a PowerSync driver release whose peer dependencies explicitly include Drizzle v1, then run a separate bridge migration covering `DrizzleAppSchema`, `toCompilableQuery`, relations, SQL compilation, writes, and reactive queries.

Sources:

- [Drizzle v1 roadmap](https://orm.drizzle.team/roadmap)
- [Drizzle v0 → v1 changes](https://orm.drizzle.team/docs/v0-v1-changes)
- [Drizzle v1 upgrade guide](https://orm.drizzle.team/docs/upgrade-v1)
- [PowerSync Drizzle integration](https://docs.powersync.com/client-sdks/orms/js/drizzle)
