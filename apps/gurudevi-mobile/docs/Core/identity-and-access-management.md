---
title: "Identity and Access Management (IAM)"
status: "active"
created: 2026-06-09
updated: 2026-06-09
author: "Naveen"
scribe: "Antigravity"
tags: [technical, iam, rebac, cedar]
---

# Identity and Access Management (IAM)

This document establishes the baseline design and runtime implementation rules for Gurudevi's Identity and Access Management system.

---

## 1. Perspectives & Bonds Context

Instead of a single, immutable user role, Gurudevi's client-side authorization state adapts dynamically depending on the selected perspective.

* **Context Hook (`usePermissions()`)**: Maps the selected `activePerspective` from the Zustand global store into a valid `UserContext`:
  * `userId`: Identifies the human user record.
  * `schoolId`: The tenant root scope.
  * `capacity`: The active role label (e.g. Teacher, Student, Principal) derived from the selected relationship bond.
  * `classroom_ids`: Array of classroom UUIDs linked to the active perspective.

---

## 2. Offline-First ReBAC (Cedar Policy Engine)

To allow permissions checks while completely disconnected from the network, we evaluate Relationship-Based Access Control (ReBAC) policies locally on the device using **Cedar**.

```
[ Local SQL DB (cedar_policies) ]
               │
               ▼ (Asynchronous load)
[ `@cedar-policy/cedar-wasm/web` ] ◄── [ UserContext & Request ]
               │
               ▼
   [ Decision: Allow / Deny ]
```

### Evaluation Process
1. **Local Policies**: Cedar DSL policies are synchronized to the SQLite database table `cedar_policies`.
2. **WASM Evaluation**: When checking a permission (e.g. `checkLocalPermission()`), we asynchronously load the compiled `@cedar-policy/cedar-wasm/web` module.
3. **Request Mapping**: We map the active `UserContext` attributes and context indicators (like device status) directly into the Cedar principal fields, comparing them against target resource schemas.

---

## 3. Dynamic Attribute Resolution for Offline Writes

When a user is offline, they may create new classrooms or lesson plans. Since these items have not synced to the cloud, the policy engine must resolve their properties locally to validate subsequent access checks.

* **`getLocalResourceAttributes(type, id)`**: Performs quick Drizzle SQLite queries to load relational attributes:
  * For **Classrooms**: Resolves `school_id`, `teacher_id`, `grade_id`, and `section_id`.
  * For **Schools**: Resolves `subscription_tier` and `isActive` boolean flags.

---

## 4. Device Trust Integration

Permission decisions are bound to the cryptographic safety of the device itself.
* **`DeviceTrustEngine`**: Evaluates security parameters (detecting local roots, debugger attachments, or system tampering) and returns a status tag:
  * `trusted`: Device has passed integrity checks.
  * `restricted`: Local tampering detected; permissions collapse to read-only or fail-secure.
  * `stale`: Integrity data is too old.
  * `standard`: Default baseline status.
* **Cedar Context Integration**: The device trust payload is sent directly into the `CedarEvaluationContext` payload, allowing specific policies to deny high-value actions (like grading or roster changes) if the device trust status falls below the `trusted` threshold.
