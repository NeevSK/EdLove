---
title: "Institutional Structure: Canonical Model"
status: "proposed"
created: 2026-10-20
updated: 2026-10-20
author: "Naveen"
scribe: "Claude"
amends: "2026-08-12-grade-school-grade-marks-domain.md"
tags: [adr, education, hierarchy, schema, academic-lifecycle, transitions, sri-lanka]
---

# Institutional Structure: Canonical Model

## 0. Status and relation to earlier decisions

Proposed, for Naveen's review. This record **amends**
`2026-08-12-grade-school-grade-marks-domain.md` (draft); it does not edit or
replace it. The August record stays as written and is read together with this
one.

What this record changes:

1. **Complementary, not replacement.** The August record calls itself
   "intentionally a breaking domain correction" and keeps `classrooms` only
   "if it means an instructional subject/group context". This record keeps
   both models as two layers of one structure: the grade class is the
   institutional unit; the classroom is the teaching group inside it. The
   ambiguity the August record names ("`classroom_id` must not ambiguously
   mean both '6A cohort' and '6A Mathematics instructional group'") is
   resolved by typing and linking classrooms, not by retiring them.
2. **Accretive evolution.** Every change below is additive: new columns,
   new tables, new constraints on new rows. No table, column, route or
   working behaviour is removed by this record. Retirement of anything,
   if ever proposed, needs its own record and explicit approval
   (AGENTS.md, Deletion Veto).
3. **Transitions are first-class.** The August record models a year; this
   record also models how people and institutions move between years,
   classes, sections and schools.

What this record keeps from earlier decisions:

- The August record's three tiers: stable definitions, cycle records, and
  delivery and evidence. Section 3 is organised by them.
- "No current-year record should be mutated to represent next year."
- The improvement plan's answers (2026-08-12, lines 149–171): an academic
  year contains terms; teacher placement is a formal historical assignment;
  "Students have one active primary `grade_class` placement at a time"; a
  letter scale without plus or minus.
- The civic ontology's occupancy shape (2026-10-10): a person holds a role in
  an entity over an interval, with a status.
- The attendance plan (2026-10-18): daily attendance on the grade class,
  period attendance as sessions.
- Plan-and-bridge (2026-10-17): notices go to verified guardians of actively
  enrolled students of a grade class.
- The identity model: one person, many placements; no separate person table
  per role.

## 1. Decision in brief

The institution and its structure exist independently of the people in it.
Each academic year, the structure is instantiated from a template chosen by
institution type, and people occupy its places for bounded intervals. People
move between places through recorded transitions; past years are kept, not
edited. Teaching happens in groups inside the structure, and relations
between people (guardian and student; teacher and student) sit beside the
structure rather than inside it.

This is Naveen's framing (2026-10-20): institutional structure and people
exist independently; the structure persists through the year; for each year
people come to occupy its places and move; the school type determines which
sections, grade levels and grade classes exist; and timetables, attendance,
lessons and assignments happen within it.

## 2. Scope and boundary

| Institution kind | Status in this record |
|---|---|
| Sri Lankan government schools: national and provincial; types 1AB, 1C, Type 2, Type 3 | **In scope.** Templates defined in §4. |
| Government schools with irregular grade spans (for example Grade 1–9, 6–11, 6–13) | **In scope.** Expressed as template overrides. |
| Special education units inside ordinary schools | In scope as a unit kind; detail deferred. |
| Private and international schools, Pirivenas, special schools, universities, tuition institutes | **Designed for, not built.** The model is template-driven so these can be added as further templates. No template is defined here. |

The boundary is deliberate: one engine, one fully specified template family
now, further families later. Fully general structures are deferred until a
second family is actually built.

## 3. Atoms

Atoms are ordered by generation: what exists on its own, then what is
defined from it, then what is instantiated per year, then occupancy,
relations, activity, and transitions.

### 3.1 Generators

**G1. Person.** One identity per human (`users`). Roles are never separate
person tables. A person may be unclaimed (a "shadow" created by a teacher)
until the human claims the identity.

**G2. Institution.** A school (`schools`), optionally linked to the national
census registry (`edu_schools` via `census_id`), which carries province,
district, zone, division and census number. Attributes the model needs on
the institution itself:

- `institution_type` (template key, §4)
- governance: national or provincial
- grade span actually offered (may differ from the type's default)
- mediums offered (Sinhala, Tamil, bilingual English)
- timezone (exists)

**G3. Time.**
- **Academic cycle** (`academic_cycles`): one school year. In Sri Lanka this
  runs roughly January to December, set by the Ministry.
- **Term** (`academic_terms`): three per year by default (2026: 1 Jan–10 Apr,
  20 Apr–24 Jul, 27 Jul–4 Dec, with breaks inside terms 1 and 3).
- **School calendar**: the days that count as school days, holidays and
  breaks. Attendance and rates are computed only over school days. Not yet
  modelled.

### 3.2 Definitions (stable across years, per institution)

These change rarely and are not copied per year.

**D1. Institution-type template.** System-level, versioned. Declares the
sections, grade levels, default streams, default term pattern and default
class naming for a type (§4). A school is configured from its template and
may override parts.

**D2. Section** (`sections`): a stage of schooling, for example Primary,
Junior Secondary, Senior Secondary, Collegiate. Holds the grade range.

**D3. Grade level** (`academic_grade_levels`, ZenStack `GradeLevel`): Grade
1–13 within a section. The level is stable; its classes are not.

**D4. Subject** (`academic_subjects`): a subject the school teaches, with
Sinhala and Tamil names. National subject codes are a later addition.

**D5. Stream** (A/L only): Bio Science, Physical Science, Commerce, Arts,
Technology, Vocational. Defined per school from what the type permits (1AB
includes science streams; 1C does not). Not yet modelled.

**D6. Medium**: Sinhala, Tamil, English (bilingual). Bilingual classes run as
separate parallel classes alongside Sinhala and Tamil streams. Not yet
modelled.

**D7. Position definition**: a named role with the kind of unit it attaches
to:

| Position | Attaches to |
|---|---|
| Principal | institution |
| Deputy principal | institution |
| Assistant principal | institution (optionally a section) |
| Sectional head | section |
| Grade head (grade coordinator) | grade level |
| Class teacher | grade class |
| Subject teacher | grade class + subject |
| Assistant teacher, substitute teacher | grade class (+ subject) |
| Teacher-in-charge of an activity | co-curricular unit |

The service grades (Sri Lanka Principals' Service classes 1–3, Sri Lanka
Teachers' Service classes 1–3) are attributes of the person's employment,
not positions.

**D8. Grading scale**: a versioned, per-school policy. The current code uses
A≥75, B≥65, C≥50, S≥40; the national O/L scale is A≥75, B≥65, C≥50, S≥35.
Which one a school uses is policy, recorded per cycle. Not yet modelled.

**D9. Co-curricular unit**: club, society, sport team, house, prefect board.
Circular 31/2024 requires a teacher-in-charge appointed in writing and
records in the student record book. Not yet modelled.

### 3.3 Cycle instances (created for one year)

**C1. Grade class** (`grade_classes`): a parallel class such as 6A, for one
cycle, under one grade level. It is the **registration unit**: official
roll, class teacher, daily attendance, notices. Attributes to add: medium;
stream (for Grades 12–13); capacity (default 40, from the Grade 1
admission notice).

**C2. Subject offering**: a subject taught to a grade class in a term
(`grade_class_subjects` exists for this). A grade-level-wide offering for
the year (the course in OneRoster terms) is a later addition if needed.

**C3. Teaching group** (`classrooms`): where teaching happens. It has a
**kind**:

| Kind | Meaning | Link |
|---|---|---|
| `homeroom` | The teacher's working surface for a whole grade class | `grade_class_id` required |
| `subject` | One subject taught to one grade class | `grade_class_id` and `subject_id` required |
| `cohort` | A teacher-defined group: remedial, enrichment, club practice, cross-class group | links optional |
| unset | Existing rows not yet classified | none |

Lessons, assignments and submissions stay on teaching groups.

**C4. Timetable**: a versioned weekly pattern of periods for each grade
class, with teacher and room per slot. Today only a per-teacher free-text
`timetable` table exists. Not yet modelled canonically.

**C5. Assessment definition**: what is assessed in a term: term test, SBA
stage, assignment. SBA (Circular 23/2017) requires at least one assessment
per subject per term, with five certified stages for O/L. Not yet modelled;
`grade_marks` carries results without a definition row.

### 3.4 Occupancy: people in places, over time

Every occupancy has `effective_from`, an optional `effective_to`, and a
status. Ending an occupancy closes the row; a new place opens a new row.
Nothing is overwritten.

**O1. Staff occupancy.**
- Leadership (`academic_cycle_leadership_assignments`): principal, sectional
  head, grade head. To add: deputy principal and assistant principal.
- Teaching (`grade_class_teacher_assignments`): class teacher, subject
  teacher, assistant, substitute. Role values to be constrained (today free
  text), with at most one primary class teacher per grade class at a time.
- Co-curricular teacher-in-charge (with D9).
- Status vocabulary from the civic ontology: acting, confirmed, interdicted,
  transferred, retired, where relevant.

**O2. Student placement.**
- **School enrolment**: entry to and exit from the institution, with
  admission number, entry date, entry grade, entry route (§3.7), exit date
  and exit reason. Not yet modelled; today only `school_memberships`
  (generic) exists.
- **Grade-class enrolment** (`student_grade_class_enrollments`): one active
  primary placement per student per cycle (to be enforced; today not
  enforced in the database).
- **Teaching-group membership** (`classroom_students`): may include unclaimed
  students; gains dates.

**O3. Multiple concurrent occupancies** are normal: a teacher who is also a
grade head; a principal who teaches. A person may also occupy places in
more than one institution (a school and a tuition institute).

### 3.5 Relations between people

These are not positions and do not live in the structure.

**R1. Guardian and student** (`student_guardian_relationships`, with
verification). `guardian_bonds` is a parallel table with drift (§8).

**R2. Teacher and student pair.** The relation between one teacher and one
student, which builds over time. It is held in the teaching-group context
and is where teaning is instantiated. Its content is defined by the teaning
work, not here; this record fixes only its place: keyed by teacher, student,
and the teaching group or grade class through which they meet.

### 3.6 Activity and evidence

All activity is recorded against occupancies, not against bare people.

| Activity | Table | Unit |
|---|---|---|
| Daily student attendance | `daily_attendance` | grade class, school day |
| Period or subject attendance | `attendance_sessions` | grade class, subject, period |
| Staff attendance | `teacher_daily_attendance`, `teacher_attendance_sessions` | institution, day |
| Lessons, assignments, submissions | `lessons`, `assignments`, `submissions` | teaching group |
| Marks | `grade_marks` | grade class, term, subject |
| SBA records, term tests | not modelled | grade class, term, subject |
| Report card | derived, not stored | student, term or cycle |
| Co-curricular record | not modelled | student, co-curricular unit |
| Notices | plan-and-bridge tables | grade class or school |

### 3.7 Transitions

A transition is a recorded event that ends one occupancy and opens another,
or records an external result. Each transition writes a row; none edits a
past cycle.

| ID | Transition | Trigger and timing | Records produced |
|---|---|---|---|
| T1 | **Cycle rollover** | Before term 1 (January) | New cycle and terms; grade classes created from the template and last year's structure; staff assignments copied as proposals |
| T2 | **Promotion, retention, completion** | End of cycle | Per student: promoted to the next grade, retained (repeats; repetition is about 0.5–1.1% per grade), or completed (left after Grade 11 or 13) |
| T3 | **Grade 1 admission** | Applications June–July for January entry | Application, category (proximity 50%, past pupils 25%, siblings 14%, education staff 6%, transferred public servants 4%, returning from abroad 1%), marks out of 100, interim list, waiting list, appeal, final list. A 40-place class: 35 by interview, 5 for children of forces and police |
| T4 | **Grade 5 Scholarship → Grade 6 admission** | Exam August–September; results; cut-offs by district and medium; applications within one month | Exam result (external), district cut-off flag, bursary eligibility, applications, per-school cut-off, placement. Schools without a primary section reserve 15% of Grade 6 places |
| T5 | **Admission to Grades 2–11 and inter-school transfer** | Subject to vacancies; Circular 27/2025 and its replacement; suspended from term 3 in some years | Exit from school A (leaving record), entry to school B, reason |
| T6 | **Movement within a school** | Any time | Class change (6A to 6B), medium change (bilingual students may exit to Sinhala or Tamil after Grade 8), section change |
| T7 | **O/L → A/L admission** | O/L at end of Grade 11 (results mid-year); A/L applications soon after | O/L result per subject (A, B, C, S, W), A/L eligibility (six passes with three credits, as applied by schools), stream eligibility, application, admission, often to another school. The Vocational stream admits regardless of O/L results |
| T8 | **A/L → university** | A/L results; Z-score ranking by the Department of Examinations; UGC selection | External result and eligibility, recorded only |
| T9 | **Staff appointment, transfer, acting, retirement** | Annual transfer schemes; appointments by the Public Service Commission or the Ministry Secretary (national schools) or provincial authority | Occupancy opened or closed with appointment type and reference |
| T10 | **Institution type change** | Gazette or ministry decision (for example Type 2 to 1C, provincial to national) | New type on the institution, effective from a date; template upgrade applied to the next cycle |
| T11 | **Identity claim** | When a shadow student or guardian claims | The person record becomes claimed; all placements and evidence follow (must be atomic) |

**External results** (Grade 5 Scholarship, O/L, A/L) are imported or
attested records with the exam index number. They are never computed by the
platform.

## 4. Templates by school type

Choosing a type creates this structure; each part is configurable per
school.

| Type | Definition (2023/2025 census) | Default sections and grades | Streams | Notes |
|---|---|---|---|---|
| 1AB | A/L classes including the science stream | Primary 1–5, Junior Secondary 6–9, Senior Secondary 10–11, Collegiate 12–13 | Bio Science, Physical Science, Commerce, Arts, Technology; Vocational if offered | Many 1AB schools start at Grade 6 (no primary section); the span is an override |
| 1C | A/L classes without the science stream | As 1AB | Commerce, Arts, Technology; Vocational if offered | |
| Type 2 | Classes only up to Grade 11 | Primary 1–5, Junior Secondary 6–9, Senior Secondary 10–11 | None | |
| Type 3 | Up to Grade 5 | Primary 1–5 | None | |

Defaults common to all government-school templates:

- three terms per cycle;
- parallel classes named by letter (A, B, C …), with medium as an attribute;
- class capacity 40;
- sections in Sinhala and Tamil as well as English (`name_si`, `name_ta`
  exist on sections).

Counts for orientation (2023 census): 10,096 government schools (396
national); 1AB 988, 1C 1,975, Type 2 3,273, Type 3 3,860.

## 5. Invariants

Each invariant fails clearly: a database constraint, a check in the setup
API, or a test.

1. **No past-cycle mutation.** Rows belonging to a completed or archived
   cycle are not edited; corrections are new rows referencing the original.
2. **One active primary placement.** A student has at most one active
   primary grade-class enrolment per cycle (partial unique index).
3. **Placement is internally consistent.** An enrolment's school and cycle
   equal its grade class's school and cycle (composite foreign key).
4. **Occupancy is bounded by its cycle.** `effective_from` and `effective_to`
   fall within the cycle's dates.
5. **One primary class teacher** per grade class at any instant.
6. **Teaching groups are linked explicitly.** A `homeroom` or `subject`
   teaching group has a `grade_class_id` in the same school and cycle. No
   process attaches records to a grade class by name or by "first active
   class" (today `resolveGradeClassRecord` does both).
7. **Role values are closed.** Teacher-assignment and leadership roles come
   from the position definitions (D7).
8. **Scoped leadership.** A sectional head has a section; a grade head has a
   grade level; a principal has neither (exists).
9. **Transitions are append-only.** Each transition is one row with its
   source and target occupancies.
10. **External results are attested,** never computed, and carry the exam
    index number and source.
11. **Identity claim is atomic.** Moving a shadow's placements and evidence
    to the claimed identity happens in one transaction or not at all.
12. **Shadows are not notice audiences.** Notices go only to verified
    guardians of claimed, actively enrolled students (plan-and-bridge).

## 6. Mapping from the current schema

| Atom | Current table | State | Additive change |
|---|---|---|---|
| G2 Institution | `schools`, `edu_schools` | `type` is free text; no governance, span or medium | Add `institution_type` (template key), `governance`, `grade_span_from`/`to`, `mediums` |
| G3 Cycle, term | `academic_cycles`, `academic_terms` | Exist; live and fresh builds differ (legacy date columns) | None needed for the model; reconcile builds separately |
| G3 Calendar | — | Missing | `school_calendar_days` (date, kind) |
| D1 Template | — | Missing | `institution_type_templates` (versioned JSON or rows) |
| D2 Section | `sections` | Exists; `school_id` has no foreign key | Add foreign key on new rows (`NOT VALID` then validate) |
| D3 Grade level | `academic_grade_levels`; legacy `grade_levels` (ZenStack `SchoolGrade`) | Two tables | Canonical: `academic_grade_levels`. Legacy kept, read-only for new features |
| D4 Subject | `academic_subjects` | Exists | Optional `national_code` |
| D5 Stream, D6 Medium | — | Missing | Lookup values; columns on grade classes |
| D7 Positions | check constraints on leadership roles; free text on teacher roles | Partial | Add deputy and assistant principal; constrain teacher roles |
| D8 Grading scale | hard-coded in `grading.ts` | Missing | `grading_scales` (versioned), referenced by marks |
| D9 Co-curricular | — | Missing | `cocurricular_units` and memberships |
| C1 Grade class | `grade_classes` | Exists | Add `medium`, `stream`, `capacity` |
| C2 Subject offering | `grade_class_subjects` | Exists | — |
| C3 Teaching group | `classrooms` | Exists, untyped and unlinked | Add `kind`, `grade_class_id`, `subject_id`, `term_id` (all nullable) |
| C4 Timetable | `timetable` (per teacher, free text) | Partial | `timetable_versions`, `timetable_slots` per grade class |
| C5 Assessment definition | — | Missing | `assessment_definitions` (term test, SBA stage, assignment) |
| O1 Staff occupancy | `academic_cycle_leadership_assignments`, `grade_class_teacher_assignments` | Exist; no setup API | Setup API; unique primary class teacher |
| O2 School enrolment | `school_memberships` (generic) | Partial | `student_school_enrolments` (admission number, entry and exit) |
| O2 Grade-class enrolment | `student_grade_class_enrollments` | Exists; invariants 2–3 not enforced | Partial unique index and composite foreign key |
| O2 Teaching-group membership | `classroom_students` | Exists | Add `effective_from`, `effective_to` |
| R1 Guardian | `student_guardian_relationships`, `guardian_bonds` | Two tables | Canonical: `student_guardian_relationships`; record the drift |
| R2 Teacher–student pair | — | Missing | Defined by the teaning work |
| Activity | attendance, lessons, assignments, submissions, `grade_marks` | Exist | Marks gain scale version and assessment definition |
| Transitions | — | Missing | `student_transitions`, `staff_transitions`, `exam_results`, `admission_applications` |

## 7. Additive change plan

Slices in order. Each states what it proves and how it fails.

1. **Link and type teaching groups.** Add `classrooms.kind`,
   `grade_class_id`, `subject_id`, `term_id`. Replace the name and
   first-class fallbacks in `resolveGradeClassRecord` with the explicit link;
   a name match may only suggest a link for a person to confirm. *Fails if*
   any attendance or mark is attached to a grade class that is not the
   teaching group's linked class.
2. **Close the role vocabularies.** Constrain teacher-assignment roles; add
   deputy and assistant principal to leadership roles; unique active primary
   class teacher. *Fails if* an unknown role value is accepted.
3. **Enforce placement invariants.** Partial unique index for one active
   primary placement; composite foreign key for school and cycle. *Fails
   if* a second active primary placement is accepted.
4. **Institution type and templates.** Add `institution_type` and span and
   medium fields; seed the four government templates. *Fails if* choosing a
   type does not produce the §4 sections and grade levels.
5. **Setup API (institution router, in `admin`).** Create cycle and terms;
   apply template; create sections, grade levels and grade classes; assign
   leadership and teachers; enrol students. Point the existing
   HierarchyBuilder, the school-creation wizard (which today discards its
   hierarchy step) and the student import screens at it.
6. **Medium, stream, capacity on grade classes.**
7. **School enrolment and transitions.** `student_school_enrolments`,
   `student_transitions` (T2, T5, T6), `staff_transitions` (T9). Cycle
   rollover (T1) as a server procedure producing proposals that a principal
   confirms.
8. **External results and admissions.** `exam_results` (Grade 5, O/L, A/L,
   with index number and source) and `admission_applications` (T3, T4, T7).
9. **Assessment definitions and grading scales.** Marks reference a
   definition and a scale version.
10. **Calendar, timetable, co-curricular.**
11. **Teacher–student pair layer** (R2), when the teaning work defines its
    content.

Slices 1–5 are the TRL 5 core for the dissertation scope (principal setup,
teacher classroom, attendance, timetable, student work). Slices 6–11 extend
it.

## 8. Contradictions recorded

| Contradiction | Resolution in this record |
|---|---|
| August record "breaking" vs migration "additive only" | Additive; both models kept (§0) |
| Three grade-level tables (`grades` in code, `grade_levels`, `academic_grade_levels`) | `academic_grade_levels` canonical; others kept for existing readers |
| Grade head on `grade_levels.grade_head_id` and on leadership assignments | Leadership assignments canonical (cycle-scoped) |
| Different write rights for `Classroom` and `GradeClass` | Setup writes go through the institution router; Cedar policies follow D7 positions |
| Free-text teacher-assignment role | Closed vocabulary (slice 2) |
| Identity doc: shadow has `student_id` null until claim; code creates a shadow `users` row and re-keys on claim | Code's model accepted; claim must become atomic (invariant 11) |
| August record's open questions | Year contains terms; explicit teacher placement; one primary placement; scale per school and versioned; published marks corrected by new rows |
| `guardian_bonds` vs `student_guardian_relationships` | Relationships canonical; drift recorded for a later record |

## 9. Defects found while writing this record

These are outside this record's decision but were found in the process.

1. `resolveGradeClassRecord` falls back to the first active grade class in the
   school (attendance and enrolment can land in the wrong class).
2. `claimShadowStudent` is not wrapped in a transaction and swallows errors
   per step.
3. `20261017210000_plan_bridge_calm_notices.sql`: `plan_bridge_can_view_grade_class`
   references `c.school_id` outside the subquery that defines `c`; the
   migration fails when function bodies are checked.
4. One active primary placement is agreed but not enforced.
5. `resolveGradeMarkAuthority` does not check that the student is enrolled in
   the class, that the term belongs to the cycle, or that the subject is
   offered to the class.
6. The migration chain cannot be replayed from an empty database; several
   tables exist only in `supabase/backups/remote_schema_backup.sql`.
7. The grading scale in `grading.ts` (S ≥ 40) differs from the O/L scale
   (S ≥ 35); this may be intended school policy, but it is not recorded as
   such.

## 10. Open questions for Naveen

1. Default `kind` for existing classrooms: unset (classified later) or
   `cohort`?
2. A/L streams in slice 6, or later?
3. Should rollover (T1) copy staff assignments as proposals, or start
   empty?
4. Do admissions (T3, T4, T7) belong in the platform's scope for the
   dissertation, or only their outcomes (the student's entry route on the
   school enrolment)?
5. Which grading scale is each school's default: the platform's current one
   or the O/L scale?
6. Is the school calendar entered by each school, or seeded from the
   Ministry's annual term dates?

## 11. Sources

Repository:
- `docs/decisions/2026-08-12-grade-school-grade-marks-domain.md`
- `docs/current_progress/2026-08-12-gurudevi-rigorous-improvement-plan.md`
- `docs/architecture/2026-10-10-sri-lanka-education-civic-ontology-ontogeny-and-er-architecture.md`
- `docs/architecture/2026-10-18-holistic-dual-loop-attendance-and-scaling-plan.md`
- `docs/decisions/2026-10-17-plan-and-bridge-calm-notices.md`
- `apps/gurudevi-mobile/docs/identity-membership-and-claim-model.md`
- `apps/gurudevi-mobile/supabase/migrations/20260813010000_academic_lifecycle_foundation.sql`
- `packages/schema/schema.zmodel`
- `apps/sanctuary-api/src/core/handlers/{attendance,educational,grading,planBridge}.ts`,
  `apps/sanctuary-api/src/core/gradingAuthority.ts`

Standards:
- [1EdTech OneRoster 1.2 Rostering Information Model](https://standards.1edtech.org/oneroster/specifications/standards/v1p2/services/rostering/im):
  academic sessions, homeroom and scheduled classes, enrolments with roles,
  primary flag and dates.
- [Ed-Fi Data Standard 5: Teaching and Learning](https://docs.ed-fi.org/reference/data-exchange/data-standard/5/model-reference/teaching-and-learning-domain/entities-references-and-descriptors),
  [Student Cohort](https://docs.ed-fi.org/reference/data-exchange/data-standard/5/model-reference/student-cohort-domain/overview),
  [Enrollment](https://docs.ed-fi.org/reference/data-exchange/data-standard/5/model-reference/enrollment-domain/entities-references-and-descriptors),
  [Student Attendance](https://docs.ed-fi.org/reference/data-exchange/data-standard/5/model-reference/student-attendance-domain/overview):
  sections, cohorts, time-bounded associations, school-day versus section
  attendance.

Sri Lanka:
- [Ministry of Education, School Census 2023](https://moe.gov.lk/wp-content/uploads/2024/09/School_Census2023_SummaryReport_V1.pdf)
  and [Annual School Census 2025](https://www.statistics.gov.lk/Resource/en/Education/School_Census/Annual_School_Census_SummaryReport_2025.pdf):
  school types, counts, cycles, A/L streams.
- [Grade 1 admission notice for 2025](https://moe.gov.lk/wp-content/uploads/2024/07/01/English_Paper_ad_2025_Corrected.pdf):
  categories, class of 40, selection and appeals.
- [Circular 03/2018, Grade 6 admission](https://moe.gov.lk/wp-content/uploads/2024/08/03-2018-en.pdf).
- [Circular 23/2017, School Based Assessment](https://moe.gov.lk/wp-content/uploads/2024/08/23-2017-en.pdf).
- [Sri Lanka Principals' Service Minute, Gazette 1885/31](https://teacher.moe.gov.lk/wp-content/uploads/2024/09/1885-31_E.pdf)
  and [Teachers' Service Minute, Gazette 1885/38](https://teacher.moe.gov.lk/wp-content/uploads/2024/09/Gazette-of-Sri-Lanka-2014-October-1.pdf).
- [NEC recommendations on medium of instruction](https://nec.gov.lk/wp-content/uploads/2025/05/Recommendations-for-the-National-Policy-on-Medium-of-Instruction-in-Schools.pdf).
- [Repetition rates by grade, 2017](https://dmb.moe.gov.lk:443/2017/04/04_PDF/Tbl20170417.pdf).
- [Kasturi Arachchi (2011), sectional heads](https://archive.cmb.ac.lk/items/38709eb0-25e5-4f71-8758-f514219128c4/full):
  no official definition of the sectional head's role.
- [2026 term schedule (Newsfirst)](https://newsfirst.lk/2025/09/13/school-term-schedule-for-2026-released).
- [O/L 2025 results (Newsfirst)](https://english.newsfirst.lk/2026/06/20/2025-o-l-results-released-re-scrutiny-applications-open-from-june-25),
  [A/L admission requirements (Thurstan College)](https://thurstancollege.com/applicants),
  [university admission (University of Colombo, restating UGC policy)](https://cmb.ac.lk/admissions).

Not confirmed on an opened page, and so stated without detail above: the
texts of circulars 2008/37, 17/2023, 27/2025, 25/2013 (A/L admission),
20/2007 (teacher transfers) and 12/2024 (prefects); official definitions of
class teacher and grade coordinator; the school census number and NEMIS
student identifier.

## 12. Intended against done

| Intended | Done |
|---|---|
| Amend the August record without editing it | Yes: new record, `amends` in front matter |
| Keep both models as complementary layers | Yes: §0, §3.3 C3 |
| Full atom set: generators, definitions, cycle instances, occupancy, relations, activity, transitions | Yes: §3 |
| Templates by school type, configurable | Yes: §4 (government family only) |
| Transitions: years, classes, sections, schools, scholarships, exams, staff | Yes: §3.7 T1–T11 |
| Other institution kinds kept outside but designed for | Yes: §2 |
| Mapping to the current schema with additive changes only | Yes: §6–§7 |
| Contradictions and defects recorded | Yes: §8–§9 |
| Implementation | Not started; awaits approval of this record |
