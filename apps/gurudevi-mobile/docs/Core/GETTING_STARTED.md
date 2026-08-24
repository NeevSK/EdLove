---
title: "Gurudevi Getting Started Guide"
status: "active"
created: 2026-02-11
updated: 2026-08-24
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile, onboarding]
---

# Gurudevi: Getting Started Guide

**Purpose**: A structured path for developers and AI agents to start building Gurudevi.
**Reading time**: ~20 minutes for the core path.

---

## What is Gurudevi?

**Gurudevi** ("Divine Teacher") is a mobile-first school platform for Sri Lankan
educators that embodies sanctuary aesthetics.

- **Primary users**: Teachers (heavy lifters)
- **Supporting users**: Principals (supportive role), Students (minimal in early versions)
- **Core value**: Mobile-first, data-conscious, offline-first, trilingual (Sinhala/Tamil/English)
- **Platform**: Expo SDK 57 / React Native 0.86 (New Architecture) with a full
  React Native Web target

### The lotus philosophy

The lotus metaphor guides design decisions:

| Stage | Meaning | Design implication |
|---|---|---|
| Rooted in mud | Difficult conditions | Build for low-end devices; work offline |
| Rising through water | Gradual growth | Support organic progress; celebrate small wins |
| Blooming above water | Clarity achieved | Calm, focused interfaces — no clutter |

---

## 30-minute onboarding path

1. **Repo layout & guardrails** — root [`AGENTS.md`](../../../../AGENTS.md)
   (critical rules, sacred versions, native-config contract).
2. **This app's README** — [`../../README.md`](../../README.md)
   (stack, commands, architecture table).
3. **Documentation SOP** — [`../docs-sop.md`](../docs-sop.md)
   (frontmatter contract, doc tiers — every `.md` must comply).
4. **Vault index** — [`../INDEX.md`](../INDEX.md) (navigation hub).
5. **Build runbook** — [`../Learning/EXPO_BUILD_RUNBOOK.md`](../Learning/EXPO_BUILD_RUNBOOK.md).

---

## Development practices

- **Library first**: logic belongs in `packages/*`, not the app, when it is reusable.
- **UI via `@repo/ui`**: never import gluestack primitives directly.
- **Data**: PowerSync offline-first, Drizzle ORM, ZenStack v3 policies,
  sovereign Hono API in `@repo/core`.
- **Verification**: `pnpm --filter gurudevi-mobile check-types && pnpm --filter gurudevi-mobile test`
  after logic changes.
- **Docs**: follow the SOP when creating or editing any markdown file.

## Quick checklists

Before committing:

- [ ] Types check clean (`tsc --build`)
- [ ] Tests pass (`vitest run`)
- [ ] No `console.log` left behind
- [ ] Accessibility attributes on interactive elements
- [ ] Docs updated if structure/behavior changed (with frontmatter)

Before pushing (enforced by husky sovereign gate):

- [ ] Lint clean (Biome + ESLint)
- [ ] react-doctor clean
