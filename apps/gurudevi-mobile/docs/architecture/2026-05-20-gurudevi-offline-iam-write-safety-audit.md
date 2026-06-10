---
title: "Gurudevi Offline IAM & Write Safety Audit (May 20, 2026)"
status: "active"
created: 2026-05-20
updated: 2026-05-20
author: "Naween"
tags: [reorganized]
---

# Gurudevi Offline IAM & Write Safety Audit (May 20, 2026)

This document maps out the **Double-Gate Zero-Trust Sandbox** architecture completed for the Gurudevi Sanctuary platform. It catalogs our accomplishments, highlights current limitations under low-connectivity and low-compute conditions, and provides a strategic roadmap to achieve the highest quality production-grade UX.

---

## 1. Architectural Progress: The Double-Gate Sandbox

We have successfully locked down both client-side and server-side write pathways, ensuring that no ad-hoc mutation or unregistered API route can bypass the **Cedar + ZenStack** security posture.

```
       [Client Surface]
              │
      ┌───────┴───────┐
      ▼               ▼
  POA Proxy      Drizzle ORM
 (API Gateway)  (Local SQLite)
      │               │
  Default-Deny   Secure Proxy
 (Contract check) (Cedar WASM)
      │               │
      ▼               ▼
 [Sanctuary API] [PowerSync Sync]
      │               │
      └───────┬───────┘
              ▼
    [Server ZenStack RLS]
              │
              ▼
       [PostgreSQL DB]
```

### Key Milestones Completed:
1. **Strict Isomorphic POA Gating:** Hardened `createPOAProxy` with a default-deny policy. All unmapped client APIs now trigger a runtime `MISSING_CONTRACT_COVERAGE` exception, eliminating "ghost features" that execute outside Cedar auditing.
2. **Secure Drizzle Mutation Proxy:** Intercepted all database mutations (`insert`, `update`, `delete`, `transaction`) within the client-side Drizzle wrapper. Ad-hoc local writes must pass `checkLocalPermission` (dynamic local Cedar evaluation) before compiling to SQLite.
3. **Coherent Feature Gating Engine:** Refactored `useFeatureRegistry` and `useSanctuaryRegistry` to gate UI domains and classroom surfaces directly via synchronous, offline-replicated Cedar snapshots (`can(action, subject)`), completely eliminating ad-hoc static role bypasses (`role === requiredRole`).

---

## 2. Current Architectural Limitations

While the platform is incredibly secure and robust, executing local-first ReBAC and Cedar WASM rules on native mobile devices (iOS/Android) presents specific production bounds:

### A. SQLite Policy Size Overhead
* **Limitation:** To check permissions offline, we replicate all user policies into the local `cedar_policies` table. Reading and compiling this table as a raw string has a safety boundary capped at `100KB` to prevent Herme's engine memory starvation.
* **Risk:** If a school's policy set expands beyond `100KB`, the safety guard throws a compile warning and denies local writes to fail-secure.

### B. Cold Start WASM Compilation Latency
* **Limitation:** Resolving dynamic permissions requires loading the `@cedar-policy/cedar-wasm` engine. Under cold starts on low-end Android hardware, loading this module introduces a `50ms - 150ms` synchronous layout block.
* **Risk:** Visual lag may occur if the first database query is fired instantly on screen mounting.

### C. Outbox Conflict and Change-of-Authorization Resolution
* **Limitation:** If a user makes a write offline, it is approved locally against their local snapshot. If their authorization is revoked server-side while they are offline, the outbox sync will fail upon connection restoration.
* **Risk:** The outbox sync fails silently at the server layer, creating a "ghost state" where the user's local database reflects a write that the server has rejected.

---

## 3. Strategic Roadmap for Production-Grade UX

To elevate the app from a hardened sandbox into an elegant, high-fidelity production app, we recommend executing the following initiatives:

### Phase 1: Policy Partitioning and Context Snippets
* **UX Strategy:** Do not sync the entire school policy bundle to every client. Instead, partition the SQLite `cedar_policies` table so that a user only syncs policies scoped to their **active capacities** and **active bonds** (e.g. only student-related policies are synced to a student client).
* **Impact:** Reduces local compilation payload from `100KB` to `<5KB`, eliminating Android memory starvation risks.

### Phase 2: Pre-compiled Policy Cache
* **UX Strategy:** Pre-instantiate and warm up the `@cedar-policy/cedar-wasm` engine in a background thread or service worker during app boot (splash screen), rather than lazyloading on first query.
* **Impact:** Reduces mutation evaluation latency to `<2ms`, providing immediate UI feedback.

### Phase 3: The Outbox Reconciliation Center (UX Engine)
* **UX Strategy:** Implement a beautiful, user-facing **Sync Outbox Tray** or **Reconciliation Panel** inside the Self dashboard.
  * Shows pending mutations (e.g., "Recording Attendance... ⏳ (offline)").
  * Provides manual retry options.
  * Visually highlights conflict rejections with helpful remediation guides (e.g., "Permission expired. Click here to re-authorize with your teacher's PIN.").
* **Impact:** Builds immense trust in local-first data integrity.

### Phase 4: Offline Media Sync Queue
* **UX Strategy:** Integrate the Drizzle Proxy with a background attachment manager. Writing a community post with a picture creates a temporary local placeholder, queues the image binary in a dedicated folder, and uploads it via background chunks prior to committing the DB row.
* **Impact:** Enables truly offline-first social feed creation.
