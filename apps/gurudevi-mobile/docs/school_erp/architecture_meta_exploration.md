---
title: "Architecture Meta-Exploration: The \"Why\" behind the Layers"
status: "active"
created: 2026-03-25
updated: 2026-03-25
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# Architecture Meta-Exploration: The "Why" behind the Layers

This document explains the logic used to decide where a package belongs and how to maintain a future-proof, "Zero Tech Debt" architecture.

## 1. The Core Principle: The Arrow of Dependency
In a healthy architecture, dependencies should only flow in ONE direction: **Downwards**.
*   **Downstream (L1)**: Stable, generic, slow-changing.
*   **Upstream (L3)**: Specific, experimental, fast-changing.

> [!IMPORTANT]
> A package in L1 *must not* know anything about L2. If it does, you can't test or use L1 without dragging in the entire L2 ecosystem. This is why "IdentityCard" being in Profile (L2) but needed by UI (L1) creates a cycle.

## 2. Deciding the Layer: The Criteria

| Criterion | Layer 1 (Foundation) | Layer 2 (Feature Domain) | Layer 3 (App Shell) |
| :--- | :--- | :--- | :--- |
| **Who uses it?** | Everybody. | Navigation-specific. | The User. |
| **Change Frequency** | Low (Stable APIs). | Medium (Feature updates). | High (Wiring & Routing). |
| **Opinionated?** | No (Dumb primitives). | Yes (Business logic). | Yes (Wiring logic). |
| **Examples** | `core`, `ui`, `ai`, `analytics`. | `classroom`, `admin`, `profile`. | `gurudevi-mobile`. |

### Why is AI in Layer 1?
AI (Sparkle, Chat, Context) is a platform-wide capability. If it were L2, every other feature (Classroom, Admin) would have to "import" the AI package, creating a massive web of horizontal dependencies. By making it L1, we say: "AI is a basic tool, like a Button or an API call, available to everyone."

### Why are Admin and Classroom both Layer 2?
They are **Silos**. A teacher in a Classroom doesn't need the Principal's Admin tools loaded in their memory. By keeping them both in L2, we ensure they are decoupled. If they need to talk, they do so through the **Shell (L3)** or **Core (L1)**.

## 3. The "IdentityCard" Dilemma
You asked: *Why not add IdentityCard to UI and reuse it?*
**YES, exactly!** This is the "L1-ization" of a pattern.

*   **Old Way (Broken)**: `ui` imports `IdentityCard` from `profile`. (L1 imports L2 = Cycle).
*   **New Way (Healthy)**: Move the *structure* of `IdentityCard` (layout, styles, skeleton) to `ui`. 
*   **How it works**:
    1.  `@repo/ui` defines `IdentityCardSkeleton` (Dumb component).
    2.  `@repo/profile` uses it to build the *data-aware* `UserProfileCard`.
    3.  `@repo/classroom` uses it to build the `StudentCard`.
    *   Now, `ui` remains clean, and everyone has a consistent identity design!

## 4. Future-Proofing
When adding a new package, ask: *"If I delete the 'Classroom' package tomorrow, will this new package still work?"*
*   If **YES** (e.g., a new Math Graph logic) -> It's probably L1.
*   If **NO** (e.g., a 'Classroom Gradebook' extension) -> It's L2 (or a sub-package of Classroom).
