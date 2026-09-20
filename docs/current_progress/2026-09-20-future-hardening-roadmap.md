---
title: "Future Hardening & Production Ratchet Roadmap (TODOs & Follow-ups)"
status: "active"
created: 2026-09-20
updated: 2026-09-20
author: "Naveen"
scribe: "Codex"
tags: [roadmap, todo, production-hardening, ratchet, future-work]
---

# Future Hardening & Production Ratchet Roadmap

> **Definitive Tracking of Follow-Up Tasks, Next Ratchet Phases, and G4/G5 Verification Goals**

---

## 1. Summary of What is Done (Baseline Completed)

- [x] **OWASP 2026 Threat Defense**: Deep link sanitization, 8192-char length cap, traversal rejection, and forbidden character filtering.
- [x] **Anti-Replay CSRF Guard**: Cryptographic 32-char hex state tokens with 15-min TTL and single-use validation (`DeepLinkStateGuard`).
- [x] **Canonical Route Topology**: Centralized `routeManifest.ts` without `/app/` prefixes across mobile and web.
- [x] **Zero-Legacy Hexagonal Supabase Decoupling**: 100% elimination of direct client imports in UI hooks and payments via `UIExperienceRepository` and `PaymentsRepository`.
- [x] **J2/J3 Offline Mutation Pipeline Strict Modern Contract**: Enforced mandatory `mutationKey`, `scope`, and `mutationType` across `useSafeMutation` and migrated all 14 callers in `@repo/self`, `@repo/classroom`, and `@repo/community`. Hardened with multi-tenant outbox partitioning (`userId`), in-flight tap debouncing, bounded capacity (`MAX_MUTATION_QUEUE_SIZE = 500`), and Effect-TS v4 `OfflineMutationError` unwrapping.
- [x] **Effect-TS v4-Ready Logic**: Parameterless `Effect.gen(function* () { ... })` and `Data.TaggedError` models.
- [x] **G0 to G3 Multi-Tier Test Suite**: 125 core test suites (594 tests), dedicated adapter & hook contract tests passing with 0 failures.

---

## 2. Near-Term Milestones & Roadmap (Remaining TODOs)

### Phase 1: Physical Device & Multi-Network Verification (G5)
- [ ] **G5 Device Runs (iOS & Low-End Android)**:
  - Run dev client build on a physical arm64 Android device (`pnpm run build:android` -> `pnpm run install:android`).
  - Test deep link intent dispatch via ADB: `adb shell am start -W -a android.intent.action.VIEW -d "gurudevi://auth/callback?code=test-code" app.gurudevi.mobile`.
  - Verify app behavior across 3 network conditions: 4G/WiFi (Fast), 3G Throttle (Slow), and Airplane Mode (Offline).

### Phase 2: Edge & Low-End Device Efficiency Ratchets
- [ ] **Adaptive Outbox Replay Windowing**:
  - Implement sequential micro-batched outbox replay (3 items/batch) with 50ms `InteractionManager.runAfterInteractions` breathing pauses to prevent frame drops on 1GB/2GB RAM Android devices.
- [ ] **Full Jitter Exponential Backoff**:
  - Adopt $\text{delay} = \text{random}(0, \min(M, B \times 2^{\text{attempt}}))$ with immediate pause on battery-saver mode to eliminate radio power thrash on spotty 2G/3G networks.
- [ ] **Zero-Copy MMKV Outbox Lookups**:
  - Optimize outbox status queries to avoid deserializing the entire JSON queue on every query.

### Phase 3: CI/CD Ratchet Automation
- [ ] **Diff-Scoped Ratchet in GitHub Actions**:
  - Integrate `audit-test-evidence-levels.mjs`, `check:supabase-boundaries`, and `check:anti-slop` in CI scoped to PR changed files.
  - Enforce machine-readable waivers for temporary waivers with explicit expiry dates.

---

## 3. Maintenance & Dependency Upgrades
- [ ] **Effect-TS v4 Upgrade**:
  - When Effect v4 is published, upgrade dependencies and verify that the parameterless generator syntax compiles cleanly without modifications.
- [ ] **Expo SDK & Sacred Versions**:
  - Maintain sacred pinned versions according to `AGENTS.md` (`react-native-gesture-handler` 3.3.0, `react-native-reanimated` 4.6.0, `react-native-mmkv` 4.3.2, etc.).
