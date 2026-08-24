---
title: "Gurudevi School ERP Architecture Plan"
status: "active"
created: 2026-03-25
updated: 2026-03-25
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# Gurudevi School ERP Architecture Plan

## Summary
Gurudevi should evolve as an **education ecology support system with ERP capabilities**, not a generic institutional ERP. The next architecture pass should optimize for **boundary clarity, role/tenant correctness, and web-first admin experience**, while preserving the existing app shell and the sanctuary philosophy.

Chosen direction:
- Use a **deep domain split now**
- Keep `classroom` focused on **teacher-student-classroom activity**
- Move broader human/admin concerns into `people`
- Keep `forms`, `letters`, and `reports` in `admin` for this phase
- Design external actors/guardians at the **foundation level only**, not as a full feature wave yet

## Key Changes
### 1. Domain model and package ownership
Adopt these active bounded domains for the next stable architecture:
- `@repo/core`: auth, tenancy, memberships, RBAC/capabilities, actor model, audit, workflows, notifications, shared policy contracts
- `@repo/admin`: school governance, official documents, forms, letters, reports, approvals, calendar, inventory, school structure
- `@repo/people`: human directory, staff identity, teacher records, memberships, placements, staff attendance, leave, human administration
- `@repo/classroom`: classroom delivery, student attendance, lessons, lesson plans, assignments, submissions, marks, timetable, student analysis
- `@repo/workforce`: keep as reserved architecture for non-academic staff operations; do not deeply implement yet
- `@repo/accounting` and `@repo/payments`: keep present and aligned, but outside the immediate cleanup wave

### 2. Role, RBAC, and tenancy
Formalize and consistently use the already-emerging 3-layer authority model:
- `PlatformRole`: founder/platform-level sovereignty and audited cross-tenant access
- `SchoolRole`: principal, teacher, student, section/grade leadership
- `WorkRole`: functional job roles inside a school

Rules:
- Founder/global visibility must stay **platform-scoped**, never disguised as a school super-role
- All cross-school access must go through capability checks and auditability
- Every business entity must resolve through `TenantContext`
- `TenantKind` remains first-class: `internal`, `customer`, `demo`, `sandbox`

### 3. Boundary cleanup and extraction
Complete the extraction that the docs already point toward:
- Remove principal governance ownership from `@repo/classroom`
- Make `apps/gurudevi-mobile` screens thin adapters only
- Keep principal web orchestration in `@repo/admin`
- Move staff attendance, leave, and staff-management surfaces into `@repo/people`
- Keep student analysis in `@repo/classroom` unless it becomes institution-wide reporting
- Keep classroom resources in `classroom`; institutional assets stay in `admin/inventory`

### 4. Documents and reporting
For this phase, place these in `@repo/admin`:
- official letters
- forms
- school reports
- export/reporting workflows

Rule:
- if the artifact is an institutional document or governance/reporting artifact, it belongs to `admin`
- classroom may consume those outputs, but should not own the institutional document system

### 5. Philosophy-to-architecture translation
Use the ecology philosophy as an architectural constraint, not only branding:
- **Policentric**: authority is distributed by scope, not centralized into one giant principal package
- **Holarchic**: school, section, grade, classroom, and person are nested scopes with explicit boundaries
- **Cybernetic**: feedback loops live in reporting, observations, analytics, and corrective workflows
- **Autopoietic**: packages should self-maintain their own invariants through capability and boundary tests
- **Impedance matching**: web gets explicit ERP-grade admin UX without breaking mobile-safe contracts

## Public Interfaces and Contracts
Standardize and treat these as durable architecture contracts:
- `PlatformRole`
- `SchoolRole`
- `WorkRole`
- `Membership`
- `TenantContext`
- `PlatformAccessContext`
- `ScopeRef`
- `TenantKind`
- `Actor`
- `ActorRelationship`
- capability APIs such as `useCapabilities()`, `can(...)`, `requireCapability(...)`, `useTenantContext()`

Add or tighten these behavior contracts:
- principal/admin web views cannot import DB clients directly
- `classroom` cannot own governance orchestration
- customer reporting can segment or exclude `internal`/`demo` tenants
- founder/platform actions must remain capability-gated and auditable

## Test Plan
Required scenarios:
- principal governance flows resolve from `admin`, not `classroom`
- staff attendance and leave resolve from `people`, not `classroom`
- student attendance, assignments, lesson flows, and student analysis stay in `classroom`
- `school.manage` gating works for principals and platform roles only
- teacher access stays scoped to assigned classroom/self-service actions
- cross-tenant access is denied unless granted by platform capability
- `tenant_kind` segmentation works for internal/demo/customer reporting
- classroom resources and institutional inventory cannot be misclassified
- current mobile/web shell and route contracts remain stable after extraction

## Assumptions and Defaults
- Primary tenant is still a **single Sri Lankan school**; multi-tenancy is school-scoped SaaS from day one
- We are planning for broader actors later, but current implementation remains centered on principal, teacher, and student
- Guardians/external stakeholders are **foundation-ready only** in this wave
- No nav-shell redesign in this pass
- No major schema rewrite unless required to support the boundary model safely
- `admin` is the home for institutional documents/forms/reports in this phase
- `workforce` is reserved for non-academic staff depth later, not activated as a full implementation pillar yet
