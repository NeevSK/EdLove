---
title: "Grade-domain legacy consumer inventory"
status: "active"
created: 2026-08-13
updated: 2026-08-13
author: "Naveen"
scribe: "opencode"
tags: [reports, grade-domain-consumer-inventory.md]
---

# Grade-domain legacy consumer inventory

Read-only inventory produced for Slice A. No consumer was changed. The target
contract terminology is `GradeLevel`, `GradeClass`,
`GradeClassTeacherAssignment`, `AcademicCycle`/`Term`, and `GradeMark`.

| Legacy path | Structural usage | Assessment usage | Notes |
| --- | --- | --- | --- |
| `grades` table/name | Yes | Yes in legacy analytics/guardian paths | Ambiguous collision; hierarchy code expects grade-level fields, while analytics expects marks/graded timestamps. |
| `grade_levels` table/name | Yes | No | Intended ZModel mapping for school grade levels. |
| `student_grades` table/name | No | Yes | Intended current assessment-result storage with marks, letter grade, GPA, and publication fields. |
| `grade_id` | Yes | No | Legacy structural reference; target distinction is `grade_level_id` versus `grade_class_id`. |
| `grade_number` / `number` | Yes | No | Numeric K–12 level, including historical academic records. |
| `marks` | No | Yes | Assessment numeric result; current code often assumes 0–100 even where assignments have `max_points`. |
| `grade` field | Ambiguous | Yes | Used for assessment letter grade, submission numeric grade, and structural grade terminology. |
| `gpa` | No | Yes | Persisted and recalculated in multiple incompatible ways. |
| `AssignmentSubmission.grade` | No | Yes | Separate numeric submission result; relationship to `student_grades` is not canonical. |
| `Classroom.grade_id` | Yes | Indirectly | Legacy structural reference; target class structure is GradeLevel → GradeClass. |
| `User.grade_id` | Yes | No | Legacy placement-like field; target Slice A does not treat it as the GradeClass contract. |

## Representative consumers

### Structural grade-level/class consumers

- `packages/admin/src/structure.ts`: reads/writes `grades` as school hierarchy.
- `packages/admin/src/components/principal/HierarchyBuilder.tsx`: creates
  numeric levels 1–13.
- `packages/core/src/types/School.ts`: exposes legacy `SchoolGrade` with `number`.
- `packages/schema/schema.zmodel`: maps legacy `SchoolGrade` to `grade_levels`.
- `packages/core/src/adapters/supabase/educational/classroomRepository.ts`:
  filters classrooms by `grade_id`.
- `packages/core/src/types/Classroom.ts`: exposes `Classroom.grade_id` and
  historical `grade_number`.
- Slice A target contracts model `GradeLevel` within `Section`, `GradeClass`
  within `GradeLevel` and `AcademicCycle`, and formal teacher assignments on
  `GradeClass`.

### Assessment-result consumers

- `packages/core/src/adapters/supabase/educational/gradingRepository.ts`:
  reads/writes `student_grades`.
- `packages/classroom/src/hooks/useGradebook.ts`: loads marks, saves drafts,
  and publishes results through the grading API.
- `packages/classroom/src/components/grading/GradebookTable.tsx`: derives
  display letter grades and ranks from marks.
- `packages/core/src/logic/schemas/grading.schema.ts`: exposes the existing
  `StudentGrade` contract and publication state.
- `packages/analytics/src/engine/GPACalculator.ts` and
  `packages/analytics/src/types/GradingTypes.ts`: define multiple grading scales.
- `packages/analytics/src/engine/PerformanceAnalyzer.ts` and
  `packages/analytics/src/ml/Predictor.ts`: query `grades` as if it were an
  assessment table, using fields such as `marks`, `graded_at`, and `class_id`.
- `packages/core/src/adapters/supabase/guardianRepository.ts`: queries
  `grades` for guardian-visible assessment identifiers and then applies
  publication/audit logic.
- `packages/schema/schema.zmodel`: `AssignmentSubmission.grade` is a separate
  numeric assessment field.

`AcademicCycle` and `Term` are currently represented by legacy academic-cycle
types/table consumers; Slice A adds explicit contract schemas without changing
those consumers.

## Slice A boundary

This report deliberately does not rename tables, change migrations, alter API
consumers, or decide the final grading scale. It records the legacy surface so
later migration slices can replace consumers deliberately.
