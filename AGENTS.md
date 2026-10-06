---
title: "AGENTS.md — Agent Guardrails for Polymath Platform"
status: "active"
created: 2026-08-03
updated: 2026-10-04
author: "Naveen"
scribe: "Antigravity"
tags: [AGENTS.md, quality, guardrails]
---

# AGENTS.md — Agent Guardrails for Polymath Platform

> **This file exists to prevent agents from making build-breaking mistakes.**
> **READ THIS FIRST** — Architecture guardrails before any code changes.
>
> 🚨 **PRIME DIRECTIVE: WEB-FIRST & REPO-DOCS-FIRST FOR ALL MODERN ECOSYSTEM DECISIONS**
> Agent static training memory has a fixed cutoff and is blind to recent changes in Expo SDK 58, React Native 0.86+, Kotlin 2.x, Gradle 8.x, Skia v3, Effect v4, etc. **NEVER rely on internal memory or make guesses.** Always perform live web searches (`search_web`), query registries (npm/Maven), and read repo docs (`docs/infra/*`, `docs/Learning/*`, `docs/architecture/*`) before proposing, diagnosing, or modifying code. If an operation fails repeatedly in the same spot, STOP and research upstream immediately.

---

## Architecture — Read Before Any Change

### The Three Apps (Know Which You're In)

| App | Purpose | Framework | **Build In** |
|-----|---------|-----------|--------------|
| **`apps/gurudevi-mobile`** | **Native iOS/Android** — flagship mobile | Expo 58 (RN 0.88, New Arch) | ✅ Mobile features |
| **`apps/gurudevi-web`** | **Unified Web Platform** — Marketing + Sanctuary (Next.js 16) | Next.js 16 (App Router, Tailwind v4) | ✅ **Primary web target** |
| `apps/gurudevi-marketingWeb` | Legacy marketing (Astro) | Astro/Svelte | ⚠️ **Migrating → gurudevi-web** |
| `apps/edlove-web` | EdLove foundation | Astro | ✅ Active |
| `apps/sanctuary-api` | Sanctuary API (Hono) | Node.js/Hono | ✅ Active |

### Domain Packages (Shared Logic Only)

| Package | Purpose | Use For |
|---------|---------|---------|
| `@repo/core` | Platform spine: auth, tenancy, permissions, contracts, API clients | Shared logic, hooks, schemas, API clients |
| `@repo/classroom` | Classroom domain: attendance, gradebook, reflect, workspace | Classroom domain logic |
| `@repo/ui` | RN/NativeWind primitives (tokens, not web components) | RN components only |
| `@repo/ui/tokens` | Design tokens (colors, spacing, motion) — platform-neutral | Design values only |
| `@repo/ui/web` | **Web-only components** (built in gurudevi-web, extracted after proven) | Web-only components |

---

## Critical Architecture Boundaries (NEVER CROSS)

| ❌ NEVER | ✅ INSTEAD |
|----------|------------|
| Import `*.web.tsx` in `gurudevi-web` | Build browser-native in `apps/gurudevi-web` |
| Import `@repo/ui` web components in Next.js | Use `@repo/ui/tokens` for design values; build web components in `gurudevi-web` |
| Import Expo/RN/PowerSync in `gurudevi-web` | Use `@repo/core/web-auth`, `@repo/core/web-authorized-entry` |
| Import `@repo/ui` web components in `gurudevi-web` | Build web components in `apps/gurudevi-web` |
| Put web components in `@repo/ui` | Build in `apps/gurudevi-web`; extract to `@repo/ui/web` **after proven** |
| Use RN Web (`*.web.tsx`) for new features | RN Web is **migration source only** — being retired |

### The Three Web Targets (Know the Difference)

| Target | Purpose | Codebase | Status |
|--------|---------|----------|--------|
| **`gurudevi-web` (Next.js)** | **Primary production web** — Marketing + Sanctuary | `apps/gurudevi-web` | ✅ **Primary** |
| **RN Web (Expo)** | Migration source, fallback | `apps/gurudevi-mobile/*.web.tsx` | ⚠️ Retiring |
| `gurudevi-marketingWeb` (Astro) | Legacy marketing | `apps/gurudevi-marketingWeb` | ⚠️ Migrating → gurudevi-web |

**`gurudevi-web` = Primary production web (Marketing + Sanctuary).**  
**RN Web = Migration source only, fallback.**

---

## Critical Rules (NEVER do these)

### 1. NEVER run `expo install --fix`

This command downgrades packages to Expo's recommended versions. This repo **intentionally** uses newer versions for new-architecture support. Running `expo install --fix` WILL break the build.

```bash
# ❌ NEVER
npx expo install --fix
npx expo install --check

# ✅ DO THIS INSTEAD (diagnostic only, no changes)
pnpm --filter gurudevi-mobile exec expo-doctor
```

### 2. NEVER run `expo prebuild --clean` without explicit user approval

`--clean` wipes the entire `android/` and `ios/` directories and regenerates from scratch. While this is sometimes necessary, it destroys any locally-generated state and requires a full rebuild.

```bash
# ❌ NEVER (without user approval)
npx expo prebuild --clean

# ✅ DO THIS INSTEAD
npx expo prebuild --no-install
# This regenerates without the destructive clean step.
```

### 3. NEVER edit files inside `android/` or `ios/` directly

These directories are **ephemeral build artifacts** (gitignored). Any edits will be wiped by the next prebuild.

All native configuration must go through:
- `apps/gurudevi-mobile/app.json` (config plugins)
- `apps/gurudevi-mobile/plugins/*.js` (custom config plugins)

### 4. NEVER remove version exclusions from `package.json`

The `expo.install.exclude` and `expo.doctor.reactNativeDirectoryCheck.exclude` arrays contain packages that are intentionally pinned to newer versions. Removing these exclusions causes `expo doctor` to flag them, and agents may try to "fix" them.

### 5. Build Dev/Debug APK by default; ONLY build Release when explicitly requested; ALWAYS build in WSL 2

Native Android builds must adhere to the following rules:

1. **Default Target is Debug (`:app:assembleDebug`)**:
   For daily development, iteration, and physical device testing, always assemble a **Debug / Development Client APK (`:app:assembleDebug`)** that connects to the active Metro bundler.
   - Run Metro: `pnpm --filter gurudevi-mobile start`
   - Reverse device port: `adb reverse tcp:8081 tcp:8081`
   - Install and launch the Debug APK on the connected device.

2. **Release Builds ONLY when explicitly requested**:
   Do **NOT** run `assembleRelease` unless the user explicitly asks for a standalone release build. Standalone release builds bundle offline assets and take significantly longer. When explicitly requested, wrap with `doppler run --no-fallback --` so public environment variables (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, etc.) are injected into Metro during asset bundling.

3. **ALWAYS build inside WSL 2 (Ubuntu)**:
   **NEVER** build native Android on the Windows host directly. Windows paths exceed limits (`CMAKE_OBJECT_PATH_MAX`) and trigger Ninja manifest timestamp loops (`build.ninja dirty after 100 tries`).
   Always run from the active workspace inside WSL 2 with verified toolchain variables:

```bash
# In Ubuntu (WSL 2) from the active workspace mount:
export ANDROID_SDK_ROOT="$HOME/Android/Sdk"
export ANDROID_HOME="$ANDROID_SDK_ROOT"
export ANDROID_NDK_HOME="$ANDROID_SDK_ROOT/ndk/27.1.12297006"
export CMAKE_BUILD_PARALLEL_LEVEL=2
export GRADLE_OPTS='-Xmx1536m -XX:MaxMetaspaceSize=256m -XX:+UseSerialGC'

# Enable ccache if installed
if command -v ccache >/dev/null 2>&1; then
  export NDK_CCACHE="$(which ccache)"
  export CCACHE_DIR="$HOME/.ccache"
  export CCACHE_MAXSIZE="10G"
fi

# Use YOUR ext4 workspace path — not someone's. The default below only applies
# if you keep the repo at ~/projects/polymath-platform. If your Linux checkout
# lives elsewhere, export POLYMATH_WSL_DIR before running the Windows scripts.
export POLYMATH_WSL_DIR="${POLYMATH_WSL_DIR:-$HOME/projects/polymath-platform}"
cd "$POLYMATH_WSL_DIR/apps/gurudevi-mobile/android"

# Standard development build (default):
./gradlew :app:assembleDebug --build-cache --no-daemon --max-workers=2 \
  -PreactNativeArchitectures=arm64-v8a --console=plain

# Standalone release build (ONLY if user explicitly requested):
# doppler run --no-fallback -- ./gradlew :app:assembleRelease --build-cache --no-daemon --max-workers=2 \
#   -PreactNativeArchitectures=arm64-v8a --console=plain
```

4. **One-Command Unified Execution from Windows**:
   Always prefer running the standardized scripts from the Windows workspace root:
   - **Dev Debug APK**: `pnpm run build:android`
   - **Release APK**: `pnpm run build:android:release`
   - **Install Dev APK**: `pnpm run install:android`
   - **Install Release APK**: `pnpm run install:android:release`

   These scripts read `POLYMATH_WSL_DIR` (see `scripts/lib/wsl-workspace.mjs`).
   If your Linux ext4 checkout is not at `~/projects/polymath-platform`, set it.
   The value must be a **Linux** path — it is interpolated into a bash script, so
   `~` and `$HOME` expand inside the distro. Use single quotes in PowerShell;
   `"$HOME"` would expand to the *Windows* home (`C:\Users\...`) and break `cd`:
   ```powershell
   $env:POLYMATH_WSL_DIR = '~/projects/my-other-clone'
   ```
   Never hardcode a personal path back into `scripts/`.

### 6. Web-First, Docs-First, and Live Registry Verification (MANDATORY)

Agents **MUST NOT** rely on static internal training memory for fast-moving, canary, beta, or prerelease libraries and tooling (e.g. Expo SDK 58, React Native 0.86+, Kotlin 2.x, Gradle 8.x, Skia v3, Effect v4, Glance / Peek, Nitro Modules, etc.). Agent training memory has fixed knowledge cutoffs and is blind to the latest breaking changes, compiler rules, and package coordinates. Relying on internal memory leads to hallucinations, obsolete recommendations, and repeated build failures.

1. **Search Web First**:
   - For ANY error, build failure, configuration change, or version decision involving modern or fast-moving libraries, **immediately search the web (`search_web`)**.
   - Query live package registries (npm via `npm view <pkg> versions`, Maven Central) and live GitHub repositories (issues, PRs, releases, commits) to verify actual package coordinates, breaking changes, and compatibility tables before guessing or applying fixes.
2. **Read Existing Architecture Documentation First**:
   - This repository maintains authoritative living documentation in `docs/infra/*`, `docs/Learning/*`, `docs/architecture/*`, and `apps/gurudevi-mobile/docs/*`.
   - **Never guess or reinvent** toolchain configurations, build arguments, or environment variables. Always consult the existing SOPs, decision logs, and runbooks first.
3. **Repeated Failure Circuit Breaker**:
   - If a native build or task fails repeatedly in the exact same place (e.g. Kotlin compilation failure in a third-party module), **STOP IMMEDIATELY**.
   - Do NOT guess, tweak arbitrary flags, or rerun builds in a loop.
   - Follow this triage sequence:
     a. **Search the web** for the exact compiler error and library name to identify known upstream breaks with newer React Native / Kotlin versions.
     b. **Audit actual workspace usage**: Run `grep_search` across `apps/gurudevi-mobile/src` and `packages/` to see if the failing package is even imported or used. If it is an unused dependency, evaluate removing it.
     c. **Check upstream releases and patches**: If the package is required, check npm and GitHub for a compatible release or create a clean, targeted patch via `pnpm patch`.
4. **No Outdated Architecture Assumptions**:
   - Never assume older React Native or Expo paradigms (e.g. old bridge patterns, deprecated Gradle plugins, obsolete package tags) apply to Expo 58+ or React Native 0.86+ New Architecture. Always verify live web documentation first.


---

## Sacred Versions (do NOT change without explicit approval)

These packages are pinned to specific versions for new-architecture compatibility:

| Package | Sacred version | Why |
|---|---|---|
| `react-native-gesture-handler` | 3.3.0 | RNGH v3 for new arch |
| `react-native-reanimated` | 4.7.1 | Reanimated 4 for new arch & Expo 58 |
| `react-native-worklets` | 0.13.0 | Required by reanimated 4.7 |
| `react-native-mmkv` | 4.3.2 | Nitro modules v4 |
| `react-native-nitro-modules` | 0.37.1 | Required by mmkv 4 / Nitro v0.37 |
| `react-native-skia` | 3.0.2 | RN Skia v3 (Graphite/WebGPU fork by William Candillon) |
| `typescript` | 7.0.2 | Latest stable |


---

## How to Add a New Native Dependency

1. **Check if it has an Expo config plugin:**
   ```bash
   # Look for "expo" in the package's plugin field
   npx expo install <package-name>
   ```
   If the package provides a config plugin, add it to `app.json` plugins array.

2. **If it needs a Maven repo (Android):**
   - Add the URL to `app.json` under `expo-build-properties` → `android.extraMavenRepos`.
   - If it needs to be in `buildscript.repositories` (rare), create a new plugin in `plugins/` using `withProjectBuildGradle`.

3. **If it needs native code changes:**
   - Create a config plugin in `plugins/` using the shared helper (`plugins/lib/buildGradleBlock.js`).
   - Wire it into `app.json` plugins array.

4. **Never hand-edit `android/` or `ios/`.**

---

## How to Update Expo SDK

1. Check the Expo SDK changelog for breaking changes.
2. Run `npx expo upgrade` (this updates SDK + compatible deps).
3. Run `expo-doctor` to verify.
4. Test on a physical device.
5. If versions conflict with sacred versions, manually override and re-add exclusions.

---

## How to Debug Build Failures

1. **Check the error message** — most Gradle errors tell you exactly what's wrong.
2. **Regenerate android/** — delete and prebuild:
   ```bash
   Remove-Item -Path "apps\gurudevi-mobile\android" -Recurse -Force
   npx expo prebuild --no-install --platform android
   ```
3. **Check plugin output** — prebuild logs show which plugins ran.
4. **Verify app.json** — `npx expo config --type prebuild` shows resolved config.
5. **Check the docs**:
   - `docs/Learning/EXPO_BUILD_RUNBOOK.md` — developer runbook
   - `docs/infra/expo-57-native-gradle-sop.md` — infra reference

---

## Git Rules

- `android/` and `ios/` are gitignored. Do not commit them.
- `node_modules/` is gitignored. Do not commit it.
- Lock files (`pnpm-lock.yaml`) MUST be committed.
- Feature branches merge forward: feature → main-dev → main. No rebase on long-lived branches.

---

## Quality Regulation — Anti-Slop Rules (apply to ALL code, human or AI)

AI-generated code fails differently from human code: it is *plausible* rather
than confused, deletes guards quietly, invents APIs, duplicates instead of
reuses, and weakens tests to make them pass. These rules exist so slop never
merges. **They apply with extra force to agent-authored changes.**

### The Slop List (patterns banned in this repo)

1. **No restating comments.** `// gets the user` above `getUser()` is noise.
   A comment must say something the code cannot.
2. **No unapproved behavior replacement or deletion.** Before changing an
   existing flow, read its callers, platform variants, error/recovery paths,
   and tests. Preserve working behavior through an additive/integrated path
   until the replacement has an explicit compatibility decision and evidence.
   Never delete a fallback, handler, route, storage path, or user-visible flow
   merely because it appears insecure, redundant, or inconvenient. If its
   security/correctness trade-off is not already specified, stop and ask the
   user; do not make that product decision alone.
3. **No dead abstractions.** An interface used once, a factory with one
   implementation, a wrapper that only forwards arguments — inline them.
4. **No duplicate utilities.** Before adding any helper, search the workspace
   (`@repo/core`, `@repo/ui`, `packages/*`). If an equivalent exists,
   consolidate — never add a near-copy with a different name.
5. **No defensive noise.** No try/catch that swallows errors silently; no
   checks for states that cannot occur; no optional chaining on non-optional
   values.
6. **No happy-path-only code.** Every network call, parse, or external
   boundary must answer "what happens when this fails?" — and the answer may
   not be "the app crashes".
7. **Never weaken a test to make it pass.** Assertions get looser only with a
   written justification in the commit message. Deleting/skipping a test
   requires stating why the behavior no longer exists.
8. **Never weaken quality gates.** No lint suppressions, skipped CI steps,
   raised budgets, or `|| true` without an explicit, reviewed reason.
9. **No scope creep.** A task touching 2 files should not touch 9. Unrelated
   cleanups go in their own commit (or don't happen).
10. **Types over assertions.** No `any`, no `as unknown as X`. Model the domain
   (`UserId`, not `string`) and let signatures be honest.

### Verification discipline (before any change is "done")

- **Run the checks yourself** — `check-types`, `lint`, `test` for touched
  packages. "Tests pass" is a claim, not evidence.
- **Read deletions first** in your own diff. Removed guards are where silent
  regressions live.
- **Diff test files separately** from implementation; confirm assertion count
  went up, not sideways.
- **Generator ≠ verifier.** Code is reviewed in a fresh session/context, never
  rubber-stamped by the session that wrote it.
- Small diffs by default. If a change can't be read carefully, split it.
- **Anti-slop gate before merge.** Run `pnpm run check:anti-slop` on your
  branch. aislop gates new AI-slop indicators; fallow gates dead code,
  duplication, and complexity in changed files. Both must exit 0. If a
  finding is inherited (pre-existing), note it in the PR description — do
  not suppress the tool to pass.

### Test-claim protocol — mandatory for every agent and code review

Never write or repeat the unqualified statement **"tests passed"**. A test
result is only valid when its evidence level, engine, scope, and limitations are
stated. Before reporting a result, inspect both the command output and the test
assertions that produced it; filenames, tags, snapshots, and a green exit code
are not sufficient proof of behavior.

Every test claim must include:

- the exact command and configuration file;
- the evidence level: G0 contract/unit, G1 boundary/mock, G2 scenario contract,
  G3 real component/runtime, G4 browser/Metro platform, G5 device/emulator, or
  R1 production assurance;
- the engine and runtime version, including whether host modules, CSS, portals,
  animation, network, storage, or native APIs were substituted;
- the exact test files/scenarios and passed/failed counts;
- what the assertions actually prove;
- what they do not prove, including untested platforms, devices, failure paths,
  accessibility behavior, visual output, and known warnings or exclusions.

The shared runner enforces `--evidence-level` and writes it into reports. Run
`pnpm run check:test-evidence` to find package/app scripts that bypass this
classification. A failing evidence audit is a real quality failure and must be
reported as blocked; do not relabel an unclassified or mock result as native,
platform, device, or production evidence.

Required reporting form:

```text
G1 boundary / Vitest 5 mock engine — Dialog.test.tsx: 4/4 passed.
Proves: the named contract assertions under the configured substitutions.
Does not prove: real React Native, browser CSS/focus, device back handling,
visual fidelity, or production behavior.
```

Only use a higher-level label when that exact level's runtime command passed.
Do not infer G3/G4/G5/R1 from G1 or G2, and do not claim a component is
production-hardened until its contract matrix and all required evidence levels
are complete.

### TypeScript policy

- `packages/typescript-config/base.json` is the strictness floor:
  `strict` + `noUncheckedIndexedAccess` are mandatory for all new packages.
- `exactOptionalPropertyTypes` is the next target (~500-error burn-down;
  adopt per-package with a dedicated cleanup, do NOT flip repo-wide).
- New package tsconfigs must extend `packages/typescript-config/base.json`
  rather than re-declaring options inline.

### When you find slop

Fix it if trivial (<20 lines), otherwise file it as a follow-up task with the
file:line reference. Every caught pattern that recurs goes into this Slop List
so agents stop producing it.

---

### Web Crawling & Document Ingestion Guardrails

1. **No Flat JSON Ledgers for Concurrent Ingestion**: Always use SQLite with Write-Ahead Logging (`WAL`) mode (`PRAGMA journal_mode = WAL; PRAGMA synchronous = FULL; PRAGMA busy_timeout = 10000;`) for crawler state and task tracking. Never rely on flat JSON files that rewrite the entire state on every download.
2. **Re-entrant Synchronization Only (`RLock`)**: In multi-threaded scrapers, all synchronization primitives that protect network calls or state commits must use `threading.RLock()` to prevent re-entrant deadlocks.
3. **Sub-50ms Header Rejection**: Always inspect `Content-Type` before consuming response bodies. Discard HTML landing pages, paywall stubs, and bot challenges immediately without burning chunk read timeouts.
4. **Magic Byte Verification**: Never rely on URL extensions or HTTP status codes alone. Verify file magic headers (e.g. `%PDF-` for PDFs) and minimum byte thresholds ($\ge 2,000$ bytes) before committing files to permanent vaults.
5. **Decoupled Two-Stage Architecture**: Never combine network fetching and CPU-heavy text/NLP extraction in the same loop. Separate into Stage 1 (ingestion & raw storage) and Stage 2 (batch text extraction into JSONL shards).

---

## Production Evidence Governance

The full standing protocol is
[`docs/architecture/production-evidence-governance.md`](docs/architecture/production-evidence-governance.md).
It applies to every agent-authored change.

- Use a task mode such as `[AUDIT-TESTS]`, `[CHAR]`, `[REG]`, `[IMPL]`,
  `[AUTHZ]`, `[INT]`, or `[FAIL]` for non-trivial work.
- Before changing identity, authorization, tenant scope, durable writes, sync,
  payments, privacy, migrations, or destructive operations, state the affected
  user journey/invariant, required evidence, real seam, substitutions, and
  smallest failing or characterization proof.
- Preserve existing behavior while characterizing it. Do not convert a bounded
  hardening task into a rewrite or silently absorb discovered adjacent gaps.
- Mocks are G1 boundary evidence unless a named real runtime/seam has run.
  Never represent mocked behavior as G2-G5 or R1 proof.
- Do not skip evidence promotions: a G4 or G5 execution result is not a
  graduated assurance claim while any applicable lower level is absent. Mark a
  level not applicable only with a written runtime-specific rationale and an
  accepted alternate boundary.
- Every defect receives a regression proof before its fix. Every structural
  change to an existing flow receives characterization coverage unless an
  equivalent explicit contract already exists.
- `pnpm run check:test-evidence` audits all declared test-command claims;
  `pnpm run check:test-evidence -- --changed` is the PR gate for new or changed
  commands. Do not add an unclassified test command.

---

## Stack Map (REQUIRED after dependency changes)

- **After adding/removing any workspace package or dependency:** run `pnpm run stack-map:bootstrap` (drafts an entry), review it in `docs/stack-map/landscape/stack-map-annotations.yaml`, then run `pnpm run stack-map` to regenerate the docs.
- `docs/stack-map/landscape/stack-map.md` + `catalog/` are **generated** — never hand-edit them; edit the annotations YAML instead.
- The annotations YAML carries: layer (core/ui/domain/tooling/app), summary, overlap verdicts, floating verdicts, upgrade notes.
- **External deps (npm/SDK/CLI):** `pnpm run stack-map:deps` regenerates `docs/stack-map/landscape/dependency-catalog.md` from `dependency-annotations.yaml`. Sacred pins live there — never bump them without user approval.

---

## Reference Docs

- `apps/gurudevi-mobile/docs/Learning/EXPO_BUILD_RUNBOOK.md` — build commands, git workflow, troubleshooting
- `apps/gurudevi-mobile/docs/infra/expo-57-native-gradle-sop.md` — gradle state, plugin table, decision log
- `apps/gurudevi-mobile/app.json` — single source of truth for native config
- `apps/gurudevi-mobile/plugins/` — custom config plugins

---

## Branded Components Usage Guide

The `@repo/ui` package now includes branded components that replace generic system defaults with brand-consistent UI elements. These components use the same motion tokens, colors, and brand geometry throughout the app.

### Motion System

Import motion tokens from `@repo/ui`:
```typescript
import { duration, easing, scale, color } from '@repo/ui';
```

- `duration`: Predefined animation durations (micro, transition, breathe, meaningful, ceremony)
- `easing`: Easing functions (standard, decelerate, accelerate)
- `scale`: Scale tokens (enter, rest, breatheMin, breatheMax)
- `color`: Brand and neutral color palettes

### New Branded Components

#### BrandPulse
Replaces `ActivityIndicator` / `Spinner` for all loading states. Uses the brand mark with a breathing animation.

```typescript
import { BrandPulse } from '@repo/ui';

// Default size
<BrandPulse />

// Custom size and color
<BrandPulse size={28} tintColor="#D4843A" />
```

#### ErrorState
For error/offline states. Uses the brand mark in muted amber (caution color), static (no breathing - the absence of the loop signals "paused").

```typescript
import { BrandedErrorState } from '@repo/ui';

<BrandedErrorState
  title="Connection lost"
  message="Please check your internet connection and try again"
>
  <Button onPress={retry}>Try again</Button>
</BrandedErrorState>
```

#### Success Components
Two tiers of success feedback - use deliberately:

- `SuccessCheck`: For trivial actions (field saved, item checked). Fast, generic checkmark.
- `SuccessGlow`: For meaningful milestones (first connection, session booked). Branded heart with motes.

```typescript
import { SuccessCheck, SuccessGlow } from '@repo/ui';

// Trivial success
<SuccessCheck size={22} />

// Meaningful success
<SuccessGlow size={64} />
```

#### BrandedEmptyState
For empty states. Uses the brand mark as an outline (not filled), signifying "hasn't bloomed yet."

```typescript
import { BrandedEmptyState } from '@repo/ui';

<BrandedEmptyState
  title="No items yet"
  message="Create your first item to get started"
  subtle={false} // Set to true for subtle breathing animation
>
  <Button onPress={create}>Create item</Button>
</BrandedEmptyState>
```

#### Skeleton Components
For loading placeholders. Uses the same responsive grid system as real content.

```typescript
import { ShimmerBlock, BrandedSkeletonCard, BrandedSkeletonList } from '@repo/ui';

// Custom shimmer block
<ShimmerBlock width="70%" height={12} />

// Skeleton card (thumbnail + lines)
<BrandedSkeletonCard />

// Skeleton list with responsive grid
<BrandedSkeletonList count={6} />
```

### Layout Helpers

Import layout utilities from `@repo/ui`:
```typescript
import { useBreakpoint, useResponsiveGrid } from '@repo/ui';
```

- `useBreakpoint()`: Returns current breakpoint ('phone' | 'tablet' | 'desktop')
- `useResponsiveGrid()`: Returns grid configuration (columns, maxWidth) for responsive layouts

### Screen Transitions

For Expo Router screen transitions:

```typescript
import { softCrossfadeScale, sharedTransitionTiming } from '@repo/ui';

// Use in Stack.Screen options
<Stack.Screen name="example" options={softCrossfadeScale} />
```

### Backward Compatibility

- The original `EmptyState` component is preserved with its original API (including `icon` and `description` props)
- New branded components are exported with `Branded` prefix to avoid conflicts
- Use the branded versions for new development, original versions remain for existing code
