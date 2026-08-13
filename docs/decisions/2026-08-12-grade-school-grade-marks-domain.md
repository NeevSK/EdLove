---
title: "Grade School and Grade Marks Domain Contract"
status: "draft"
created: 2026-08-12
updated: 2026-08-12
author: "Naveen"
scribe: "Codex"
tags: [adr, education, grading, schema, authorization, migration]
---

# Grade School and Grade Marks Domain Contract

## Status

Draft decision for review before implementation. This document defines the
target conceptual contract; it does not authorize destructive migration.

## Context

The repository currently uses `grade`, `grades`, `Grade`, `SchoolGrade`,
`StudentGrade`, `marks`, and `gpa` for more than one concept. Current evidence
shows competing runtime paths:

- school hierarchy code treats `grades` as K–12 levels;
- the intended ZenStack `SchoolGrade` model points toward `grade_levels`;
- assessment repositories use `student_grades`;
- analytics and guardian paths still query `grades` for assessment-like fields;
- multiple grading calculators and persisted GPA formulas disagree.

This ambiguity creates correctness, migration, authorization, and reporting risk.

## Decision direction

Use explicit hierarchy and assessment concepts. Do not use `grade_school` as the
name for a class: in the clarified LMS model, a school grade is a level and a
class is a time-bound cohort such as 6A or 6B.

## Target academic hierarchy

```text
School
 └── AcademicCycle (2026)
      ├── school leadership assignments
      ├── Section (Primary / Secondary / etc.)
      │    └── GradeLevel (Grade 6)
      │         └── GradeClass (6A / 6B)
      │              ├── student enrollments
      │              ├── homeroom/class teacher assignments
      │              ├── subject-teacher assignments
      │              ├── assistant-teacher assignments
      │              ├── timetable
      │              └── instructional subject contexts
      ├── terms/semesters
      ├── attendance
      └── assessments and GradeMarks
```

`School` is the stable institutional identity. `AcademicCycle` is the top-level
operational scope for a school's year, such as 2026, and contains ordered terms
or semesters. This makes historical queries direct and coherent:

```text
school_id + academic_cycle_id → the school's structure, leadership, staff,
classes, timetable, attendance, assessments, and outcomes for that cycle
```

Do not recreate a School row for every year. Do not put the current principal
directly on the timeless School row when the requirement is historical truth.
Represent principal/section-head/grade-head appointments as cycle-scoped,
effective-dated role assignments. A principal connects an existing person to an
existing School and AcademicCycle; the system does not create a duplicate person
identity.

Student and teacher identity remain in the existing identity/person tables. The
academic model adds cycle-scoped enrollment, placement, and assignment records;
it does not create a new student identity per year.

## Lifecycle model

The system is an academic lifecycle system. Definitions and events must be
separated so the model can be corrected, replayed, or migrated without rewriting
historical academic facts.

### Stable or slowly changing definitions

These identify things and should not be duplicated per lesson:

- school identity and school configuration;
- section definition, such as Primary or Secondary;
- grade-level definition, such as Grade 6;
- subject definition, such as Mathematics or Science;
- person identity and role capabilities;
- room/location definitions;
- grading-scale definitions.

These may have effective-dated versions when the meaning changes, but their
identity remains stable.

### Academic-cycle records

An `AcademicCycle` belongs to one School, represents a school year, and contains
ordered `Term` or `Semester` records. Cycle-bound records include:

- GradeClass, such as 6A for 2026;
- student GradeClass enrollment and transfer history;
- GradeClass subject offerings;
- teacher assignments, including homeroom, subject, assistant, and substitute
  roles;
- timetable versions;
- attendance policy/configuration;
- assessment policy/configuration.

No current-year record should be mutated to represent next year. Create a new
cycle-bound instance and retain the old one.

### Delivery and evidence records

Within a term, subject offerings produce:

- timetable slots and scheduled meetings;
- lessons, including planned and delivered status;
- student and teacher attendance events;
- assignments, submissions, exams, and other assessments;
- GradeMarks and publication/revision events.

These are append-oriented or versioned records. Corrections create a revision
or audit record rather than erasing the original fact.

Recommended target names:

- `grade_levels`: the catalogue/structure for Grade 1–13 within a section.
- `grade_classes`: the academic-period cohort such as 6A, with one active
  primary placement per student.
- `grade_class_teacher_assignments`: formal, historical teacher assignments
  with role, subject scope, and academic period.
- `grade_class_timetables` or a timetable/event model: schedule entries tied to
  a grade class and subject-teacher assignment.
- `grade_class_subjects`: the subjects required/offered for a GradeClass in an
  academic cycle and term.
- `teacher_subject_assignments`: the teachers eligible to deliver a subject for
  a GradeClass, with role and effective dates.
- `timetable_versions`, `timetable_slots`, and `lessons`: the planned schedule
  and the actual delivered lesson instance must be distinguishable.
- `classrooms`: retain only if it means an instructional subject/group context;
  otherwise migrate the current classroom concept to `grade_classes` explicitly.

The key architectural question is semantic, not cosmetic: `classroom_id` must
not ambiguously mean both “6A cohort” and “6A Mathematics instructional group.”
If the current `classrooms` row is the 6A identity, then it should become the
GradeClass contract and use `grade_class_id` at the API/type layer. Subject
teaching can then be represented by assignment rows rather than multiplying
cohort records.

Live data confirms this ambiguity is already present: the remote `classrooms`
table contains cohort-like names such as `10B` and subject-like rows such as
`10 / Bio`, while many rows have null `grade_id`, `section_id`, and `teacher_id`.
Therefore `classroom_id` cannot be assumed to be a valid GradeClass identity.
The new contract must introduce the distinction explicitly and classify or
retire the existing rows rather than silently treating them as equivalent.

The implementation is intentionally a breaking domain correction. We will not
preserve ambiguous `grades`, `StudentGrade`, or mixed `classroom_id` semantics as
the final API. Existing data must be inventoried and migrated or rejected
loudly; silent compatibility that keeps the ambiguity alive is not acceptable.
We still must not delete data or drop tables until a verified migration/backfill
proves that it is safe.

Use explicit domain concepts and reserve the names:

### `GradeLevel`

A school-level structure such as Grade 5 or Grade 10, belonging to a Section.

It should be associated with:

- school;
- academic period/year;
- optional section/program;
- grade number and/or localized label;
- lifecycle/audit fields;
- students assigned during that period;
- teachers/classrooms associated during that period.

It is not a mark, letter grade, GPA, or assessment result.

Proposed minimum placement fields:

```text
id, student_id, school_id, section_id?, classroom_id?, grade_number,
academic_cycle_id, effective_from, effective_to?, status, created_at, updated_at
```

The first implementation should confirm whether this is one student-placement
row or a school-level catalogue plus a separate student-placement history. The
names must not hide that distinction.

### `GradeClass`

A time-scoped cohort such as 6A or 6B under a GradeLevel and academic cycle.
It owns roster, homeroom responsibility, timetable context, and teacher
assignment records. It is not itself a mark or a subject result.

### Subject delivery

A GradeClass does not contain subjects as embedded mutable fields. It has
cycle/term-scoped `GradeClassSubject` records. Each subject offering can have
one or more teacher assignments, including a primary subject teacher, assistant,
and substitute. The timetable matches subject offerings and teacher assignments
to day/time slots and rooms. A lesson is the actual scheduled/delivered
occurrence, allowing cancellation, substitution, rescheduling, and attendance
without corrupting the recurring timetable.

### `GradeMark`

A time-scoped assessment result for one student.

It should be associated with:

- student;
- grade class and, where needed, a separate instructional subject context;
- subject/course;
- academic period and optional term;
- assignment or assessment definition;
- the student's applicable `GradeClass` placement;
- awarded marks;
- the denominator or normalized percentage contract;
- persisted calculated GPA;
- general letter grade without plus/minus variants;
- publication state and publication audit fields;
- correction/revision and actor audit fields.

Proposed minimum result fields:

```text
id, student_id, school_id, grade_class_id, subject_id?,
academic_cycle_id, term_id?, assignment_id?, submission_id?, marks_earned,
max_points, percentage, letter_grade?, gpa?, grading_scale_version,
publication_state, graded_by, graded_at, published_by?, published_at?,
created_at, updated_at
```

Use `marks_earned` rather than ambiguous `marks`, and `letter_grade` rather than
ambiguous `grade`. Keep `grade_class_id` as a placement snapshot when historical
reporting must remain stable after a student changes class.

The final physical table names should use these names directly if the deliberate
breaking migration is approved. The current remote `student_grades` table is
the closest source for `grade_marks`, but it should not be treated as the final
contract merely because it exists.

## Calculation direction

The system should distinguish:

1. raw awarded marks for an assignment;
2. maximum possible marks (`max_points` or equivalent);
3. normalized percentage used for aggregation;
4. configured weight/category/term contribution;
5. persisted final GPA and general letter grade.

Do not store redundant derived values without a reason. Because GPA is explicitly
required to be persisted, every persisted GPA/letter result must record or be
reproducible from the grading-scale/configuration version used to calculate it.
Changing a scale must not silently rewrite historical published results.

Recommended initial model:

- store raw awarded marks and maximum points for each assignment result;
- derive normalized percentage and aggregates from those values;
- persist GPA and general letter grade at publication/calculation time;
- store calculation/configuration version and audit actor;
- use idempotency keys for imports and retries;
- prevent marks above the applicable maximum unless an explicit override exists.

For an assignment, the basic calculation is:

```text
percentage = marks_earned / max_points * 100
```

Weighted reporting should calculate from percentages and explicit weights, not
blindly sum marks from assignments with different maximums. Class rank,
percentile, term average, cumulative GPA, trends, and risk indicators should be
runtime/reporting results rather than duplicated onto every result row.

This is compatible with Moodle-like weighted assessment without prematurely
committing the product to every Moodle feature.

## Visibility and authorization

- Guardians receive only published, approved student-facing results/summaries.
- Teachers receive only students and classrooms within their authorized scope.
- Subject teachers receive the subjects/classrooms assigned to them.
- Administrative access is configurable but restrictive by default.
- Access to another student's results produces an audit event containing actor,
  student, scope, reason/context where available, and timestamp.
- Sensitive student/profile data is not bundled into assessment queries by
  default.

Current guardian access is **not resolved**. Live verification found:

- guardian repository code reads `grades`, but the linked database has
  `student_grades` and no `grades` table;
- guardian service code expects relationship permission/status fields absent from
  the linked `student_guardian_relationships` table;
- `student_grades` RLS has student-self and classroom-teacher policies but no
  guardian policy;
- no guardian assessment-read audit insertion or trigger was confirmed.

Guardian access requires its own contract, server-side read path, published-only
filtering, field minimization, relationship/permission model, and audit event
before it can be marked implemented.

## Attendance model

Attendance has two deliberate layers: a daily presence record and granular
session/lesson evidence.

```text
DailyAttendance (one student/teacher per school day)
  └── AttendanceSession (one class/lesson/arrival/departure event)
```

Daily attendance answers “was this person present today?” Granular attendance
answers “where, when, and in which lesson or event was presence recorded?” The
daily record should be the operational summary, while sessions are the detailed
evidence and reconciliation source.

Attendance should support both a daily roll-up and session-level evidence:

```text
AcademicCycle → Term → GradeClassSubject → TimetableSlot → Lesson
                                            ├── StudentAttendance
                                            └── TeacherAttendance
```

- Daily attendance is the operational summary for a student or teacher.
- Session attendance is the authoritative detail when a timetable lesson exists.
- A day can have multiple sessions; a morning/arrival event and departure event
  may be recorded separately from lesson attendance.
- A daily roll-up should be derived from session and arrival/departure events,
  with an explicit policy for partial days, leave, late arrival, early departure,
  and excused absence.
- Student attendance is normally recorded by the responsible teacher for the
  lesson, with controlled correction by a GradeHead, SectionHead, principal, or
  authorized attendance officer.
- Teacher attendance may be self-recorded for arrival/departure, but approval or
  correction belongs to a supervisor/authorized school administrator. The policy
  must prevent a teacher from approving their own exception without oversight.
- Location, device, and other contextual signals are optional evidence fields,
  not the sole authorization mechanism. Any future ABAC decision may use role,
  school, GradeClass, timetable, time, device trust, and location context.
- Attendance records need actor, source, timestamp, correction reason, and audit
  history. Do not overwrite the original attendance event silently.

## Disposable demo-data reset

The current remote rows are demo/testing data and are not a historical migration
constraint. After the replacement schema and authorization contracts are
validated, the project may use a deliberate clean reset/reseed rather than a
complex legacy backfill. This still requires:

- an explicit migration/reset script;
- schema and RLS verification before reseeding;
- deterministic seed fixtures for one Sri Lankan school, multiple sections,
  grade levels/classes, teachers, subjects, terms, timetable slots, lessons,
  attendance, assignments, exams, and guardian visibility;
- no accidental production-data assumption in code or tests.

## Migration strategy

1. Freeze the conceptual contract and create explicit types/ports first.
2. Inventory every legacy table/column/query and classify it as structural grade,
   assessment result, submission mark, or unrelated use of “grade”.
3. Establish compatibility reads/writes with contract-level tests.
4. Backfill and validate historical records before changing primary consumers.
5. Migrate admin, guardian, analytics, classroom, and API paths in bounded slices.
6. Add negative authorization and publication tests.
7. Remove legacy aliases only after zero-consumer scans, migration verification,
   and rollback readiness.

No `DROP TABLE`, broad rename, or deletion of historical data is part of the
initial implementation.

## Initial target relationship

```text
User
 ├── grade_school placement history ── School / Section / Classroom
 └── grade_marks ── Assignment / Subject / Academic period
```

`grade_marks` should be attributable to the student, grade class/instructional
context, assignment or
assessment, grading actor, publication event, and grading-scale version. The
current `submissions.grade` field should become a temporary compatibility input
or be reconciled into `grade_marks`; it should not remain a competing academic
result source.

## Required decisions before schema migration

- academic year versus year-plus-term model;
- whether teacher placement is explicit or classroom-derived;
- whether students can have concurrent primary grade-school placements;
- exact default marks-to-letter/GPA scale and configuration ownership;
- whether published results are immutable revisions or editable with history;
- first deployment target and availability of a safe linked staging database.

## Related plan

[Gurudevi Rigorous Improvement and Verification Plan](../current_progress/2026-08-12-gurudevi-rigorous-improvement-plan.md)

## Implementation status (2026-08-13)

The first local guardian assessment-read slice is implemented behind the
Sanctuary API boundary:

- `GET /guardian/students/:studentId/assessments` has a typed contract and is
  registered in the Sanctuary oRPC router.
- The service requires an authenticated guardian, an allowed relationship, and
  an explicit active `assessment_results/read` permission.
- Results are limited to published marks and a safe projection; feedback,
  grading actors, and other sensitive fields are not returned.
- Every allowed or denied attempt writes an audit event; audit failure fails
  closed rather than returning data.
- Pagination uses an opaque composite `(graded_at, id)` cursor.
- Clients must call the API. There is no client-facing Supabase/Postgres RPC
  for this read path, and the migration does not grant direct table access.

This remains a local, unapplied migration slice. Remote Supabase was not
mutated. The mobile guardian client is intentionally not wired until the API
contract and remote migration are reviewed together.
