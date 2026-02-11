# TRIPLE-HELIX BDD: THE GURUDEVI ARCHITECTURAL SOUL

**Version**: 1.0  
**Date**: February 11, 2026  
**Status**: Formalized Architecture  

---

## 1. The Analogy: Life & Code

The **Triple-Helix BDD** approach represents the synthesis of three distinct but inseparable strands of truth required to build a "Sanctuary-grade" application like Gurudevi. 

| Helix Strand | Philosophical Domain | Technical Tool | Analogy |
| :--- | :--- | :--- | :--- |
| **Strand 1: Behavior** | The "What" (Intent) | BDD (Gherkin/jest-cucumber) | The Soul / Life-force |
| **Strand 2: Structure** | The "How" (Execution) | TDD (Jest/Unit Tests) | The Bone & Muscle |
| **Strand 3: Specification** | The "Where" (Constraints) | Technical Docs (Markdown/JSON) | The Environment / Gravity |

---

## 2. Why Triple-Helix? (The Synthesis)

Building with only one or two strands leads to structural decay in complex monorepos:

1.  **Behavior + Structure (No Spec)**: The app works and is well-tested, but it doesn't align with the project's long-term environmental constraints (e.g., $0 budget, low-end devices, Sri Lanka-specific needs).
2.  **Behavior + Spec (No Structure)**: The app does exactly what the user wants, but the code is a "spaghetti" mess that is impossible to maintain or refactor. This is the **Goodhart's Law** trap.
3.  **Structure + Spec (No Behavior)**: The code is perfectly engineered and efficient, but it doesn't actually solve the user's problem or feels "robotic" and unintuitive.

**The Triple-Helix ensures that the Soul (Behavior) is supported by Bone (Structure) within a defined Environment (Spec).**

---

## 3. Deep-Dive: Behavior (The Soul)

In Gurudevi, Behavior is defined through **Gherkin (.feature files)**.

- **Purpose**: To provide a common language that the Human Visionary and AI Architect both understand.
- **Enforcement**: By using `jest-cucumber`, we ensure that if the "Soul" (Gherkin) doesn't approve, the code cannot be considered "Done."
- **Key Flow**: `Draft Feature` -> `Step Definitions` -> `Green Test`.

---

## 4. Deep-Dive: Structure (The Bone & Muscle)

Structure is defined through **Clean Code Patterns** and **Unit Verification**.

- **Purpose**: To ensure the code is modular, tree-shakeable, and scalable.
- **Enforcement**: This is where the **UI Abstraction Layer (`@/ui`)** and **Zustand Store** logic live. Even if a BDD test passes, we audit the "Bone" to ensure no direct Gluestack imports exist and that types are resolve-able without stack overflows.
- **Pattern**: Atomic components, pure functions, and predictable state.

---

## 5. Deep-Dive: Specification (The Environment)

Specification is defined in our **Docs v 3.0** directory.

- **Purpose**: To define the "Gravity" our code must survive in.
- **Constraints**: 
    - **Economic**: Free-tier only (Supabase, Firebase, Cloudinary).
    - **Hardware**: Must run on 2GB RAM / 3G data devices.
    - **Cultural**: Must support Si/Ta/En from day one.
- **Enforcement**: Weekly audits against `PROJECT_STATUS_REPORT.md` and `PRODUCTION_READINESS.md`.

---

## 6. The "Spiral" Integration

The Triple-Helix is not a static document; it is a **dynamic spiral**:

1.  **Discovery**: A new vision item appears in `CURRENT_SPRINT.md` (Spec).
2.  **Conceptualization**: We write a `.feature` file to define how it should feel (Behavior).
3.  **Hardening**: We build the code using the UI Abstraction layer and verified components (Structure).
4.  **Verification**: We run the BDD suite to confirm the helix is unified.

---

## 7. AI-Human Collaboration Impact

For the Gurudevi project, this means:
- **The Human** primarily shapes the **Soul** (Behavior) and **Environment** (Spec).
- **The AI** primarily builds the **Bone** (Structure) and ensures it satisfies the Soul while surviving the Environment.

This partnership prevents the AI from "Gaming the Measure" and ensures the Human's vision remains technically viable.

---
*Blueprint by Antigravity & Sovereign Developer*
