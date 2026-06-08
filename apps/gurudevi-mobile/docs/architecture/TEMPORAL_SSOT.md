---
title: "Temporal SSOT"
status: "active"
created: 2026-03-30
updated: 2026-03-30
author: "Naween"
tags: [reorganized]
---

# Temporal SSOT

Status: active foundation

This document defines the shared temporal model for long-lived school records.

Use it with:

- [CROSS_HOLON_CONTRACT_MAP.md](C:/Users/Naween/projects/polymath-platform/docs/architecture/CROSS_HOLON_CONTRACT_MAP.md)
- [POA_IMPLEMENTATION_GUIDE.md](C:/Users/Naween/projects/polymath-platform/docs/architecture/POA_IMPLEMENTATION_GUIDE.md)
- [PRE_POA_STABILIZATION_MAP.md](C:/Users/Naween/projects/polymath-platform/docs/architecture/PRE_POA_STABILIZATION_MAP.md)

## Core rule

For student-life data, a mutable current row is not enough.

Every serious lane should support:

- current working row
- longitudinal event timeline
- as-of snapshot reconstruction
- official published projection where needed
- audited access

## Temporal fields

Minimum shared meaning:

- `occurred_at`
  when the business event happened
- `recorded_at`
  when the system captured the event
- `effective_from`
  when the record became valid in the domain
- `effective_to`
  when the record stopped being valid
- `viewDate`
  the user or system temporal lens for queries

## Bedrock table

Student-longitudinal history now uses:

- `public.student_longitudinal_events`

This bedrock captures:

- enrollments
- attendance
- grades
- guardian relationships
- observations
- assignment submissions
- student-owned study notes

Each row stores:

- student scope
- school and classroom context
- entity type and source table
- operation
- temporal bounds
- full snapshot payload
- recorder identity

## Query model

The POA-facing core layer should expose:

- timeline query
- as-of snapshot query

Current contract-backed routes:

- `api.longitudinal.getStudentTimeline(studentId, viewDate, entityTypes?)`
- `api.longitudinal.getStudentSnapshotAsOf(studentId, viewDate, entityTypes?)`

## Why this matters

A student can remain in the system for 13 years or more.

So we need:

- classroom-to-classroom continuity
- teacher handover continuity
- institutional auditability
- guardian-safe official views
- private versus official separation

## Next lane migrations

1. move admin/student-profile consumers onto the longitudinal routes
2. add published-only grade and official-attendance projections on top of the same bedrock
3. add dedicated version tables where a lane needs richer state than generic snapshots
4. extend the same pattern to academic cycles, interventions, and support plans
