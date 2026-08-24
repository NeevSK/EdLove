---
title: "Package Layer Definitions (Revised)"
status: "active"
created: 2026-03-25
updated: 2026-03-25
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# Package Layer Definitions (Revised)

Based on the temporal and product reality of the app, we are defining three strict layers. Packages can ONLY import from their own layer or *downward* (e.g., L2 can import L1, L1 CANNOT import L2).

## Layer 1: The Foundation (L1)
*These packages provide the absolute un-opinionated primitives and core platform capabilities. Any feature in L2 can safely import from L1.*
*   **@repo/core**: API clients, raw data models, auth hooks, global state context, and dependency injection tokens (slots).
*   **@repo/ui**: Reusable, dumb components (Buttons, Cards, Inputs). It CANNOT know about specific entities like "Profile" or "Classroom".
*   **@repo/graphics**: SVGs, charts, raw visualization engines.
*   **@repo/ai**: *New L1 Capability.* The core AI engine.
*   **@repo/analytics**: *New L1 Capability.* Cross-cutting tracking and measurement.
*   **@repo/scanner-kit**: Hardware capability wrapper.

## Layer 2: Core Domain Features (L2)
*These are the actual business verticals of the Gurudevi platform. They correspond to major navigational tabs or completely isolated product areas. L2 packages **should avoid importing other L2 packages** to prevent spaghetti.*
*   **@repo/profile** & **@repo/self**: User identity domains.
*   **@repo/classroom**: Teacher/Student course domain.
*   **@repo/admin**: Principal/Admin domain. *(Same level as Classroom)*
*   **@repo/people**: Staff/Directory domain. *(Same level as Classroom)*
*   **@repo/community**: Social interaction domain.
*   **@repo/library**: Content repository domain.
*   **@repo/accounting** & **@repo/payments**: Finance capabilities.
*   **@repo/ai** *(Now treated as Foundation)*: 
    *   Currently depends on Core/UI. Needs to be checked to ensure NO L2 feature imports exist.
*   **@repo/analytics** *(Now treated as Foundation)*:
    *   Used for platform-wide event tracking. Must remain L2-agnostic.
*   *Rule for L2*: If `classroom` needs to show someone's profile, it should NOT import `<IdentityCard />` from `@repo/profile`. It should use generic `<EntityView type="user" id={id} />` from `@repo/ui` which gets resolved by the App Shell, OR it emits an intent event.

## Layer 3: The Integrator / App Shell (L3)
*The only layer that is allowed to know about everything and wire it all together.*
*   **apps/gurudevi-mobile**: This is where React Navigation lives. 
*   It wires L2 screens into Navigators.
*   It populates the Dependency Injection container (e.g., telling `@repo/core` that "when an app asks to render a User Profile, use this component from `@repo/profile`").
*   **CRITICAL RULE**: NO `.web.tsx` or `.ts` file inside `packages/` can ever import `.web.tsx` files or constants from `apps/gurudevi-mobile`. The Arrow of Dependency is strictly `App -> Packages`.
