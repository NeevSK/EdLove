---
title: "Expo 56 Support Guide"
status: "active"
created: 2026-06-10
updated: 2026-06-10
author: "Naween"
scribe: "Antigravity"
tags: [expo, expo-router, react-native, upgrade, routing]
---

# Expo 56 Support Guide

This guide is intentionally specific to the current Expo 56 upgrade in `gurudevi-mobile`.

It does **not** replace the reusable general dependency checklist. It only records the concrete issues, decisions, and follow-ups we care about right now.

## 1. What Expo 56 Specifically Tells Us

Expo 56 expects the app to align with the SDK 56 package line.

Packages that typically need attention in this repo:

- `@react-native-community/netinfo`
- `@react-native-community/slider`
- `expo-device`
- `expo-haptics`
- `expo-location`
- `react-native-gesture-handler`
- `react-native-reanimated`
- `react-native-safe-area-context`
- `react-native-screens`
- `react-native-svg`
- `react-native-worklets`
- `react`
- `react-dom`
- `react-native`
- `typescript`
- `@shopify/react-native-skia`

## 2. Current Repo Decisions

### Routing

- Current runtime: Expo Router 56 in `gurudevi-mobile`
- Expo Router file-based routes own navigation in the live app
- React Navigation APIs are only acceptable where Expo Router internally depends on them
- React Navigation v8: evaluation only if a future migration requires it

### Web strategy

- Web-specific screen variants stay in `.web.tsx` when a platform split is still useful
- Web shell chrome should live in Expo Router layout files such as `app/(tabs)/_layout.web.tsx`
- `expo-web-browser` stays the browser handoff primitive for auth/external flows

### Monorepo Metro strategy

- `resolver.disableHierarchicalLookup = true` stays enabled
- This is intentional for the monorepo resolver strategy
- Metro warnings about this setting should be documented, not blindly “fixed”

### Splash

- Legacy top-level `splash` was removed from `app.json`
- Modern splash config should use the `expo-splash-screen` config plugin

## 3. TypeScript 6.0 Notes

We moved the workspace toward TypeScript 6.0 because Expo 56 expects it on the current compatibility line.

Important changes from the official TypeScript 6.0 release notes:

- `strict` now defaults to `true`
- `module` now defaults to `esnext`
- `target` now defaults to the current-year ECMAScript target
- `noUncheckedSideEffectImports` now defaults to `true`
- `libReplacement` now defaults to `false`
- `types` now defaults to an empty list unless explicitly set
- `rootDir` now defaults to `.`
- `moduleResolution: classic` is removed
- `esModuleInterop` and `allowSyntheticDefaultImports` can no longer be set to `false`
- `moduleResolution: node` / `node10` is deprecated
- `target: es5` is deprecated
- `downlevelIteration` is deprecated

What that means for this repo:

- we should explicitly list the types packages we need
- we should watch for path/output changes in emitted builds
- we should expect some editor or build differences when moving from TS 5.9 to TS 6
- we should be careful with packages that assume older TS defaults

Reference:

- [TypeScript 6.0 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html)

## 4. Current Upgrade Status

### Done

- Expo SDK bumped to 56 in the mobile app
- Expo Router is the live mobile app architecture
- Route guards and shell chrome now live in Expo Router layouts
- Docs need to stay aligned with the file-based route tree, not the old navigator mental model
- Legacy `splash` key removed from `app.json`

### Still Worth Watching

- Duplicate native module installs in the workspace
- Stale pins in shared packages such as `packages/core` and `packages/graphics`
- Expo Doctor warnings that are either intentional or need cleanup

## 5. How Renovate Fits In

Renovate is the preferred “see what changed” layer for dependency updates.

Recommended strategy:

- Keep Renovate enabled for visibility
- Do not auto-merge foundation updates
- Group runtime updates separately from tooling updates
- Review all framework upgrades manually

### Suggested groups

- Expo / React / React Native / React Navigation
- Native runtime helpers
- Tooling and build system packages
- Patch and minor updates that are clearly safe

## 6. Installing Renovate

### Option A: GitHub App

This is the easiest path if you want Renovate to manage this repository on GitHub.

Steps:

1. Install the Mend Renovate GitHub App on the organization or repository
2. Select the repositories Renovate should watch
3. Let Renovate open its onboarding PR
4. Merge the onboarding PR only after reviewing the proposed config
5. Use a repo-level `renovate.json` or `renovate.json5` to control grouping and update policy

Why this works well:

- no custom server to run
- easy to review onboarding
- good default for teams that just want dependency visibility

### Option B: Self-hosted Renovate

Use this only if you want full control over runtime, auth, or scheduling.

Typical setup:

- run Renovate as a bot user or container
- provide a GitHub token
- configure onboarding and repository access
- keep the bot updated

This is more work, but gives you the most control.

### Option C: Dependabot

This is the simpler alternative if you want a built-in GitHub solution with less customization.

Tradeoff:

- easier to start
- less flexible grouping and update policy than Renovate

For this repo, Renovate is usually the better fit because we want:

- grouped updates
- manual review for framework changes
- visibility into monorepo package drift

## 7. What To Carry Forward

- Keep the reusable general checklist separate
- Use this guide only for Expo 56-specific context and the TS 6 transition
- Keep Renovate enabled for visibility, but review framework PRs manually
- Keep `disableHierarchicalLookup = true` documented as an intentional monorepo choice
- Keep the splash config on `expo-splash-screen`, not the legacy top-level `splash` key
- Keep Expo Router as the current runtime unless the team explicitly approves a routing change
- Use `router.push` / `router.replace` and route-group layouts for new navigation work
