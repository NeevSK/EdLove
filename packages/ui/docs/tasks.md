# 📝 UX Integrity & Quality Implementation Tasks

Track the progress of hardening the repository against the "Top 10" UX killers.

## 🟢 Phase 1: Foundation & Safe Actions
- [x] **Task 1.1**: Create `useSafeAction` hook in `@repo/ui`.
- [x] **Task 1.2**: Implement `SafeButton` component that consumes `useSafeAction`.
- [x] **Task 1.3**: Add lint rule to warn on "naked" `onPress` with async functions.
- [x] **Task 1.4**: Implement Sovereign Error Engine (IDE-style feedback).
- [x] **Task 1.5**: Implement `LifecycleMonitor` (SAL progress tracking).
- [x] **Task 1.6**: Refactor `ToastProvider` to use "Liquid Glass" (blur) aesthetics.

## 🟡 Phase 2: Strictness Hardening
- [x] **Task 2.1**: Move `@typescript-eslint/no-floating-promises` to `error`.
- [x] **Task 2.2**: Move `@typescript-eslint/no-explicit-any` to `error` in `packages/core`.
- [x] **Task 2.3**: Enable `import-x/no-cycle` (Circular Dependency Audit). <!-- Completed 2026-05-02 -->
- [x] **Task 2.4**: Enforce `jsx-a11y` accessibility standards. <!-- Completed 2026-05-02 -->
- [x] **Task 2.5**: Remediate Sovereign Sentinel Violations (27 resolved via Universal Runtimes). <!-- Completed 2026-05-02 -->

## 🔴 Phase 3: Performance & "Liquid Glass"
- [x] **Task 3.1**: Eliminate non-deterministic hydration patterns (Math.random/Date.now) across monorepo.
- [x] **Task 3.2**: Migrate legacy InteractionManager and Animated API to Reanimated UI-thread worklets.
- [x] **Task 3.3**: Implement Optimistic UI (`useOptimistic`) for high-frequency actions (Chat).
- [x] **Task 3.4**: Refactor heavy state consumers (Attendance, Facade) to use Atomic Selectors and useMemo facades.
- [ ] **Task 3.5**: Implement Layout Shift (CLS) enforcement via standardized container sizes.

- [x] **Task 4.3**: Implement "Stale-While-Revalidate" (SWR) for classroom attendance to allow offline marking.
- [x] **Task 4.4**: Add "Sync Status" indicators (Cloud/Local) to the UI for user peace-of-mind.

## 🎭 Phase 5: Dynamic Sovereignty (Adaptive UX)
- [ ] **Task 5.1**: Implement "Delta-Resonance" (JSON Patch) for form and chat sync.
- [ ] **Task 5.2**: Build the "Micro-Layout Runtime" (Rearrangeable Widgets via `dnd-kit`).
- [ ] **Task 5.3**: Implement "Predictive Hydration" (Heuristic-based pre-fetching).
- [ ] **Task 5.4**: Add "Temporal Conflict Resolver" (UI for LWW conflicts).

---

## 📈 Progress Summary
- **Current Goal**: Establish the "Safe Action" pattern.
- **Rules Enforced**: `max-use-state`, `exhaustive-deps`.
- **UX Patterns Established**: (Pending `useSafeAction`).
