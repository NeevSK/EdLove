# Classroom UI Inventory

This document is the working source of truth for the Sanctuary V3 healing sweep in `@repo/classroom`.

Goal:
- keep the package fully aligned with Sanctuary V3 primitives from `@repo/ui`
- remove legacy UI smell instead of shimming around it
- heal sequentially in dependency order so regressions are easier to reason about

## Status Legend
- `Pending`: not yet audited in the current sweep
- `In Progress`: audited, but still has open issues
- `Healed`: no legacy `sx` usage, no legacy Gluestack imports, and typecheck-safe in its cluster

## Healing Queue
1. Export surface reconciliation
2. Shared wrappers and primitives used across many classroom screens
3. Teacher workspace cluster
4. Student cluster
5. Web-only screens
6. Remaining standalone components

## Export Surface

Current live exports to reconcile against:
- `packages/classroom/src/components/index.ts`
- `packages/classroom/src/screens/index.ts`
- `packages/classroom/src/entrypoints/core.ts`
- `packages/classroom/src/entrypoints/student.ts`
- `packages/classroom/src/entrypoints/teacher.ts`

## Inventory

### Components
- [ ] `AddStudentModal.tsx` `Pending`
- [ ] `AttendanceSheet.tsx` `Pending`
- [ ] `AttendanceView.tsx` `Pending`
- [ ] `ClaimInviteModal.tsx` `Pending`
- [ ] `ClassroomEchoSection.tsx` `Pending`
- [ ] `ClassroomHolisticInsights.tsx` `Pending`
- [ ] `ClassroomList.tsx` `Pending`
- [ ] `ClassroomNotes.tsx` `Pending`
- [ ] `CreateClassroomModal.tsx` `Pending`
- [ ] `CreateSchoolModal.tsx` `Pending`
- [ ] `GlobalCreateModal.tsx` `Pending`
- [ ] `GradebookView.tsx` `Pending`
- [ ] `GroupManager.tsx` `Pending`
- [ ] `InventoryView.tsx` `Pending`
- [ ] `OCRScanner.tsx` `Pending`
- [ ] `OCRStudentImport.tsx` `Pending`
- [ ] `QuickAnalytics.tsx` `Pending`
- [ ] `ResourcesView.tsx` `Pending`
- [ ] `RoleInitialState.tsx` `Pending`
- [ ] `StudentList.tsx` `Pending`
- [ ] `SubmissionModal.tsx` `Pending`
- [ ] `SubmissionModal.web.tsx` `Pending`
- [ ] `BulkStudentCreation.tsx` `Recovered, pending V3 verification`

#### Grading
- [ ] `grading/GradebookTable.tsx` `Pending`
- [ ] `grading/GradeEntryForm.tsx` `Pending`
- [ ] `grading/GradingSettings.tsx` `Pending`
- [ ] `grading/ReportCard.tsx` `Pending`

#### Onboarding
- [ ] `onboarding/PrincipalOnboardingView.tsx` `Pending`
- [ ] `onboarding/PrincipalOnboardingView.web.tsx` `Pending`
- [ ] `onboarding/StudentOnboardingView.tsx` `Pending`
- [ ] `onboarding/StudentOnboardingView.web.tsx` `Pending`
- [ ] `onboarding/TeacherOnboardingView.tsx` `Pending`
- [ ] `onboarding/TeacherOnboardingView.web.tsx` `Pending`

#### Principal Action Items
- [ ] `poa/CreateClassroomAction.tsx` `Pending`
- [ ] `poa/MyEchoesAction.tsx` `Pending`
- [ ] `poa/PrincipalEchoAction.tsx` `Pending`
- [ ] `poa/ScanQRAction.tsx` `Pending`
- [ ] `poa/TeacherActions.tsx` `Pending`
- [ ] `poa/TeacherEchoActions.tsx` `Pending`
- [ ] `poa/TeacherPrimaryActions.tsx` `Pending`

#### Student Components
- [ ] `student/StudentClassroomList.tsx` `Pending`
- [ ] `student/StudentGoals.tsx` `Pending`
- [ ] `student/StudentGradesOverview.tsx` `Pending`
- [ ] `student/StudentGrowthPoints.tsx` `Pending`
- [ ] `student/StudentHeader.tsx` `Pending`
- [ ] `student/StudentProgressOverview.tsx` `Pending`
- [ ] `student/StudentStats.tsx` `Pending`
- [ ] `student/StudentStudySuite.tsx` `Pending`
- [ ] `student/StudentUpcomingAssignments.tsx` `Pending`

#### Teacher Components
- [ ] `teacher/TeacherAdminActions.tsx` `Pending`
- [ ] `teacher/TeacherAnalysisWorkspace.tsx` `Pending`
- [ ] `teacher/TeacherAssignmentsSidebar.tsx` `Pending`
- [ ] `teacher/TeacherAssignmentsWorkspace.tsx` `Pending`
- [ ] `teacher/TeacherClassroomList.tsx` `Pending`
- [ ] `teacher/TeacherGroupsModal.tsx` `Pending`
- [ ] `teacher/TeacherObservationsWorkspace.tsx` `Pending`
- [ ] `teacher/TeacherSnapshot.tsx` `Pending`
- [ ] `teacher/TeacherStats.tsx` `Pending`
- [ ] `teacher/TeacherWorkspaceShell.tsx` `Pending`

### Screens
- [ ] `AttendanceReportScreen.tsx` `Pending`
- [ ] `AttendanceScreen.tsx` `Pending`
- [ ] `AttendanceScreen.web.tsx` `Pending`
- [ ] `ClassroomDetailScreen.web.tsx` `Pending`
- [ ] `ClassroomProfileScreen.web.tsx` `Pending`
- [ ] `ClassroomScreen.tsx` `Pending`
- [ ] `ClassroomScreen.web.tsx` `Pending`
- [ ] `ContentLibrary.tsx` `Pending`
- [ ] `DemoPlaygroundPanel.web.tsx` `Pending`
- [ ] `GradebookScreen.tsx` `Pending`
- [ ] `GradebookScreen.web.tsx` `Pending`
- [ ] `LessonFeed.tsx` `Pending`
- [ ] `NoSchoolView.web.tsx` `Pending`
- [ ] `StudentClassroomDashboard.tsx` `Pending`
- [ ] `StudentDashboard.tsx` `Pending`
- [ ] `StudentDashboard.web.tsx` `Pending`
- [ ] `StudentProfileScreen.tsx` `Pending`
- [ ] `TeacherClassroomDashboard.tsx` `Pending`
- [ ] `TeacherClassroomDashboard.web.tsx` `Pending`
- [ ] `TeacherDashboard.tsx` `Pending`
- [ ] `TeacherDashboard.web.tsx` `Pending`
- [ ] `TimetableScreen.web.tsx` `Pending`

## Cluster Rules
- Heal one cluster at a time.
- Remove legacy props and imports rather than adding compatibility shims.
- Reconcile exports after any file move or recovery.
- Verify with typecheck after each cluster.
- Do not mark a file `Healed` until it is both V3-clean and type-safe in context.

## Notes
- `BulkStudentCreation.tsx` was recovered from git history and is now back in the package.
- `QuickAnalytics.tsx` remains a known hotspot because it depends on missing graphics wiring.
- `RoleInitialState.tsx` remains a known hotspot because it still carries legacy layout patterns.
