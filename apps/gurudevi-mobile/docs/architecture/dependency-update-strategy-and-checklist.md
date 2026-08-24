---
title: "Dependency Update Strategy and Checklist"
status: "active"
created: 2026-05-25
updated: 2026-05-25
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# Dependency Update Strategy and Checklist

Use this document when planning SDK upgrades, runtime upgrades, or dependency refreshes in `gurudevi-mobile`.

## Purpose

- Keep the app on a known-good baseline
- Avoid blind upgrades
- Separate intentional architecture choices from accidental dependency drift
- Make Renovate produce useful signals instead of noisy churn

## Renovate Strategy

Use Renovate as an informational tool, not an auto-merge machine.

Recommended strategy:

- Keep Renovate enabled for visibility into new releases
- Do not auto-merge foundation upgrades
- Group safe patch and minor updates separately
- Keep core runtime updates in one dedicated group:
  - `expo`
  - `react`
  - `react-native`
  - `@react-navigation/*`
- Keep native runtime helpers in a separate group:
  - `expo-*`
  - `react-native-*`
  - `@react-native-community/*`
  - `@shopify/react-native-skia`
- Keep tooling separate from runtime:
  - TypeScript
  - linting
  - testing
  - build tooling
- Let Renovate open PRs, but review them manually before merging

## What To Watch

- Expo SDK changes
- React / React Native changes
- React Navigation changes
- Metro / bundler changes
- native module duplication
- shared package pins in the monorepo
- stale docs and old architecture assumptions

## Upgrade Checklist

### 1. Decide the upgrade type

- [ ] Is this a patch, minor, major, or framework migration?
- [ ] Is the target stable, preview, or alpha?
- [ ] Is the upgrade runtime-only, tooling-only, or architecture-changing?

### 2. Check the current architecture

- [ ] Confirm the routing model
- [ ] Confirm web/mobile split behavior
- [ ] Confirm monorepo Metro behavior
- [ ] Confirm any intentional warnings that should remain

### 3. Update manifests

- [ ] Root `package.json`
- [ ] App `package.json`
- [ ] Shared package `package.json` files
- [ ] `app.json` / `app.config.*`
- [ ] `metro.config.js`
- [ ] `babel.config.js`

### 4. Align versions

- [ ] Match Expo SDK companion packages
- [ ] Remove obsolete pins
- [ ] Avoid duplicate native module versions
- [ ] Keep shared workspace packages on the same runtime line

### 5. Verify

- [ ] Run `pnpm install`
- [ ] Run `npx expo-doctor`
- [ ] Run a native smoke test
- [ ] Run a web smoke test

### 6. Document

- [ ] Update live docs
- [ ] Note intentional exceptions
- [ ] Leave historical docs alone unless they mislead current work

### 7. Finish

- [ ] The app works on the target platforms
- [ ] Remaining warnings are understood
- [ ] The upgrade is either clean or intentionally accepted with documentation

## Current Notes For This Repo

- Expo Router is not the app architecture
- React Navigation v7 is the current runtime
- React Navigation v8 is under evaluation
- `resolver.disableHierarchicalLookup = true` is intentional for the monorepo resolver strategy
- `expo-splash-screen` is the modern splash approach; the legacy top-level `splash` config should not be used

