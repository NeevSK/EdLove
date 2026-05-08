# Citizenship & Identity Architecture: The Sovereignty Journey

## 🎯 1. The Core Principle: "Personal Sovereignty First"
The Gurudevi Sanctuary is designed as a progressive journey. Unlike traditional systems, **Sovereignty resides with the User**, not the Institution.

### The Onboarding Gate (Hard Constraint) - because app is different for each need to select role first 
*   **Zero-Entry Default**: No user (Anon or Auth) can access the core application features without completing **Onboarding**.
*   **Mandatory Role Selection**: During onboarding, the user *must* choose their primary archetype (Student, Teacher, or Principal). This choice is stored immediately in the `users` table to drive the UI context.

### The Three Dimensions of Authority
1.  **Citizenship**: Lifecycle state and participation depth.
2.  **Role**: Contextual capabilities (ReBAC) within a specific entity (School, Group).
3.  **Pricing Tier**: Economic capacity and entitlement access.

### The Universal Workspace (Day 1)
*   **Full Capability Root**: Every user, from the moment they complete onboarding, has access to the full suite of application capabilities (Free/Sovereign version).
*   **No Blockers**: Every user—regardless of citizenship—receives a functional workspace.
*   **Autonomy**: A teacher or student can use the full suite of educational tools (Assignments, Grades, Community Groups) for private usage (tutoring, self-study) without ever joining a school.
*   **Institutional Integration**: "Joining a School" is an optional *Elevation* of the user's existing sovereign journey, not a prerequisite for utility.

---

## 🗺️ 2. The Citizenship Lifecycle (2026 Unified Model)
We distinguish between three distinct states of participation:

| Level | Name | Auth Status | Storage Strategy | Rights |
| :--- | :--- | :--- | :--- | :--- |
| **0** | **Wanderer** | Supabase Anon | **Local-Only** (SQLite) | Full Personal CRUD. No DB domain records. |
| **1** | **2nd Class** | Authenticated | **Cloud-Synced** (Private) | Personal Sanctum Backup. Full DB persistence. |
| **2** | **1st Class** | Authenticated | **Cloud-Institutional** | Institutional Bonds. Dual-Workspace Access. |

### The "Sovereign Grace" (7-Day Rule)
Wanderers enjoy full functionality. Data is saved locally via PowerSync. After 7 days, they are prompted to elevate to **2nd Class** to synchronize their "Odyssey" to the cloud.

---

## 🏛️ 3. Workspace Topology

### A. The "Personal Sanctum" (Level 0+)
*   **Ownership**: 100% User-Owned.
*   **Usage**: Private tutoring, personal growth, independent teaching.
*   **Visibility**: Private to the user. No school principal or admin has sight here.
*   **Citizenship**: Functional for Wanderers (Local) and 2nd Class+ (Cloud).

### B. The "Official Grounds" (Level 2)
*   **Ownership**: Institutional (School/Org).
*   **Usage**: Official K-12 curricula, district reporting, school announcements.
*   **Gating**: Requires **1st Class** citizenship and a verified **Bond** to an institution.
*   **Governance**: Subject to school-wide policies and principal oversight.

### C. The Dual-Workspace Context (1st Class Nuance)
*   **Persona Transition**: 1st Class users operate in two distinct contexts:
    1.  **Personal Workspace**: Their original sovereign journey (Level 1 cloud-synced).
    2.  **Official Workspace**: Their role-bound institutional context.
*   **UI Focus**: This dual-nature is primarily exposed in the `ClassroomScreen`, where users can toggle between their "Private Practice" and "School Assignments."
*   **Universal Domains**: Sections like `Self`, `Community`, and `Library` are typically role-agnostic and operate across both contexts without rigid workspace boundaries.

---

## 🛠️ 4. Technical Implementation Guidelines

### Identity Elevation
*   **Elevation to 2nd Class**: Occurs when a user links an identity. This triggers a "Migration" of local SQLite personal data to the user's private cloud schema.
*   **Elevation to 1st Class**: Occurs when a user establishes a **Bond** (Relationship) with an institutional entity.

### Authority Enforcement
The platform uses **POA (Permission-Oriented Architecture)**:
1.  **Contract (Hono)**: Defines the API surface and the required "Action/Subject" authority.
2.  **Abilities (CASL)**: `composeUserAbilities` grants `manage` rights on `PersonalWorkspace` to all users by default.
3.  **The Law (ZenStack)**: RLS policies in `schema.zmodel` ensure data is scoped correctly between Personal (User-ID) and Official (Bond-ID) contexts.

---

## 📝 5. Summary Technical Map
*   **Table: `users`** -> Stores `citizenship` and `primary_archetype` (Student/Teacher/Principal).
*   **Table: `bonds`** -> Maps users to Institutional entities.
*   **Engine: `composeUserAbilities`** -> The single source of truth for runtime capability.
*   **Patterns**: See [Sovereign Development Patterns](file:///c:/Users/Naween/projects/polymath-platform/packages/core/docs/SOVEREIGN_DEVELOPMENT_PATTERNS.md).
