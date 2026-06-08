---
title: "Canonical API Map"
status: "active"
created: 2026-03-30
updated: 2026-03-30
author: "Naween"
tags: [reorganized]
---

# Canonical API Map

This map is the safe consolidation guide for the current production-hardening pass.

It answers one question:

"Which API is the real doorway now, and which ones are only compatibility seams or still carry important legacy behavior?"

The immediate scope is the priority academic holon:

- student
- teacher
- principal

## How To Read This

- `Canonical`: the route new code should use.
- `Compatibility wrapper`: old name or old shape that can stay temporarily while callers migrate.
- `Do not retire yet`: still contains important behavior or missing replacement coverage.
- `Retire after`: the condition that must be true before we delete or fully deprecate it.

## Student Lane

### Attendance

- Canonical read:
  - `api.attendance.getClassroomAttendanceSnapshot(classroomId, viewDate)`
  - `api.attendance.getStudentAttendanceTimeline(studentId, options?)`
- Compatibility wrapper:
  - `api.attendance.getByDate(classroomId, date)`
  - `api.attendance.getForStudent(studentId, classroomId?)`
- Why wrapper still exists:
  - older consumers still expect the non-temporal naming
- Retire after:
  - all student/classroom consumers are on `snapshot` or `timeline`

### Grading

- Canonical read:
  - `api.grading.getGradebookSnapshot(classroomId, viewDate)`
  - `api.grading.getStudentGradeTimeline(studentId, options?)`
  - `api.grading.getPublishedStudentGrades(studentId, viewDate)`
- Canonical write:
  - `api.grading.saveGradeDraft(...)`
  - `api.grading.publishGrade(...)`
  - `api.grading.revisePublishedGrade(...)`
  - `api.grading.overrideGrade(...)`
- Compatibility wrapper:
  - `api.grading.getClassroomGrades(classroomId)`
  - `api.grading.getReportCard(studentId)`
- Why wrapper still exists:
  - older callers still expect unscoped current-state reads
- Retire after:
  - student/profile and teacher/gradebook callers are fully on temporal and published routes

### Longitudinal student life

- Canonical read:
  - `api.longitudinal.getStudentTimeline(studentId, viewDate, entityTypes?)`
  - `api.longitudinal.getStudentSnapshotAsOf(studentId, viewDate, entityTypes?)`
- Not a duplicate pair:
  - `timeline` answers "what happened over time?"
  - `snapshot` answers "what was true as of this date?"
- Keep both:
  - they share one temporal bedrock but solve different UI/reporting needs

### Assignments and submissions

- Canonical read:
  - `api.assignments.getUpcomingForStudent(studentId)`
  - `api.assignments.getSubmissionHistoryForStudent(studentId, classroomId?)`
- Canonical write:
  - `api.assignments.submitSubmission(assignmentId, content?, photoUrl?)`
- Important relation:
  - assignment submission is not standalone student data
  - it is a response to a teacher-authored assignment
- Do not retire yet:
  - any ad hoc lesson-feed or dashboard shaping that still adds useful UI metadata not yet produced by core

### Notes

- Current canonical workspace route:
  - `api.classroomNotes.getAll(classroomId)`
  - `api.classroomNotes.create(...)`
  - `api.classroomNotes.update(...)`
  - `api.classroomNotes.delete(id)`
- Do not retire yet:
  - `api.classroomNotes.*` is POA-covered, but the module still contains raw Supabase logic and broad visibility shaping
- Why it is not "finished canonical":
  - it has not been fully moved to a dedicated temporal domain/service/repository stack
  - visibility policy still needs stronger separation between:
    - teacher private notes
    - student personal study notes
    - class-visible announcements
- Retire after:
  - a dedicated notes temporal seam exists and current callers are migrated

### Observations

- Canonical teacher-owned seam:
  - `api.teacherInsights.listStudentObservations(...)`
  - `api.teacherInsights.listStudentObservationsForEnrollment(...)`
  - `api.teacherInsights.createStudentObservation(...)`
  - `api.teacherInsights.finalizeStudentObservation(...)`
  - `api.teacherInsights.shareStudentObservation(...)`
  - `api.teacherInsights.revokeStudentObservationShare(...)`
  - `api.teacherInsights.promoteStudentObservation(...)`
  - `api.teacherInsights.getInsightAuditTrail(...)`
- Compatibility wrapper:
  - `api.studentObservations.getForEnrollment(...)`
  - `api.studentObservations.getForClassroom(...)`
  - `api.studentObservations.create(...)`
  - `api.studentObservations.finalize(...)`
- Transitional wrapper:
  - `api.studentObservations.getForStudent(studentId)`
  - `api.studentObservations.delete(id)`
- Current status:
  - these now delegate to `teacherInsights`, so the raw observation escape hatch is closed
- Retire after:
  - all classroom and profile callers migrate off the `studentObservations` namespace

## Teacher Lane

### Teacher classroom workspace

- Canonical workspace shaping:
  - `useTeacherClassroomWorkspaceData(...)`
- Canonical data seams underneath:
  - assignments -> `api.assignments.*`
  - observations -> `api.teacherInsights.*`
  - notes -> `api.classroomNotes.*` for now
  - attendance -> `api.attendance.*`
  - grading -> `api.grading.*`
- Do not retire yet:
  - older direct feature hooks if they still carry UI-specific shaping not yet folded into the workspace seam

### Teacher insights and anti-surveillance data

- Canonical:
  - `api.teacherInsights.*`
- Compatibility wrapper:
  - `api.studentObservations.*`
  - `api.studentPotential.*`
  - parts of `api.teacher.*`
- Why wrappers still exist:
  - old UI paths and type shapes still reference the older namespaces
- Retire after:
  - teacher UI calls `teacherInsights` directly for all note/observation/potential behavior

## Principal Lane

### Institutional attendance oversight

- Canonical:
  - `api.attendance.getSchoolAttendancePulse(schoolId, classroomId?, viewDate?, audit?)`
  - `api.attendance.getAttendanceReport(schoolId, fromDate, toDate, classroomId?, audit?)`
- Compatibility wrapper:
  - `staffManagement` attendance reporting helpers that now delegate internally
- Retire after:
  - no admin/principal callers depend on `staffManagement` for student attendance views

### Institutional grading oversight

- Canonical:
  - `api.grading.getSchoolPublishedGradingCompletion(schoolId, viewDate, audit?)`
- Compatibility wrapper:
  - older admin-local or classroom-injected grading analytics
- Retire after:
  - all principal/admin dashboards use published-only grading projections

### Principal observations and invites

- Canonical:
  - principal workspace routes in core/admin bridge
- Important rule:
  - principal reads official governance records and published/official academic projections
  - principal does not automatically inherit teacher-private intelligence

## Safe Consolidation Order

Use this order so we do not delete useful behavior by accident.

1. Migrate all active callers to canonical routes.
2. Compare output shape and hidden filtering against the legacy route.
3. Move any missing behavior into the canonical route.
4. Re-run POA and architecture tests.
5. Convert the legacy route into a thin alias or remove it.

## High-Risk Overlaps Right Now

These are the ones to be careful with.

### `studentObservations`

- Risk:
  - still mixes canonical wrapper behavior with raw direct Supabase reads
- Needed before cleanup:
  - move `getForStudent` and `delete` into `teacherInsights`

### `classroomNotes`

- Risk:
  - POA-wrapped public surface, but still raw implementation underneath
- Needed before cleanup:
  - split teacher-private, student-private, and shared note modes into a dedicated domain seam

### `getByDate` / `getForStudent` style attendance reads

- Risk:
  - low, mostly naming and temporal clarity
- Needed before cleanup:
  - caller migration only

### `getClassroomGrades` / `getReportCard`

- Risk:
  - medium, because old callers may still rely on their "current-state" behavior
- Needed before cleanup:
  - ensure all consumers use snapshot, timeline, or published routes correctly

## Simple Rule Of Thumb

If the question is:

- "What is true as of a date?" -> use `snapshot`
- "What happened over time?" -> use `timeline`
- "What is safe for admin/guardian to see?" -> use `published` or `official` projection
- "What does the teacher privately own?" -> use `teacherInsights`

If a route does not make one of those meanings obvious, treat it as suspicious until mapped.
