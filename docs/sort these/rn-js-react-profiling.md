# RN Profiling & React Model Reference

Third companion doc, alongside `ui-thread-discipline.md` (animation/gesture) and `rn-perf-surface-map.md` (lists, native, jank categories, bundling). This one covers the JS/React-side profiling toolchain and rendering-model techniques — largely sourced from Callstack's *Ultimate Guide to React Native Optimization* (2026 ed.), cited where noted.

---

## 1. Profiling React re-renders — React Native DevTools

**Access:** press `j` in the Metro dev server, or shake-gesture on device → Dev Menu → "Open DevTools." It's built on Chrome DevTools' backend, so the interface is familiar if you've profiled web React before.

**Setup for a real profiling session:** go to the Profiler tab → gear icon → enable both "Highlight updates when components render" and "Record why each component rendered while profiling." The second one is the actual value — it tells you *why* a component re-rendered, not just that it did.

**Two views, different purposes:**
- **Flame graph** — click a component to zoom into its children; shows the render tree per commit.
- **Ranked view** — components sorted slowest (yellow) to fastest (green), closer to a bottom-up profiler view. Use this to spot the actual cost center instead of scanning the whole tree.

**Reading it correctly:** if a component re-renders every commit despite unchanged props, check whether an inline function/object prop is defeating memoization — a new function reference every render (`onPress={() => ...}`) breaks `React.memo` even if the *logic* didn't change. Fix: `useCallback`/`useMemo` around the prop, `React.memo` around the consumer — or let React Compiler handle it (§5).

**Start "Reload and start profiling"** specifically when profiling app startup — starting mid-session after the app already loaded won't capture init-time renders.

---

## 2. Profiling raw JS execution (not just React)

Same DevTools, different tab: **"JavaScript Profiler"** (if not visible, enable it under Settings → gear icon → Experiments). This is a CPU profiler, not a React-render profiler — use it for long-running synchronous work, not re-render counts.

**Three views:** Chart (flame graph), Heavy/Bottom-Up (sort by longest-running function — usually the fastest way to find the actual offender), Tree.

**The budget that matters:** any JS thread work should stay under ~16ms to hold 60fps, ~8ms if targeting 120fps (increasingly common on newer hardware). A function blocking the JS thread longer than that is a direct frame-drop cause — the profiler's Heavy view will surface it immediately by sort order, no manual hunting through a flame graph required.

**Important nuance for RN specifically:** a JS-thread-blocking function doesn't necessarily freeze the *native* UI, because of RN's threading model (see the native-modules threading table in `rn-perf-surface-map.md` §2) — but it does freeze all *JS-driven* interactivity (state updates, event handlers, navigation) for its duration, which is what users actually perceive as a frozen app.

---

## 3. Measuring JS/UI FPS in practice

**React Perf Monitor** (built into RN Dev Menu) — live overlay showing **two separate FPS readings**: one for UI/main thread, one for JS thread. This split is the actual diagnostic value: a JS-thread FPS drop with a stable UI-thread FPS means the problem is your JS/React code (§1–2); a UI-thread drop with stable JS FPS points at native rendering (large view hierarchies, image decode — see `rn-perf-surface-map.md` §5.1).

**Rule before trusting any FPS number: disable dev mode.** Android: Dev Menu → Settings → JS Dev Mode off. iOS: run Metro in production mode. Dev-mode numbers are not representative — this is the same "benchmark release builds only" rule that applies to FlashList/LegendList evaluation.

**Flashlight** (Android-only) — `flashlight measure` gives a lighthouse-style report: average FPS, CPU, RAM, over a real interaction, saved as JSON. The actual value over the live Perf Monitor overlay: it's *comparable across runs* — commit the JSON per version and diff it, giving you a real regression check instead of an eyeballed "feels about the same."

---

## 4. Hunting JS memory leaks

**The three classic patterns** (all missing-cleanup variants):
```tsx
// 1. Listener never removed
useEffect(() => {
  const sub = EventEmitter.addListener('myEvent', handleEvent);
  // missing: return () => sub.remove();
}, []);

// 2. Timer never cleared
useEffect(() => {
  const timer = setInterval(() => setCount(c => c + 1), 1000);
  // missing: return () => clearInterval(timer);
}, []);

// 3. Closure retaining more than it needs
class Bad {
  private largeData = new Array(1_000_000).fill('data');
  createLeakyFn() { return () => this.largeData.length; }  // captures entire array
}
class Good {
  private largeData = new Array(1_000_000).fill('data');
  createEfficientFn() {
    const length = this.largeData.length;  // capture only what's needed
    return () => length;
  }
}
```

**Tool: React Native DevTools → Memory tab → "Allocation instrumentation on timeline."** Record, interact with the suspected leak path, stop. Blue bars = still-allocated; grey = deallocated (GC runs periodically, so give it time — an object not yet grey isn't automatically a leak). Expand the constructor list and compare **shallow size** (the object's own memory) against **retained size** (memory freed if this object were deleted) — a huge gap between the two (e.g. 40 bytes shallow, ~2.7MB retained) is the actual leak signature: something small is holding a reference that's keeping a much larger structure alive. DevTools points to the exact allocating line.

Fun fact with zero practical value but good trivia: Hermes' garbage collector is internally named **Hades**.

---

## 5. Controlled vs. uncontrolled components — mainly a legacy-architecture concern

**The issue this solves:** in the old bridge architecture, a controlled `TextInput` (`value` + `onChangeText` both wired to React state) round-trips every keystroke through the JS thread before the native input reflects it. Under fast typing or JS-thread contention, updates can arrive out of order — the docs' example shows a native input actually reverting mid-word (`TES` → `TE`) before catching up, because a later `onChangeText` event resolves before an earlier one's `setState` synced back.

**Fix (legacy architecture):** drop the `value` prop, keep only `onChangeText` — the native input then owns its own state and just reports out, one-directional, no round-trip to desync.

**Relevance check for your stack:** this is explicitly framed as a **legacy-architecture** problem in the source material. Since you're New-Architecture-only (Fabric/Reanimated 4 requires it), the synchronous state-update path Fabric provides likely already closes most of this gap — but the *pattern* (uncontrolled inputs as an escape hatch from React's re-render model) is still valid to know for any case where you deliberately want native-only state ownership, independent of which architecture you're on.

---

## 6. Concurrent React — perceived performance, not raw speed

Core idea: it's often better to respond immediately with partial/stale info than to block until an operation fully completes. Ships since RN 0.69 (React 18), but the specific hooks below **require New Architecture** — which you're already on.

**`useDeferredValue`** — defers rendering of *one* value, letting urgent updates (typing, taps) render immediately while an expensive downstream render lags behind:
```tsx
const [query, setQuery] = useState('');
const deferredQuery = useDeferredValue(query);
const isStale = query !== deferredQuery;

<TextInput value={query} onChangeText={setQuery} />
<View style={isStale && { opacity: 0.8 }}>
  <SearchResults query={deferredQuery} />  {/* wrap in React.memo */}
</View>
```
Wrap the consuming component in `React.memo` — otherwise a parent re-render still cascades into it regardless of the deferred value not having changed.

**`useTransition`** — defers an entire update (not just one value), marking it low-priority so urgent state changes aren't blocked behind it:
```tsx
const [isPending, startTransition] = useTransition();
const handleIncrement = () => {
  setCount(c => c + 1);                          // urgent, immediate
  startTransition(() => setSlowCount(c => c + 1)); // low-priority, backgrounded
};
```

**Which one:** single value/prop feeding one expensive render → `useDeferredValue`. Multiple state updates or a broader UI transition → `useTransition`. Note screen-to-screen transitions are usually handled by native-stack navigation already (not JS-driven), so this mainly applies to JS-based navigators or in-screen state transitions, not your primary nav stack.

**Automatic batching (React 18+, free):** state updates inside promises, `setTimeout`, and native event handlers now batch into a single re-render instead of one render per `setState` call — this used to only happen inside React event handlers. No code change required, just don't rely on the old "immediate re-render after setState" assumption in a timeout/promise callback if you're checking intermediate render state.

---

## 7. React Compiler — adoption specifics, not just the concept

You already have the conceptual framing from the earlier docs (auto-memoization at build time, reduces manual `useMemo`/`useCallback` need, doesn't fix Context's structural selectivity gap). Concrete adoption path:

**1. Add the ESLint plugin first, before the compiler itself** — flags Rules-of-React violations that would block the compiler, and is useful even if you don't adopt the compiler yet:
```bash
# Non-Expo projects: rules ship in eslint-plugin-react-hooks recommended-latest
npm install -D eslint-plugin-react-hooks@latest
```
```js
import reactHooks from 'eslint-plugin-react-hooks';
export default [reactHooks.configs.flat.recommended];
```
```bash
# Expo projects: separate dedicated plugin
npm install -D eslint-plugin-react-compiler
```

**2. Fix whatever the linter flags** — class components, patterns breaking Rules of React, etc. won't be optimized by the compiler regardless.

**3. Add the Babel plugin:**
```bash
npm install -D babel-plugin-react-compiler@latest
```
```js
// babel.config.js
const ReactCompilerConfig = { target: '19' };  // match your React version
module.exports = () => ({
  plugins: [['babel-plugin-react-compiler', ReactCompilerConfig]], // must run first in the plugin list
});
```
If your RN version predates 0.78 (pre-React-19), add `react-compiler-runtime` and set `target: '18'` instead.

**4. Adopt incrementally, not all-at-once** — the `sources` config lets you scope the compiler to specific directories while it's still new in your codebase, limiting blast radius from any compiler bugs on unfamiliar code paths:
```js
const ReactCompilerConfig = {
  sources: (filename) => filename.includes('src/path/to/dir'),
};
```

**One correctness caveat that actually matters:** the compiler uses **shallow comparison**, same as `React.memo`/`useMemo` — it is not magic about object/array identity. If you pass a fresh object or array literal as a prop each render, it's still treated as a new value even post-compiler. The compiler removes the need to hand-write memoization in the common case; it doesn't remove the need to think about referential stability in props at all.

---

Four docs now cover the full surface: `ui-thread-discipline.md` (animation/gesture), `rn-perf-surface-map.md` (lists, native modules, memory, bundling, startup), and this one (JS-side profiling and React's concurrent/compiler model).
