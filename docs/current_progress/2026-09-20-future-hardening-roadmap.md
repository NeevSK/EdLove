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
- [x] **Effect-TS v4-Ready Logic**: Parameterless `Effect.gen(function* () { ... })` and `Data.TaggedError` models.
- [x] **G0 to G3 Multi-Tier Test Suite**: 197 core unit tests, 39 web tests, and 263 mobile tests passing with 0 failures.

---

## 2. Near-Term Milestones & Roadmap (TODOs)

### Phase 1: Physical Device & Multi-Network Verification (G5)
- [ ] **G5 Device Runs (iOS & Low-End Android)**:
  - Run dev client build on a physical arm64 Android device (`pnpm run build:android` -> `pnpm run install:android`).
  - Test deep link intent dispatch via ADB: `adb shell am start -W -a android.intent.action.VIEW -d "gurudevi://auth/callback?code=test-code" app.gurudevi.mobile`.
  - Verify app behavior across 3 network conditions: 4G/WiFi (Fast), 3G Throttle (Slow), and Airplane Mode (Offline).

### Phase 2: Journey 2 (Primary Create / Edit) Adversarial Hardening
- [ ] **J2 Mutation Recovery & Idempotency**:
  - Implement and test duplicate-tap resilience for classroom post / comment creation.
  - Test interrupted mutations, local draft persistence in SQLite/MMKV, and optimistic rollback on 5xx server rejection.

### Phase 3: Journey 3 (Return & Synchronization) Adversarial Hardening
- [ ] **J3 Offline Queue & Sync Replay**:
  - Test queue replay during offline-to-online transitions under PowerSync.
  - Test multi-account switching isolation: ensure User A's pending offline mutations are never dispatched under User B's active session.

### Phase 4: CI/CD Ratchet Automation
- [ ] **Diff-Scoped Ratchet in GitHub Actions**:
  - Integrate `audit-test-evidence-levels.mjs` and `check:anti-slop` in CI scoped to PR changed files.
  - Enforce machine-readable waivers for temporary waivers with explicit expiry dates.

---

## 3. Maintenance & Dependency Upgrades
- [ ] **Effect-TS v4 Upgrade**:
  - When Effect v4 is published, upgrade dependencies and verify that the parameterless generator syntax compiles cleanly without modifications.
- [ ] **Expo SDK & Sacred Versions**:
  - Maintain sacred pinned versions according to `AGENTS.md` (`react-native-gesture-handler` 3.3.0, `react-native-reanimated` 4.6.0, `react-native-mmkv` 4.3.2, etc.).
