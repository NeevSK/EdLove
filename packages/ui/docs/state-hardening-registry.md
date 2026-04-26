# 💎 Zero-Legacy State & Memory Hardening Registry

This registry serves as the **Sovereign Checklist** for sanitizing the codebase against performance bottlenecks, referential instabilities, and architectural drift.

---

## 🚀 1. The "State Machine" Migration (Local Logic)
**Target**: Components with >3 interdependent `useState` hooks.
**Goal**: Atomic updates and deterministic transitions.

### 📍 High-Priority Targets
- [ ] **[CuratorReviewScreen.tsx](../library/src/screens/CuratorReviewScreen.tsx)**: currently uses 5 `useState` hooks for tab, items, and loading.
- [ ] **[SchoolCreationScreen.tsx](../../apps/gurudevi-mobile/src/screens/SchoolCreationScreen.tsx)**: complex form state needs a schema-driven reducer.
- [ ] **[AttendanceScreen](../../apps/gurudevi-mobile/src/screens/AttendanceScreen.web.tsx)**: handle multi-student selection logic via reducer.

### 🛡️ Guidance: Code-to-Cure
```tsx
// ❌ Avoid: "State Soup"
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

// ✅ Cure: The Atomic Reducer
const [state, dispatch] = useReducer((s, a) => {
    switch(a.type) {
        case 'FETCH_START': return { ...s, loading: true, error: null };
        case 'FETCH_SUCCESS': return { ...s, loading: false, data: a.payload };
    }
}, initialState);
```

---

## 🧬 2. Referential Stability (Memory Management)
**Target**: Anonymous functions and object literals in the render path.
**Goal**: Zero-Allocation Renders.

### 📍 High-Priority Targets
- [ ] **[StudentAnalysisModal.tsx](../library/src/components/modals/StudentAnalysisModal.tsx)**: 
    - Wrap `handleSave`, `handleExport`, and `handleGetAIInsights` in `useCallback`.
    - Extract dimension slider objects into a `useMemo` block.
- [ ] **[CollectionPickerModal.tsx](../library/src/components/CollectionPickerModal.tsx)**:
    - Memoize `renderItem` using `useCallback` or move it outside the component.
- [ ] **[HistoryTimeline.tsx](./src/components/HistoryTimeline.tsx)**:
    - Ensure SVG path calculations are 100% stabilized via `useMemo`.

### 🛡️ Guidance: Code-to-Cure
```tsx
// ❌ Avoid: Anonymous Sinks
<Button onPress={() => dispatch({ type: 'DONE' })} />

// ✅ Cure: Callback Stabilization
const handleDone = useCallback(() => {
    dispatch({ type: 'DONE' });
}, []);
<Button onPress={handleDone} />
```

---

## ⚡ 3. Blast Radius Control (Context API)
**Target**: "God Providers" that trigger massive re-render waterfalls.
**Goal**: Domain-Specific Context Nodes.

### 📍 High-Priority Targets
- [ ] **[EnvironmentContext.tsx](./src/context/EnvironmentContext.tsx)**:
    - **Split**: Move `reality` (Network/Memory) to `RealityProvider`.
    - **Split**: Move `language` to `i18nProvider`.
- [ ] **[SanctuaryProvider.tsx](./src/providers/SanctuaryProvider.tsx)**:
    - Ensure this only acts as a orchestrator, not a state-holder.

---

## 🔮 4. The "Zero-Legacy" 2-Minute Audit
*Run this over any file before checking in:*

1.  **Count the useStates**: Is it > 2? **Action**: Refactor to `useReducer`.
2.  **Hunt functions**: Is there an `async` or handler function without `useCallback`? **Action**: Wrap it.
3.  **Check the Map**: Are you creating objects inside a `.map()` loop? **Action**: Move to `useMemo`.
4.  **Zustand Check**: are you using `const { a, b } = useStore()`? **Action**: Convert to `useStore(s => s.a)` and `useStore(s => s.b)`.
5.  **Ref-ability**: Could this variable be a `useRef`? (i.e., does it need to trigger a UI update?). **Action**: Switch to `useRef` if possible to save render cycles.

---

> [!IMPORTANT]
> **Performance is the first feature.** 
> Architectural purity is not an "afterthought"—it is the foundation of the 2026 Sovereign Platform.
