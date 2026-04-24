# Grading Hardening Plan

Status: active execution note

This document translates the cross-holon doctrine into the grading lane.

Use it with:

- [CROSS_HOLON_CONTRACT_MAP.md](C:/Users/Naween/projects/polymath-platform/docs/architecture/CROSS_HOLON_CONTRACT_MAP.md)
- [PRE_POA_STABILIZATION_MAP.md](C:/Users/Naween/projects/polymath-platform/docs/architecture/PRE_POA_STABILIZATION_MAP.md)
- [POA_IMPLEMENTATION_GUIDE.md](C:/Users/Naween/projects/polymath-platform/docs/architecture/POA_IMPLEMENTATION_GUIDE.md)

## 1. Ownership

Write owner:

- `classroom`

Projection consumers:

- `admin`
- guardian summaries later through policy-governed projections

This means:

- classroom authors and revises grade records
- institutional dashboards should read completion and oversight projections
- guardian-facing views should stay summary-oriented and policy-scoped

## 2. Temporal model

Grading needs these views:

- classroom gradebook snapshot by `viewDate`
- student grade timeline
- school grading completion by `viewDate`

Current minimum time fields:

- `created_at`
- `updated_at`
- published snapshot `published_at`
- `viewDate`

This phase now hardens:

- temporal reads
- institutional completion projection
- explicit `draft` vs `published` lifecycle through durable audit state
- publish, revise, override, and oversight-read audit events
- guardian-safe published-grade summaries

Important caveat:

The current lifecycle is persisted through `grades` as the teacher working row plus durable publication snapshots in `audit_logs`.
That means we now have a safe publication seam, but not yet a dedicated versioned grade-history table.

## 3. Contract split

Classroom-aligned routes:

- `saveGradeDraft`
- `submitGrade`
- `publishGrade`
- `revisePublishedGrade`
- `overrideGrade`
- `getReportCard`
- `getClassroomGrades`
- `getGradebookSnapshot`
- `getStudentGradeTimeline`
- `getGradingSettings`
- `updateGradingSettings`

Institutional projection routes:

- `getSchoolGradingCompletion`
- `getSchoolPublishedGradingCompletion`
- `getPublishedStudentGrades`

## 4. Current implementation shape

After this phase:

- teacher grade entry is draft-first
- published visibility is a deliberate action, not an automatic leak
- grade publish, revise, and override actions are durably audited
- classroom and student grade reads have temporal route names plus publication state
- institutional grading completion is calculated through a dedicated projection service
- guardian summaries consume published snapshots instead of raw grade rows

## 5. Next move

1. add a dedicated versioned persistence model for grade publications when schema work is ready
2. widen admin and guardian consumers onto published-only routes
3. add behavior tests around publish lifecycle and guardian visibility guarantees
4. split draft teacher workspace metrics from published institutional metrics more explicitly
