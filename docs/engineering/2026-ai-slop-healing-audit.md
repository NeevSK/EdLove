---
title: "AI-Slop Healing — Architecture Audit & Gap Map"
status: "active"
created: 2026-08-24
updated: 2026-08-24
author: "Naveen"
scribe: "opencode"
tags: [quality, anti-slop, tooling, audit, ai-agents]
---

# AI-Slop Healing — Architecture Audit & Gap Map

> **Point-in-time audit** (2026-08-24). Companion operating procedure:
> [`ai-slop-healing-sop.md`](./ai-slop-healing-sop.md). Companion register of
> banned patterns: [`slop-register.md`](./slop-register.md).

## 1. Purpose

Polymath is a heavy AI-assisted codebase. The goal of this workstream is to
make the anti-slop posture *preventive* (stop slop at generation time) and
*remediating* (heal safely after the fact), without stacking redundant tools
that duplicate what the repo already enforces.

This audit records exactly what exists, what the AI-slop literature names, and
which gaps are real for this repository — as evidence, not aspiration.

## 2. Stack facts (verified 2026-08-24)

| Concern | Value | Source |
| --- | --- | --- |
| Node | 22.23.2 (`.nvmrc`, manages 24.11.0 locally) | `.nvmrc`, root `package.json` |
| pnpm | 11.21.0 | root `package.json` `packageManager` |
| TypeScript (sacred) | 7.0.2 | `AGENTS.md` |
| Expo / React Native | ~57.0.12 / ~0.86.0 | root + `gurudevi-mobile` |
| Rust toolchain | **not installed** (`cargo`/`rustc` unavailable) | shell probe 2026-08-24 |
| `aislop` (npm) | **0.14.1** available | `npm view aislop` |
| `fallow` (npm) | **3.17.0** available | `npm view fallow` |
| `dupehound` | Rust crate only (needs `cargo`) — **not on npm** | `npm view dupehound` returns nothing |

## 3. Current-state inventory (what already guards this repo)

### 3.1 Detectors (post-hoc, by layer)

| Layer | Tool | Config / command | Status |
| --- | --- | --- | --- |
| Baseline lint | Oxlint | `.oxlintrc.json` · `pnpm lint:oxlint` | ✅ in pre-commit + CI |
| Deep lint | ESLint 10 + typescript-eslint + react-native + expo + sonarjs + import | `packages/eslint-config/` · `pnpm lint:eslint` | ✅ in pre-commit + CI |
| Formatter | Biome (linter disabled) | `biome.json` · `pnpm format` | ✅ in pre-commit |
| React/RN anti-pattern | React Doctor | `pnpm audit:react-doctor` | ✅ `quality-gate.yml` |
| Architecture boundaries | dependency-cruiser | `.dependency-cruiser.cjs` · `check:architecture/cycles/unused` | ⚠️ in `check-all`, not all CI |
| Dead code/imports | depcruise `no-orphans` + Knip | `check:unused` · `knip.json` | ⚠️ in `check-all` |
| Block-level duplication | `jscpd` v5 (Rust) | `pnpm audit:duplication` | ✅ wired |
| Cognitive complexity | `eslint-plugin-sonarjs` (threshold ≤15) | enabled | ✅ |
| Secrets | gitleaks · snyk · semgrep | `pnpm audit:secrets` / `audit:security` | ✅ |
| Bundle | size-limit, bundle-visualizer, Expo Atlas | `audit:bundle`, `audit:size` | ✅ |
| i18n, consumer, observability, feature lands | many `scripts/audit-*.mjs` | `pnpm i18n:check`, etc. | ✅ |

### 3.2 Proactive (generation-time) governance

- `AGENTS.md` — **Anti-Slop Rules** (9 banned patterns) + verification discipline.
- `.agents/skills/gurudevi-quality-gate` — blast-radius zones (RED/AMBER/GREEN),
  DRY mandate + utility map, feature-spec contract, complexity budget.
- `.agents/skills/expo-rn-expert` — Expo 57 sacred pins, New-Architectures
  discipline, FlashList/Reanimated rules.
- Docs-SOP (`.workspace-documentation` skill) forces YAML frontmatter + dual
  naming, preventing doc-slop.
- `docs/stack-map/landscape/` — generated; external deps carry overlap/floating
  verdicts so new tools are checked against what exists.

### 3.3 What the literature asks that this repo **already covers**

| Proposed tool gap | Verdict |
| --- | --- |
| "slop-register" | ✅ Now added as `docs/engineering/slop-register.md` (this pass) |
| "dupehound" semantic dup | ⚠️ Covered structurally by `jscpd` (block) + `fallow` (semantic, this pass) — dupehound itself not installable without Rust |
| "aislok" narrative/TOOO/swallow/escape scan | ❌ Gap — closed this pass with `aislop` |
| healing loop (scan → feed back → safe-fix) | ⚠️ Partially: `heal-*.ps1`, `ts-fix.mjs`, AI-review skills exist; no agent-facing "run before finish" gate | Closed this pass |
| `jscpd` MCP (pre-generation) | ⚠️ Planned in `gurudevi-quality-constellation-*` (P1), not yet wired | Wire into `platform-mcp` this pass |

## 4. Gap map (genuine deltas for this repo)

| # | Gap | Evidence | Resolution in this pass |
| --- | --- | --- | --- |
| G1 | No narrative-comment / TODO-stub / swallowed-exception / unsafe `as-any` **scan** | `aislok` detected patterns not in Oxlint/ESLint | Install `aislop@0.14.1`, add `audit:aislop`; safe-fix `heal:aislop --safe` for non-behavioral classes |
| G2 | No semantic (renamed-variant) duplicate detector | `jscpd` finds block clones only; the "variational duplication" disease is explicitly named in the repo | Use **`fallow@3.17.0`** `find duplicates` (quality/risk/dup/architecture); add `audit:fallow`. Rationale: dupehound is Rust-only (no `cargo` here); fallow is an npm CLI and covers both duplication + dead-code + complexity, so it does not duplicate `jscpd`/directory cruiser. |
| G3 | No pre-generation duplication/quality query for agents | jscpd v5 MCP exists but not wired | Wire `jscpd-mcp` + register in MCP infra |
| G4 | Healing loop not explicit in agent exit criteria | AGENTS.md lacks "run audits before finishing" | Add an "Exit gate" subsection to `AGENTS.md` |
| G5 | `aislop` scan has no CI gate | — | Add anti-slop step to `quality-gate.yml`; lean step to `pr-guard.yml` (note 2f) |

## 5. Environment / dependency alignment note

- **Rust toolchain absent**: any future Rust-native tooling (`dupekeeper`, `fallow`-native, `jscpd` via cargo) is gated on installing Rust on-device or on CI. This pass intentionally uses npm-distributed CLIs to avoid adding a toolchain requirement.
- Neo four tools (`aislok`, `fallow`) are **root devDependencies only**; they do not touch Expo/React Native, sacred pins, or native config. `packages/gurudevi-mobile/app.json` is untouched.
- Versions verified as of today; both tools ship MCP servers (`aislok-tools`, `fallow-mcp`) that can be wired later without changing the CLI integration.

## 5. Acceptance for this pass

- `pnpm audit:aislop` exits (documents findings, non-fatal baseline resold as a gate later).
- `pnpm audit:fallow` runs over `src/` of the mobile + core packages with an ignore list matching `node_modules`, `dist`, `.expo`, `android/`, `ios/`.
- `AGENTS.md` gains an Exit-gate section referencing both audits.
- CI gate added to `quality-gate.yml` for anti-slop; fetch only new blockers.

See [`ai-slop-healing-sop.md`](./ai-slop-healing-sop.md) for thresholds and safe-fix policy.

## 6. Baseline scores (established 2026-08-24)

| Metric | Value | Source |
| --- | --- | --- |
| `aislop` score | **28 / 100** | `pnpm exec aislop scan --changes` |
| AI-slop indicators | 148 (all `warn`) | aislop output |
| Confirmed defects | 34 | aislop output |
| Fixable issues | 26 | aislop output |
| `fallow` dead-code issues | 656 | `pnpm exec fallow audit` |
| `fallow` complexity findings | 1 366 (1 371 inherited) | fallow output |
| `fallow` clone groups | 868 | fallow output |
| `fallow` CSS class typos | 77 candidates | `fallow review --brief` |
| CI gate status | **non-blocking** (`continue-on-error: true`) | `quality-gate.yml` + `pr-guard.yml` |
| `failBelow` (aislop CI) | 10 | `.aislop/config.yml` |

Raise `failBelow` incrementally as legacy slop is burned down. Target: ≥50 before making the gate blocking.