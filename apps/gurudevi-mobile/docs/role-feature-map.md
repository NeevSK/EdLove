# Deep Role-Feature Architecture (Resonance V1.4 - Offline & Playground Focused)

This architecture defines the **Topological Field** of the Gurudevi ecosystem. It moves beyond a simple list of features to define **Kernels of Logic** and their intended **Resonance** across the spatial dimensions of the platform, specifically catering to an **Offline-First** paradigm.

## 1. The Multi-Layer Feature Matrix

Each role resonates differently within the same spatial domains (Self, Community, Classroom).

### A. The 'Self' Sanctuary (Personal Rhythm)
| Kernel | Primary Role Focus | Resonance Type | Logical Boundary |
| :--- | :--- | :--- | :--- |
| **Pulse Dashboard** | All Roles | `Ecosystem Feedback` | `@repo/self/analytics` |
| **Mood Lotus** | Students / Staff | `Personal Healing` | `@repo/core/mood` |
| **Decision Journal** | Principal / Founder | `Metacognitive Audit` | `@repo/self/decisions` |
| **Shadow Agent** | All Roles | `AI Co-Pilot` | `apps/components/self` |

### B. The 'Community' Hearth (Collective Resonance)
| Kernel | Role-Based Affordance | Governance | Resonance Path |
| :--- | :--- | :--- | :--- |
| **Resonant Feed** | All | Tag-Locked (Education) | `@repo/community/feed` |
| **Infinite Galaxy** | Principal / Teacher | Group Creation Logic | `@repo/community/groups` |
| **Manifesto Loop** | Principals | Institutional Promises | `@repo/community/manifestos` |

---

## 2. Core Paradigms (Structural Integrity)

Based on strategic alignment, the architecture fundamentally embraces two paradigms:

1.  **Offline-First Identity**:
    - *Concept*: The app must function seamlessly without a network connection.
    - *Implementation*: Core identity metrics (`userId`, `role`, `schoolId`) must be persisted locally (e.g., via Zustand + SecureStorage) and hydrated immediately upon startup. Every corner of the app must rely on this local, offline-available context.

2.  **Authentic Playground Resonance**:
    - *Concept*: `mock-school` provides a safe playground for unauthenticated or newly registered users. However, we must only showcase **authentic, existing features**.
    - *Implementation*: The app dynamically switches to a `mock-school` context if no real `schoolId` is present.
    - *Student Constraint*: We must not artificially render "fake" features for students in the mock school. If a student feature (e.g., Daily Goals) is not yet built, the mock view will honestly display its "Coming Soon / In Production" state via a `PositiveInvitation` rather than populating it with fake dummy data that creates a false expectation. The Teacher view (which has more completed features) will continue to show its true capabilities in the mock environment.

---

## 3. Healing Gestures (Reparative Implementation)

| Trigger (Decay/Gap) | Reparative Gesture (The Repair) | Tone |
| :--- | :--- | :--- |
| **Guest / Missing Role** | Route to `mock-school` Playground with `PositiveInvitation` | Welcoming, non-blocking |
| **Network Disconnect** | Utilize Offline-First Identity via Zustand | Calm, resilient |

---

## 4. O(Trajectory) Milestones

- **Kernel 1: Persistent Identity**: Ensure `useUserRole` and `useActiveSchool` are fully backed by offline storage and serve as the undeniable local source-of-truth.
- **Kernel 2: Role-Specific Playgrounds**: Implement distinct `mock-school` experiences for Students vs. Teachers in both the Classroom and Community sections.

---
*Generated: 2026-02-26*
*Refined for Depth: V1.4*
