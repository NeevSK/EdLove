---
title: "Institutional Structure: Canonical Model"
status: "proposed"
created: 2026-10-20
updated: 2026-10-21
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

1. **Complementary layers.** The August record keeps `classrooms` only "if it
   means an instructional subject/group context; otherwise migrate the
   current classroom concept to `grade_classes` explicitly." This record
   keeps both as two layers of one structure: the grade class is the
   institutional registration unit; the classroom is a teaching group. The
   ambiguity the August record names ("`classroom_id` must not ambiguously
   mean both '6A cohort' and '6A Mathematics instructional group'") is
   resolved by typing and linking classrooms (C3), not by retiring them.
2. **Accretive evolution.** Changes are additive: new columns, new tables,
   new constraints applied to new rows (`NOT VALID` on existing rows). No
   table, column, route or working behaviour is removed by this record.
   Where a slice would retire a behaviour (a fallback, an old write path),
   the slice names it and leaves it in place until Naveen signs off under
   the Deletion Veto (AGENTS.md §4).
3. **Transitions are first-class.** The August record models a year; this
   record also models how people and institutions move between years,
   classes, sections and schools.

What this record keeps from earlier decisions:

- The August record's three tiers (stable definitions, cycle records,
  delivery and evidence), its rule "No current-year record should be mutated
  to represent next year", and its rule that the initial implementation
  "must not delete data or drop tables". Its "breaking domain correction"
  concerns meaning and API contracts, not data, so it does not conflict with
  additive evolution.
- The improvement plan's answers (2026-08-12, lines 149–171): an academic
  year contains terms; teacher placement is a formal historical assignment;
  "Students have one active primary `grade_class` placement at a time"; the
  general marks scale excludes plus and minus grades.
- The civic ontology's occupancy shape (2026-10-10): a person holds a role in
  an entity over an interval, with a status.
- The attendance plan (2026-10-18): daily attendance on the grade class,
  period attendance as sessions.
- Plan-and-bridge (2026-10-17) as decided; §8 records where the code differs.
- The identity model: one person, many placements; no separate person table
  per role.

One divergence from the August record is recorded rather than hidden: it
names the canonical grade-level table `grade_levels`; the migration built
`academic_grade_levels`, and `grade_levels` is the legacy table. This record
takes `academic_grade_levels` as canonical (D3).

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
| Sri Lankan government schools: national and provincial; types 1AB, 1C, Type 2, Type 3 | **In scope.** Templates in §4. |
| Government schools with irregular grade spans (for example Grade 1–9, 6–11, 6–13) | **In scope**, as template overrides. |
| Special education units inside ordinary schools | In scope as a unit kind; detail deferred. |
| Private and international schools, Pirivenas, special schools, universities, tuition institutes | **Designed for, not built.** The model is template-driven so these can be added as further templates. None is defined here. |

One engine, one fully specified template family now; further families when
one is actually built.

Known risk: the 2026 curriculum reform (Grade 1 in 2026; Grades 2, 6 and 7
in 2027; then 3/8 and 4/9) may change assessment structure. C5 and SBA are
modelled to absorb new assessment kinds as data, not schema.

## 3. Atoms

Ordered by generation: what exists on its own; what is defined from it; what
is instantiated per year; occupancy; relations; activity; transitions.

### 3.1 Generators

**G1. Person.** One identity per human (`users`). Roles are never separate
person tables. A person may be unclaimed (a "shadow" created by a teacher)
until the human claims the identity.

**G2. Institution.** A school (`schools`), optionally linked to the national
census registry (`edu_schools` via `schools.census_id`). The registry already
carries `type_code`, `category`, `gender`, `religion`, province, district,
zone, division and census number. The model needs on the institution:

- the template key (§4), derived from `edu_schools.type_code` where linked,
  and set by the school where not;
- governance: national or provincial;
- the grade span actually offered (may differ from the type's default);
- mediums offered;
- timezone (exists).

`schools.type` is free text today and stays as it is.

**G3. Time.**
- **Academic cycle** (`academic_cycles`): one school year, roughly January to
  December in Sri Lanka, set by the Ministry.
- **Term** (`academic_terms`): three per year by default (2026: 1 Jan–10 Apr,
  20 Apr–24 Jul, 27 Jul–4 Dec, with breaks inside terms 1 and 3).
- **School calendar**: which days are school days. Partial today:
  `calendar_events` (school-wide or per grade class) and the
  `school_day`/`rest_day` schedules in `school_mode_policies`. A per-date
  school-day register for attendance rates is not yet modelled.

### 3.2 Definitions (stable across years, per institution)

**D1. Institution-type template.** System-level, versioned. Declares the
sections, grade levels, permitted streams, default term pattern and class
naming for a type (§4). A school is configured from its template and may
override parts.

**D2. Section** (`sections`): a stage of schooling (Primary, Junior
Secondary, Senior Secondary, Collegiate), with its grade range and Sinhala
and Tamil names.

**D3. Grade level** (`academic_grade_levels`, ZenStack `GradeLevel`): Grade
1–13 within a section. Legacy `grade_levels` (ZenStack `SchoolGrade`) stays
for existing readers.

**D4. Subject** (`academic_subjects`), with Sinhala and Tamil names. National
subject codes later.

**D5. Stream** (A/L): Bio Science, Physical Science, Commerce, Arts,
Technology, Vocational. Permitted by type (1AB includes science; 1C does not).
Not yet modelled.

**D6. Medium**: Sinhala, Tamil, English. Medium is an attribute of a grade
class (Sinhala-medium and Tamil-medium parallel classes) **and** of a
student's subject (bilingual students take up to five subjects in English
from Grade 6). Not yet modelled.

**D7. Position definition**: a named role and the unit it attaches to.

| Position | Attaches to | Current home |
|---|---|---|
| Principal | institution | leadership assignments |
| Deputy principal | institution | none |
| Assistant principal | institution, optionally a section | `invite_codes` role only |
| Sectional head | section | leadership assignments; also `sections.section_head_id` |
| Grade head (grade coordinator) | grade level | leadership assignments; also `grade_levels.grade_head_id` |
| Class teacher | grade class | teacher assignments (free-text role) |
| Subject teacher | grade class + subject, or teaching group | teacher assignments |
| Assistant teacher | grade class | teacher assignments |
| Relief (substitute) teacher | a period on a date | `relief_assignments` (classroom-based, dated) |
| Teacher-in-charge of an activity | co-curricular unit | none |
| Non-teaching staff, guidance counsellor | institution | none |
| School Development Committee member | institution | none |

Service grades (Sri Lanka Principals' Service, Teachers' Service) are
attributes of a person's employment, not positions. Role fields also
duplicated in `teacher_profiles` (`designation`, `school_role`,
`work_roles`, `is_section_head`) are treated as profile projections, not
sources of truth.

**D8. Grading scale**: versioned, per school and cycle. The code
(`apps/sanctuary-api/src/core/handlers/grading.ts`) uses A≥75, B≥65, C≥50,
S≥40, otherwise F; the national O/L scale is A≥75, B≥65, C≥50, S≥35,
otherwise W. Which a school uses is recorded policy. Not yet modelled.

**D9. Co-curricular unit**: club, society, sport team, house, prefect board.
Circular 31/2024 requires a teacher-in-charge appointed in writing and
records in the student record book. Not yet modelled.

### 3.3 Cycle instances (created for one year)

**C1. Grade class** (`grade_classes`): a parallel class such as 6A, for one
cycle, under one grade level. The **registration unit**: official roll,
class teacher, daily attendance, notices. To add: medium; stream (Grades
12–13); capacity (default 40).

**C2. Subject offering**: a subject taught to a grade class in a term
(`grade_class_subjects`).

**C3. Teaching group** (`classrooms`): where teaching happens. It gains a
**kind** and explicit links:

| Kind | Meaning | Links |
|---|---|---|
| `homeroom` | The class teacher's working surface for one grade class | one grade class |
| `subject` | One subject taught to one or more grade classes (cross-class groups are common: religion, O/L basket subjects, A/L subjects) | `subject_id`; one or more grade classes through a link table |
| `cohort` | A teacher-defined group: remedial, enrichment, club practice | optional |
| unset | Existing rows not yet classified | none; excluded from new linking until classified |

Existing columns `grade_id` (legacy grade level), `section_id`, free-text
`subject` and text `academic_year` stay. New readers use the new links; old
readers keep working. Lessons, assignments and submissions stay on teaching
groups.

**C4. Timetable**: a versioned weekly pattern of periods per grade class, with
teacher, subject and room per slot. Today only a per-teacher free-text
`timetable` table exists. Not yet modelled canonically.

**C5. Assessment definition**: term test, SBA stage, assignment, or a future
assessment kind. SBA (Circular 23/2017) requires at least one assessment per
subject per term, with five certified stages for O/L. Not yet modelled;
`grade_marks` carries results without a definition row.

**C6. Student subject choice**: what each student actually takes in a cycle:
religion, the aesthetic subject (Grades 6–9), the three O/L basket subjects,
the A/L subjects with General English and the Common General Test, and the
medium per subject. Marks and subject attendance are validated against it.
Not yet modelled.

### 3.4 Occupancy: people in places, over time

Every occupancy has `effective_from`, an optional `effective_to`, and a
status. Ending an occupancy closes the row; a new place opens a new row.

**O1. Staff occupancy.**
- Leadership (`academic_cycle_leadership_assignments`): principal, sectional
  head, grade head; deputy and assistant principal to add.
- Teaching (`grade_class_teacher_assignments`): class teacher, subject
  teacher, assistant. Role values to be closed; at most one active
  `class_teacher` per grade class.
- Relief (`relief_assignments`) and co-curricular teacher-in-charge (D9).
- Lifecycle today is `active`, `completed`, `ended`. The civic ontology's
  tenure statuses (acting, confirmed, interdicted, transferred, retired) are
  added as a separate `tenure_status`, not by changing the existing status.

**O2. Student placement.**
- **School enrolment**: entry to and exit from the institution, with
  admission number, entry date, entry grade, entry route (§3.7), exit date
  and exit reason. Not yet modelled. Placement facts are scattered today
  across `school_memberships`, `student_profiles` (`index_number`,
  `current_grade_id`, `section_id`, `active_classroom_id`) and `users`
  (`school_id`, `index_number`); these remain as projections.
- **Grade-class enrolment** (`student_grade_class_enrollments`): one active
  primary placement per student at any instant (invariant 2).
- **Teaching-group membership** (`classroom_students`): may include unclaimed
  students; gains dates.

**O3. Concurrent occupancies** are normal: a teacher who is also a grade head;
a principal who teaches; a person in a school and a tuition institute.

### 3.5 Relations between people

Not positions; they do not live in the structure.

**R1. Guardian and student** (`student_guardian_relationships`, with
verification). `guardian_bonds` is a parallel table with drift (§8).

**R2. Teacher and student pair.** The relation between one teacher and one
student, built over time, held in the teaching-group context. This is where
teaning is instantiated. Its content is defined by the teaning work; this
record fixes only its place: keyed by teacher, student, and the teaching
group or grade class through which they meet.

### 3.6 Activity and evidence

Recorded against occupancies, not bare people.

| Activity | Table | Unit |
|---|---|---|
| Daily student attendance | `daily_attendance` | grade class, date |
| Session attendance | `attendance_sessions` (`session_kind` lesson, arrival or departure; `session_at`; optional term and subject) | grade class, time |
| Staff attendance | `teacher_daily_attendance`, `teacher_attendance_sessions`; also `staff_attendance` | institution, date |
| Lessons, assignments, submissions | `lessons`, `assignments`, `submissions` | teaching group |
| Marks | `grade_marks` | grade class, term, subject |
| SBA records, term tests | not modelled | grade class, term, subject |
| Report card | derived, not stored | student, term or cycle |
| Co-curricular record | not modelled | student, co-curricular unit |
| Notices and events | `announcements` (with `audience_scope` school or grade class), `school_notice_events`, `calendar_events` | school or grade class |

### 3.7 Transitions

A transition is a recorded event that ends one occupancy and opens another,
or records an external result. Each writes a row; none edits a past cycle
(the one exception is T11).

| ID | Transition | Trigger and timing | Records produced |
|---|---|---|---|
| T1 | **Cycle rollover** | Before term 1 (January) | New cycle and terms; grade classes from the template and last year's structure; staff assignments as proposals |
| T2 | **Promotion, retention, leaving** | End of cycle | Per student: promoted; retained (repetition is about 0.5–1.1% per grade); left at the school's top grade (for example Grade 5 in a Type 3 school, Grade 9 in a 1–9 school) and expected to transfer; or completed schooling (after Grade 11 or 13) |
| T3 | **Grade 1 admission** | Applications June–July for January entry | Application; category (proximity 50%, past pupils 25%, siblings 14%, education staff 6%, transferred public servants 4%, returning from abroad 1%); marks out of 100; interim, waiting and final lists; appeal. A class of 40: 35 by interview, 5 for children of forces and police |
| T4 | **Grade 5 Scholarship → Grade 6 admission** | Exam August–September; cut-offs by district and medium; applications within one month | Exam result (external); cut-off flag; bursary eligibility; applications; per-school cut-off; placement. Schools without a primary section reserve 15% of Grade 6 places |
| T5 | **Admission to Grades 2–11; inter-school transfer** | Subject to vacancies (Circular 27/2025 and its replacement); suspended from term 3 in some years | Exit from school A with leaving record; entry to school B; reason |
| T6 | **Movement within a school** | Any time | Class change (6A to 6B); medium change (bilingual students may move to Sinhala or Tamil medium after Grade 8); section change |
| T7 | **O/L → A/L admission** | O/L after Grade 11 ends; results mid-year (2025 O/L results: June 2026); A/L applications soon after | O/L result per subject (A, B, C, S, W); eligibility (six passes with three credits, as schools apply it); stream eligibility; application; admission, often to another school. Between Grade 11 and A/L entry the student is in a **waiting state**; Grade 12 classes are created mid-cycle. Vocational stream admits regardless of O/L results |
| T8 | **A/L → university** | A/L results; Z-score rank (Department of Examinations); UGC selection | External result and eligibility, recorded only |
| T9 | **Staff appointment, transfer, acting, retirement** | Annual transfer schemes; appointments by the Public Service Commission or Ministry Secretary (national schools) or provincial authority | Occupancy opened or closed, with appointment type and reference |
| T10 | **Institution type change** | Gazette or ministry decision (for example Type 2 to 1C; provincial to national) | New type from a date; template upgrade applied to the next cycle |
| T11 | **Identity claim** | A shadow student or guardian claims | The shadow identity merges into the claimed one (see invariant 11) |

**External results** (Grade 5 Scholarship, O/L, A/L) are imported or attested
records with the exam index number and source. They are never computed by
the platform, and they reference the student, not an occupancy.

## 4. Templates by school type

Choosing a type creates this structure; each part is configurable per school.

| Type | Definition (2023/2025 census) | Default sections and grades | Permitted streams | Notes |
|---|---|---|---|---|
| 1AB | A/L classes including the science stream | Primary 1–5, Junior Secondary 6–9, Senior Secondary 10–11, Collegiate 12–13 | Bio Science, Physical Science, Commerce, Arts, Technology; Vocational if offered | Many start at Grade 6; the span is an override |
| 1C | A/L classes without the science stream | As 1AB | Commerce, Arts, Technology; Vocational if offered | |
| Type 2 | Classes only up to Grade 11 | Primary 1–5, Junior Secondary 6–9, Senior Secondary 10–11 | None | |
| Type 3 | Up to Grade 5 | Primary 1–5 | None | |

Defaults common to the government family: three terms; parallel classes
named by letter (A, B, C …) with medium as an attribute; class capacity 40;
section names in English, Sinhala and Tamil.

Orientation (2023 census): 10,096 government schools (396 national); 1AB 988,
1C 1,975, Type 2 3,273, Type 3 3,860.

## 5. Invariants

Each fails clearly; the last column names the enforcing slice (§7).

| # | Invariant | Enforced by |
|---|---|---|
| 1 | **No past-cycle mutation.** Rows of a completed or archived cycle are not edited; corrections are new rows referencing the original. Sole exception: the person reference rewritten by an identity claim (11). | Slice 3 (trigger rejecting updates to archived-cycle rows) |
| 2 | **One active primary placement per student at any instant,** across all schools. | Slice 3 (exclusion constraint on student and interval, `NOT VALID` on existing rows) |
| 3 | **Placement is internally consistent.** An enrolment's school and cycle equal its grade class's. | Slice 3 (composite foreign key, `NOT VALID`) |
| 4 | **Cycle-scoped occupancies stay within their cycle** (grade-class enrolment, teacher assignment, leadership). School enrolment and staff appointment are not cycle-scoped. | Slice 3 (check in the setup API) |
| 5 | **At most one active `class_teacher`** per grade class at any instant. | Slice 2 (partial unique index) |
| 6 | **Teaching groups are linked explicitly.** New records attach to a grade class only through the explicit link; name matching may only suggest. | Slice 1 |
| 7 | **Role values are closed** for new rows. | Slice 2 (`NOT VALID` check) |
| 8 | **Scoped leadership.** A sectional head has a section; a grade head a grade level; a principal neither. | Exists |
| 9 | **Transitions are append-only.** Movement transitions (T2, T5, T6, T7 admission, T9) reference source and target occupancies; result transitions (T4, T7 results, T8) reference the student. | Slice 7 |
| 10 | **External results are attested** with index number and source. | Slice 8 |
| 11 | **Identity claim is atomic and complete.** One transaction moves every placement and record from the shadow to the claimed person; any conflict aborts the claim and is reported, never left behind. The merge is itself recorded. | Slice 1 (fix to `claimShadowStudent`) |
| 12 | **Shadows are not notice audiences.** | Exists (plan-and-bridge) |

## 6. Mapping from the current schema

| Atom | Current table | State | Additive change |
|---|---|---|---|
| G2 Institution | `schools`; `edu_schools` (`type_code`, `category`) | Type free text on `schools`; registry type on `edu_schools` | `template_key` (derived from `type_code` where linked), `governance`, `grade_span_from`/`to`, `mediums` |
| G3 Cycle, term | `academic_cycles`, `academic_terms` | Exist; live and fresh builds differ (legacy date columns) | None for the model; reconcile builds separately |
| G3 Calendar | `calendar_events`, `school_mode_policies` | Partial | `school_calendar_days` (date, kind) |
| D1 Template | — | Missing | `institution_type_templates` (versioned) |
| D2 Section | `sections` | Exists; `school_id` has no foreign key | Foreign key `NOT VALID` (enforced for new rows); validation only after orphan cleanup, with sign-off |
| D3 Grade level | `academic_grade_levels`; legacy `grade_levels`; code still queries a non-existent `grades` | Two tables plus a stale name | `academic_grade_levels` canonical; legacy kept |
| D4 Subject | `academic_subjects` | Exists | Optional `national_code` |
| D5 Stream, D6 Medium | — | Missing | Lookups; columns on grade classes; medium on C6 |
| D7 Positions | Leadership check (principal, section head, grade head); free-text teacher role; `relief_assignments` | Partial | New leadership check including deputy and assistant principal (`NOT VALID`); closed teacher roles for new rows |
| D8 Grading scale | Hard-coded in `grading.ts` | Missing | `grading_scales` (versioned), referenced by marks |
| D9 Co-curricular | — | Missing | `cocurricular_units`, memberships |
| C1 Grade class | `grade_classes` | Exists | `medium`, `stream`, `capacity` |
| C2 Subject offering | `grade_class_subjects` | Exists | — |
| C3 Teaching group | `classrooms` (legacy `grade_id`, `section_id`, text `subject`, text `academic_year`) | Linked only to legacy tables | `kind`, `subject_id`, `term_id`; `classroom_grade_classes` link table |
| C4 Timetable | `timetable` (per teacher, free text) | Partial | `timetable_versions`, `timetable_slots` per grade class |
| C5 Assessment definition | — | Missing | `assessment_definitions` |
| C6 Subject choice | — | Missing | `student_subject_choices` (cycle, subject, category, medium) |
| O1 Staff occupancy | leadership and teacher assignments; `relief_assignments` | Exist; no setup API | Setup API; `tenure_status`; invariant 5 |
| O2 School enrolment | `school_memberships`, `student_profiles`, `users.school_id` | Scattered | `student_school_enrolments` |
| O2 Grade-class enrolment | `student_grade_class_enrollments` | Exists; invariants 2–3 not enforced | Exclusion constraint; composite foreign key |
| O2 Teaching-group membership | `classroom_students` | Exists | `effective_from`, `effective_to` |
| R1 Guardian | `student_guardian_relationships`, `guardian_bonds` | Two tables | Relationships canonical; drift recorded |
| R2 Teacher–student pair | — | Missing | Defined by the teaning work |
| Activity | attendance tables, lessons, assignments, submissions, `grade_marks` | Exist | Marks gain scale version and assessment definition |
| Transitions | — | Missing | `student_transitions`, `staff_transitions`, `exam_results`, `admission_applications`, `identity_merges` |

## 7. Additive change plan

Each slice states what it adds, what it leaves in place, and how it fails.

1. **Link teaching groups; make the claim atomic.** Add `classrooms.kind`,
   `subject_id`, `term_id` and `classroom_grade_classes`. `resolveGradeClassRecord`
   prefers the explicit link. Its name and first-class fallbacks stay in
   place but are logged and flagged; removing them needs sign-off (open
   question 1), because `addShadowStudent` currently depends on them. Wrap
   `claimShadowStudent` in one transaction that aborts on conflict.
   *Fails if* a record attaches to a grade class other than the teaching
   group's linked class, or a claim leaves rows on the shadow.
2. **Close role vocabularies.** Replace the leadership role check with a
   wider one (adding deputy and assistant principal), `NOT VALID`; add a
   `NOT VALID` check on teacher-assignment roles; partial unique index for
   one active `class_teacher`. Existing free-text rows stay readable.
   *Fails if* an unknown role is accepted on a new row.
3. **Enforce placement invariants** for new rows: exclusion constraint for
   one active primary placement; composite foreign key; archived-cycle
   update guard. Existing duplicates are listed, not altered. *Fails if* a
   second active primary placement is accepted.
4. **Institution type and templates.** `template_key`, span, governance,
   mediums; seed the four government templates. *Fails if* choosing a type
   does not produce the §4 sections and grade levels.
5. **Setup API (institution router, in `admin`).** Create cycle and terms;
   apply a template; create sections, grade levels and grade classes; assign
   leadership and teachers; enrol students. Add new write paths for the
   HierarchyBuilder, the school-creation wizard (which today discards its
   hierarchy step) and the import screens. Their current write paths stay
   until sign-off; note that `packages/admin/src/structure.ts` and
   `schoolRepository.ts` query a `grades` table that does not exist, so the
   current HierarchyBuilder grade writes are likely failing already.
6. **Medium, stream, capacity on grade classes; student subject choice (C6).**
7. **School enrolment and transitions.** `student_school_enrolments`,
   `student_transitions` (T2, T5, T6, T7 admission), `staff_transitions` (T9);
   rollover (T1) as a server procedure producing proposals a principal
   confirms; the A/L waiting state (T7).
8. **External results and admissions.** `exam_results` (Grade 5, O/L, A/L);
   `admission_applications` (T3, T4, T7).
9. **Assessment definitions and grading scales.**
10. **Calendar days, timetable, co-curricular.**
11. **Teacher–student pair layer** (R2), when the teaning work defines it.

Slices 1–5 are the TRL 5 core for the dissertation scope (principal setup,
teacher classroom, attendance, timetable, student work).

## 8. Contradictions recorded

| Contradiction | Resolution |
|---|---|
| August record names `grade_levels` canonical; migration built `academic_grade_levels` | `academic_grade_levels` canonical (D3) |
| Grade-level naming in code: `packages/admin/src/structure.ts:34,49` and `schoolRepository.ts:117,150` query `grades` (column `number`); the real legacy table is `grade_levels` (`grade_number`) | Recorded; new writes go through slice 5 |
| Leadership recorded in five places: leadership assignments, `sections.section_head_id`, `grade_levels.grade_head_id`, `teacher_profiles` role fields, `invite_codes.role` | Leadership assignments canonical; others are projections or invitation intents |
| Different write rights for `Classroom` and `GradeClass` | Setup writes through the institution router; Cedar follows D7 |
| Free-text teacher-assignment role | Closed for new rows (slice 2) |
| Identity doc: shadow `student_id` null until claim; code creates a shadow `users` row and re-keys on claim | Code's model accepted, as a recorded merge (invariant 11) |
| Plan-and-bridge ADR: notices to **verified** guardians only; code (`plan_bridge_can_view_grade_class`) also admits pending guardians when `guardian_verification_required` is false, its default | Open question 2 |
| August record's open questions | Year contains terms; explicit teacher placement; one primary placement at a time; per-school versioned scale; published marks corrected by new rows |
| `guardian_bonds` vs `student_guardian_relationships` | Relationships canonical; drift recorded |

## 9. Defects found while writing this record

Outside this record's decision, found in the process:

1. `resolveGradeClassRecord` (`attendance.ts:52–118`): the name match has no
   cycle filter (it can pick a prior-year class), it falls back to the
   school's first active grade class, then to the context school's first
   class, and it swallows errors.
2. `claimShadowStudent` (`educational.ts:456–587`) is not transactional,
   swallows per-step errors, and leaves conflicting rows on the shadow.
3. `20261017210000_plan_bridge_calm_notices.sql`: in
   `plan_bridge_can_view_grade_class` (about line 301) `c.school_id` is used
   outside the subquery that defines `c`. With the default
   `check_function_bodies = on` the migration fails to apply.
4. One active primary placement is agreed but not enforced.
5. `resolveGradeMarkAuthority` does not check student enrolment, that the
   term belongs to the cycle, or that the subject is offered to the class.
6. The migration chain cannot be replayed from empty; several tables exist
   only in `supabase/backups/remote_schema_backup.sql`.
7. `grading.ts` uses S ≥ 40 and fail grade F; the O/L scale is S ≥ 35 and
   W. Possibly intended; not recorded as policy.
8. HierarchyBuilder writes target a non-existent `grades` table (§8).

## 10. Open questions for Naveen

1. May the name and first-class fallbacks in `resolveGradeClassRecord` be
   retired once explicit links exist (Deletion Veto)?
2. Notices: verified guardians only (the ADR), or also pending guardians
   when a school does not require verification (the code)?
3. Default `kind` for existing classrooms: unset, or `cohort`?
4. A/L streams and subject choice in slice 6, or later?
5. Rollover: copy staff assignments as proposals, or start empty?
6. Admissions (T3, T4, T7): in the platform's scope, or only their outcome
   (entry route on the school enrolment)?
7. Default grading scale: the platform's or the O/L scale?
8. School calendar: entered by each school, or seeded from the Ministry's
   term dates?

## 11. Sources

Repository:
- `docs/decisions/2026-08-12-grade-school-grade-marks-domain.md`
- `docs/current_progress/2026-08-12-gurudevi-rigorous-improvement-plan.md`
- `docs/architecture/2026-10-10-sri-lanka-education-civic-ontology-ontogeny-and-er-architecture.md`
- `docs/architecture/2026-10-18-holistic-dual-loop-attendance-and-scaling-plan.md`
- `docs/decisions/2026-10-17-plan-and-bridge-calm-notices.md`
- `apps/gurudevi-mobile/docs/identity-membership-and-claim-model.md`
- `apps/gurudevi-mobile/supabase/migrations/20260813010000_academic_lifecycle_foundation.sql`,
  `20261017210000_plan_bridge_calm_notices.sql`
- `apps/gurudevi-mobile/supabase/backups/remote_schema_backup.sql`
- `packages/schema/schema.zmodel`
- `apps/sanctuary-api/src/core/handlers/{attendance,educational,grading,planBridge}.ts`,
  `apps/sanctuary-api/src/core/gradingAuthority.ts`
- `packages/admin/src/structure.ts`, `packages/core/src/adapters/supabase/educational/schoolRepository.ts`

Standards:
- [1EdTech OneRoster 1.2 Rostering Information Model](https://standards.1edtech.org/oneroster/specifications/standards/v1p2/services/rostering/im):
  academic sessions; homeroom and scheduled classes; enrolments with role,
  primary flag and dates.
- [Ed-Fi Data Standard 5: Teaching and Learning](https://docs.ed-fi.org/reference/data-exchange/data-standard/5/model-reference/teaching-and-learning-domain/entities-references-and-descriptors),
  [Student Cohort](https://docs.ed-fi.org/reference/data-exchange/data-standard/5/model-reference/student-cohort-domain/overview),
  [Enrollment](https://docs.ed-fi.org/reference/data-exchange/data-standard/5/model-reference/enrollment-domain/entities-references-and-descriptors),
  [Student Attendance](https://docs.ed-fi.org/reference/data-exchange/data-standard/5/model-reference/student-attendance-domain/overview):
  sections, cohorts, time-bounded associations, school-day and section
  attendance.

Sri Lanka:
- [School Census 2023](https://moe.gov.lk/wp-content/uploads/2024/09/School_Census2023_SummaryReport_V1.pdf),
  [Annual School Census 2025](https://www.statistics.gov.lk/Resource/en/Education/School_Census/Annual_School_Census_SummaryReport_2025.pdf)
- [Grade 1 admission notice, 2025](https://moe.gov.lk/wp-content/uploads/2024/07/01/English_Paper_ad_2025_Corrected.pdf)
- [Circular 03/2018, Grade 6 admission](https://moe.gov.lk/wp-content/uploads/2024/08/03-2018-en.pdf)
- [Circular 23/2017, School Based Assessment](https://moe.gov.lk/wp-content/uploads/2024/08/23-2017-en.pdf)
- [Principals' Service Minute, Gazette 1885/31](https://teacher.moe.gov.lk/wp-content/uploads/2024/09/1885-31_E.pdf),
  [Teachers' Service Minute, Gazette 1885/38](https://teacher.moe.gov.lk/wp-content/uploads/2024/09/Gazette-of-Sri-Lanka-2014-October-1.pdf)
- [NEC recommendations on medium of instruction](https://nec.gov.lk/wp-content/uploads/2025/05/Recommendations-for-the-National-Policy-on-Medium-of-Instruction-in-Schools.pdf)
- [Repetition rates by grade, 2017](https://dmb.moe.gov.lk:443/2017/04/04_PDF/Tbl20170417.pdf)
- [Kasturi Arachchi (2011), sectional heads](https://archive.cmb.ac.lk/items/38709eb0-25e5-4f71-8758-f514219128c4/full)
- [2026 term schedule](https://newsfirst.lk/2025/09/13/school-term-schedule-for-2026-released),
  [2025 O/L results](https://english.newsfirst.lk/2026/06/20/2025-o-l-results-released-re-scrutiny-applications-open-from-june-25),
  [Grade 6 reform deferred to 2027](https://english.newsfirst.lk/2026/01/13/education-reforms-for-grade-6-shifted-to-next-year)
- [A/L admission requirements, Thurstan College](https://thurstancollege.com/applicants),
  [university admission, University of Colombo restating UGC policy](https://cmb.ac.lk/admissions)

Not confirmed on an opened page, and so stated without detail: the texts of
circulars 2008/37, 17/2023, 27/2025, 25/2013 (A/L admission), 20/2007
(teacher transfers) and 12/2024 (prefects); official definitions of class
teacher and grade coordinator; the school census number and NEMIS student
identifier.

## 12. Intended against done

| Intended | Done |
|---|---|
| Amend the August record without editing it | Yes |
| Keep both models as complementary layers | Yes (§0, C3) |
| Full atom set: generators, definitions, cycle instances, occupancy, relations, activity, transitions | Yes (§3) |
| Templates by school type, configurable | Yes (§4, government family) |
| Transitions: years, classes, sections, schools, scholarships, exams, staff | Yes (§3.7) |
| Other institution kinds outside but designed for | Yes (§2) |
| Mapping to the current schema, additive only, with retirements held for sign-off | Yes (§6–§7) |
| Contradictions and defects recorded | Yes (§8–§9) |
| Independent review | Done 2026-10-21; schema, code and quotes checked; corrections applied (calendar and notice tables, existing classroom columns, registry type fields, cross-class subject groups, student subject choice, A/L waiting state, relief assignments, invariant scoping, non-destructive constraint handling, identity-claim exception). External figures were verified when researched; the reviewer could not re-fetch them |
| Implementation | Not started; awaits approval |
