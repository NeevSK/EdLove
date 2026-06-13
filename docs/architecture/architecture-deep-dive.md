---
title: "Architecture Deep Dive: Resilience through Restraint"
status: "active"
created: 2026-03-30
updated: 2026-03-30
author: "Naween"
tags: [reorganized]
---

# Architecture Deep Dive: Resilience through Restraint

This document expands on the **Architecture Guidelines** of the `polymath-platform` monorepo. It explains the "Why" behind our core principles and provides strategies for maintaining structural integrity as the system grows.

---

## 1. The Philosophy of Restraint
"The strength of a project's architecture is revealed not when it is being built, but when it is at a failure point." 

Architecture is not about what we *can* do, but what we **choose to forbid**. In a monorepo, where physical boundaries are thin, we use automated restraints (`dependency-cruiser`, `knip`) to create predictable, one-way paths for data and logic.

### Key Goals
- **Containment**: Limit the "Blast Radius" of bugs and breaking changes.
- **Predictability**: Ensure that a developer can understand one layer without needing to know the internals of all others.
- **Sustainability**: Prevent the code from becoming a single "Big Ball of Mud" where everything depends on everything.

---

## 2. The Layered Topology (Layers 0-4)
We follow a strict **Downward Import** hierarchy. Imports can only go to a lower layer or a sideways (same layer) package.

| Layer | Type | Role | Rule |
| :--- | :--- | :--- | :--- |
| **L0** | **Base** | Global primitives (Core, Types). | Cannot import upward. |
| **L1** | **UI** | Design system (UI, Graphics). | Cannot import upward. |
| **L2** | **Infra** | Specialized Engines (AI, Docs). | Cannot import upward (L3+). |
| **L3** | **Domains** | Business logic (Classroom, People). | Can import L0-L2. |
| **L4** | **Services** | Orchestrators (Payments, Accounting). | Can import all layers. |

### The "Sovereignty" Rule
Domain packages (Layer 3) should be **Sovereign Stores**. They should communicate through Layer 0 "Core Contracts" rather than importing directly from each other whenever possible.

---

## 3. Encapsulation: Subpaths vs. API Boundaries
How we expose code defines how much we can refactor later.

### Strategy A: Subpath Exports (L0-L1)
Packages like `@repo/ui` contain hundreds of components. We provide a root `index.ts` for lightweight atoms but enforce subpath usage for heavy items (e.g., `@repo/ui/charts`).
- **Why**: Prevents "Full Evaluation" of the entire library when only one button is needed. Boosts performance and reduces circularity risks.

### Strategy B: Public API Boundary (L2-L4)
Independent packages like `@repo/form-builder`, `@repo/trube-art`, `@repo/lk-edu-geo` must hide their internals. External code is forbidden from importing anything except the root `index.ts`.
- **Why**: Allows the internal structure to change entirely as long as the "Public Interface" remains the same.

---

## 4. Resilience at the Failure Point
Our architecture is designed to protect us during the following common "Failure Points":

- **The Dependency Failure**: If a library in Layer 2 needs a breaking update, Layer 0 remains unaffected because of the strict Downward Import rule.
- **The Performance Failure**: Subpath exports prevent the app from loading too much code upfront.
- **The Cognitive Failure**: New developers only need to understand the "Map" (L0 -> L4) to know where to place new features without polluting the system.

---

## 5. Advancements for Expo & React Native
### Zero-Trust Validation (Zod)
Never trust external data (Supabase, API, Storage). Use Zod schemas to validate data at the **System Boundary** (Layer 0/2) before it enters your Domain logic.

### Store Sovereignty
Avoid cross-store dependencies. If Store A needs data from Store B, pass that data in through an event, a prop, or a Core middleware to maintain testability.

### Peer Dependency Management
Keep Layer 0 and Layer 1 packages independent of heavy UI libraries. If a component requires a bulky library, make it an optional dependency or move it to a dedicated Infrastructure package (L2).

---

## 6. The Pragmatic Hybrid Strategy (The 80/20 Rule)
Architecture is a tool, not a trap. We use a hybrid approach to ensure developer happiness without sacrificing performance.

### The "Convenience API" (Root)
For Layer 0 & 1, the root `index.ts` is reserved for **Lightweight & Ubiquitous** items. These are components that are used almost everywhere and have minimal "evaluation cost" (e.g., Button, Spacing, Typography).

### The "Performance API" (Subpaths)
For **Heavy or Specialized** items, we enforce subpath exports. This ensures that you only "pay for what you use."

### Avoiding the "Trap"
If a rule stops progress without a clear benefit, iterate on the rule. We prefer **Warning** over **Error** for new rules until they are proven helpful.
