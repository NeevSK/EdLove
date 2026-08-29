# Sanctuary API Coverage Improvement Plan — 100% Target

**Generated**: 2026-08-28  
**Current**: 39.28% statements / 39.62% lines  
**Target**: 100% statements / 100% lines / 100% branches / 100% functions

---

## Phase 0 — Infrastructure & Foundation (Current State)

| Item | Status |
|------|--------|
| pnpm lockfile fixed | ✅ |
| @orpc packages at 1.15.0 / 2.0.0-beta.31 | ✅ |
| Stale `.js` test artifacts removed | ✅ |
| `self.orpc.test.ts` — 17 tests, 91.83% self handler | ✅ |
| `presence.orpc.test.ts` — 7 tests | ✅ |
| `education.orpc.test.ts` — mutation filter TODO | ✅ |
| `downstream.test.ts` — idempotencyKey fix | ✅ |
| `self.integration.test.ts` — local ORPC client | ✅ |

**Coverage after Phase 0**: 39.28% statements / 39.62% lines

---

## Phase 1 — Fix Broken Tests & Add Core Mocks (Week 1)

### 1.1 Fix `history.orpc.test.ts` (11 failing tests)
- [ ] Add `collectionNodeEvent` mock model to `setup.ts`
  - `findMany` with `collection_id`, `node_id`, `event_type`, `occurred_at`, `actor_id`
  - `findFirst` / `findUnique` support
- [ ] Add `user` mock support for `actor` lookups (already exists but verify)
- [ ] Add `classroomNote` mock for `findUnique` (recordId check)
- [ ] Add `audit.logs` raw query support via `setMockQueryRowsQueue`
- [ ] Verify all 11 history tests pass

**Expected coverage gain**: +2-3% (history handler 5.55% → ~80%)

### 1.2 Add Missing Mock Models to `setup.ts`
- [ ] `userRewards` (findUnique, findMany, create, update)
- [ ] `userRewardsVersions` (findMany, findFirst, create, update)
- [ ] `whisperedMoment` (findMany)
- [ ] `collectionNodeEvent` (findMany, findFirst)
- [ ] `classroomNote` (findUnique)

---

## Phase 2 — High-Impact Zero-Coverage Handlers (Week 2)

### 2.1 `rewards.orpc.test.ts` — 9 procedures (4.25% → 90%+)
| Procedure | Input | Mock Needs |
|-----------|-------|------------|
| `getRewards` | query.userId? | `userRewards.findUnique` |
| `getRewardsHistory` | query.userId?, query.limit? | `userRewardsVersions.findMany` |
| `getRewardsAsOf` | query.userId?, query.asOf | `userRewardsVersions.findFirst` |
| `getRewardsRangeHistory` | query.userId?, query.viewScale, query.viewDate | `userRewardsVersions.findMany` |
| `initializeRewards` | body.userId | `userRewards.findUnique`, `create` |
| `addPoints` | body.userId, body.points | `userRewards.findUnique`, `create`, `update` |
| `awardBadge` | body.userId, body.badge | `userRewards.findUnique`, `create`, `update` |
| `checkAndAwardAchievements` | body.userId | `queryDatabaseRows` (feature_usage_log), `userRewards` |
| `getWhisperedMoments` | query.userId? | `whisperedMoment.findMany` |

**Expected coverage gain**: +5-7%

### 2.2 `sync.orpc.test.ts` — 1 procedure (28.57% → 90%+)
| Procedure | Input | Mock Needs |
|-----------|-------|------------|
| `uploadBatch` | body.idempotencyKey, body.crud[] | Mock `applyPowerSyncBatch` return `{ success: true, processedCount: N }` |

**Expected coverage gain**: +3-4%

---

## Phase 3 — Existing Low-Coverage Test Files (Week 3)

### 3.1 Enhance `mapping.orpc.test.ts` (12.5% → 80%+)
- Add success-path tests for all mapping procedures

### 3.2 Enhance `identity.orpc.test.ts` (22.58% → 80%+)
- Add success-path tests for identity procedures

### 3.3 Enhance `attendance.orpc.test.ts` (14.28% → 80%+)
- Add success-path tests for attendance procedures

### 3.4 Enhance `schoolForest.orpc.test.ts` (10.15% → 80%+)
- Add success-path tests for schoolForest procedures

### 3.5 Enhance `guardianAssessment.orpc.test.ts` (16.66% → 80%+)
- Add success-path tests

### 3.6 Enhance `forms.orpc.test.ts` (13.72% → 80%+)
- Add success-path tests

### 3.7 Enhance `longitudinal.orpc.test.ts` (15.78% → 80%+)
- Add success-path tests

### 3.8 Enhance `thuthimal.orpc.test.ts` (10% → 80%+)
- Add success-path tests

### 3.9 Enhance `warmMirror.orpc.test.ts` (14.28% → 80%+)
- Add success-path tests

### 3.10 Enhance `presence.orpc.test.ts` (12.5% → 80%+)
- Already has 7 tests; add more edge cases

### 3.11 Enhance `inventory.orpc.test.ts` (16.21% → 80%+)
- Add success-path tests

### 3.12 Enhance `tracking.orpc.test.ts` (22.22% → 80%+)
- Add success-path tests

### 3.13 Enhance `decisionJournal.orpc.test.ts` (20% → 80%+)
- Add success-path tests

### 3.14 Enhance `privacy.orpc.test.ts` (25% → 80%+)
- Add success-path tests

### 3.15 Enhance `profile.orpc.test.ts` (81.48% → 95%+)
- Already high; fill gaps

---

## Phase 4 — Zero-Test Handlers (Week 4)

### 4.1 Create test files for handlers with NO test file:
| Handler | Current Coverage | Priority |
|---------|------------------|----------|
| `dailyContent.ts` | 77.77% | Low |
| `educational.ts` | 69.23% | Low |
| `forms.ts` | 13.72% | High (has test file, enhance) |
| `guardianAssessment.ts` | 16.66% | High (has test file, enhance) |
| `identity.ts` | 22.58% | High (has test file, enhance) |
| `learningReflections.ts` | 33.33% | Medium |
| `longitudinal.ts` | 15.78% | High (has test file, enhance) |
| `permissionSnapshot.ts` | 33.33% | Medium |
| `principalNotes.ts` | 100% | Done |
| `profile.ts` | 81.48% | Low |
| `rewards.ts` | 4.25% | **Critical** (Phase 2.1) |
| `sacredMissions.ts` | 85.29% | Low |
| `schoolForest.ts` | 10.15% | High (has test file, enhance) |
| `studentPotential.ts` | 78.26% | Low |
| `sync.ts` | 28.57% | **Critical** (Phase 2.2) |
| `thuthimal.ts` | 10% | High (has test file, enhance) |
| `warmMirror.ts` | 14.28% | High (has test file, enhance) |

---

## Phase 5 — High-Impact Core Files (Week 5)

### 5.1 `app.ts` (25.87% → 90%+)
- Test all routes, middleware, error handling, health endpoints
- Mock all sub-routers

### 5.2 `router.ts` (42.64% → 90%+)
- Test ORPC router composition

### 5.3 `orpc.ts` / `orpcMiddleware.ts` (82.56% / 40.47% → 90%+)
- Test middleware chain, doubleGateMiddleware, auth

### 5.4 `apiErrors.ts` (50% → 90%+)
- Test error transformation

---

## Phase 6 — Edge Cases, Branches, Functions (Week 6)

### 6.1 Branch Coverage (32.43% → 100%)
- Error paths in all handlers
- Conditional branches (if/else, switch cases)
- Try/catch error handling paths

### 6.2 Function Coverage (40.46% → 100%)
- All helper functions (mapRewards, mapHistory, mapWhisperedMoment, etc.)
- Private functions
- Utility functions

### 6.3 Line Coverage (39.62% → 100%)
- Every executable line hit

---

## Phase 7 — Integration & Contract Tests (Week 7)

### 7.1 Fix integration tests
- `self.integration.test.ts` — requires test DB + auth token
- Ensure integration test suite runs in CI

### 7.2 Contract validation
- All contracts have success + error tests
- OpenAPI spec generation verified

---

## Tracking Metrics

| Phase | Target Statements | Target Lines | Target Branches | Target Functions |
|-------|------------------|--------------|-----------------|------------------|
| Current | 39.28% | 39.62% | 32.43% | 40.46% |
| After Phase 1 | ~55% | ~55% | ~40% | ~50% |
| After Phase 2 | ~70% | ~70% | ~55% | ~65% |
| After Phase 3 | ~85% | ~85% | ~75% | ~80% |
| After Phase 4 | ~90% | ~90% | ~85% | ~88% |
| After Phase 5 | ~95% | ~95% | ~92% | ~94% |
| After Phase 6 | 100% | 100% | 100% | 100% |

---

## Rules & Guardrails

1. **No test weakening** — never lower assertions to make tests pass
2. **No `any` types** — use proper types from contracts
3. **Real mocks** — mock at the DB layer (Prisma/ZenStack), not handler level
4. **Success + error paths** — every procedure needs both
5. **Run quality gates after each phase**:
   - `npm run test:coverage` — thresholds pass
   - `npx tsc --noEmit` — typecheck clean
   - `npx biome check` — lint clean
6. **Commit after each phase** — atomic, reviewable changes

---

## File References

- `apps/sanctuary-api/src/__tests__/setup.ts` — Central mock registry
- `apps/sanctuary-api/src/__tests__/orpc-client.ts` — Test client factory
- `apps/sanctuary-api/src/core/handlers/*.ts` — Handler implementations
- `packages/core/src/api/*.contract.ts` — Contract definitions
- `apps/sanctuary-api/vitest.config.ts` — Coverage config (excludes integration)

---

## Implementation Order (Next Immediate Actions)

1. **Fix history mocks** → run `history.orpc.test.ts` to green
2. **Create `rewards.orpc.test.ts`** → run to green
3. **Create `sync.orpc.test.ts`** → run to green
4. **Run full suite + coverage** → verify Phase 1+2 targets
5. **Phase 3 enhancements** — parallelize across handlers
6. **Phase 4 new test files** — parallelize
7. **Phase 5 core files** — systematic
8. **Phase 6 gap closure** — targeted
9. **Phase 7 integration** — final

---

*This plan will be updated as phases complete. Each phase ends with a coverage report and quality gate check.*