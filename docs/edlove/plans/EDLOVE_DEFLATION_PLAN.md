# EdLove Deflation Plan
*Repo: NeevSK/EdLove · Author: Grok Bot for Naveen · 2026-10-15 · Status: proposed*

> **Poetry in names, truth in behavior.** Nothing here is a default, and every name has to earn its meaning.

---

## 0. Principles

1. **Brevity.** Every file, script and package has to justify why it exists. Most of the time, deleting it is the better choice.
2. **Clarity.** Each concern gets one canonical path: one data layer, one API client, one linter strategy, one cycle checker, one agent-config root.
3. **Levity.** Keep the poetic names. Each one gets a one-line plain-English glossary entry and behavior that matches its promise.
4. **Truth gates.** CI fails when reality drifts from claims: typecheck, cycles, the `any` ratchet, and no demo code in prod bundles.
5. **Ratchet, don't rewrite.** Metrics only move one way. No big-bang refactors.
6. **Local stays easy.** Localhost dev and local report tooling keep working. Generated output goes to a gitignored folder instead of being deleted.

### Audit baseline (HEAD, 2026-10-15)
| Fact | Value |
|---|---|
| Real source (ts/tsx, excl. tests/generated/mocks) | 313,242 LOC / 2,336 files |
| Tests | 37,563 LOC |
| Markdown | 301,235 LOC / 1,795 files (143,029 in `apps/gurudevi-mobile` alone) |
| Agent config (`.agents` `.claude` `.codex` + `.cursorrules` + `.github/copilot-instructions.md` 9,217) | ~44,600 LOC |
| Committed reports (`reports/`, `report/`) | 52,018 LOC |
| Root scripts | 117 |
| `any` in src | 1,836 |
| Mock/demo identifiers in non-test src | 81 |
| Data/transport layers | supabase-js (32 files), PowerSync (9), drizzle (≥4), ZenStack/kysely/pg (11), oRPC (82), Hono RPC (26), Effect (20) |

*Corrections from the re-check:* `apps/sanctuary-api/src/ai/utils/crypto.ts` already throws when `BYOK_ENCRYPTION_SECRET` is missing, and no `*.keystore` is tracked at HEAD anymore. Both items move to Phase 0 as checks that need verifying, not fixes. `packages/core/src` has **0** `@repo/ui` imports, while `packages/ui/src` has **92** files importing `@repo/core`. If a core↔ui cycle exists, it comes from manifests or tsconfig paths. Confirm it with depcruise (WS-3).

---

## 1. Phased roadmap

| Phase | When | Theme | Exit criteria |
|---|---|---|---|
| **0: Safety** | This week | Secrets, fail-fast config, CI truth | Gemini key revoked and confirmed dead. `BYOK_ENCRYPTION_SECRET` fail-fast covered by a test. No keystore in history signs release builds. gitleaks is green on a full-history scan. |
| **1: Clear the floor** | Weeks 1–2 | Clutter, `.reports/`, toolchain pins, scripts diet | `reports/`, `report/`, `temp/`, `scratch/`, `old_docs/` are gone from git and generated locally into `.reports/`. Root scripts ≤ 25. `pnpm install` + `turbo typecheck` run on Linux/macOS/Windows with the pinned Node/pnpm. |
| **2: Green gate** | Weeks 2–4 | Typecheck and CI as gate, `any` ratchet, one linter strategy | `quality-gate.yml` is required on `main`: typecheck 0 errors, lint, depcruise cycles 0, the ratchet doesn't increase. |
| **3: True Sovereign** | Weeks 3–6 | SovereignClient v2 (oRPC, typed, HTTPS, offline), Hono RPC client retired | No `createSovereignClient(): any`. All client calls go through `@repo/sovereign-client`. Contract coverage ≥ 95 %. |
| **4: One river** | Weeks 5–10 | Data-layer consolidation | Client side runs on PowerSync + oRPC only. drizzle and ZenStack removed from client packages. ADR-002 accepted. |
| **5: Split the trunk** | Weeks 8–14 | `core` split, huge files, stubs, demo gating | `@repo/core` is ≤ 5k LOC, or deleted and replaced by a facade. No source file over 800 LOC. Demo code is absent from prod bundles. |
| **6: Make names true** | Continuous, closes week 14 | Glossary, docs consolidation | `GLOSSARY.md` covers 100 % of the poetic identifiers in a lint list. One `ARCHITECTURE.md` + ADRs. Markdown ≤ 60k LOC. |

---

## 2. Workstreams

Each workstream lists why, paths, steps, done-when, risk and effort (S ≤ 1 day, M ≤ 1 week, L > 1 week).

### WS-0 Security (Phase 0)
**Why:** the repo is public, so its history is permanent.
**Paths:** history of `apps/teacher-platform/lib/aiService.ts` (commit `b56f62a`), `apps/sanctuary-api/src/ai/utils/crypto.ts`, `config/doppler-secrets.json`, `apps/gurudevi-mobile/android/`, `.gitleaks.toml`.
**Steps:**
1. Revoke the Gemini key in Google AI Studio / Cloud Console. Confirm a call with it returns 401/403. Don't rewrite history, because revoking the key is enough.
2. Add `crypto.test.ts`, which asserts that a missing or short (`<32 bytes`) `BYOK_ENCRYPTION_SECRET` throws at **boot** in `entry-node.ts`, not on first encrypt.
3. Add a boot-time `assertEnv()` in `apps/sanctuary-api/src/load-env.ts` for all required secrets in staging/prod. In dev it warns instead.
4. Keystore check: run `git log --all --diff-filter=A --name-only | rg -i keystore`. If a debug keystore ever shipped, confirm the release signing config uses the EAS/Play keystore only. Add the gitleaks rule `*.keystore|*.jks`.
5. Add a scheduled full-history gitleaks run to `security-gitleaks.yml`.
**Done when:** steps 1–5 are merged, and the key is dead.
**Risk:** low. **Effort:** S.

### WS-1 Clutter → local-only generated output (Phase 1)
**Why:** 52k LOC of timestamped reports are committed. Naveen's audit scripts still have to work locally.
**Paths:** `reports/`, `report/jscpd-report.json`, `apps/gurudevi-mobile/temp/`, `packages/core/scratch/`, `packages/ui/src/archive/`, `docs/old_docs/`, `docs/current_progress/old_docs/`, `apps/gurudevi-mobile/docs/old_docs/` (44 files), `scripts/run-and-report.mjs`, `scripts/sovereign-audit.mjs`, `scripts/toggle-reports.mjs`.
**Steps:**
1. Add one env-overridable output root: `EDLOVE_REPORTS_DIR ?? <repo>/.reports`. Update `run-and-report.mjs`, `sovereign-audit.mjs`, and every `--log "reports/…"` in `package.json` to write `.reports/<tool>/<timestamp>.{json,md,txt}` and keep a `latest` copy.
2. Add `.gitignore` entries:
   ```
   .reports/
   reports/
   report/
   **/temp/
   **/scratch/
   *.log
   coverage/
   .turbo/
   ```
3. Run `git rm -r --cached reports report apps/gurudevi-mobile/temp packages/core/scratch`. Move any still-useful reports into a dated ADR or `docs/history/` (summarized in under 50 lines each), then delete the rest.
4. Delete `old_docs/` and `archive/`. Git history keeps them.
5. CI uploads `.reports/` as a workflow artifact, so nothing gets lost.
**Done when:** `git ls-files | rg '(^|/)(reports?|temp|scratch|old_docs|archive)/'` is empty, and `pnpm audit:cycles` still writes `.reports/cycles/latest.txt` locally.
**Risk:** low. **Effort:** S.

### WS-2 Toolchain and scripts diet (Phases 1–2)
**Why:** 117 scripts, 3 linters, 2 cycle checkers and 2 unused-code tools, plus PowerShell scripts that don't run off Windows. The box couldn't even install, because Node 22.23.2 / pnpm 12.4.2 are pinned and corepack isn't wired up.
**Paths:** `package.json`, `mise.toml`, `.nvmrc`, `.npmrc`, `.pnpmrc`, `biome.json`, `eslint.config.js`, `.oxlintrc.json`, `.dependency-cruiser.cjs`, `scripts/refactor/sovereign-cycle-checker.mjs`, `knip.json`, `.fallowrc.json`, `.driftignore*`, `doctor.config.json`, `runbyte.json`, `dagger.ts`, `scripts/*.ps1`, `scripts/sync-wsl.mjs`, `scripts/workspace-sync.mjs`.
**Linter strategy (ADR-007):**
- **Biome** formats and lints everything.
- **ESLint** stays only for rules Biome lacks (react-hooks, expo, boundary rules), with a ≤ 15-rule allowlist.
- **Remove oxlint.**
**One cycle checker:** dependency-cruiser. Delete `sovereign-cycle-checker.mjs`, or keep the name as a 10-line wrapper that calls depcruise ("sovereign" means *we own our graph*, so the glossary entry says that).
**One unused-code tool:** knip. Drop depcruise's `no-orphans` duplication. Delete the fallow, drift, doctor and runbyte configs unless an ADR justifies them.
**Pins:**
- `package.json` gets `"engines": {"node": ">=22.12 <23"}` and `"packageManager": "pnpm@<exact>"`.
- `.nvmrc` and `mise.toml` must match it. CI checks this with `scripts/check-toolchain.mjs`.
- Document `corepack enable` in the README.
- Keep `pnpm@12` only if it's GA and CI uses it. Otherwise pin the latest stable 10.x (ADR-008).
**Scripts:** target about 20 at the root.

| Group | Scripts |
|---|---|
| Develop | `dev`, `dev:mobile`, `dev:api`, `dev:web` |
| Build and test | `build`, `test`, `test:e2e` |
| Quality | `typecheck`, `lint`, `format`, `check` (= typecheck+lint+cycles+unused+ratchet), `cycles`, `unused`, `ratchet` |
| Security | `audit:secrets`, `audit:security` |
| Data and i18n | `db:migrate`, `db:types`, `i18n:check` |
| Mobile | `android`, `ios` |

Everything else moves into package-level scripts or `scripts/README.md` as `node scripts/x.mjs`.
**Cross-platform:** port every `.ps1` to `.mjs`, use `cross-env`, never `powershell -ExecutionPolicy`, and move WSL sync to `tooling/local/` (not in CI). `run-and-report.mjs` wrapping stays opt-in through `EDLOVE_REPORT=1` instead of wrapping every script.
**Done when:** a clean Linux/macOS/Windows clone runs `corepack enable && pnpm i && pnpm check` with no edits, and there are ≤ 25 root scripts.
**Risk:** medium, because changing lint rules makes diffs noisy. Land the formatter change in one commit and add it to `.git-blame-ignore-revs`. **Effort:** M.

### WS-3 Typecheck and CI as gate (Phase 2)
**Why:** right now nothing proves the 313k LOC compiles together.
**Paths:** `turbo.json`, `tsconfig.json`, `packages/typescript-config/`, `.github/workflows/quality-gate.yml`, `pr-guard.yml`.
**Steps:**
1. Run `pnpm turbo run typecheck --continue` and save the error count to `.reports/typecheck/baseline.json`.
2. Fix errors per package, leaves first (`types-shim` → `schema` → `people` → … → apps).
3. Add `.dependency-cruiser.cjs` rules:
   - `no-circular`
   - `packages/** ↛ apps/**`
   - `apps/X ↛ apps/Y`
   - `@repo/ui ↛ data adapters`
   - deep-import ban (`@repo/*/src/**`)
4. In `quality-gate.yml`, make `typecheck`, `lint`, `cycles`, `test`, `ratchet` and `bundle-guard` (WS-10) required checks on `main`. Branch protection is on.
5. Remove core↔ui manifest/tsconfig edges found by `depcruise --output-type err`.
**Done when:** `main` is green with typecheck at 0 errors and 0 cycles, and every PR is gated.
**Risk:** medium, the error count is unknown. **Effort:** M–L.

### WS-4 SovereignClient v2 (Phase 3)
**Why:** today `packages/core/src/api/base.ts` silently falls back to `'http://localhost:3000'`, and `createSovereignClient = (url): any` ("Cast to any to bypass complex nested generic resolution"). It runs two transports (Hono RPC in 26 files, oRPC in 82) addressed by a string-rewrite of `/api`. *Sovereign* has to mean **the client owns its trust boundary**: typed, encrypted, authenticated, resilient, observable.
**Decision (ADR-003):** **oRPC contracts are the single source of truth.** `packages/core/src/api/*.orpc.contract.ts` already exist (about 25), so make them complete and retire the Hono RPC client and the `*.contract.ts` duplicates (e.g. `admin.contract.ts` vs `admin.orpc.contract.ts`). Track coverage through the existing `contractCoverage.ts`.
**New package:** `packages/sovereign-client`. It depends on `@repo/contracts` (WS-6) only.

#### Env resolution table
| Env (resolved from) | Allowed origins | Missing URL | Scheme rule | Pinning | Retry |
|---|---|---|---|---|---|
| **dev**: `__DEV__` true (Expo) or `NODE_ENV=development` | `http://localhost`, `127.0.0.1`, `10.0.2.2` (Android emulator), RFC1918 LAN `10.*` `172.16–31.*` `192.168.*`, `*.local`; also any https | Falls back to `http://localhost:3000` (web/iOS sim) or `http://10.0.2.2:3000` (Android emulator), with a **one-time console warning** | http allowed only for the hosts listed | off | on, short |
| **test**: `NODE_ENV=test` | injected `fetch` / msw, any origin | **throws** (tests must be explicit) | any | off | off (deterministic) |
| **staging**: `EDLOVE_ENV=staging` | https only | **throws at boot** | `http:` → throw `InsecureOriginError` | optional (on for mobile release builds) | on |
| **prod**: `EDLOVE_ENV=production` or `NODE_ENV=production` without dev | https only; host in an allowlist (`SOVEREIGN_API_HOSTS`) | **throws at boot** | `http:` → throw; non-allowlisted host → throw | on for mobile, pins + backup pin | on |

URL source order: `EXPO_PUBLIC_SOVEREIGN_API_URL` → `NEXT_PUBLIC_SOVEREIGN_API_URL` → `SOVEREIGN_API_URL`, then the dev fallback only. The env comes from `EDLOVE_ENV` first and then `__DEV__`/`NODE_ENV`, so a prod build can never resolve to dev by accident: CI asserts `EDLOVE_ENV` is set for EAS/Vercel builds.

#### Interface sketch
```ts
// packages/sovereign-client/src/types.ts
import type { ContractRouterClient } from '@orpc/contract';
import type { appContract } from '@repo/contracts';

export type SovereignEnv = 'development' | 'test' | 'staging' | 'production';

export interface SovereignConfig {
  env: SovereignEnv;                  // from resolveSovereignEnv()
  baseUrl: URL;                       // from resolveSovereignUrl(env); validated
  allowedHosts?: readonly string[];   // prod allowlist
  auth: TokenProvider;
  timeoutMs?: number;                 // default 15_000
  retry?: RetryPolicy;
  offline?: OfflineHandoff;           // PowerSync bridge; mutations only
  pinning?: PinningConfig;            // mobile only, staging/prod
  tracer?: SovereignTracer;
  fetch?: typeof fetch;               // injectable (tests, native pinning fetch)
}

export interface TokenProvider {
  getAccessToken(): Promise<string | null>;
  refresh(): Promise<string | null>;  // called once on 401, then fail
}

export interface RetryPolicy {
  attempts: number;                   // default 3 (dev 1, test 0)
  baseDelayMs: number;                // 250, exponential + full jitter
  maxDelayMs: number;                 // 8_000
  retryOn: (e: SovereignError) => boolean; // network, 408, 425, 429, 5xx; never 4xx otherwise
  // Mutations retry ONLY when they carry an idempotency key.
}

export interface PinningConfig {
  hosts: Record<string, readonly [primarySha256: string, backupSha256: string]>;
  failMode: 'closed';                 // never silently unpin
}

export interface OfflineHandoff {
  isOnline(): boolean;
  /** Enqueue into the PowerSync CRUD queue keyed by the mutation-registry key. */
  enqueue<K extends MutationKey>(m: QueuedMutation<K>): Promise<void>;
}

export interface QueuedMutation<K extends MutationKey> {
  key: K;                             // e.g. 'createPost' — from core/lib/sync/registry.ts
  input: MutationInput<K>;            // typed from the contract, no `any`
  idempotencyKey: IdempotencyKey;     // branded UUIDv7
  enqueuedAt: number;
}

export type IdempotencyKey = string & { readonly __brand: 'IdempotencyKey' };

export interface SovereignTracer {
  start(op: string, attrs: Record<string, string | number>): { traceparent: string; end(err?: unknown): void };
}

export type SovereignError =
  | { kind: 'config'; code: 'MISSING_URL' | 'INSECURE_ORIGIN' | 'HOST_NOT_ALLOWED' }
  | { kind: 'network'; cause: unknown }
  | { kind: 'timeout'; afterMs: number }
  | { kind: 'http'; status: number; body: unknown; requestId?: string }
  | { kind: 'pinning'; host: string }
  | { kind: 'queued'; idempotencyKey: IdempotencyKey }; // handed to PowerSync

export type SovereignClient = ContractRouterClient<typeof appContract>; // fully typed, zero `any`

export declare function resolveSovereignEnv(): SovereignEnv;
export declare function resolveSovereignUrl(env: SovereignEnv): URL;   // implements the table above
export declare function createSovereignClient(cfg: SovereignConfig): SovereignClient;
```
**Behavior (one link chain, in order):**
1. `trace`: sets the `traceparent` header and `x-request-id`.
2. `auth`: adds `Authorization: Bearer`, does a single refresh on 401, then fails.
3. `idempotency`: every mutation procedure (marked `meta({ mutation: true })` in the contract) gets `Idempotency-Key` from the caller or a fresh UUIDv7. The server already reads it (`packages/core/src/lib/idempotency.ts`). `core/lib/sync/registry.ts` `requireIdempotencyKey` uses the **same branded type**.
4. `timeout`: `AbortSignal.timeout`.
5. `retry`: exponential backoff with full jitter, mutations only with a key.
6. `offline`: when offline, or after retries are exhausted on a network error, a mutation goes to `offline.enqueue()` into the PowerSync upload queue and resolves `{kind:'queued'}`. Queries are never queued.
7. `pinning`: native fetch via `react-native-ssl-public-key-pinning` (Expo config plugin), in staging/prod mobile only.

**Steps:**
1. Create `@repo/contracts`, which moves all `*.orpc.contract.ts` and zod schemas out of `core/src/api`.
2. Build `@repo/sovereign-client` with the chain above and unit tests for each row of the env table.
3. Run a codemod replacing `createSovereignClient(SOVEREIGN_API_URL)` and Hono `hc` uses (26 files).
4. Delete `AppType = unknown`, the `SOVEREIGN_ORPC_URL` string-rewrite, `clientRuntime.ts`'s Hono path, `resonantProxy.ts`/`temporalProxy.ts` if they're just fetch wrappers (otherwise fold them into links), and the duplicate `*.contract.ts`.
5. Server side: `apps/sanctuary-api` mounts only the oRPC router and keeps Hono as the HTTP host (fine).
**Done when:**
- `rg "createSovereignClient.*any|AppType = unknown|localhost:3000" packages apps` returns only dev-fallback code in `resolveSovereignUrl`.
- The contract coverage report is ≥ 95 %.
- Env-table tests pass.
**Risk:** medium–high, since the client surface is broad. Ship behind an adapter so both clients coexist for one release. **Effort:** L.

### WS-5 Data-layer consolidation: "One river" (Phase 4)
**Why:** clients reach data six ways (supabase-js direct, PowerSync, drizzle, ZenStack/kysely/pg, oRPC, Hono). Every feature can pick a different path, so bugs and RLS assumptions diverge.
**Canonical path (ADR-002):**
- **Reads:** PowerSync local SQLite (offline-first is core to the product: schools with poor connectivity), with sync rules in `powersync/sync-config.yaml`.
- **Writes:** SovereignClient (oRPC) → `sanctuary-api` → Postgres. PowerSync's upload queue calls the same oRPC mutations with idempotency keys.
- **Auth/storage/realtime:** supabase-js is allowed **only** inside `packages/data/adapters/supabase` (auth session, storage uploads, realtime presence).
- **Server DB access:** one query layer inside `sanctuary-api` only, which is **Kysely** (typed, close to SQL, already present via ZenStack). ZenStack goes away unless ADR-002 shows its access-policy engine is required. If it is, keep ZenStack server-only and drop raw Kysely. Pick one.
- **drizzle:** removed (`core/src/store/useCedarDecisionStore.ts`, `self/src/api/wellbeingRepository.ts`, `core/src/adapters/supabase/supabaseEntitlement.adapter.ts`, `core/src/adapters/powersync/forms.adapter.ts`). On the client, use PowerSync's typed query API (Kysely-flavored `@powersync/kysely-driver` keeps one query dialect across client and server).
- **State:** TanStack Query for server state and zustand for UI-only state. A zustand store must not cache server data.
- **Effect:** limited to `sanctuary-api` orchestration, or removed (ADR-005). It doesn't go in shared client packages.

**Migration order (lowest risk first):**
1. Inventory: tag each of the 32 supabase-js files as auth, storage, realtime or **data**, and record the list in the ADR.
2. Freeze: add a depcruise rule saying no new imports of `drizzle-orm`, `@zenstackhq/*` or `@supabase/supabase-js` outside the allowlisted adapters.
3. Move the 4 drizzle files to the PowerSync/Kysely driver.
4. Move the supabase-js **data** calls → oRPC procedures (writes) or PowerSync (reads), one domain at a time: `self` → `library` → `community` → `classroom` → `admin`.
5. Move `packages/database` (ZenStack client) into `apps/sanctuary-api/src/db/`, then delete the package.
6. Run RLS and authorization parity tests (`apps/sanctuary-api/src/authorization/`) for every moved procedure.

**Delete:** `packages/database/`, `packages/core/src/adapters/zenstack/`, drizzle deps, direct `supabase.from(` calls outside adapters.
**Done when:** `rg "supabase\.from\(" packages apps` is 0 outside `packages/data/adapters/supabase` and the server, drizzle and ZenStack are absent from client lockfile deps, and offline write → reconnect → server ack is e2e tested.
**Risk:** high, because it touches data integrity. Go domain by domain behind a feature flag (`core/src/adapters/feature-rollout`). **Effort:** L.

### WS-6 Split the `core` trunk and break core↔ui (Phase 5)
**Why:** `@repo/core` is 67.9k LOC holding api, adapters, effect, efficiency, offline, store, native, routing, monitoring, testing and more. Twenty-two packages depend on it, so every change goes everywhere.

**Target package map:**
| Package | Takes from `core/src/` | May import |
|---|---|---|
| `@repo/contracts` | `api/*.orpc.contract.ts`, `*.schema.json`, `*.generated*.ts` | zod only |
| `@repo/sovereign-client` | `api/client*.ts`, `orpcClient.ts`, `interceptor.ts` | contracts |
| `@repo/data` | `adapters/{powersync,supabase,storage,memory,realtime}`, `offline/`, `lib/sync/`, `store/` (server-state parts) | contracts, sovereign-client |
| `@repo/platform` | `native/`, `platform/`, `adapters/{web,native}`, `WebCryptoAdapter`, `deviceTrust*` | — |
| `@repo/auth` | `accounts/`, `webAuth*.ts`, `lib/{authStorage,accountPin,permissions,authorization}.ts`, `adapters/cedar` | contracts, data, platform |
| `@repo/observability` | `monitoring/`, `lib/monitoring`, telemetry | — |
| `@repo/domain-kit` | `logic/` (pure domain functions, `useDomainFeature`), `lib/{grading,gradePublication,idempotency,errors}.ts` | contracts |
| `@repo/i18n` | locale loading (today the core tests reach into `apps/gurudevi-mobile/src/i18n`) | — |
| `@repo/test-kit` | `testing/`, `test-shims/`, `api/demo*.ts`, `api/mockData.ts`, memory adapters (dev only, WS-10) | any |
| `@repo/ui` | primitives, theme, components. **No data and no auth.** | platform, i18n |
| Feature packages (`classroom`, `library`, `self`, `community`, `admin`, `profile`) | unchanged | all of the above except test-kit |

**Layer rule (depcruise):** `contracts → sovereign-client → data/auth → domain-kit → ui → features → apps`. Imports flow left to right only, and `ui` never imports `data` or `auth`.
**Breaking core↔ui:** `ui` currently imports `@repo/core` in 92 files. Replace those with props/hooks injected by the feature packages, plus `@repo/platform` and `@repo/i18n` for the truly cross-cutting parts. Remove `@repo/ui` from `core/package.json` and tsconfig paths.
**Steps:**
1. Extract the leaves first: contracts, observability, platform.
2. Turn `@repo/core` into a **re-export facade** with deprecation JSDoc.
3. Codemod importers package by package.
4. Delete the facade when its import count reaches 0.
**Done when:** `@repo/core` is deleted (or ≤ 5k LOC of facade), depcruise layer rules pass, and no package has more than 30k LOC.
**Risk:** medium, mostly mechanical, and the facade keeps the build green. **Effort:** L.

### WS-7 Stub packages (Phase 5)
| Package | LOC | Reality | Action |
|---|---|---|---|
| `packages/payments` | 204 | `plugins/stripe.ts` returns `st_${Math.random()}`; "In a real implementation…" | Keep the package but **gate it**. Every provider throws `NotImplemented` outside dev. README states "stub". Implement only via the edge function + webhook (ADR-010). |
| `packages/accounting` | 206 | thin double-entry `Ledger` over supabase | Fold into `admin/src/accounting/` until it has a second consumer. Writes go through oRPC (WS-5). |
| `packages/workforce` | 110 | one "Workforce Management" shell screen | Delete. Re-create it when the feature exists, behind `useDomainFeature('workforce')`. |
| `packages/database` | 123 | ZenStack client | Move into the server (WS-5), then delete. |
| `packages/types-shim` | 15 | one `.d.ts` | Move into `packages/typescript-config/types/`. |
| `packages/scripts` | 0 (no package.json) | stray folder | Move into `/scripts` or delete. |
| `packages/editorial` | 617 | used only by `gurudevi-marketingWeb` | Fine, but move it to `apps/gurudevi-marketingWeb/src/editorial` if it never gains a second consumer. |
| `useSchoolStats.ts` ×2 | — | `packages/admin/src/hooks/` and `packages/classroom/src/hooks/` | Keep one in `classroom` and export it from there. |

**Done when:** every package has ≥ 2 consumers or a written ADR reason, and no stub returns fake success outside dev. **Risk:** low. **Effort:** S–M.

### WS-8 Huge-file splits (Phase 5)
**Rule:** source files ≤ 800 LOC. This is a CI warning, and for new files it fails the build.
| File | LOC | Split into |
|---|---|---|
| `apps/edlove-web/app/atlas/page.tsx` | 5,603 | `atlas/_components/*` (map, filters, school card, legend), `atlas/_data/*` (server loaders), and a page that stays ≤ 150 lines |
| `packages/schema/schema.ts` | 5,383 | If generated: move it to `schema/generated/` and exclude it from LOC and lint. If hand-written: split per domain (`schema/{identity,classroom,library,…}.ts` + `index.ts`) |
| `packages/schema/input.ts` | 1,460 | per domain, same as above |
| `packages/library/src/screens/LibraryScreen.web.tsx` / `.tsx` | 2,128 / 1,714 | one shared `LibraryScreen.shared.tsx` + platform-specific shells ≤ 200 lines each; logic moves into `useLibraryScreen()` |
| `packages/ui/src/screens/OnboardingScreen.web.tsx` | 1,760 | step components + `useOnboardingFlow()`; move it to a feature package (ui holds no screens) |
| `packages/admin/src/screens/FounderDashboard.web.tsx` | 1,552 | widgets per card |
| `packages/platform-mcp/src/index.ts` | 1,510 | `tools/*.ts`, one per MCP tool, + `server.ts` |
| `packages/ui/src/screens/AppSettingsScreen.shared.tsx` | 1,462 | sections per file; move to a feature package |
| `packages/ui/src/components/SanctuaryGlobalStyles.tsx` | 1,329 | tokens → `theme/tokens.ts`, global CSS → `.css` |
**Risk:** low–medium. **Effort:** M.

### WS-9 `any` reduction with ratchet (Phases 2–5)
**Baseline:** 1,836 `any` occurrences in src (`: any`, `as any`, `<any>`).
**Steps:**
1. `scripts/ratchet.mjs` counts `any`, `@ts-ignore`, `eslint-disable`/`biome-ignore`, files over 800 LOC, mock identifiers in src, and root scripts. It compares the counts against `tooling/ratchet.json` (committed) and **fails if any count rises**. When a count falls, the script rewrites the file (`pnpm ratchet --update`).
2. Turn on Biome `noExplicitAny: error` for **new** files (path-scoped override), and `warn` for existing ones.
3. Kill the root causes first, because they produce the most `any`s:
   - `createSovereignClient(): any` (WS-4)
   - `MutationFunction = (variables: any …) => Promise<any>` in `core/lib/sync/registry.ts` (type it from the contracts)
   - `metadata?: any` in payment providers
4. Use `unknown` + zod parse at boundaries. Ban `as any` in favor of `as unknown as T` with a comment, which is also counted.
**Done when:** `any` ≤ 200 at week 14 and ≤ 50 at week 26, with `ts-ignore` at 0 (only `@ts-expect-error` with a reason). **Risk:** low. **Effort:** M, ongoing.

### WS-10 Demo/mock gating (Phase 5)
**Why:** 81 mock or demo identifiers sit in prod paths:
- `packages/core/src/api/{demo.ts,demoProvider.ts,mockData.ts}`
- `adapters/memory/MemoryAuthAdapter.ts`, `adapters/native/SimulatorDeviceIdentityAdapter.ts`
- `packages/graphics/src/components/CollaborativeGrove.tsx` (`mockTenantMetricsAPI`)
- `apps/gurudevi-mobile/src/screens/TanStackPacerDemo.tsx`
- `admin/src/bridge/founderWorkspace.ts`, `classroom/src/components/ClassroomList.tsx`
**Steps:**
1. Move them all to `@repo/test-kit` (or `src/__dev__/`).
2. Wire them through DI only when `EDLOVE_ENV==='development' && EDLOVE_DEMO==='1'`.
3. Make **CollaborativeGrove true**: feed it from `@repo/analytics` tenant metrics through SovereignClient, with an empty-state UI instead of fake numbers.
4. Delete `TanStackPacerDemo.tsx` or move it under `app/(dev)/`, which is excluded from release builds.
5. CI `bundle-guard`: build the prod web and mobile bundles, then grep for `__DEMO__`/`mockData` markers, and fail on any hit.
**Done when:** mock identifiers in non-test src are 0 and the bundle guard is green. **Risk:** low. **Effort:** M.

### WS-11 Docs and agent-config consolidation (Phase 6)
**Why:** 301k lines of markdown against 313k LOC of code. The 9,217-line `.github/copilot-instructions.md`, 143k lines in `apps/gurudevi-mobile/docs/`, and five agent-config roots (`.agents` 26.7k, `.claude` 8.7k, `.codex`, `.cursorrules`, copilot) drift apart.
**Target:**
```
ARCHITECTURE.md        ≤ 400 lines: system map, layer rules, data flow, mermaid
GLOSSARY.md            poetic name → plain English → module path
docs/adr/NNNN-*.md     decisions (list below)
docs/guides/           ≤ 15 how-tos (setup, release, mobile, db)
docs/edlove/           philosophy & papers — kept, marked non-normative
AGENTS.md              single agent root (≤ 300 lines); points at ARCHITECTURE/GLOSSARY
.agents/skills/        the one skills dir (deduped)
```
**Steps:**
1. Pick `AGENTS.md` + `.agents/` as the **one** root. `CLAUDE.md`, `.cursorrules` and `.github/copilot-instructions.md` become 3-line pointers (`See AGENTS.md`).
2. Delete per-app `AGENTS.md`/`CLAUDE.md` duplicates unless they hold app-specific rules, kept to ≤ 50 lines.
3. Harvest `apps/gurudevi-mobile/docs/{architecture,Core,decisions}` into ADRs and ARCHITECTURE.md. Delete `current_progress/` (163 files, session logs) and the `Support/` versioned docs (`GURUDEVI_ARCHITECTURE_v4_0_UPDATED.md` etc.).
4. Make `llms.txt` and `apps/00_ECOSYSTEM_INDEX.md` point at ARCHITECTURE.md.
5. CI: fail when markdown under `apps/**` or `packages/**` exceeds the ratchet number.

**Glossary format (each poetic name earns its meaning):**
| Name | Plain English | Behavior it must prove | Path |
|---|---|---|---|
| Sanctuary | The authenticated, safe space for a member | Route group requires a session, CSP and rate limits; `sanctuary-api` enforces authz on every procedure | `apps/sanctuary-api`, `apps/gurudevi-web/app/(sanctuary)` |
| Sovereign | We own the trust boundary | WS-4 guarantees (typed, HTTPS, pinned, traced, idempotent) | `packages/sovereign-client` |
| Sovereign cycle checker | We own our dependency graph | Wraps depcruise, and CI fails on cycles | `scripts/refactor/sovereign-cycle-checker.mjs` |
| Grove (CollaborativeGrove) | A school's collective growth at a glance | Real tenant metrics, never mock data | `packages/graphics/src/components/CollaborativeGrove.tsx` |
| Healed (sync registry) | Moved out of the app into a shared, tested home | Typed mutation keys + idempotency | `packages/core/src/lib/sync/registry.ts` |
| Atlas | A map of Sri Lankan schools by census number | Server-loaded data, page ≤ 150 lines | `apps/edlove-web/app/atlas` |
| Thuthimal | Gratitude/recognition flow | Claim flow is idempotent and auditable | `packages/core/src/api/thuthimal.ts` |
| TemporalHorizon / FloorAtmosphere | Date strip / ambient background picker | Accessible, no layout shift | `apps/gurudevi-web/app/(sanctuary)/components/` |

Rule: every exported identifier on the poetic word list (`scripts/glossary-words.txt`) needs a one-line TSDoc `/** Plain: … */` and a GLOSSARY row. `scripts/check-glossary.mjs` enforces this.
**Done when:** markdown is ≤ 60k LOC, there's one agent root, and glossary coverage is 100 %. **Risk:** low, but losing context is a risk, so harvest before deleting. **Effort:** M.

---

## 3. ADRs to write (`docs/adr/`)
| # | Title | Workstream |
|---|---|---|
| 0001 | Record architecture decisions; poetry in names, truth in behavior | all |
| 0002 | One river: PowerSync reads, oRPC writes, supabase-js adapters only | WS-5 |
| 0003 | oRPC contracts are the single API source of truth; retire Hono RPC client | WS-4 |
| 0004 | SovereignClient guarantees and env resolution table | WS-4 |
| 0005 | Effect: server-only (or removed) | WS-5 |
| 0006 | Package layering and the core split | WS-6 |
| 0007 | Lint strategy: Biome primary, ESLint minimal, no oxlint; depcruise sole graph tool; knip sole unused tool | WS-2 |
| 0008 | Toolchain pins (Node, pnpm, corepack) and cross-platform scripts | WS-2 |
| 0009 | Generated output is local-only under `.reports/` | WS-1 |
| 0010 | Payments: stub policy and edge-function design | WS-7 |
| 0011 | Demo/mock code gating and bundle guard | WS-10 |
| 0012 | Ratchet metrics and CI gate | WS-3/9 |
| 0013 | Server query layer: Kysely vs ZenStack (pick one) | WS-5 |
| 0014 | Mobile certificate pinning and rotation | WS-4 |
| 0015 | Docs and agent-config single root | WS-11 |

---

## 4. Metrics ratchet (`tooling/ratchet.json`)
| Metric | Now | Wk 4 | Wk 14 | Final |
|---|---|---|---|---|
| Typecheck errors | unknown (no install on Node 20) | baseline recorded | 0 | 0 |
| Dependency cycles (depcruise) | unverified | baseline | 0 | 0 |
| `any` in src | 1,836 | ≤ 1,700 | ≤ 200 | ≤ 50 |
| `@ts-ignore`/`@ts-nocheck` (+ `@ts-expect-error` without a reason) | 8 | 8 | 0 | 0 |
| lint suppressions | 48 | ≤ 48 | ≤ 20 | ≤ 10 |
| Mock/demo identifiers in non-test src | 81 | ≤ 81 | 0 | 0 |
| Hardcoded localhost/http fallbacks | 14 | ≤ 14 | 1 (`resolveSovereignUrl` dev branch) | 1 |
| Source files > 800 LOC | ≥ 10 | ≤ 10 | 0 (except generated) | 0 |
| Largest source file | 5,603 | 5,603 | ≤ 800 | ≤ 800 |
| `@repo/core` LOC | 67,896 | 67,896 | ≤ 5,000 facade | 0 |
| Packages with < 2 consumers and no ADR | 5 | 5 | 0 | 0 |
| Client data paths | 6 | 6 | 2 (PowerSync, oRPC) | 2 |
| Root package.json scripts | 117 | ≤ 25 | ≤ 20 | ≤ 20 |
| Linters | 3 | 3 | 2 (Biome + minimal ESLint) | 2 |
| Root tooling configs | ~25 | ≤ 18 | ≤ 12 | ≤ 12 |
| Markdown LOC | 301,235 | ≤ 200k | ≤ 60k | ≤ 40k |
| Agent-config roots | 5 | 5 | 1 | 1 |
| Committed generated reports (LOC) | 52,018 | 0 | 0 | 0 |
| Glossary coverage of poetic names | 0 % | 30 % | 100 % | 100 % |
| Contract coverage (oRPC) | see `contractCoverage.ts` | baseline | ≥ 95 % | 100 % |

---

## 5. Target architecture
```mermaid
flowchart LR
  subgraph Apps
    M[gurudevi-mobile<br/>Expo]
    W[gurudevi-web<br/>Next]
    E[edlove-web<br/>Next · Atlas]
    K[marketingWeb<br/>Astro]
  end
  subgraph Features
    F[classroom · library · self<br/>community · admin · profile]
  end
  UI[@repo/ui<br/>primitives · theme]
  DK[@repo/domain-kit]
  AU[@repo/auth]
  D[@repo/data<br/>PowerSync · supabase adapters]
  SC[@repo/sovereign-client<br/>typed · HTTPS · pinned · traced]
  C[@repo/contracts<br/>oRPC + zod]
  P[@repo/platform · i18n · observability]
  API[sanctuary-api<br/>Hono host · oRPC router · Kysely]
  PG[(Postgres / Supabase)]
  PS[[PowerSync service]]

  M & W & E --> F
  K --> UI
  F --> UI & DK & AU & D
  UI --> P
  AU --> D
  D --> SC --> C
  DK --> C
  D <--> PS
  SC -- HTTPS + Idempotency-Key + traceparent --> API
  PS -- upload queue → oRPC mutations --> API
  API --> PG
  PS <-- logical replication --> PG
```

---

## 6. This week (Phase 0 checklist)
- [ ] Revoke the Gemini key from commit `b56f62a` and verify it's dead.
- [ ] Add a boot-time `assertEnv()` in `apps/sanctuary-api/src/load-env.ts`, plus `crypto.test.ts` for the BYOK secret.
- [ ] Run a full-history gitleaks scan, add the keystore rule, and confirm release signing doesn't use a debug keystore.
- [ ] Add the `.reports/` redirect and the `.gitignore` entries, then `git rm --cached` the generated folders.
- [ ] Align `engines`/`packageManager`/`.nvmrc`/`mise.toml`, run `corepack enable`, and record the typecheck baseline.
- [ ] Commit `tooling/ratchet.json` with the "Now" column above, so the numbers can only go down from here.
