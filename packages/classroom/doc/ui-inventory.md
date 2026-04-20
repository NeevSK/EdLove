# Classroom UI Inventory

This document tracks the healing progress for all UI-related files in the `@repo/classroom` package to ensure alignment with Sanctuary V3 (Gluestack v3 + NativeWind).

## Status Legend
- ⚪ **Pending**: Not yet audited.
- 🟡 **In Progress**: Healing initiated, some issues remain.
- 🟢 **Healed**: No `sx` props, Lucide icons wrapped in `Icon`, and type-safe.

## Inventory

### Components
- [ ] `AddStudentModal.tsx` ⚪
- [ ] `AttendanceSheet.tsx` ⚪
- [ ] `AttendanceView.tsx` ⚪
- [ ] `ClaimInviteModal.tsx` ⚪
- [ ] `ClassroomEchoSection.tsx` ⚪
- [ ] `ClassroomHolisticInsights.tsx` ⚪
- [ ] `ClassroomList.tsx` ⚪
- [ ] `ClassroomNotes.tsx` ⚪
- [ ] `CreateClassroomModal.tsx` ⚪
- [ ] `CreateSchoolModal.tsx` ⚪ (Clusters: Missing imports, Haptics)
- [ ] `GlobalCreateModal.tsx` ⚪
- [ ] `GradebookView.tsx` ⚪
- [ ] `GroupManager.tsx` ⚪
- [ ] `InventoryView.tsx` ⚪
- [ ] `OCRScanner.tsx` ⚪
- [ ] `OCRStudentImport.tsx` ⚪ (Clusters: Toast API)
- [ ] `QuickAnalytics.tsx` ⚪ (Clusters: Missing @repo/graphics)
- [ ] `ResourcesView.tsx` ⚪
- [ ] `RoleInitialState.tsx` ⚪ (Clusters: Legacy SX props)
- [ ] `StudentList.tsx` ⚪
- [ ] `SubmissionModal.tsx` ⚪
- [ ] `SubmissionModal.web.tsx` ⚪

#### Grading
- [ ] `grading/GradebookTable.tsx` ⚪
- [ ] `grading/GradeEntryForm.tsx` ⚪
- [ ] `grading/GradingSettings.tsx` ⚪
- [ ] `grading/ReportCard.tsx` ⚪

#### Onboarding
- [ ] `onboarding/PrincipalOnboardingView.tsx` ⚪
- [ ] `onboarding/PrincipalOnboardingView.web.tsx` ⚪
- [ ] `onboarding/StudentOnboardingView.tsx` ⚪
- [ ] `onboarding/StudentOnboardingView.web.tsx` ⚪
- [ ] `onboarding/TeacherOnboardingView.tsx` ⚪
- [ ] `onboarding/TeacherOnboardingView.web.tsx` ⚪

#### Principal Action Items (POA)
- [ ] `poa/CreateClassroomAction.tsx` ⚪
- [ ] `poa/MyEchoesAction.tsx` ⚪
- [ ] `poa/PrincipalEchoAction.tsx` ⚪
- [ ] `poa/ScanQRAction.tsx` ⚪
- [ ] `poa/TeacherActions.tsx` ⚪
- [ ] `poa/TeacherEchoActions.tsx` ⚪
- [ ] `poa/TeacherPrimaryActions.tsx` ⚪

#### Student Components
- [ ] `student/StudentClassroomList.tsx` ⚪
- [ ] `student/StudentGoals.tsx` ⚪
- [ ] `student/StudentGradesOverview.tsx` ⚪
- [ ] `student/StudentGrowthPoints.tsx` ⚪
- [ ] `student/StudentHeader.tsx` ⚪
- [ ] `student/StudentProgressOverview.tsx` ⚪
- [ ] `student/StudentStats.tsx` ⚪
- [ ] `student/StudentStudySuite.tsx` ⚪
- [ ] `student/StudentUpcomingAssignments.tsx` ⚪

#### Teacher Components
- [ ] `teacher/TeacherAdminActions.tsx` ⚪
- [ ] `teacher/TeacherAnalysisWorkspace.tsx` ⚪
- [ ] `teacher/TeacherAssignmentsSidebar.tsx` ⚪
- [ ] `teacher/TeacherAssignmentsWorkspace.tsx` ⚪
- [ ] `teacher/TeacherClassroomList.tsx` ⚪
- [ ] `teacher/TeacherGroupsModal.tsx` ⚪
- [ ] `teacher/TeacherObservationsWorkspace.tsx` ⚪
- [ ] `teacher/TeacherSnapshot.tsx` ⚪
- [ ] `teacher/TeacherStats.tsx` ⚪
- [ ] `teacher/TeacherWorkspaceShell.tsx` ⚪

### Screens
- [ ] `AttendanceReportScreen.tsx` ⚪
- [ ] `AttendanceScreen.tsx` ⚪
- [ ] `AttendanceScreen.web.tsx` ⚪
- [ ] `ClassroomDetailScreen.web.tsx` ⚪
- [ ] `ClassroomProfileScreen.web.tsx` ⚪
- [ ] `ClassroomScreen.tsx` ⚪
- [ ] `ClassroomScreen.web.tsx` ⚪
- [ ] `ContentLibrary.tsx` ⚪
- [ ] `DemoPlaygroundPanel.web.tsx` ⚪
- [ ] `GradebookScreen.tsx` ⚪
- [ ] `GradebookScreen.web.tsx` ⚪
- [ ] `LessonFeed.tsx` ⚪
- [ ] `NoSchoolView.web.tsx` ⚪
- [ ] `StudentClassroomDashboard.tsx` ⚪
- [ ] `StudentDashboard.tsx` ⚪
- [ ] `StudentDashboard.web.tsx` ⚪
- [ ] `StudentProfileScreen.tsx` ⚪
- [ ] `TeacherClassroomDashboard.tsx` ⚪
- [ ] `TeacherClassroomDashboard.web.tsx` ⚪
- [ ] `TeacherDashboard.tsx` ⚪
- [ ] `TeacherDashboard.web.tsx` ⚪
- [ ] `TimetableScreen.web.tsx` ⚪
