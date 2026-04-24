# Attendance Hardening Plan

Status: active execution note

This document translates the cross-holon doctrine into the attendance lane.

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

- classroom authors the official attendance record
- institutional dashboards consume projections, not classroom UI state
- guardian reads should stay summary-oriented and policy-scoped

Teacher and principal personal attendance is a different lane.

That belongs with staff or workforce presence, not with student classroom attendance.

So:

- student attendance stays in the academic attendance lane
- teacher and principal personal attendance belongs in `people` now, and likely `workforce` later for broader non-academic staffing reality

## 2. Temporal model

Attendance needs four temporal views:

- same-day classroom snapshot
- student timeline
- school pulse by `viewDate`
- report range by `startDate` and `endDate`

Current minimum time fields:

- `date`
- `created_at`
- `updated_at`
- `viewDate`
- `startDate`
- `endDate`

Later hardening:

- explicit override history
- explicit `recordedAt`
- explicit export and institutional-read audit events

Current audit progress:

- batch attendance marking can now record durable audit events when actor context is provided
- override events are logged when an existing attendance mark changes
- institutional pulse and report reads can now log durable audit events when actor context is provided

## 3. Contract split

Classroom-aligned routes:

- `getAttendance`
- `recordAttendance`
- `batchRecordAttendance`
- `getAttendanceForStudent`
- `getClassroomAttendanceSnapshot`
- `getStudentAttendanceTimeline`

Institutional projection routes:

- `getSchoolAttendancePulse`
- `getAttendanceReport`

## 4. Transitional implementation

After this phase:

- attendance public contract now names both classroom and institutional routes in one lane
- classroom snapshot and timeline stay backed by the educational attendance service
- school pulse and range report now calculate through a dedicated attendance projection service
- `staffManagement` delegates to that projection service instead of owning student attendance logic

This is a cleaner transitional state because the public seam and internal service ownership now point in the same direction.

## 5. Next move

1. add override and export audit events
2. migrate attendance UI toward the temporal route names
3. add focused behavior tests for snapshot, pulse, and report
4. decide whether student attendance projections should later move into a dedicated reporting package or remain in core
