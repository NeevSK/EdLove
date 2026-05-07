# 💠 Sovereign Identity Fabric: Truthful Audit (2026.05)

This document serves as the authoritative technical reference for the **Gurudevi Sovereign Identity Fabric**. It documents the end-to-end flow of identity, authority, and onboarding logic across the entire stack.

---

## 🏛️ 1. Database & RLS Layer (Foundation)
The identity fabric is anchored in two primary Supabase tables, governed by **Row Level Security (RLS)**.

### `users` Table
- **Purpose**: Primary identity storage.
- **Key Columns**: `id` (UUID), `is_anonymous` (Boolean), `school_id` (UUID, nullable), `onboarding_completed` (Boolean).
- **RLS Policies**:
  - `SELECT`: Allowed for all authenticated users (Self-read).
  - `UPDATE`: Restricted to the user themselves (`auth.uid() = id`). 
  - **Critical Note**: Anonymous users are mapped to a temporary internal ID to allow profile updates during guest exploration.

### `bonds` Table
- **Purpose**: Atomic unit of **Relationship-Based Access Control (ReBAC)**.
- **Columns**: `user_id`, `entity_id`, `entity_type` (PLATFORM, SCHOOL, PERSONAL), `capacity` (admin, teacher, student).
- **RLS Policies**:
  - `INSERT`: Enabled for authenticated users to bootstrap their own identity (`auth.uid() = user_id`).
  - `SELECT`: Allowed for the user themselves or Platform Admins.

---

## 📜 2. ZenStack / Model Layer (Policy)
Access rules are declaratively defined in `schema.zmodel` and compiled into CASL-compatible policies.

```prisma
model Bond {
  // Access Control: Platform Admins or the user themselves can manage their bonds
  @@allow('all', auth().bonds?[capacity == 'admin' && entity_type == 'PLATFORM'])
  @@allow('read', auth() != null && user_id == auth().id)
  @@allow('create', auth() != null && user_id == auth().id)
}
```

---

## 🛡️ 3. Zod Layer (Validation & Runtime Context)
`packages/core/src/logic/schemas/user.schema.ts` defines the authoritative runtime shape of a user's context.

- **Naming Convention**: Strict `snake_case` (e.g., `user_id`, `active_bond`).
- **UserContextSchema**:
  - `bonds`: The "Union of Identity" (All active relationships).
  - `active_bond`: The current "Perspective" (The lens through which the user acts).
  - `is_anonymous`: Boolean flag for "Wanderer" status.

---

## 🔑 4. Policy-Oriented Authority (POA) (The Gatekeeper)
Authority is enforced via a proxy layer (`createPOAProxy`) that intercepts API calls and validates them against the **Authority Contract**.

- **Gatekeeper**: `poaProxy.ts`
- **Contract**: `identity.contract.ts` defines required actions (`read`, `update`, `resolve`).
- **Internal Bypass**: Methods like `getActivePerspective` or `getBonds` are added to `ignoredMethods` to allow the identity system to bootstrap itself without triggering circular authority checks.

---

## 🧠 5. API Orchestration (The Brain)
`packages/core/src/api/orchestration/identity.ts` coordinates identity resolution.

- **`getOnboardingStatus(id)`**:
  - State Machine: `ARRIVAL` -> `IDENTITY_SELECTION` -> `SANCTUARY_INIT` -> `COMPLETED`.
  - Determines if the user is a "Wanderer" or a "Citizen" based on auth status and bond presence.

---

## 🎨 6. UI Layer: Onboarding Logic (Interface)
Implemented with functional parity in `OnboardingScreen.tsx` (Native) and `OnboardingScreen.web.tsx`.

### The "Wanderer" (Guest) Logic
1. **Entrance**: User taps "Explore as Guest".
2. **Identity Selection**: User chooses a role (e.g., Teacher).
3. **The Gate**: 
   - `if (isAnonymous)` -> Skip `initializePersonalWorkspace`.
   - Wanderers are bound to `entity_id: 'GLOBAL'` with `entity_type: 'GUEST'`.
4. **Resumption**: If a user reloads the app, the UI fetches `getOnboardingStatus` and resumes the correct step automatically.

### The "Citizen" (Authenticated) Logic
1. **Entrance**: User signs up/logs in via Google or Email.
2. **Workspace Initialization**: 
   - `if (!isAnonymous)` -> Call `initializePersonalWorkspace`.
   - Creates a **Personal Workspace** for the user immediately.
3. **Promotion**: Once the user joins a school, they are promoted to a `SCHOOL` bond.

---

## ⚠️ 7. Critical Implementation Rules
1. **No CamelCase**: Identity attributes in DB/API/Zod MUST be `snake_case`.
2. **Prop vs Profile**: Always use the `isAnonymous` prop passed to UI screens rather than re-fetching `profile.is_anonymous` to prevent race conditions during hydration.
3. **Contract Coverage**: Every new identity-related API method MUST be either in `identity.contract.ts` or `ignoredMethods` in the orchestration proxy.
