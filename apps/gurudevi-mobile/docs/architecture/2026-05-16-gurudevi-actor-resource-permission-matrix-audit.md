---
title: "Actor × Resource Permission Matrix Audit (2026-05-16)"
status: "active"
created: 2026-05-20
updated: 2026-05-20
author: "Naween"
tags: [reorganized]
---

# Actor × Resource Permission Matrix Audit (2026-05-16)

This audit documents the complete permission reality within a single school context for the Sovereign platform.

---

## STEP 1 — IDENTIFY ALL ACTORS

The system recognizes the following distinct actor types within a school context, primarily modeled via **Bonds (Capacity)** and **Citizenship (Status)**.

| Actor Type | Code Identifier | Modeling Method | Scoped Variant Exists? |
| :--- | :--- | :--- | :--- |
| **Principal** | `principal` | Bonds / CASL | YES (via `school_id`) |
| **Asst. Principal**| `assistantPrincipal`| Bonds / CASL | YES (via `school_id`) |
| **Teacher** | `teacher` | Bonds / CASL | YES (`teacher_id` for class) |
| **Grade Head** | `grade_head` | Bonds / CASL | YES (`grade_id`) |
| **Section Head** | `section_head` | Bonds / CASL | YES (`section_id`) |
| **Student** | `student` | Bonds / CASL | YES (Self-only for grades/logs) |
| **Parent** | `parent` | Bonds / CASL | YES (`student_parent_id`) |
| **Staff** | `staff` | Bonds / CASL | YES (via `school_id`) |
| **Wanderer** | `WANDERER` | Citizenship | NO (Global anonymous) |
| **Admin** | `admin` | Bonds / CASL | NO (Global Platform access) |

*Note: `librarian`, `nurse`, `guardian`, and `member` exist in the `CapacitySchema` but have no specific CASL ability files or ZenStack policy overrides beyond basic authenticated access.*

---

## STEP 2 — IDENTIFY ALL RESOURCES

Audit of all models in `schema.zmodel` and tables in `master_baseline.sql`.

| Resource | Guarded? | Primary Guard Location |
| :--- | :--- | :--- |
| **User (Profile)** | YES | `schema.zmodel:93-100` (ZenStack) |
| **School** | YES | `schema.zmodel:452-454` (ZenStack) |
| **Classroom** | YES | `schema.zmodel:179-184` (ZenStack) |
| **AttendanceRecord** | YES | `schema.zmodel:413-414` (ZenStack) |
| **Grade** | YES | `schema.zmodel:245-249` (ZenStack) |
| **Assignment** | YES | `schema.zmodel:218-219` (ZenStack) |
| **Lesson** | YES | `schema.zmodel:372-373` (ZenStack) |
| **Material** | YES | `schema.zmodel:392-393` (ZenStack) |
| **StaffLeave** | YES | `schema.zmodel:785-786` (ZenStack) |
| **MoodLog** | YES | `schema.zmodel:487` (ZenStack) |
| **FireJournal** | YES | `schema.zmodel:499` (ZenStack) |
| **InventoryItem** | YES | `schema.zmodel:470-471` (ZenStack) |
| **Group / Post** | YES | `schema.zmodel:282-327` (ZenStack) |
| **Ledger / Budget** | YES | `schema.zmodel:876-923` (ZenStack) |
| **Guardian** | YES | `schema.zmodel:828-829` (ZenStack) |
| **SentinelAuditLog** | YES | `schema.zmodel:1044` (ZenStack) |
| **JoyMoments** | **∅ UNGUARDED** | Absent in `.zmodel` (SQL only) |
| **GratitudeEntries** | **∅ UNGUARDED** | Absent in `.zmodel` (SQL only) |
| **EnergyForecasts** | **∅ UNGUARDED** | Absent in `.zmodel` (SQL only) |

---

## STEP 3 — PERMISSION MATRIX

Matrix: Actors (Rows) × Key Resources (Columns).

| Actor | School | Classroom | Grade | Attendance | StaffLeave | Assignment | Library |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Principal** | ✓ FULL | ✓ FULL | ✓ FULL | ✓ FULL | ✓ FULL | ✓ FULL | ✓ FULL |
| **Teacher** | R | ✓ FULL* | ~ PARTIAL| ✓ FULL* | R** | ✓ FULL* | ✓ FULL |
| **Student** | R | R*** | R**** | R**** | R** | R | R |
| **Parent** | R | ✗ BLOCKED | ? UNKNOWN | ? UNKNOWN | ✗ BLOCKED | R | R |
| **Wanderer** | R | ✗ BLOCKED | ✗ BLOCKED | ✗ BLOCKED | ✗ BLOCKED | ✗ BLOCKED | R |

**Matrix Legend:**
- **✓ FULL**: CRUD on owned/managed entities.
- **~ PARTIAL**: Can view all, but only edit specific subset.
- **R**: Read-only (often broader than intended).
- **✗ BLOCKED**: Explicitly denied.
- **? UNKNOWN**: CASL says YES, ZenStack says NO (Contradiction).
- **∅ UNGUARDED**: No policy found.

*\*Scoped to classes they teach.*
*\*\*Leak: Students can read all teacher leave records in the same school (schema.zmodel:786).*
*\*\*\*Only for classes they are enrolled in.*
*\*\*\*\*Self-only records.*

---

## STEP 4 — SCOPING AUDIT

| Actor | Resource | Scoping Expression | Finding |
| :--- | :--- | :--- | :--- |
| **Teacher** | **Classroom** | `auth().id == teacher_id` | **CORRECTLY SCOPED** |
| **Teacher** | **Attendance**| `classroom.teacher_id == auth().id` | **CORRECTLY SCOPED** |
| **Principal**| **School** | `auth().bonds?[entity_id == this.school_id]`| **CORRECTLY SCOPED** |
| **Student** | **Classroom** | `members?[user_id == auth().id]` | **CORRECTLY SCOPED** |
| **Student** | **Lesson** | `(auth() != null && classroom.is_archived == false)` | **LEAK**: Students can see ALL lessons in ANY school. |
| **Parent** | **Grade** | `auth().id == student_id` | **FAILURE**: Parents cannot see their child's grades (Missing rule). |
| **All Auth** | **StaffLeave** | `school_id == auth().school_id` | **LEAK**: Everyone in school can see all staff leaves. |

---

## STEP 5 — GAPS & HONEST ASSESSMENT

### 1. UNGUARDED Resources (∅ Cells)
*   **JoyMoments / EnergyForecasts / GratitudeEntries**: These tables exist in the SQL baseline (`master_baseline.sql`) but are **absent** from the ZenStack `schema.zmodel`. Because ZenStack acts as the gatekeeper for the Prisma client, these models are currently inaccessible via the standard `db` client, OR they are being queried via raw SQL, bypassing all security.

### 2. Scoping Failures
*   **Academic Content Leak**: `Assignment`, `Lesson`, and `Material` use a broad `auth() != null` read rule. This means any authenticated user can theoretically scrape the entire content library of any school on the platform.
*   **HR Data Leak**: The `StaffLeave` read policy grants access to anyone sharing a `school_id` with the school. Students can see why their teachers are taking leave.

### 3. Contradictions
*   **The Parent Paradox**: `parent.ts` (CASL) grants parents permission to read grades and attendance. However, `schema.zmodel` (ZenStack) has no rules for the `parent` capacity on these models. Result: The UI will show a "Grades" tab, but the API will return a 403 or empty array.

### 4. Missing Actors
*   **GradeHead / SectionHead**: These capacities exist in the enum and have CASL files, but they are **not registered** in `composer.ts`. They currently default to basic authenticated users with no elevated powers.

---

### HONEST ASSESSMENT
The Sovereign permission model is a **"Coherent Skeleton with Major Flesh Wounds."** The ReBAC infrastructure (Bonds + ZenStack) is architecturally sound and far superior to the legacy RBAC it replaces. However, the current implementation is riddled with broad "Authenticated-Only" catch-alls that leak sensitive academic and HR data across the school. Most critically, the "Parent" and "Head" roles are currently broken at the data layer or the composition layer, meaning the system is presently a Two-Tier model (Principal/Teacher vs. Everyone Else) masquerading as a granular hierarchy.
