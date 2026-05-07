# 🛡️ Sovereign Healing Protocol: Hook & UX Audit (2026)

This document tracks the audit and refactoring of the Polymath Platform to comply with the **2026 State Management** and **UX Quality Standards**.

## 📋 Comprehensive Audit Checklist

For every file audited, verify the following standards:

### 1. Hooks & State Purity
- [ ] **useState Limit**: Max 3 per component. (Use `useReducer` or `useActionState` for 4+).
- [ ] **Hook Rules**: Ensure no hooks are called conditionally or after early returns.
- [ ] **Redux/Zustand**: Use atomic selectors (`useStore(s => s.field)`). No "God Selectors".
- [ ] **Sync Effects**: No synchronous `setState` inside `useEffect` (prevents cascading renders).

### 2. Memory & Referential Stability
- [ ] **Anonymous Sinks**: No inline arrow functions in JSX props (`onPress={() => ...}`). Use `useCallback`.
- [ ] **Context Stability**: All values passed to Context Providers must be wrapped in `useMemo`/`useCallback`.
- [ ] **Expensive Children**: Props passed to memoized components must be referentially stable.

### 3. UX & SAL Lifecycle (Sovereign Agentic Lifecycle)
- [ ] **Naked Handlers**: Async handlers must use `useSafeAction` (Idempotency + Progress + Errors).
- [ ] **Optimistic UI**: Mandatory for "Likes", "Votes", "Toggles", and "Status Updates" using `useOptimistic`.
- [ ] **Action Suite**: Use `useActionState` for forms and multi-step mutations.
- [ ] **Floating Promises**: All async calls must be handled with `await` or `.catch()`.

### 4. Determinism & Aesthetics
- [ ] **Hydration Integrity**: No `new Date()` or `Math.random()` in component bodies.
- [ ] **Liquid Glass**: Ensure `backdrop-blur`, spring physics, and frame-perfect transitions.
- [ ] **Type Safety**: Zero `any` casting. Use `unknown` + Zod validation.

---

## 🎯 Target Files & Progress

### 🛡️ Packages/Community (Screens)
- [x] `packages/community/src/screens/CommunityScreen.web.tsx` (🚨 **CRITICAL**)
  - [x] Fix Hook Rules (Move early return after all hooks)
  - [x] Consolidate 11 `useState` into `useReducer`
  - [x] Remove Anonymous Sinks (Memoize handlers)
  - [x] Stabilize Hydration references
  - [x] Wrap mutations in `useSafeAction` (Migrated to useReducer pattern)
  - [x] **Infrastructural**: Enabled `--jsx` in TSConfig and resolved API shadowing.
- [ ] `packages/community/src/screens/AnnouncementsScreen.tsx`

### 🏗️ Packages/UI (Screens)
- [ ] `packages/ui/src/screens/AppSettingsScreen.tsx` (⚠️ 3/3 useState, Hydration violation)
- [ ] `packages/ui/src/screens/AuthScreen.tsx` (⚠️ Naked handlers)
- [ ] `packages/ui/src/screens/AuthScreen.web.tsx`
- [ ] `packages/ui/src/screens/OnboardingScreen.tsx` (⚠️ Naked handlers, Anonymous sinks)
- [ ] `packages/ui/src/screens/OnboardingScreen.web.tsx`
- [ ] `packages/ui/src/screens/WelcomeScreen.tsx`
- [ ] `packages/ui/src/screens/WelcomeScreen.web.tsx` (🚨 Heavy Anonymous Sinks)
- [ ] `packages/ui/src/screens/WorkspaceCanvasDemo.tsx`

### 🧬 Packages/Core (Hooks)
- [ ] `packages/core/src/hooks/useIdentity.ts`
- [ ] `packages/core/src/hooks/useAuthorityLifecycle.ts`
- [ ] `packages/core/src/hooks/usePendingActions.ts`

### 🎨 Packages/UI (Hooks)
- [ ] `packages/ui/src/hooks/useTheme.ts`
- [ ] `packages/ui/src/hooks/useSafeAction.ts` (The Standard - check for consumption)

---

## 📝 Recent Audit Notes
- **CommunityScreen.web.tsx**: Refactored successfully. Resolved 153 IDE errors by fixing `--jsx` config and API shadowing. Consolidated 11 states into a stable reducer.
- **AppSettingsScreen.tsx**: (Priority: High) - Found a hydration violation with `new Date()` in the render path.
