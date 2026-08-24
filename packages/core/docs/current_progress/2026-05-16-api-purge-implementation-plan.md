---
title: "Implementation Plan: Sovereign API Purge (Breaking Migration) ðŸ› ï¸"
status: "active"
created: 2026-05-16
updated: 2026-07-28
author: "Naveen"
scribe: "opencode"
tags: [packages, core, historical]
---

# Implementation Plan: Sovereign API Purge (Breaking Migration) 🛠️

## Objective
Fully eliminate `@ts-rest` from the monorepo and transition to a unified **Hono + Sovereign Port** architecture. This is a "Loud Failure" migration: we will intentionally break downstream consumers to ensure all hidden logic is surfaced and refactored.

## 1. Domain Status Registry
### Current Migration Status (The "Siphon" Stage)

| Domain | Status | Gateway Support |
| :--- | :--- | :--- |
| **Self** | ✅ Siphoned | Mood, Journal, Prefs |
| **Profile** | ✅ Siphoned | User, Social, Journey |
| **Community** | ✅ Siphoned | Groups, Posts, Reactions |
| **Classroom** | ✅ Siphoned | Structural, Lessons |
| **Grading** | ✅ Siphoned | Marks, GPA, Publication |
| **Attendance** | ✅ Siphoned | Daily Records, Pulse |
| **Identity** | ✅ Siphoned | Resolution, Capacity |
| **Admin** | ✅ Siphoned | Staff, Carousel, Leaves |
| **Library** | ⏳ Pending | Resources, Media |

---

## 2. Phase 1: The "Self" Domain (Vertical Slice)

### Step 1: Contract Transformation (Breaking)
*   **Action**: Delete `self.contract.ts` (ts-rest version) and recreate it using `SovereignContract`.
*   **Result**: All `api.self.*` calls in the mobile/web apps will immediately throw TS errors.

### Step 2: Adapter Implementation
*   **Action**: Implement the Hono handlers for the new Self contract.
*   **Action**: Ensure `POA Middleware` is correctly extracting metadata from the new contract format.

### Step 3: Orchestration Update
*   **Action**: Update the master `api` object in `packages/core/src/api/index.ts` to export the Hono-ready `selfAPI`.

### Step 4: Downstream Healing
*   **Action**: Refactor `gurudevi-mobile` and `neevsk-web` to use the new typed client.
*   **Action**: Verify that `AuthorityInterceptor` is correctly blocking unauthorized mood/journal actions.

---

## 3. Long-Term: The Railway Transition
*   **Centralization**: Once 80% of domains are migrated, we will pull all Hono adapters into a single `apps/sanctuary-api`.
*   **Deployment**: Switch Railway to be the primary `process.env.API_URL`.

---
*Last Updated: May 2026*
