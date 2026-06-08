---
title: "Temporal API Consolidation"
status: "active"
created: 2026-03-30
updated: 2026-03-30
author: "Naween"
tags: [reorganized]
---

# Temporal API Consolidation

Status: active migration guide

This document defines the canonical API surface for temporal school data.

The main rule is:

- teacher and student workspaces use write-owner and temporal workspace routes
- admin and reporting use institutional and published projections
- longitudinal history uses the shared timeline bedrock
- legacy convenience names remain only as compatibility wrappers while callers migrate

## Canonical routes by lane

## Attendance

Teacher or classroom write routes:

- `api.attendance.record(...)`
- `api.attendance.batchRecord(...)`

Teacher or student temporal reads:

- `api.attendance.getClassroomAttendanceSnapshot(...)`
- `api.attendance.getStudentAttendanceTimeline(...)`

Admin and reporting reads:

- `api.attendance.getSchoolAttendancePulse(...)`
- `api.attendance.getAttendanceReport(...)`

Compatibility wrappers:

- `api.attendance.getByDate(...)`
- `api.attendance.getForStudent(...)`

## Grading

Teacher write routes:

- `api.grading.saveGradeDraft(...)`
- `api.grading.publishGrade(...)`
- `api.grading.revisePublishedGrade(...)`
- `api.grading.overrideGrade(...)`

Teacher or student temporal reads:

- `api.grading.getGradebookSnapshot(...)`
- `api.grading.getStudentGradeTimeline(...)`

Admin and guardian-safe reads:

- `api.grading.getSchoolPublishedGradingCompletion(...)`
- `api.grading.getPublishedStudentGrades(...)`

Compatibility wrappers:

- `api.grading.submitGrade(...)`
- `api.grading.getReportCard(...)`
- `api.grading.getClassroomGrades(...)`

## Longitudinal student history

Shared temporal bedrock:

- `api.longitudinal.getStudentTimeline(...)`
- `api.longitudinal.getStudentSnapshotAsOf(...)`

Use this for:

- 13-year student continuity
- handover-sensitive reads
- cross-year reports
- cross-holon official history reconstruction

Do not use it for:

- raw draft teacher workspaces
- institutional projections that already have a dedicated published or report route

## Reporting rule

Reporting consumers should call canonical institutional routes directly.

Examples:

- student attendance reporting uses `api.attendance.getAttendanceReport(...)`
- published grading oversight uses `api.grading.getSchoolPublishedGradingCompletion(...)`
- student-longitudinal reports should use `api.longitudinal.*`

They should not route through unrelated legacy facades if a canonical route already exists.

## Migration order

1. move admin and reporting callers off compatibility wrappers
2. move student-profile and admin-profile consumers onto `api.longitudinal.*`
3. remove unused compatibility wrappers only after caller coverage is complete
