# 🏛️ Sovereign Agentic Lifecycle (SAL) & State Quality Standards

This document codifies the **Sovereign Agentic Lifecycle (SAL)** and the **Top 15 UX Killers** for the Polymath platform. We build for a world where humans and AI agents collaborate in real-time across intermittent networks.

---

## 🔝 The Top 15 UX Killers (Architectural Enforcements)

| Standard | Impact | Enforcement | Pragmatic Nuance |
| :--- | :--- | :--- | :--- |
| **1. Floating Promises** | ❌ Silent failures & crashes. | `@typescript-eslint/no-floating-promises` | OK for "fire and forget" tracking if `.catch()` is used. |
| **2. Anonymous Sinks** | 🐢 GC Jank & laggy scrolls. | `react/jsx-no-bind` | Relax for internal admin tools; Strict for Student views. |
| **3. a11y Violations** | 🧱 Access barriers. | `eslint-plugin-jsx-a11y` | Design-approved branding overrides are allowed. |
| **4. Direct DOM/Ref** | 🌀 UI/State desync. | `react/no-direct-mutation-state` | Allowed for Skia/D3 performance. Use `// @sovereign-bypass`. |
| **5. Bundle Leaks** | ⏳ Slow cold-starts. | `size-limit` | Dynamic imports for heavy AI models or Skia assets. |
| **6. Circular Deps** | 🔥 Random runtime crashes. | `import-x/no-cycle` + `madge` | Prefer linear module graphs; Graph SCC detection used. |
| **7. Over-Subscription** | ⌨️ Laggy interactions. | Selector Enforcement | Forbidden for List Items; Allowed for top-level Header. |
| **8. Hardcoded Strings** | 🌐 Broken i18n. | `react/jsx-no-literals` | Allow for technical keys and debug logs. |
| **9. Any-Casting** | 💣 Type-safe "lies". | `@typescript-eslint/no-explicit-any` | Use `unknown` + Zod validation as the standard. |
| **10. Naked Handlers** | ⚠️ Idempotency bugs. | `local/use-safe-action` | Simple internal navigations do not require the full loop. |
| **11. Hydration Mismatch**| 🕯️ UI Flickering. | `deterministic-id-checks` | Use `useId` or suppress warnings for non-critical dynamic keys. |
| **12. Layout Thrashing** | 🎢 Janky motion. | `reanimated-only-transforms` | Avoid animating `width`, `height`, or `top`. Use `scale` and `translate`. |
| **13. Sync-Wait** | 🧊 Interface Freezes. | `interaction-manager` | Defer heavy logic with `InteractionManager.runAfterInteractions`. |
| **14. Lack of Optimism** | ⏳ Network Hanging. | `optimistic-query-updates` | Mandatory for "Likes", "Votes", and "Status Updates". |
| **15. Context Rot/Bloat**| 🧠 Agent Confusion. | `atomic-selectors` | Forbidden to pass large, noisy state objects to AI contexts. |

---

## 💎 The "Liquid Glass" Aesthetic (2026 Standard)
Premium UX in 2026 feels "alive" and physically plausible.
*   **Surface**: Use `bg-black/60` or `bg-white/60` with `backdrop-blur-xl`.
*   **Depth**: Physically plausible shadows and borders (`border-phase-interactive/20`).
*   **Motion**: State transitions must use **Spring Physics** (via Reanimated) to feel natural.
*   **Dopamine Micro-interactions**: Subtle haptics and "pulse" animations for agent handoffs.

---

## ⚡ The SAL Lifecycle Loop
Every async action MUST expose its internal lifecycle to the **LifecycleMonitor**.

1.  **Intent (Declare)**: User/Agent declares a goal (e.g., "Generate Report").
2.  **Orchestration (Thought)**: System plans the steps (e.g., "Step 1: Fetching Data").
3.  **Execution (Action)**: Computation/API call occurs (Idempotency Lock active).
4.  **Verification (Validation)**: Result checked against schema (Zod/MPC).
5.  **Resolution (Closure)**: Loop closes with Success or **Sovereign Error Resolution**.

---

## 🔬 Deep Performance Architecture
### 1. AST vs. Graph SCC Detection
*   **AST (Legacy/IDE)**: Deeply accurate per-file analysis. Excellent for catching type-safety issues but OOMs on large trees. We limit `maxDepth: 5` for real-time feedback.
*   **Graph SCC (Madge/Next)**: Fast, project-wide cycle detection using Graph Theory (Strongly Connected Components). This is our mandatory CI gate.

### 2. Rust-Powered Tooling (2026 Shift)
*   Wherever possible, we shift from JS-based linting to Rust-based binaries (Biome/Oxlint) to achieve sub-second verification loops.

---


## ⚡ Phase 3: Performance & Visual Fluidity (2026 Patterns)

### 1. Frame-Perfect Transitions (The UI-Thread Shift)
*   **Legacy**: `InteractionManager.runAfterInteractions` is deprecated.
*   **Modern**: Use **Reanimated Worklets** and `requestIdleCallback`.
*   **Constraint**: Animations must never run on the JS thread. Use `useNativeDriver: true` for simple fades and Reanimated for complex transforms.

### 2. Hydration Integrity (Flicker-Free Load)
*   **Pattern**: Use `useId()` for all stable identifiers.
*   **Constraint**: `Math.random()` or `new Date()` inside a component body is an **Architectural Violation**. These cause hydration mismatches that break "Liquid Glass" aesthetics.

### 3. Optimistic UI (The Instant-Action Model)
*   **Hook**: `useOptimistic(baseState, updateFn)`
*   **Rollback**: Automatic on promise rejection.
*   **UX Requirement**: Always provide an "Error Toast" feedback if an optimistic update rolls back.

#### 🛠️ 2026 Blueprint: The "Instant-Grade" Pattern
```tsx
const [optimisticGrades, addOptimisticGrade] = useOptimistic(
  dbGrades,
  (state, newGrade) => [...state, { ...newGrade, pending: true }]
);

const [state, formAction] = useActionState(async (prev, formData) => {
  const grade = formData.get('grade');
  addOptimisticGrade({ value: grade }); // Instant UI feedback
  
  try {
    return await api.grading.submit(grade);
  } catch (e) {
    toast.showToast({ message: "Sync failed. Reverting...", type: "error" });
    throw e; // useOptimistic catches this and rolls back
  }
}, null);
```

### 4. Atomic Selectors (Subscription Efficiency)
*   **Pattern**: Instead of `useStore(s => s)`, use `useStore(useShallow(s => ({ a: s.a, b: s.b })))` or individual atomic selectors.
*   **Why**: Prevents "The God Selector" from re-rendering the entire view on a minor state change.

---

## 🛠️ The Sovereign Error Engine (Dual-Resolution)

Errors must provide different information for humans and agents.

### 1. Human Resolution (Empathy & Clarity)
*   **Message**: "We couldn't reach the server."
*   **Guide**: "Please check your internet connection and try again."
*   **Action**: A button labeled "Retry Sync."

### 2. Agent Resolution (Technical Precision)
*   **AgentHint**: `OFFLINE_RETRY_READY`
*   **AgentGuide**: "Wait for NetInfo `isConnected: true`, then re-trigger with `transaction_id: TX_992`."

---

## ⚖️ The "Pragmatic Kantian" Philosophy
Rules are tools for **Velocity**, not blocks. 
1.  **Is it in the Core Path?** (Grading, Identity, Payments) -> **Zero Tolerance.**
2.  **Is it a secondary UI detail?** -> **Bypass with intent.**
3.  **Does the rule hinder AI Agent performance?** -> **Refactor the rule.**

### Sovereign Sync (Resilience Layer)
- **LWW (Last-Write-Wins)**: All synced mutations must carry a high-precision `occurred_at` timestamp. Server-side resolution must prioritize the latest temporal truth.
- **Delta-Resonance**: Avoid sending full objects. Sync only the "diff" (JSON Patch) to minimize bandwidth usage on 3G/Edge networks.
- **Clear-on-Success**: Local drafts must be purged immediately upon server confirmation to prevent "ghost data" re-hydration.
- **Background Resonance**: UI must indicate sync status without blocking the user (e.g., non-modal spinners).
*   **Constraint**: Standardize on `aspectRatio: 16/9` for media and specific pixel heights for dashboard widgets.

## 🏛️ The Architectural Triad (Universal Enforcement)

To ensure 100% platform-agnostic code in our core business logic, we follow a strict separation of concerns:

### 1. Universal (`api/`, `logic/`, `lib/`)
*   **Definition**: Platform-agnostic domain logic.
*   **Rule**: **ZERO** imports from `/native/` or platform-specific React Native primitives.
*   **Why**: Ensures the "Brain" of the app runs identically on Web (Next.js), Node, and Mobile (Expo).

### 2. Native (`native/`)
*   **Definition**: The "Hardware" bridge.
*   **Rule**: Allowed to use RN primitives, JSI, and OS-specific modules.
*   **Why**: This is where we touch the metal. It should be as thin as possible.

### 3. Runtime (`runtimes/`)
*   **Definition**: The **Composition Layer**.
*   **Rule**: Wires Universal Logic with specific Adapters.
*   **Note**: If a composition (e.g., Supabase + Core Logic) is safe for web, it belongs in `src/api/runtimes/`. If it requires a native SQLite or sensor, it belongs in `src/native/runtimes/`.

> [!TIP]
> If the Sovereign Sentinel flags "Native Pollution", move the target logic to `api/runtimes/` if it is actually universal, or use a **Port/Adapter** pattern if it must remain native.

