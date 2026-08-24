---
title: "UI-Thread Discipline: Architecture Principles for RN Performance"
status: "active"
created: 2026-08-24
updated: 2026-08-24
author: "Naveen"
scribe: "opencode"
tags: [docs, engineering]
---

# UI-Thread Discipline: Architecture Principles for RN Performance

**Stack:** Reanimated 4.5.x + react-native-worklets 0.11.x, New Architecture (Fabric) only.

## 0. The one rule everything else derives from

> **State that changes every frame must never pass through React's render cycle.**

Every principle below is this rule enforced at a different layer. If you only remember one thing, remember this — it's the actual mechanism behind "why is this smooth."

---

## 1. The two-thread mental model

- **JS thread**: orchestration. Screen state, navigation, business logic, anything driven by user *intent* (not motion).
- **UI thread**: everything that changes every frame. Position, scale, opacity, path morphs, gesture tracking, spring physics.

Reanimated's job is to let you write UI-thread code in JS syntax, compiled to a worklet that actually *runs* on the UI thread via JSI — it does not ship values back to JS each frame. The moment you write to `useState`, you've forced a bridge crossing you didn't need.

**Rule:** if a value updates on every `requestAnimationFrame`-equivalent tick (drag, scroll, spring, gesture), it lives in a `useSharedValue`, never in component state.

---

## 2. Ownership boundary — where each piece of state lives

| State | Lives in | Why |
|---|---|---|
| Screen/tab selection, modal open/closed | React state | Changes rarely, triggers legitimate re-render |
| Drag/pan position | `useSharedValue` | Every-frame |
| Press/scale/morph progress | `useSharedValue` | Every-frame |
| Derived colors/paths from the above | `useDerivedValue` | Computed on UI thread, never crosses back |
| Server data, form fields | React state / query cache | Not frame-driven |
| Layout measurements used once | React state (measured once, cached) | Not frame-driven after initial layout |

If you're unsure which column something belongs in, ask: *"does this need to be different 60 times a second?"* If yes → shared value. If no → React state.

---

## 3. Concrete implementation rules (Reanimated 4.5 / Worklets 0.11)

1. **Use `react-native-worklets/plugin` in babel config**, not `react-native-reanimated/plugin` — worklets moved to its own package as of Reanimated 4. Both must be on matching minor versions (4.5.x Reanimated ↔ 0.11.x Worklets) or you get silent runtime mismatches.
2. **New Architecture is mandatory** — Reanimated 4.x has dropped old-architecture support entirely. Don't spend time making anything work on the bridge.
3. **Prefer the CSS-based animation/transition API where it fits** (new in Reanimated 4) over manual `useAnimatedStyle` — it removes a class of bugs where derived styles are miscalculated, and Software Mansion is investing further perf work here.
4. **Avoid deprecated re-exports.** They still work via `react-native-reanimated` for back-compat but are marked for removal — import from `react-native-worklets` directly:
   - `runOnRuntime` → `scheduleOnRuntime`
   - `makeShareableCloneRecursive` → `createSerializable`
   - `executeOnUIRuntimeSync` → `runOnUISync`
5. **`withSpring` tuning changed** — `restDisplacementThreshold`/`restSpeedThreshold` are gone, replaced by a single relative `energyThreshold`. If you have old spring configs copied from Reanimated 3 code, don't port the old params — let the default `energyThreshold` behave, then tune once.
6. **`duration` in animations is now perceptual, not literal.** Don't hand-tune durations against a stopwatch assuming 1:1 — re-tune by eye after upgrading.
7. **Every worklet crossing a thread boundary is a cost, even if small.** Calling a non-worklet function from a worklet context for anything other than a rare, discrete event (haptics trigger, analytics ping, navigation) is a smell — ask if that call can be deferred or batched instead of fired every frame.
8. **API rename, not just deprecation — update call sites, not just imports.** `runOnUI` is still re-exported for back-compat but deprecated, and the *signature itself changed*: `runOnUI(fn)(args)` → `scheduleOnUI(fn, args)`. Same pattern for the JS-thread escape hatch: `runOnJS` is replaced by `scheduleOnRN` (from `react-native-worklets`), used for non-worklet functions (e.g. from external libraries) that can't run on the UI thread. Grep for `runOnUI(` and `runOnJS(` — these aren't just import swaps, the call shape changes.

---

## 4. The Skia layer (for the tab bar / FAB work specifically)

- Draw as **one `Canvas`**, not a tree of styled `View`s. A composed `View` tree still goes through Fabric diffing per update; a Skia canvas is one native draw call reading shared values directly.
- Path/shape math (morph interpolation, color stops, corner radii curves) should be **precomputed as constants outside the worklet** wherever it doesn't depend on the live gesture value — don't recompute static math every frame.
- `useDerivedValue` is where morph/interpolation logic belongs — it runs on the UI thread and never touches React.

---

## 5. Enforcement — how this stays true as the codebase grows

Since you're solo + AI, the discipline has to be mechanical, not memory-based:

- **ESLint**: use `eslint-plugin-react-native-reanimated` (flags worklet misuse, e.g. reading a shared `.value` outside a worklet, or calling non-worklet functions from a worklet context without `runOnJS`).
- **Code-review checklist** (apply to every PR/diff touching animation code, including AI-generated diffs — treat this as the review a human teammate would do):
  - [ ] Any new `useState`/`useEffect` — does it fire on every frame? If yes, convert to shared value.
  - [ ] Any `runOnJS` call — is it discrete (fires occasionally) or per-frame (wrong)?
  - [ ] Any new animated `View` tree — could it be a Skia canvas instead?
  - [ ] Any deprecated Reanimated 3-era API sneaking back in (AI assistants trained on older docs will suggest these — check imports against §3.4 above).
  - [ ] Any hardcoded duration/threshold copied from old Reanimated 3 code without re-tuning for 4.x semantics.
- **Perf smoke test**: profile the tab bar/FAB interaction with the JS-thread FPS monitor (Reanimated dev tools) *before* merging — a stall on the JS thread during a drag means something leaked into React state that shouldn't have.

---

## 6. `useState` vs `useReducer` vs `useSharedValue` — sort in this order

This is a separate axis from §1–2, and easy to tangle with it. Do the shared-value sort first — pull out everything frame-driven — then decide reducer-vs-state on what's left.

**Sort test, applied per piece of state:**
1. Changes every frame/gesture tick (drag, spring, morph)? → `useSharedValue`. Stop here — this state never becomes a reducer.
2. Changes rarely (tap, toggle, nav, data load) **and** is coupled to other state (usually updates together in the same handler)? → `useReducer`. Coupling is the real trigger, not just count — two useStates that must stay in sync are a reducer even at count 2; three independent unrelated booleans are fine as three `useState`s.
3. Rare and independent? → plain `useState`.

**Trap to catch in review:** a reducer `dispatch(...)` called inside a worklet, `onUpdate`, or anywhere per-frame. A reducer is still React state under the hood — same render-cycle cost as `useState`. Organizing frame-driven values into a tidy reducer doesn't fix the perf problem, it just hides it better. If you see this, the fix isn't a smaller reducer — it's moving that state to a shared value entirely.

Add this to the PR checklist in §5: **any new `useReducer` — confirm no action is dispatched from a per-frame call site.**

---

## 7. When to actually reach for Rust

Not for UI. Skia + Reanimated already *is* your native rendering layer — reimplementing that in Rust duplicates infrastructure you already have. Rust earns its place only for compute Skia/Reanimated can't do: vector search, on-device ML inference, heavy signal/geometry processing outside the render path. Keep that boundary explicit so "let's use Rust" doesn't quietly creep into "let's use Rust for the FAB," which is solving a problem you don't have.
