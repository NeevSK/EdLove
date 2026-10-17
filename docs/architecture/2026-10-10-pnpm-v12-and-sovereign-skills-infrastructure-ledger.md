---
title: "pnpm v12 & Sovereign Agent Skills Infrastructure Ledger"
status: "active"
created: 2026-10-10
updated: 2026-10-10
author: "Polymath Platform Architecture"
tags: [pnpm-12, agent-skills, toolchain, catalogs, supply-chain, rust-toolchain, architecture]
---

# pnpm v12 & Sovereign Agent Skills Infrastructure Ledger

## 1. Executive Summary & Context

On **October 10, 2026**, the Polymath Platform executed a comprehensive infrastructure overhaul to modernize its monorepo toolchain to **`pnpm 12.11.2`**, establish native **Rust Toolchain Orchestration**, transition all 32 workspace packages to **pnpm Catalogs**, and replace synthetic/hand-waved agent skills with **canonical upstream agent skill suites**.

This initiative resolves multi-package version drift, eliminates duplicate dependencies across lockfiles, hardens lifecycle scripts, enforces supply-chain quarantine against zero-day package poisoning, and integrates strict automated health gates for all 237 workspace agent skills.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                     PNPM V12 & SOVEREIGN SKILLS ARCHITECTURE MAP                       │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│   package.json (packageManager: pnpm@12.11.2)   rust-toolchain.toml (Rust 1.85.0)      │
│                            │                                   │                       │
│                            ▼                                   ▼                       │
│                 pnpm-workspace.yaml                    cargo: enabled: true            │
│                 ├── catalog: (SSoT Pins)                       │                       │
│                 ├── minimumReleaseAge: 1440                    ▼                       │
│                 └── skills: dirs: ['.agents/skills/vendor']   Shiny Tools (rg, fd, sd) │
│                            │                                                           │
│                            ├──────────────────────────────────────────┐                │
│                            ▼                                          ▼                │
│                 32 Monorepo Packages                      Sovereign Agent Skills       │
│                 ├── typescript: "catalog:"                ├── Emil Kowalski Motion     │
│                 ├── react: "catalog:"                     ├── Expo SDK 58 Suite        │
│                 ├── @zenstackhq/*: "catalog:"             ├── Supabase Architecture    │
│                 └── 135 packages deduplicated             ├── Vercel React 19 Suite    │
│                                                           └── Skill Doctor (--strict)  │
│                                                                      │                 │
│                                                                      ▼                 │
│                                                            pnpm run check:anti-slop    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Upstream Research & Sacred Native Pins Protection

Prior to toolchain migration, empirical investigation was conducted into the upstream status of `react-native-reanimated` and `react-native-worklets`:
* **Investigation Findings**: Both `react-native-reanimated@4.8.0` and `react-native-worklets@0.14.0` remain unreleased daily nightlies (`4.8.0-nightly-20261009-390c8c6fe` and `0.14.0-nightly-*`) on npm/GitHub. Neither stable tags nor production releases have been published by Software Mansion.
* **Sacred Pins Invariant**: In accordance with `AGENTS.md` Section 2, the Sacred Native Pins remain locked:
  * `react-native-reanimated`: `4.7.1`
  * `react-native-worklets`: `0.13.0`
  * `react-native-gesture-handler`: `3.3.0`
  * `react-native-mmkv`: `4.3.2`
  * `react-native-nitro-modules`: `0.37.1`
  * `react-native-skia`: `^3.3.0`
  * `typescript`: `7.0.2`

---

## 3. The 4 Strategic Leverage Vectors

### Vector A: Vendor Agent Skills Linking (`pnpm approve` / `skills.dirs`)
* **Configuration**: Added `skills.dirs: ['.agents/skills/vendor']` to `pnpm-workspace.yaml`.
* **Approved Upstream Dependencies**: Verified and linked dependency-shipped skills via `pnpm approve --all`:
  * `@swmansion/argent` (18 skills)
  * `@tanstack/ai`
  * `@tanstack/react-table`
  * `expo-sqlite`
  * `fallow`
  * `react-native-nitro-google-signin`
* **Vendor Directory Isolation**: Normalized vendor skill manifests into `.agents/skills/vendor/`, ensuring clean separation between internal monorepo skills and third-party package skills.

### Vector B: Rust Toolchain & Shiny Tools Orchestration
* **Rust SSoT**: Created `rust-toolchain.toml` at the monorepo root, explicitly pinning Rust `1.85.0` with `rustfmt` and `clippy` components.
* **pnpm Cargo Bridge**: Enabled `cargo: enabled: true` in `pnpm-workspace.yaml`.
* **Shiny Tools Pre-flight**: Integrated with `scripts/check-shiny-tools.mjs`. All 7 Rust utilities verified functional:
  * `rg 15.1.0` (ripgrep)
  * `fd 10.4.2` (fd-find)
  * `sd 1.0.0` (Rust find-and-replace)
  * `bat 0.26.1` (syntax viewer)
  * `eza` (modern tree view)
  * `delta 0.19.2` (git diff review)
  * `pnpm 12.11.2`

### Vector C: Workspace Catalogs & Full Monorepo Migration
* **SSoT Catalog Definition**: Configured `catalog:` in `pnpm-workspace.yaml` for platform spine dependencies:
  * `react`: `19.3.0`
  * `react-dom`: `19.3.0`
  * `typescript`: `7.0.2`
  * `clsx`: `^2.1.1`
  * `tailwind-merge`: `^3.7.0`
  * `@zenstackhq/*`: `3.8.3` (aligned across catalog and overrides)
* **Codemod Automation**: Developed `scripts/migrate-to-catalog.mjs` (`pnpm run catalog:migrate`).
* **Migration Impact**:
  * Scanned 36 `package.json` manifests across `packages/` and `apps/`.
  * Migrated **32 workspace packages**.
  * Converted **61 dependencies** to `"catalog:"`.
  * Eradicated version fragmentation (such as `"typescript": "rc"` in packages).
  * Lockfile resolution via `autoDedupe: true` pruned **135 redundant package versions**.

### Vector D: Lifecycle Sandboxing & Sovereign Skill Sentinel
* **Script Sandboxing**: Explicit build permissions audited and locked down via `allowBuilds` in `pnpm-workspace.yaml` for native binary modules (`wa-sqlite`, `esbuild`, `tree-sitter`, `sharp`, `prisma`).
* **Canonical Upstream Skills Integration**: Replaced synthetic skills with 4 official upstream suites:
  * **Emil Kowalski Motion Suite** (14 skills): `animate`, `animate-expo`, `emil-design-eng`, `apple-design`, `review-animations`, `break-ui`, `ask-sonner`, etc.
  * **Expo Official Suite** (25 skills): `expo-router`, `eas-workflows`, `expo-native-ui`, `expo-dom`, `expo-upgrade`, `expo-animation`, etc.
  * **Supabase Suite** (2 skills): `supabase`, `supabase-postgres-best-practices`.
  * **Vercel Labs Suite** (8 skills): `react-best-practices`, `react-view-transitions`, `composition-patterns`, `react-native-skills`, etc.
* **Skill Doctor Hardening**: Upgraded `scripts/skill-doctor.mjs` with YAML multiline folded/block scalar support.
* **CI Quality Gate**: Wired `node scripts/skill-doctor.mjs --strict` into `check:anti-slop` in `package.json`.
* **Audit Score**: **237/237 skills pass with 0 warnings and 0 errors**.
* **Upstream Sync Engine**: Created `scripts/sync-upstream-skills.mjs` (`pnpm run skill:sync`) to allow one-command reproducible pulls from upstream git remotes.

---

## 4. Supply-Chain Quarantine Architecture

To safeguard the monorepo against zero-day supply-chain attacks (malicious package injections, compromised credentials, or rapid point releases), pnpm v12's maturation policy is active:
* **Quarantine Period**: `minimumReleaseAge: 1440` (24-hour mandatory cooling-off period).
* **Controlled Waivers**: Verified platform infrastructure packages are explicitly exempted in `minimumReleaseAgeExclude`:
  * `pnpm`, `@pnpm/*`
  * `expo`, `expo-*`, `@expo/*`, `babel-preset-expo`, `jest-expo`
  * `react-native-reanimated`, `react-native-worklets`, `react-native-skia`
  * `@shopify/flash-list`, `ai`, `@ai-sdk/*`, `@tanstack/ai`, `effect`, `@effect/*`
* **Observability Tooling**: Developed `scripts/audit-quarantine.mjs` (`pnpm run audit:quarantine`). Queries npm registry timestamps and outputs human-readable countdown timers and exact unlock timestamps, eliminating confusion around quarantine errors.

---

## 5. Toolchain SSoT Synchronization

The Toolchain Single Source of Truth (`packageManager: pnpm@12.11.2`, `.nvmrc: 24.21.0`, `rust-toolchain.toml: 1.85.0`) is automatically propagated across all environments:
* **Synchronizer**: `scripts/sync-toolchain.mjs` updated to resolve `expectedTs` from `pnpm-workspace.yaml` `catalog.typescript` whenever `"typescript": "catalog:"` is declared in `package.json`.
* **Synchronized Targets**:
  * `.devcontainer/Dockerfile`
  * `.devcontainer/devcontainer.json`
  * `mise.toml`
  * `dagger.ts`
  * `scripts/setup-wsl-native.sh`
  * `scripts/check-shiny-tools.mjs`
  * `.github/ISSUE_TEMPLATE/security_advisory.yml`
* **Verification Command**: `pnpm run toolchain:check` confirms zero toolchain drift.

---

## 6. Verification & Evidence Ledger

| Tier | Test / Gate | Target / Engine | Result | Proven Guarantee |
| :--- | :--- | :--- | :--- | :--- |
| **G0** | `pnpm run toolchain:check` | Node, pnpm, TS, Bun, Turbo, Rust | ✅ Exit 0 | Zero toolchain drift across all configs and Dockerfiles. |
| **G0** | `node scripts/check-shiny-tools.mjs` | Rust 1.85.0 & 7 CLI tools | ✅ Exit 0 | Native Rust tools operational on host. |
| **G0** | `node scripts/skill-doctor.mjs --strict` | 237 Skill manifests | ✅ Exit 0 (0 warn, 0 err) | 100% valid YAML frontmatters, trigger keywords, and symlinks. |
| **G0** | `pnpm run check:version-drift` | Dependency manifests & AST | ✅ Exit 0 | Zero unannotated major lags; zero deprecated framework dialects. |
| **G1** | `pnpm run test:fast` | Vitest / `@repo/core` | ✅ 45 passed / 0 failed | Core domain contracts, security stores, and identity logic verified. |

---

## 7. Developer & Agent Runbook

| Operation | Command | Purpose |
| :--- | :--- | :--- |
| **Toolchain SSoT Check** | `pnpm run toolchain:check` | Verify zero drift across all environments. |
| **Toolchain Sync** | `pnpm run toolchain:sync` | Propagate toolchain updates to mise, Docker, and CI. |
| **Skill Doctor Audit** | `pnpm run skill:doctor` | Audit all 237 agent skills for valid frontmatters and links. |
| **Skill Auto-Healer** | `pnpm run skill:heal` | Automatically repair corrupted skill manifests. |
| **Upstream Skills Sync** | `pnpm run skill:sync` | Re-pull and diff canonical skills from official remotes. |
| **Catalog Migration** | `pnpm run catalog:migrate` | Audit or convert package dependencies to `"catalog:"`. |
| **Quarantine Audit** | `pnpm run audit:quarantine [pkg]` | Check 24h quarantine status and maturation countdown. |
| **Anti-Slop Quality Gate**| `pnpm run check:anti-slop` | CI gate combining aislop, fallow, version-drift, and skill doctor. |
