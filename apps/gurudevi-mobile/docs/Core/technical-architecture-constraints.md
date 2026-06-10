---
title: "Technical Architecture and Constraints"
status: "active"
created: 2026-06-09
updated: 2026-06-09
author: "Naveen"
scribe: "Antigravity"
tags: [architecture, technical, database, offline-first, multi-tenant]
---

# Technical Architecture and Constraints

This document defines the technical architecture limits, sync patterns, and multi-tenant database constraints for the Gurudevi application.

---

## 1. Offline-First & Data Sync (Two-Lane Pattern)

Rural connectivity in Sri Lanka requires robust data resiliency. We enforce the **Two-Lane Future Pattern**:

### A. Lane 1: Auth Bootstrap
* Platform-aware session management (Supabase Auth).
* Restricts token handling to local storage and bootstrap headers. Handles zero application business data.

### B. Lane 2: Application Data
* Local-first, gateway-driven CRUD.
* UI and business code must never query Supabase directly. All reads load from local cache or PowerSync projection tables. All mutations queue locally and sync through the **Sanctuary API Gateway**.

```
[ UI / Feature Code ]
       │ (Zustand / TanStack Query)
       ▼
[ Local Cache / PowerSync Projection ]
       │ (Sync Queue)
       ▼
[ Sanctuary API Gateway ]
       │ (Row-Level Security)
       ▼
[ Supabase PostgreSQL DB ]
```

### C. Data Integrity Rules
* **Client-Side UUIDs**: All primary keys are UUIDs generated on the device using `crypto.randomUUID()` to allow conflict-free client writes.
* **Temporal Discipline**: Tables require both `occurred_at` (actual event time) and `created_at` (network sync time).
* **Idempotency Keys**: Network transactions (especially grades and attendance) require client-side idempotency keys to prevent duplicate entries during sync retries.

---

## 2. Mobile-First constraints

* **The 2GB RAM Limit**: Constraints on target devices require thin UI footprints. Keep screen components focused on rendering state, while business logic resides in `@repo/core` hooks and stores.
* **Low-Tier Render Optimization**: Blurs and heavy animations are disabled on low-tier targets. Grid lists must recycle items using `@shopify/flash-list` to avoid memory leakage.

---

## 3. Multi-Account & Multi-Device Boundaries

* **Multi-Account Phone Sharing**: Supports multiple distinct accounts (e.g. mother and children) on a single shared device.
  * *Boundary Constraint*: Local state and active perspectives must remain completely isolated. No single user may run two active accounts/perspectives simultaneously on the same device.
* **Multi-Device Coherence**: Real-time conflict-free replication across multiple physical platforms (web vs. mobile) is enabled by client UUIDs and PowerSync projection rails.

---

## 4. Multi-Tenant Database Isolation

All schools share a single PostgreSQL database on Supabase, isolated using **Row-Level Security (RLS)**.

### A. School Tenant Keys
Every school table has a `school_id` tenant key. RLS rules enforce that a user can only query or write data corresponding to their active `school_id` perspective context.

### B. Explicit Sovereignty Grants (ADR-002)
We reject vertical surveillance by default (e.g., higher administrative roles automatically viewing lower-level student wellbeing details). 
* Any cross-tenant or administrative data access (counselors, principals, or external schools accessing student records) requires an explicit, time-bound relational entry in `student_record_access_grants`.

### C. Tenant Kind Segmentation
Tenants are classified using `tenant_kind` (`internal`, `customer`, `demo`, `sandbox`). Reporting engines and analytics packages must segment queries by `tenant_kind` to exclude internal test data from production analytics.
