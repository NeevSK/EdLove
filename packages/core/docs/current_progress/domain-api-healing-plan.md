---
title: "Sovereign Domain API Healing Plan"
status: "active"
created: 2026-07-28
updated: 2026-07-28
author: "Naveen"
scribe: "opencode"
tags: [packages, core, historical]
---

# Sovereign Domain API Healing Plan

## Objective
Migrate legacy Supabase-direct API managers to the **Sanctuary RPC Gateway**, enforcing **ReBAC (Relationship-Based Access Control)** and "Loud Failure" patterns to eliminate technical debt and ensure architectural integrity across the monorepo.

## Status: HEALED (Phase 2 Complete)

### Phase 1: Foundation (COMPLETED)
- [x] Defined `educational.contract.ts` and `community.contract.ts`.
- [x] Established `SovereignClient` factory with Hono RPC support.
- [x] Implemented core POA (Port-and-Adapter) proxy infrastructure.

### Phase 2: Orchestration Layer Hardening (COMPLETED)
- [x] **Sanctuary RPC Siphoning**: All domain APIs (Attendance, Community, Classrooms, Staff) now route through the Sanctuary gateway.
- [x] **Contract Enforcement**: implemented `createTemporalPOAProxy` with strict contract coverage checks.
- [x] **Loud Failure Realignment**: Resolved all TypeScript warnings caused by method renamings and signature shifts.
- [x] **Hook Synchronization**: Updated `@repo/core` hooks (comment, poll, community) to match ReBAC-aware contract signatures.
- [x] **Proxy Mapping Repair**: Fixed the POA proxy to correctly bridge contract-driven method calls to internal implementations.

### Phase 3: Identity & ReBAC Deep Integration (NEXT)
- [ ] **Auth Store Refinement**: Transition remaining hooks to use `useAuthStore` for citizen-first identity resolution.
- [ ] **Capability Registry Integration**: Wire the `DomainRegistry` into the POA interception layer for granular feature gating.
- [ ] **Cross-Platform Mobile Validation**: Run `tsc` on `apps/gurudevi-mobile` to catch any remaining downstream breakages.

## Key Architectural Decisions
1. **Loud Failure**: Methods were intentionally renamed (e.g., `record` -> `recordAttendance`) to break legacy calls and surface hidden dependencies.
2. **Contract-First**: The Hono RPC contract is the source of truth; implementations that diverge from the contract are blocked by the POA proxy.
3. **Identity Injection**: Citizen context is automatically injected via the `createPOAProxy` from the global `useAuthStore`, removing the need for manual ID passing.
