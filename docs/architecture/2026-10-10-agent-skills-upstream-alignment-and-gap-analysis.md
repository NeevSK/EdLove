---
title: "Agent Skills Upstream Alignment & Gap Analysis"
status: "active"
created: 2026-10-10
updated: 2026-10-10
author: "Polymath Platform Architecture"
tags: [agent-skills, pnpm-12, upstream-alignment, gap-analysis, quality]
---

# Agent Skills Upstream Alignment & Gap Analysis

## 1. Executive Summary

Historically, AI agent skills across many repositories were manually authored or "hand-waved"—synthesizing high-level best practices into static Markdown files. While useful as initial scaffolding, hand-waved skills suffer from:
1. **API Drift & Stale Signatures:** Falling behind fast-moving releases (Expo SDK 58, React 19, Reanimated 4, Next.js 16).
2. **Missing Real-World Edge Cases:** Lacking the deep recipes, failure catalogs, and boundary checks that library authors possess.
3. **Redundant Maintenance Burden:** Duplicating documentation that official maintainers now maintain and publish upstream.

With the release of **`pnpm 12.11`** and the standardization of **`skills.sh` / `SKILL.md`**, agent skills are now first-class distributed software artifacts. This document inventories every skill in the Polymath Platform, details the gaps discovered between our hand-waved implementations and canonical upstreams, and establishes the permanent upstream synchronization protocol.

---

## 2. Upstream Canonical Sources & Inventory

All upstream skills are now sourced directly from authenticated, official creator repositories:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    OFFICIAL UPSTREAM SOURCE REPOSITORIES                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. emilkowalski/skills (GitHub: Emil Kowalski)                             │
│    • 14 official motion, physics, design engineering & testing skills.      │
│ 2. expo/skills (GitHub: Expo Core Team)                                    │
│    • 25 official Expo SDK 58, EAS workflows, router, DOM, & native UI skills│
│ 3. supabase/agent-skills (GitHub: Supabase Core Team)                       │
│    • 2 official CLI, schema, security & Postgres best-practice skills.     │
│ 4. vercel-labs/agent-skills (GitHub: Vercel Labs)                           │
│    • 8 official React 19, composition patterns, view transitions, & web.    │
│ 5. pnpm 12.11 Linked Dependencies (NPM Package Tarballs)                   │
│    • @swmansion/argent (18 native mobile tools)                            │
│    • @tanstack/ai & @tanstack/react-table (4 skills)                        │
│    • expo-sqlite, fallow, react-native-nitro-google-signin                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Hand-Waved vs. Upstream Canonical: Comprehensive Gap Analysis

| Domain | Prior Hand-Waved Skill | Canonical Upstream Sourced | Discovered Gaps & Enhancements in Upstream |
| :--- | :--- | :--- | :--- |
| **Animation & Motion** | `emil-animation` (synthetic single file) | **`emilkowalski/skills`** (14 skills: `animate-expo`, `emil-design-eng`, `animate`, `review-animations`, `apple-design`, `ask-sonner`, `improve-animations`, `find-animation-opportunities`, etc.) | **Massive Gap:** Upstream provides exact spring presets (`RECIPES.md`), Gesture velocity handoff, FLIP layout projection math, and dedicated Expo Reanimated 4 recipes vs. generic advice. |
| **Expo & Native Architecture** | `expo-rn-expert` (single 250-line file) | **`expo/skills`** (25 skills: `expo-router`, `eas-workflows`, `expo-native-ui`, `expo-dom`, `expo-dev-client`, `expo-upgrade`, `expo-animation`, `eas-update`, etc.) | **Massive Gap:** Upstream is split into 25 targeted execution skills authored by Expo staff, covering EAS App Store submission, DOM components, TurboModules, config plugins, and OTA update insights. |
| **Supabase & Backend** | `supabase` & `supabase-expert` (generic hand-rolled advice) | **`supabase/agent-skills`** (`supabase` + `supabase-postgres-best-practices`) | **Significant Gap:** Upstream contains a 14 KB authoritative guide, deep asset references, real Postgres index optimization rules, connection pooling heuristics, and RLS bypass prevention. |
| **React 19 & Web Architecture** | Generic coding patterns in instructions | **`vercel-labs/agent-skills`** (`react-best-practices`, `react-view-transitions`, `composition-patterns`, `web-design-guidelines`) | **Critical Gap:** Upstream encodes Vercel's official React 19 concurrent boundaries, Server Action cache strategies, view transitions API, and state composition rules. |
| **Native Device Automation** | `agent-device-control` (basic wrapper) | **`@swmansion/argent`** (18 native skills linked via pnpm 12.11) | **Resolved:** Direct JSI debugger, native profiling with Perfetto/xctrace, Argent Lens visual variants, and automated QA YAML flow replays. |
| **Table & Data Grids** | Hand-crafted TanStack guidance | **`@tanstack/react-table`** (3 skills linked via pnpm 12.11) | **Resolved:** Table v9 reactive state ownership, Query & Virtual integration, and exact v8 $\rightarrow$ v9 migration guides directly from Tanner Linsley. |

---

## 4. Sovereign In-Repo Skills (Retained & Protected)

Not all skills should or can be upstreamed. The following skills embody **sovereign internal platform contracts** unique to the Polymath Platform and are strictly preserved:

1. **`branded-ui`**: Enforces Gurudevi design tokens, `BrandPulse`, atmosphere floors, and brand typography.
2. **`gurudevi-quality-gate`**: Enforces sacred native pins, blast-radius classifications, and monotonic code contracts.
3. **`resilient-crawler-pipeline`**: Internal SQLite WAL crawler architecture and cascading mirror resolvers.
4. **`storage-efficiency`**: Monorepo cross-layer data schema optimization across Postgres, ZenStack, and PowerSync.
5. **`skill-doctor`**: Fast in-repo diagnostic script (`scripts/skill-doctor.mjs`) ensuring zero frontmatter or link corruption across all 237 skills.

---

## 5. Verification & Health Audit

Following the upstream alignment, the entire skill corpus was verified via `pnpm run skill:doctor`:

```text
🩺 Sovereign Skill Doctor — Agent Skill Health & Integrity Audit
📌 Mode: AUDIT
=================================================================
📊 Audit Results:
   Total Skills Inspected : 237
   Healthy Skills         : 237 (100%)
   Warnings               : 5 (minor description brevity)
   Errors                 : 0
✨ All skill manifests, frontmatters, and links are healthy!
```

---

## 6. Upstream Maintenance Protocol

To ensure zero drift going forward:
1. **NPM Dependencies:** Whenever dependencies are updated via `pnpm run deps:upgrade`, run `pnpm approve --all` to immediately refresh linked vendor skills.
2. **Git Upstreams:** Periodically update external git skills via `npx skills update`.
3. **CI Gate:** Run `pnpm run skill:doctor --strict` in CI to fail any PR introducing malformed or broken skill manifests.
