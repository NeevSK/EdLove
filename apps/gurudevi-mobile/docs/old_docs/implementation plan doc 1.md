---
title: "Gurudevi Strategic Architecture Plan: Ecology Platform with School-Scoped ERP"
status: "active"
created: 2026-03-30
updated: 2026-07-24
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile, historical]
---

> **Superseded** � kept for historical reference.
> See active docs at docs/INDEX.md.
# Gurudevi Strategic Architecture Plan: Ecology Platform with School-Scoped ERP

## Summary
Gurudevi remains an **education ecology support system** first, with ERP behavior as enabling structure. The next architecture should preserve the current app shell while creating a stronger internal model around:

- clear domain boundaries
- separate authority layers
- school-scoped policy and tenancy
- future-ready support for non-academic staff and external stakeholders

The product should not collapse into a generic institutional ERP. It should become a **living school operating ecology** that can later include academic, operational, financial, and stakeholder flows without losing philosophical coherence.

## Core Architecture
### 1. Domain packages
Target structure:

- `@repo/core`
  - auth
  - tenancy
  - memberships
  - capabilities/policies
  - workflows
  - audit
  - notifications
  - actor model
- `@repo/classroom`
  - student attendance
  - lessons and lesson plans
  - assignments and submissions
  - marks and gradebook
  - timetable
  - student analysis
  - classroom-linked resources
- `@repo/people`
  - person identity inside a school
  - staff directory
  - teacher profiles
  - student profiles
  - role memberships and placements
  - parent/guardian relationship foundations later
- `@repo/workforce` (future-facing, not first implementation wave)
  - non-academic staff
  - job families
  - employment/assignment structures
  - shifts, leave, attendance, duty rosters, service roles
- `@repo/admin`
  - school structure
  - approvals
  - governance
  - institutional calendar
  - official documents
  - reporting
  - school asset inventory
- `@repo/accounting`
  - ledger
  - budgeting
  - finance records
- `@repo/payments`
  - fees
  - invoices
  - receipts
  - payment gateway orchestration

### 2. Inventory and resources split
Use a strict split:

- `classroom/resources`
  - whiteboards assigned to a classroom
  - lesson-linked classroom materials
  - classroom-specific equipment and teaching support items
- `admin/inventory`
  - school-wide assets
  - labs as institutional assets
  - devices
  - furniture
  - stockrooms
  - stationery pools
  - maintenance items
  - anything not owned by a single classroom context

Rule:
- if an item’s operational home is a classroom, keep it in classroom resources
- if it belongs to the institution, even if used by a classroom, keep it in admin inventory

## Authority and identity model
### 3. Separate role layers
Replace the long-term single role model with three layers:

- `PlatformRole`
  - `founder`
  - `platform_admin`
  - `developer`
  - future `support_operator` or `auditor`
- `SchoolRole`
  - `principal`
  - `section_head`
  - `grade_head`
  - `teacher`
  - `student`
  - future `vice_principal`, `office_head`, etc.
- `WorkRole` or `JobRole`
  - `teacher`
  - `librarian`
  - `lab_assistant`
  - `counselor`
  - `finance_officer`
  - `office_staff`
  - `maintenance`
  - `security`
  - `driver`
  - `canteen`
  - future supplier-facing or contractor assignments

One user may hold:
- one or more platform roles
- one or more school memberships
- one or more job/work roles inside a school

This keeps your founder power intact while preventing architectural confusion.

### 4. Founder visibility model
Adopt a phased governance model:

- **Now**
  - founder has global platform visibility and override ability
  - this is explicit and audited, not hidden inside school roles
- **Architecture from day one**
  - all cross-school access goes through platform-scoped capability checks
  - every founder/global access event is auditable
  - internal/test activity is taggable
- **Future**
  - can evolve into break-glass or narrower support controls without rewriting the whole system

Do not model founder as a school super-principal. Model founder as a **platform sovereign role** outside ordinary school governance.

### 5. Internal dogfood model
You want founder/community/testers mixed into real school-shaped spaces for now. Support that, but safely:

- allow internal coordination inside school-mode spaces
- add `tenant_kind` or equivalent classification
  - `internal`
  - `customer`
  - `demo`
  - `sandbox`
- add tagging for internal/test-origin objects where needed
- ensure analytics, reporting, and future customer trust can distinguish internal dogfood from customer reality

This preserves flexibility now while keeping a later path toward separation.

## Stakeholders and future ecosystem
### 6. Non-academic staff
Non-academic staff should be planned as part of the future `workforce` domain, not squeezed into academic or admin shortcuts.

Future examples:
- office administration
- finance office
- librarian
- lab assistant
- counselor
- nurse
- maintenance
- security
- drivers
- canteen/vendor-linked staff

Their architecture should support:
- job family
- reporting line
- attendance/leave
- duty allocations
- permissions by function
- school-scoped visibility

### 7. External stakeholders
Treat stakeholders as a first-class future actor model in `core`, with **parents/guardians first**.

Future actor types:
- parent/guardian
- ministry/provincial/zonal education officers
- suppliers/vendors
- service providers
- alumni/donors/community partners

Use a generic `Actor` foundation in `core`:
- `actorType`
- `personOrOrg`
- `schoolRelationships`
- `scopedCapabilities`
- `contactChannels`

Then implement stakeholder products gradually:
- first: parents/guardians
- later: ministry/reporting interfaces, suppliers, donors, external partners

### 8. Parents first
Plan parents/guardians as the first external stakeholder domain to shape architecture, even if not implemented immediately.

Parent domain should eventually support:
- student linkage
- attendance visibility rules
- assignment/report visibility
- notices and consent flows
- request/communication channels
- fee/payment responsibility later

This means student records and school memberships should be designed now with guardian linkage in mind.

## First implementation wave
### 9. What to do first
The first execution wave remains:

- strengthen `@repo/core` tenancy and capabilities
- separate platform roles from school roles conceptually
- create `@repo/admin`
- create `@repo/people`
- reserve `@repo/workforce` in architecture, but do not deeply implement it yet
- move mixed principal/staff logic out of `@repo/classroom`
- keep current tab/nav shell stable

Priority extraction:
- principal governance widgets to `admin`
- staff attendance/leave and people records toward `people` and future `workforce`
- institutional inventory to `admin`
- classroom-owned resources stay in `classroom`

## Public API / Type Changes
Introduce or formalize these contracts:

- `PlatformRole`
- `SchoolRole`
- `WorkRole`
- `Membership`
- `TenantContext`
- `ScopeRef`
- `CapabilityKey`
- `Actor`
- `ActorRelationship`
- `TenantKind`

Core APIs/hooks:
- `useTenantContext()`
- `useCapabilities()`
- `can(capability, resource?)`
- `requireCapability(capability, resource?)`
- `getPlatformAccessContext()`

Admin APIs:
- approvals
- structure
- calendar
- inventory
- reporting/documents

People APIs:
- directory
- memberships
- profile placement
- guardian link foundations later

## Test Plan
- Founder global access works through platform capabilities, not school role shortcuts.
- Principal can manage only own school scope.
- Teacher can access only assigned classroom and allowed staff self-service.
- Classroom resources remain classroom-scoped.
- Admin inventory remains institution-scoped.
- Internal/demo/customer tenants are distinguishable in queries and reporting.
- Parent linkage design does not break student or school membership assumptions.
- Principal/admin flows still render through the current app shell after extraction.

## Assumptions and defaults
- Gurudevi is ecology-first, ERP-powered.
- Primary tenant remains a Sri Lankan school.
- Current shell and tab navigation stay intact in this phase.
- `reporting` stays inside `admin`.
- `inventory` is split into classroom resources vs admin institutional inventory.
- Founder keeps global platform visibility for now.
- Architecture must preserve a future path to break-glass or narrower support controls.
- Non-academic staff are planned under a future `workforce` domain.
- Parents/guardians are the first external stakeholder to shape future architecture.

