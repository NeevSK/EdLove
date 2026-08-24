---
title: "Dependency Upgrade Checklist"
status: "active"
created: 2026-05-25
updated: 2026-06-10
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# Dependency Upgrade Checklist

Use this checklist for Expo, React Native, React Navigation, or any other foundation-level upgrade in `gurudevi-mobile`.

## 1. Decide The Upgrade Mode

- [ ] Confirm the target version is stable, preview, or alpha
- [ ] Decide whether the upgrade is a routine bump or a deliberate migration
- [ ] Identify whether the app runtime, web shell, or shared packages are in scope
- [ ] Decide whether the upgrade should preserve the current architecture or change it

## 2. Inventory The Surface Area

- [ ] Find all direct dependency pins in root `package.json`
- [ ] Find all direct dependency pins in app/package `package.json` files
- [ ] Check `pnpm.overrides` for old version locks that would fight the upgrade
- [ ] Check `app.json` or `app.config.*` for plugins that need to change
- [ ] Check `metro.config.*`, `babel.config.*`, and platform shims for version-sensitive behavior
- [ ] Decide which Metro warnings are intentional for the monorepo and document them
- [ ] Search docs for stale references to the old stack

## 3. Upgrade The Core Packages

- [ ] Upgrade the primary framework package first
- [ ] Upgrade the companion runtime packages required by that framework
- [ ] Run the package manager install and resolve any version mismatches
- [ ] Regenerate the lockfile
- [ ] Remove direct dependency pins that no longer belong

## 4. Reconcile Architecture Decisions

- [ ] Confirm the routing model is still the intended one
- [ ] Confirm web behavior still matches the product goal
- [ ] Confirm any nested layouts or responsive shells still work with the chosen router
- [ ] Confirm any external browser/auth flows still use the intended browser primitive
- [ ] Confirm platform-specific screen variants still resolve correctly

## 5. Verify Runtime Compatibility

- [ ] Run Expo doctor or the equivalent health check
- [ ] Start the app on native
- [ ] Start the app on web
- [ ] Check for blank screens, import errors, or missing peer dependency warnings that matter
- [ ] Verify deep links, auth flows, and navigation guards
- [ ] Verify media, camera, audio, storage, and any native-only integrations

## 6. Clean Up Stale References

- [ ] Update live docs to match the new architecture
- [ ] Leave historical docs alone unless they actively mislead current work
- [ ] Remove obsolete plugins, shims, or comments
- [ ] Update upgrade notes and runbooks
- [ ] Record anything intentionally deferred

## 7. Decide What Is Done

- [ ] The app builds
- [ ] The app runs on the target platforms
- [ ] The intended architecture is preserved
- [ ] The docs match the actual runtime
- [ ] The remaining warnings are understood and acceptable

## Applied Example: Expo 56 + React Navigation v7

### Upgrade mode

- [x] Stable package line confirmed for Expo 56
- [x] This was a routine framework upgrade, not a routing migration
- [x] The app runtime now uses Expo Router
- [x] React Navigation is only used where Expo Router internally depends on it or for compatibility code

### Surface area

- [x] Root `package.json` updated
- [x] `apps/gurudevi-mobile/package.json` updated
- [x] `apps/gurudevi-mobile/app.json` cleaned up
- [x] Legacy `splash` config removed from `app.json`
- [x] `packages/ui/package.json` no longer references Expo Router
- [x] Stale Expo Router plugin references removed from the mobile app

### Core packages

- [x] Expo and Expo companion packages were bumped to Expo 56-compatible versions
- [x] Lockfile was regenerated
- [ ] A final full workspace install / runtime smoke test is still worth doing if you want extra confidence

### Architecture decisions

- [x] Expo Router remains the routing layer
- [x] Nested layouts continue to be handled with Expo Router + `.web.tsx`
- [x] `expo-web-browser` remains the browser handoff primitive
- [x] `resolver.disableHierarchicalLookup = true` is intentional for the monorepo resolver strategy

### Runtime compatibility

- [ ] Run `npx expo-doctor`
- [ ] Run a native start/build smoke test
- [ ] Run a web start/build smoke test
- [ ] Confirm there are no breaking peer warnings that affect the app
- [ ] Confirm the remaining Expo doctor warnings are either fixed or explicitly accepted

### Docs cleanup

- [x] Updated live docs to reflect the new architecture
- [x] Left historical docs in place
- [x] Clarified Expo Router now, React Navigation only where needed

### Status

- **Core upgrade work:** done
- **Architecture alignment:** done
- **Docs alignment:** done
- **Verification follow-up:** still recommended
