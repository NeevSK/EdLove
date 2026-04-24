# Architecture & Dependency Guidelines

This document defines the structural integrity rules for the **polymath-platform** monorepo. Use this as a reference for resolving existing violations and planning new feature placements.

## 1. Core Definitions

### Package API (Public Interface)
The **Public Interface** of a package is the set of functions, types, and classes it chooses to "expose" to the rest of the monorepo. 
- **Mechanism**: Defined in `package.json` under `exports` and/or the `index.ts` barrel file.
- **Rule**: If it’s not in the Package API, it is "private" and should never be imported by another package.

### Network API (Data Layer)
The **Network API** refers to the logic that communicates with external systems (Supabase, Postgres, REST APIs).
- **Placement**: Typically in `packages/core/src/api/`.
- **Confusion**: When we say "API" in a package context, we mean the *Interface*. When we say "API" in a network context, we mean the *Data Fetching*.

---

## 2. The Layered Topology

Packages must follow a strict "Downward Import" hierarchy. **Imports can only go to a lower layer or a sideways (same layer) package.**

| Layer | Type | Examples | Role |
| :--- | :--- | :--- | :--- |
| **Layer 0** | **The Base** | `core`, `types-shim`, `base-utils` | Global primitives, shared types, and foundational logic. |
| **Layer 1** | **The UI** | `ui`, `graphics` | Atomic components, design system, and visual primitives. |
| **Layer 2** | **Infrastructure** | `scanner-kit`, `ai`, `analytics`, `form-builder` | Specialized technical engines that support multiple domains. |
| **Layer 3** | **Domains** | `classroom`, `people`, `self`, `admin`, `community` | High-level business logic and feature-specific state management. |
| **Layer 4** | **Services** | `payments`, `accounting` | Final integrations and external service orchestrators. |

> [!IMPORTANT]
> **Standalone Packages** (`lk-edu-geo`, `trube-art`): These should be treated as **Layer 1 or 2** (General Utilities). They must have **ZERO** dependencies on Layer 3+ to remain publishable on GitHub.

---

## 3. The "Golden Rules" of Dependencies

### Rule 1: No Circular Dependencies
- **Why**: Cycles cause memory leaks, broken Hot Module Replacement (HMR), and impossible-to-test code.
- **Resolution**: Use `dependency-cruiser` to find the cycle. Move the shared code down to a lower layer.

### Rule 2: No "Upward" Imports
- **Example**: `core` (L0) should NEVER import from `classroom` (L3).
- **Resolution**: If `core` needs a type from `classroom`, that type should likely be move to `core` or a dedicated `types` package.

### Rule 3: Domain Isolation (L3 Sideways)
- **Problem**: `accounting` importing directly from `classroom`.
- **Solution**: Use **The Core Contract**. Define a shared interface in `core` that both understand, so they communicate through `core` rather than directly.

---

## 4. Subpath Exports Strategy (The Hybrid Model)

To prevent massive bundles and cycle traps, we use a **Hybrid Export Strategy**.

### Rules for L0 & L1
- **Lightweight (Root index)**: Common, small components (Buttons, Spacing, Text) can be exported from the root `index.ts`.
- **Heavy (Subpath)**: Large components (Icons, SVGs, Lottie, complex Hooks) **MUST** be exported via subpaths (e.g., `@repo/ui/icons`).
- **Goal**: Allow convenience for 80% of use cases while guarding against 20% of the "heavy" code accidental evaluation.

- **Bad**: `import { HeavyChart } from '@repo/ui'` (triggers full UI evaluation).
- **Good**: `import { Button } from '@repo/ui'` (convenient for lightweight).
- **Best**: `import { HeavyChart } from '@repo/ui/charts'` (performance-critical).

---

## 5. How to Resolve Violations

1. **Find**: Run `pnpm run check:architecture`.
2. **Identify**: Look for the `from` and `to` path in the error.
3. **Move or Abstract**:
    - If a lower layer imports from a higher layer: **Move** the code to the lower layer.
    - If a cycle exists: **Abstract** the shared logic into a new file and move it to a lower layer.
4. **Enforce**: Once fixed, the rule in `.dependency-cruiser.cjs` ensures the issue never returns.
