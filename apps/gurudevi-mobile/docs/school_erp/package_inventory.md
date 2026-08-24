---
title: "Package Inventory & Dependency State (Revised)"
status: "active"
created: 2026-03-25
updated: 2026-03-25
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# Package Inventory & Dependency State (Revised)

This document maps out the current state of the workspaces, based on `package.json` vs. actual code imports causing circular spaghetti. *Note: Declared dependencies refer to PNPM workspace structure, while "Actual Code" references the madge circular analysis.*

## Layer 1: The Foundation (Primitives & Shared Capabilities)
*   **@repo/core**: 
    *   *Actual Code Violation*: Phantom-imports `@repo/graphics` for `KnowledgeTopology`.
*   **@repo/graphics**: 
    *   *Actual Code Violation*: Imports `@repo/ui` which in turn imports L2 Profile data.
*   **@repo/ui**: 
    *   *Actual Code Violation*: Imports `IdentityCard` directly from `@repo/profile` (L2 bleed).
*   **@repo/ai** *(Now treated as Foundation)*: 
    *   Currently depends on Core/UI. Needs to be checked to ensure NO L2 feature imports exist.
*   **@repo/analytics** *(Now treated as Foundation)*:
    *   Used for platform-wide event tracking. Must remain L2-agnostic.

## Layer 2: Core Domain Features (The Spaghetti Tier)
*These packages are all accessed via standard Shell navigation (e.g., Tab Nav). The golden rule is they should rely heavily on L1 and avoid pointing to each other.*

*   **@repo/classroom**: 
    *   *Status*: **Massive Spaghetti Node**. It imports almost every other L2 package in `package.json`: `admin`, `people`, `profile`, `community`, `library`. This must be broken using Component Registry / Slots.
*   **@repo/admin**: 
    *   *Status*: Imports `people`, `analytics`.
*   **@repo/people**: 
    *   *Status*: Should be pure, but injected into Admin.
*   **@repo/community**: 
    *   *Status*: Imports `library`, `self`.
*   **@repo/profile** / **@repo/self**: 
    *   *Status*: Clean in `package.json`, but polluted by inward cycles from `ui`.

## Layer 3 The App Shell
*   **apps/gurudevi-mobile**:
    *   *Status*: Has internal web vs native routing complexities and relies heavily on implicit Metro resolution. We'll enforce a strict one-way downward dependence.
