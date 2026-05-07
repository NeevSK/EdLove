# Citizenship & Identity Architecture: The Sovereignty Journey

## 🎯 1. The Core Principle: "No One is a Stranger, No One is Idle"
The Gurudevi Sanctuary is designed as a progressive journey of participation. Access is governed not just by "Authentication" (Login), but by **"Citizenship"** (Participation Level).

### The Onboarding Gate (Hard Constraint)
*   **Zero-Entry Default**: No user (Anon or Auth) can access the core application features without completing **Onboarding**.
*   **Mandatory Role Selection**: During onboarding, the user *must* choose their primary archetype (Student, Teacher, or Principal). This choice is stored immediately in the `users` table to drive the UI context.

---

## 🗺️ 2. The Citizenship Lifecycle
We distinguish between four distinct states of being within the platform:

| Level | Name | Auth Status | Profile Status | Access Level |
| :--- | :--- | :--- | :--- | :--- |
| **0** | **Wanderer** | Supabase Anon | None | Public Nodes only (Pre-Onboarding). |
| **1** | **Traveler (Guest)** | Anon / Session | Role Chosen | **Onboarded Guest**. Has a `users` record but no permanent credentials. Access to personal workspace. |
| **2** | **Citizen** | Authenticated | Profile Created | **2nd Class Citizen**. Permanent identity, personal "Sanctum" workspace, but no institutional ties. |
| **3** | **Professional** | Authenticated | Institutional Link | **1st Class Citizen**. Fully integrated into a School/Classroom tenant. |

---

## 🏛️ 3. Workspace Topology
Every "Onboarded" user (Level 1+) operates within a dual-workspace environment:

### A. The "Personal Sanctum" (Personal Workspace)
*   **Ownership**: 100% User-Owned.
*   **Scope**: Personal notes, private bookmarks, growth reflections, and private learning nodes.
*   **Discovery**: Hidden from all other users and schools.
*   **Implementation**: Effectively items where `school_id IS NULL` and `creator_id = auth.uid()`.

### B. The "Official Grounds" (Institutional Workspace)
*   **Ownership**: School/Classroom-Owned.
*   **Scope**: Official curricula, institutional announcements, classroom grades, and school-wide events.
*   **Governance**: Subject to School Policy and Principal oversight.
*   **Implementation**: Items linked to a specific `school_id` or `classroom_id`.

---

## 🛠️ 4. Technical Implementation Guidelines

### Identity Persistence
*   **Anon Users**: Even anonymous users receive a record in the `users` table. This allows the system to remember their chosen role and onboarding progress across a single session or device life.
*   **The "Upgrade" Path**: When an Anon Traveler authenticates (Citizen), their existing `users` record and session data should be merged/promoted to the permanent Auth identity to maintain continuity.

### Truth Determination
The **Truth** of a user's role is a computed hierarchy:
1.  **Does an active `school_membership` exist?** → User is a **Professional** in that context.
2.  **Does a `teacher_profile` / `student_profile` exist?** → User is a **Citizen** of that archetype.
3.  **Does `onboarding_completed` = true?** → User is a **Traveler/Guest**.

### Row Level Security (RLS)
The RLS policies must strictly enforce the **Citizenship Boundary**:
*   `SELECT` on Institutional data requires Level 3 (Institutional) membership.
*   `SELECT` on Personal data requires `auth.uid() = creator_id`.
*   `SELECT` on Community/Public data is open to Level 1+.

---

## 📝 5. Summary Technical Map
*   **Table: `users`** -> Identity Bucket (Anon path to Auth path).
*   **Table: `user_growth_state`** -> Citizenship tier tracking (`bhumi_stage`).
*   **Table: `school_memberships`** -> The Institutional "First Class" ticket.
*   **View: `unified_user_profiles`** -> The query interface that abstracts all of the above.
