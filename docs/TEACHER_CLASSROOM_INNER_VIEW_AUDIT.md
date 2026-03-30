# Teacher Classroom Inner View Audit

## Summary

This audit maps the current inside-classroom teacher experience across:

- [TeacherClassroomDashboard.tsx](/Users/Naween/projects/polymath-platform/packages/classroom/src/screens/TeacherClassroomDashboard.tsx)
- [TeacherClassroomDashboard.web.tsx](/Users/Naween/projects/polymath-platform/packages/classroom/src/screens/TeacherClassroomDashboard.web.tsx)

The goal is to identify what is already shared conceptually, what exists only on one platform, and what is missing from the native teacher view relative to the richer web implementation.

The intended flow is:

- `ClassroomScreen` -> role router
- `TeacherDashboard` -> teacher home / registry
- `TeacherClassroomDashboard` -> individual class workspace

## Current Screen Intent

Both files are the same product surface:

- one teacher inside one classroom
- teacher manages students, teaching materials, assignments, notes, operational classroom views, and institutional insight

The mismatch is not conceptual. It is implementation depth:

- native `TeacherClassroomDashboard.tsx` is a lighter feature switcher with reusable package views
- web `TeacherClassroomDashboard.web.tsx` is a much larger teacher control surface with additional CRUD and management flows

## Exhaustive Feature Map

| Capability | Native `TeacherClassroomDashboard.tsx` | Web `TeacherClassroomDashboard.web.tsx` | Notes |
|---|---|---|---|
| Route identity | Yes | Yes | Now consolidated under `TeacherClassroomDashboard` |
| Back navigation | Yes | Yes | Both have explicit back behavior |
| Classroom title / subject header | Yes | Yes | Native uses `GlobalHeader` plus sanctuary header; web uses custom header |
| Classroom data fetch | Yes | Yes | Both fetch classroom details |
| Student roster fetch | Lazy, only when `students` tab opens | Loaded on mount | Web is more complete |
| Students tab | Yes | Yes | Both expose student list functionality |
| Student analysis modal | Yes | Yes | Native via `StudentList` callback, web via inline action |
| Add student | Indirect / depends on `StudentList` internals | Explicit | Web clearly exposes add-student flow |
| Edit student | Not explicit in screen | Yes | Web has explicit edit action |
| Remove student | Not explicit in screen | Yes | Web has explicit remove action |
| Student profile navigation | Implicit via `StudentList` if supported | Yes | Web explicitly navigates to `StudentProfile` |
| Group management | No explicit surface | Yes | Web has create/edit/delete groups and assign students |
| Insights tab | Yes | Yes | Native uses `ClassroomHolisticInsights`; web has richer custom insight loading |
| Intent-based student pulse block | Yes | No | Native has extra `Intent` block for institutional student pulse |
| Attendance tab | Yes | No explicit tab | Native has dedicated attendance view; web only loads attendance data into insights |
| Attendance report drilldown | Yes | No | Native has `AttendanceReportScreen` transition |
| Gradebook tab | Placeholder only | No explicit tab | Native has placeholder text, web has none in teacher inner view |
| Lessons tab | Yes | Yes | Both support lessons/materials/assignments conceptually |
| Add month/module | Yes | Implicit through lesson structures, no visible equivalent in current audit slice | Native has dedicated modal + FAB |
| Add lesson material | Yes | Yes | Native via lesson feed modal flow; web through lessons data model |
| Add assignment from lesson | Yes | Yes | Native supports this via lesson feed; web supports assignment creation separately |
| Assignments tab | No dedicated tab | Yes | This is one of the biggest gaps in native |
| Create assignment form | Only via lesson-linked content flow | Yes | Web has top-level assignment creation state |
| Resources / Library tab | Yes | Yes | Both expose classroom resource management |
| Add resource | Via `ResourcesView` if supported | Yes | Web has explicit add-resource flow |
| Pin resource | Unknown from screen | Yes | Explicit on web |
| Delete resource | Unknown from screen | Yes | Explicit on web |
| Notes tab | Yes | Yes | Both expose notes |
| Add note | Via `ClassroomNotes` component | Yes | Web has explicit add-note flow |
| Inventory tab | Yes | Yes | Both expose inventory concept |
| Inventory request creation | Unknown from `InventoryView` surface | Yes | Web has explicit request form flow |
| Echo tab | Yes | No | Native has `ClassroomEchoSection`; web currently has no teacher echo tab inside class |
| Observations tab | No | Yes | Web-only |
| Create observation | No | Yes | Web-only |
| Delete observation | No | Yes | Web-only |
| Analysis tab | No | Yes | Web-only dedicated analysis surface |
| Loading skeleton / loading state | Yes | Yes | Different implementations |
| FAB integration | Yes, for lessons only | No | Native-only behavior right now |
| Add-content modal | Yes | No equivalent modal structure | Native-only explicit modal |
| Add-module modal | Yes | No equivalent modal structure | Native-only explicit modal |

## Native Gaps Relative to Web

These capabilities are present explicitly in web and missing or materially weaker in native:

- explicit student edit and removal actions
- explicit group management
- dedicated assignments tab
- top-level assignment creation flow
- explicit resource add / pin / delete controls in the screen layer
- explicit note creation flow in the screen layer
- explicit inventory request flow
- dedicated observations tab
- observation CRUD
- dedicated analysis tab

These are the main reasons the native teacher inner-classroom screen currently feels thinner than web.

## Native-Only or Stronger-on-Native Areas

These capabilities exist in native and are not matched clearly in web:

- dedicated attendance tab
- attendance report drilldown
- explicit teacher echo tab
- institutional student pulse `Intent` block
- lesson/module FAB and content modals

So consolidation should not be framed as "copy web over native". It must preserve these native strengths too.

## Structural Mismatches

### Screen Composition

Native uses a feature-strip model:

- sanctuary header
- student pulse intent block
- horizontal feature selector
- one active feature body

Web uses a teacher operations console model:

- header
- stats row
- tab row
- large custom CRUD surfaces per tab

These compositions are compatible, but not yet aligned.

### Ownership of CRUD

Native delegates heavily to reusable components:

- `StudentList`
- `AttendanceView`
- `InventoryView`
- `ResourcesView`
- `ClassroomHolisticInsights`
- `ClassroomEchoSection`
- `ClassroomNotes`
- `LessonFeed`

Web owns much more CRUD directly inside the screen:

- student table actions
- observations CRUD
- group management
- assignment creation
- resource creation
- note creation
- inventory requests

This means the consolidation work is partly a UX problem and partly a component-boundary problem.

## Consolidation Recommendation

The single conceptual screen should stay:

- `TeacherClassroomDashboard.tsx`
- `TeacherClassroomDashboard.web.tsx`

Implementation strategy should be:

1. Define one canonical feature inventory for teacher-inside-classroom.
2. Bring native and web to the same feature set.
3. Keep layout differences by platform, but do not allow capability drift.
4. Move repeated CRUD into shared components only when it actually generalizes.

## Canonical Teacher Classroom Feature Inventory

This should be the target shared inventory for both platforms:

- overview / insight pulse
- students
- assignments
- lessons
- resources
- notes
- attendance
- inventory
- echo
- observations
- analysis

Optional but recommended:

- gradebook, only if it becomes a real working view and not a placeholder

## What Should Happen Next

Before visual UX refinement, implementation should close the capability gap in this order:

1. define the canonical teacher classroom feature list
2. add missing native tabs and flows that web already has:
   - assignments
   - observations
   - analysis
   - explicit student management actions if missing from `StudentList`
3. preserve native-only strengths while deciding whether web should gain:
   - attendance tab
   - echo tab
   - report drilldown
4. then align layout and interaction rhythm across platforms

## Conclusion

Yes, the native `TeacherClassroomDashboard.tsx` is missing a lot relative to the web implementation.

The most important gaps are:

- assignments as a first-class workspace
- observations
- analysis
- direct student management
- group management
- richer classroom-level CRUD around resources, notes, and inventory

So the right next move is not pure UX polish. It is feature-parity implementation against this audit, then UX alignment on top of that shared capability base.
