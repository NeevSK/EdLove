# 💎 Zero-Legacy State & Memory Hardening Registry

This registry serves as the **Sovereign Checklist** for sanitizing the codebase against performance bottlenecks, referential instabilities, and architectural drift.

---

## 🚀 1. The "State Machine" Migration (Local Logic)
**Target**: Components with >3 interdependent `useState` hooks.
**Goal**: Atomic updates and deterministic transitions.
**Enforcement**: `local/max-use-state` (ESLint Error).

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

## 🏎️ 2. The 2026 "Layered" Philosophy
**Philosophy**: Don't use a hammer for every screw. Choose the right tool for the state lifecycle.

| Layer | Recommended Tool | Rationale |
| :--- | :--- | :--- |
| **Server State** | **TanStack Query** | Caching, invalidation, and background sync are handled natively. |
| **Action Transitions** | **`useActionState`** | Handles "pending" and "result" lifecycles of async actions automatically. |
| **Optimistic UI** | **`useOptimistic`** | Immediate feedback with automatic rollback on failure. |
| **Global UI** | **Zustand** | Minimal boilerplate, fine-grained subscription, zero re-render waterfalls. |
| **Derived State** | **Plain JS** | If it can be calculated from props/state, do it during render. No hooks. |

---

## 🧬 3. Referential Stability (Memory Management)
**Target**: Anonymous functions and object literals in the render path.
**Goal**: Zero-Allocation Renders.

### 🛡️ Guidance: Code-to-Cure
```tsx
// ❌ Avoid: Anonymous Sinks (triggers re-renders in children)
<Button onPress={() => dispatch({ type: 'DONE' })} />

// ✅ Cure: Callback Stabilization
const handleDone = useCallback(() => {
    dispatch({ type: 'DONE' });
}, []);
<Button onPress={handleDone} />
```

---

## ⚡ 4. Blast Radius Control (Context API)
**Target**: "God Providers" that trigger massive re-render waterfalls.
**Goal**: Domain-Specific Context Nodes.

---

## 🔮 5. The "Zero-Legacy" 2-Minute Audit (2026 Edition)
*Run this over any file before checking in:*

1.  **State Density**: Are there > 3 `useState` hooks? **Action**: Refactor to `useReducer`. (Automated check: `local/max-use-state`).
2.  **State Mirroring**: Is this `useEffect` syncing state? **Action**: Delete it. Use **Derived State** (computed during render).
3.  **Async Mutations**: Is there a manual `loading` flag for a form? **Action**: Upgrade to `useActionState`. (Note: useReducer can also manage this if logic is complex).
4.  **Referential Check**: Are there objects `{}`, arrays `[]`, or `() => {}` inside the JSX or dependency arrays? **Action**: Move to `useMemo` / `useCallback` or static scope.
5.  **Zustand Selectors**: Are you using `const { a, b } = useStore()`? **Action**: Convert to `useStore(s => s.a)` to prevent over-subscription.
6.  **Ref-ability**: Does this value need to trigger a UI update? **Action**: If not, use `useRef` to avoid unnecessary render cycles.
7.  **Server State Leak**: Is API data sitting in a client-side reducer? **Action**: Move it to TanStack Query/use() cache.

---

> [!IMPORTANT]
> **Performance is the first feature.** 
> Architectural purity is not an "afterthought"—it is the foundation of the 2026 Sovereign Platform.
