---
title: "Guardian Temporal Policy"
status: "active"
created: 2026-03-30
updated: 2026-03-30
author: "Naween"
tags: [reorganized]
---

# Guardian Temporal Policy

Status: active policy clarification

This document defines the guardian-facing temporal model for the current guardian seam.

It clarifies three separate things:

- timeline visibility
- summary windows
- official-record boundaries

It does not move guardian persistence ownership back into `packages/admin`.

The guardian workspace remains a consumer of the core guardian seam.

## 1. Guardian visibility doctrine

Guardians do not receive unrestricted student history.

Guardian visibility is limited to:

- linked-student views only
- official institutional records
- explicit guardian projections that are already approved for guardian consumption

Guardians must not receive:

- teacher private notes
- pedagogical intelligence
- draft grades
- internal admin notes
- hidden package-local joins that bypass the core guardian contract

## 2. Timeline model

The guardian timeline is an official-record timeline.

That means:

- attendance contributes only as official attendance history or official attendance summaries
- grading contributes only after records are publishable or published for guardian consumption
- upcoming assignments are projections, not official institutional records

Current implementation rule:

- expose timeline policy metadata now
- keep raw timeline expansion constrained to core guardian services and repositories later

## 3. Summary model

Guardian summaries are not indefinite all-time aggregates.

They must be explicitly time-bounded:

- attendance summary
  rolling 30-day official summary ending at dashboard `asOf`
- grade summary
  latest published or publishable guardian-visible grade snapshot
- assignment summary
  forward-looking projection window from dashboard `asOf`

These windows should be visible in the contract shape so guardian consumers know whether they are reading:

- a rolling summary
- a current snapshot
- an upcoming projection

## 4. Official-record boundary

Guardian dashboards can mix official records and projections, but they must label the boundary clearly.

The current boundary is:

- official records
  attendance
  guardian-visible grade summaries
- projections
  upcoming assignments
  notifications
  school events

The dashboard policy should therefore declare:

- the dashboard `asOf`
- that timeline visibility is `official_records_only`
- that teacher-private and admin-internal records are excluded
- that summaries are bounded windows rather than open-ended history

### Current-phase grade rule

During this phase, guardian grade visibility should prefer explicit publication markers when they exist.

Accepted publication markers:

- `published_at`
- `publishedAt`
- `is_published`
- `isPublished`
- `status` or publication status values such as `published`, `released`, `finalized`, or `guardian_visible`

If no publication metadata exists at all in the current grade source, the system may temporarily fall back to the legacy recent-grade projection so the guardian surface does not fail closed during migration.

That fallback is transitional and should be replaced by a first-class published-to-family grading contract.

## 5. Current-phase permission rule

Guardian relationship permissions should now act as section-level visibility controls for linked students.

Current-phase rule:

- active relationship required for the student to appear at all
- if a permission category is explicitly set to `none`, that section is hidden
- if a category has no explicit rule yet, the current phase defaults to allow so existing informal guardian flows keep working during migration

The first enforced dashboard categories are:

- `attendance`
- `grades`
- `reports`

This is intentionally transitional.

Longer-term hardening should move from opt-down behavior to explicit family-visibility rules once relationship policy is fully modeled.

## 6. Ownership rule

This policy does not expand admin-local persistence ownership.

Allowed shape:

`guardian workspace -> core guardian contract -> guardian service policy -> guardian repository`

Disallowed shape:

`guardian workspace -> admin-local repository -> raw joins -> hidden visibility rules`
