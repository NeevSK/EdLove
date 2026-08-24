---
title: "Dependency Update Guidance"
status: "active"
created: 2026-04-18
updated: 2026-04-18
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# Dependency Update Guidance

This document explains how we should upgrade external dependencies and shared workspace packages in the Gurudevi monorepo without turning every change into a full-stack migration.

## 1) How to think about the repo layers

Use this order when deciding whether a dependency change is safe:

1. Foundation/runtime
   - `expo`
   - `react`
   - `react-native`
   - `@expo/metro-runtime`
   - `@react-navigation/*`
   - `react-native-gesture-handler`
   - `react-native-reanimated`
   - `@shopify/react-native-skia`

2. Shared platform packages
   - `@repo/core`
   - `@repo/ui`
   - `@repo/database`
   - `@repo/graphics`
   - `@repo/analytics`

3. Feature packages
   - `@repo/classroom`
   - `@repo/community`
   - `@repo/profile`
   - `@repo/library`
   - `@repo/scanner-kit`
   - `@repo/self`
   - `@repo/ai`
   - `@repo/admin`
   - `@repo/people`
   - `@repo/form-builder`

4. Leaf or support packages
   - `@repo/payments`
   - `@repo/accounting`
   - `@repo/workforce`
   - `@repo/platform-mcp`
   - `@repo/types-shim`
   - `@repo/typescript-config`
   - `@repo/eslint-config`
   - `@intuitui-labs/lk-edu-geo`
   - `@repo/trube-art`

## 2) Production-ready updates

Use the production lane when all of these are true:

- The package is on a stable release line, not alpha or canary.
- The change stays within the same major version, or is a very intentional major upgrade with a clear migration path.
- The package is not a root dependency for `@repo/core` or `@repo/ui`, unless the upgrade is part of a wider foundation migration.
- All affected app targets still build:
  - `apps/gurudevi-mobile`
  - `apps/gurudevi-marketingWeb`
  - `apps/neevsk-web`
  - any package that re-exports or wraps the changed dependency

Recommended production flow:

1. Update the smallest leaf package first.
2. Run the repo checks for that package and its dependents.
3. Move one layer upward only after the lower layer is stable.
4. Touch `@repo/core` and `@repo/ui` last, not first.

## 3) Beta-ready updates

Use the beta lane when you want to test a future direction without claiming it as stable.

This lane is appropriate for:

- isolated leaf packages
- app-internal experiments
- web-only experimental work
- mobile feature branches that can be turned on or off with flags

This lane is not appropriate for:

- default `main` branch releases
- root foundation changes without a rollback plan
- canary-only React, Expo, or gluestack upgrades as the default app baseline

Beta-ready updates should be:

- branch isolated
- env gated
- easy to revert
- tested in one app surface first

## 4) Apps vs websites

Treat these as different upgrade surfaces:

- `apps/gurudevi-mobile`
  - Expo and React Native stack
  - native modules, EAS channels, mobile build constraints
  - highest sensitivity to runtime changes

- `apps/*` web sites
  - Astro, Svelte, and sometimes React
  - easier to move independently
  - can often accept faster UI-library or tooling changes than mobile

Guidance:

- Keep mobile runtime changes separate from web runtime changes.
- Do not assume a dependency that is safe for the web is also safe for Expo.
- If a package is shared by both, widen peer ranges carefully before upgrading the consuming apps.

## 5) Practical upgrade order

When we want a stable but modern stack, prefer this order:

1. Tooling packages
   - lint, type, formatting, test helpers
   - example: `typescript`, `eslint`, `@repo/eslint-config`

2. Leaf support packages
   - `@repo/workforce`
   - `@repo/accounting`
   - `@repo/payments`
   - `@repo/platform-mcp`

3. Shared utility packages
   - `@repo/analytics`
   - `@repo/graphics`
   - `@repo/library`
   - `@repo/scanner-kit`

4. Shared foundation packages
   - `@repo/core`
   - `@repo/ui`

5. App runtime packages
   - `expo`
   - `react`
   - `react-native`
   - `@expo/*`

## 6) Production guardrails

- Prefer stable dist-tags on `main`.
- Avoid pulling canary or alpha versions into the root baseline unless the whole migration is intentionally experimental.
- Keep peer ranges a little wider than the exact installed version when the package is shared across multiple apps.
- Update the lockfile in the same commit as the manifest change.
- Re-run the mobile app plus the affected web app builds after any shared dependency change.

## 7) Suggested baseline policy for this repo

- Stable baseline for mobile: Expo SDK 55, React Native 0.83.x, React 19.2.x, Reanimated 4.x, Skia 2.6.x, gluestack-ui 3.x, ZenStack stable 3.5.6.
- Beta baseline: isolated branch with explicit feature flags, preview EAS channel, and a locked dependency set.
- Watch list only: Expo 56, React Native 0.85, React 19.3 canary, gluestack v5 alpha, ZenStack canary.

## 8) What to do before a version bump

Check these questions first:

- Is this a leaf package or a foundation package?
- Does it affect mobile, web, or both?
- Does it change peer dependencies for `@repo/ui` or `@repo/core`?
- Is there a stable release line available?
- Do we have a rollback path?

If the answer touches mobile runtime or shared foundation packages, move slower and test more surfaces.
