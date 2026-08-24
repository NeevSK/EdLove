---
title: "Plan 1: Foundation Healing (Layer 1)"
status: "active"
created: 2026-03-25
updated: 2026-03-25
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# Plan 1: Foundation Healing (Layer 1)

*Objective: Establish a rock-solid, cycle-free Layer 1 (Core, UI, AI, Graphics). If L1 has cycles, the entire monorepo collapses.*

## 1. The @repo/ui Cycle
Currently, `@repo/ui` imports parts of `@repo/profile` (specifically things like `IdentityCard`). This is an L1 -> L2 violation causing structural tech debt.
*   **Action**: Remove all imports of `@repo/profile`, `@repo/self`, or any other domain package from `@repo/ui`.
*   **Implementation**: `<EntityView>` or `<Avatar>` in `@repo/ui` must rely on generic props. The actual fetching of the user profile must be done inside the feature calling the UI, or wired via a registry.

## 2. Moving IdentityCard to @repo/ui (L1-ization)
*Action*: Move the `IdentityCard` component structure and styling from `@repo/profile` to `@repo/ui`.
*Reasoning*: This allows any package (Classroom, People, Admin) to render a consistent identity card without depending on the heavy `@repo/profile` domain logic.
*Constraint*: The component in `ui` must be "data-dumb" (accepting props, not fetching from API).

## 3. The @repo/core Phantom Topology
`@repo/core` imports `KnowledgeTopology` from `@repo/graphics`, but this is not declared in `package.json`, creating a phantom cycle.
*   **Action**: Extract core shared types (`KnowledgeTopology`, `SystemTopology`) out of `graphics` into `core/src/types`.
*   **Implementation**: `graphics` logic will import these types *from* `core`. The `core` package must remain 100% dependency-free within the monorepo layers.

## 4. Elevating @repo/ai and @repo/analytics to Layer 1
Based on strategic product vision, both AI and Analytics are platform primitives.
*   **Action**: Ensure both packages only depend on `@repo/core` and `@repo/ui`. 
*   **Implementation**: 
    1.  Audit `@repo/ai` and `@repo/analytics` to remove any imports from `classroom`, `admin`, or `profile`. 
    2.  Use the "Downstream Context" pattern: Features pass data TO these L1 services, these services never "reach up" to fetch data.

## 5. Verification
`npx madge --circular packages/core packages/ui packages/graphics packages/ai packages/analytics` must return 0 results before moving to Plan 2.
