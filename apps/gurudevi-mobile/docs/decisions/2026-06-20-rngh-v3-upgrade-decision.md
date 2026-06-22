---
title: "React Native Gesture Handler v3 Upgrade Decision"
status: "active"
created: 2026-06-20
updated: 2026-06-20
author: "Naveen"
scribe: "Cascade"
tags: [dependencies, rngh, upgrade, architecture-decision]
---

# ADR: React Native Gesture Handler v3 Upgrade Decision

## Status
**Decision:** DEFER upgrade to react-native-gesture-handler v3

## Context
React Native Gesture Handler (RNGH) v3.0.0 was recently released as a stable version with significant architectural changes including a new hook-based API, deeper Reanimated integration, and New Architecture optimization. Given RNGH's foundational role in the gesture system, this decision evaluates the feasibility and timing of upgrading from the current version (2.31.1) to v3.

## Current State Analysis

### Current Versions
- **RNGH:** 2.31.1 (gurudevi-mobile, @repo/graphics, @repo/library)
- **React Native:** ~0.85.3 (gurudevi-mobile), ~0.83.6 (root override)
- **React Native Reanimated:** 4.3.1
- **Expo SDK:** 56

### Dependency Scope
Packages depending on RNGH in the workspace:
- `gurudevi-mobile` (dependencies)
- `@repo/graphics` (dependencies, devDependencies, peerDependencies)
- `@repo/library` (dependencies, peerDependencies)

## RNGH v3 Compatibility Assessment

### ✅ Compatible Components
- **React Native:** Minimum required 0.82+, current 0.85.3 ✅
- **Reanimated:** v4.3.1 compatible with RNGH v3's deeper integration
- **New Architecture:** Required by RNGH v3, available with RN 0.85+

### ⚠️ Breaking Changes

#### 1. API Migration Required
- Builder pattern replaced with hook-based API
- `Gesture.Pan()` → `usePanGesture()`
- `Gesture.Tap()` → `useTapGesture()`
- All gesture types require complete rewrite

#### 2. Callback Renaming
- `onStart` → `onActivate`
- `onEnd` → `onDeactivate`
- `onTouchesCancelled` → `onTouchesCancel`

#### 3. Removed Functionality
- `onChange` callback removed (integrated into `onUpdate`)
- `state` and `oldState` properties removed from event objects
- `ForceTouch` gesture unavailable in hook API
- `PureNativeButton` component removed
- `createNativeWrapper` removed

#### 4. Event Handling Changes
- `success` parameter replaced with `event.canceled` (inverted logic)
- StateManager no longer passed to callbacks (use global `GestureStateManager`)

### ⚠️ Third-Party Compatibility Risks
- `@swmansion/react-native-bottom-sheet` (v0.14.1) - RNGH v3 compatibility unknown
- `react-native-drawer-layout` - Dependency compatibility unverified
- Expo SDK 56 - Official RNGH v3 support status unclear

## Decision Rationale

### Reasons to Defer

1. **Significant Migration Effort**
   - Complete rewrite of all gesture implementations required
   - High risk of introducing bugs in core interaction patterns
   - Extensive testing needed across navigation, bottom sheets, and gesture-driven components

2. **Ecosystem Maturity**
   - Third-party libraries (bottom sheets, drawers) may not support RNGH v3 yet
   - Community adoption and stability reports limited
   - Potential for breaking changes in dependent packages

3. **Expo SDK Compatibility Uncertainty**
   - Expo SDK 56 RNGH v3 support not fully verified
   - Risk of conflicts with Expo's bundled dependencies
   - Potential need for Expo SDK upgrade

4. **Foundational Risk**
   - RNGH is core to navigation and interaction stack
   - Failure would impact critical user-facing features
   - Current version (2.31.1) is stable and well-supported

5. **Limited Immediate Benefits**
   - Current stack meets performance requirements
   - New Architecture benefits already available via RN 0.85+
   - Hook-based API doesn't provide critical functionality gaps

## Alternatives Considered

### Option 1: Upgrade Immediately
**Rejected** - High risk, significant migration effort, ecosystem uncertainty

### Option 2: Upgrade in Isolated Branch
**Rejected** - Still requires full migration effort; better to wait for ecosystem maturity

### Option 3: Wait for Ecosystem Maturity
**Selected** - Monitor third-party library updates, community adoption, and Expo SDK support

## Action Plan

### Short Term (Current)
- **Maintain RNGH 2.31.1** - Stable, supported, meets requirements
- **Monitor ecosystem** - Track RNGH v3 adoption and third-party library updates
- **Watch Expo SDK** - Monitor official RNGH v3 support in future SDK versions

### Medium Term (3-6 months)
- **Re-evaluate** when:
  - Major third-party libraries (bottom sheets, drawers) support RNGH v3
  - Expo SDK officially supports RNGH v3
  - Community stability reports are positive
  - Clear migration path and tooling available

### Long Term (6-12 months)
- **Plan migration** when ecosystem mature
- **Create migration branch** for comprehensive testing
- **Update dependencies** across all packages
- **Migrate gesture implementations** to hook-based API
- **Extensive testing** across all gesture-driven features

## Success Criteria for Future Upgrade

1. **Ecosystem Readiness**
   - Third-party libraries support RNGH v3
   - Expo SDK official support confirmed
   - Community stability reports positive

2. **Migration Preparedness**
   - Clear migration guide and tooling available
   - Automated migration tools if possible
   - Comprehensive test coverage for gesture features

3. **Resource Availability**
   - Dedicated time for migration and testing
   - Rollback plan prepared
   - Team training on new API if needed

## References

- RNGH v3 Release: https://github.com/software-mansion/react-native-gesture-handler/releases/tag/v3.0.0
- Migration Guide: https://docs.swmansion.com/react-native-gesture-handler/docs/guides/upgrading-to-3/
- Installation Docs: https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation/
- Reanimated Compatibility: https://docs.swmansion.com/react-native-reanimated/docs/guides/compatibility/

---

**Next Review Date:** 2026-09-20 (3 months)
**Review Cadence:** Quarterly until upgrade decision confirmed
