# 🏛️ sovereign_audit:architecture - @repo/classroom
> **Timestamp:** 2026-04-27T02:44:16.818Z
> **Target Path:** `C:\Users\Naween\projects\polymath-platform\packages\classroom`
> **Audit Score:** 🔴 ACTION REQUIRED

## 📊 Executive Summary
| Metric | Value |
| :--- | :--- |
| **Total Violations** | 317 |
| **Hygiene Warnings** | 6 |
| **Subpath Exports** | 13 subpaths |

## ⚠️ Hygiene Warnings
- Wildcard export in src/index.ts
- Wildcard export in src/hooks/index.ts
- Wildcard export in src/components/teacher/index.ts
- Wildcard export in src/components/student/index.ts
- Wildcard export in src/components/index.ts
- Wildcard export in src/components/poa/index.ts

## ❌ Architectural Violations
| Type | File | Issue | Documentation |
| :--- | :--- | :--- | :--- |
| **LOGIC -> UI** | `./entrypoints/core.ts` | 1:export { default as AttendanceScreen } from '../screens/AttendanceScreen'; | N/A |
| **LOGIC -> UI** | `./entrypoints/core.ts` | 2:export { default as AttendanceScreenWeb } from '../screens/AttendanceScreen.web'; | N/A |
| **LOGIC -> UI** | `./entrypoints/core.ts` | 3:export { ClassroomDetailScreenWeb } from '../screens/ClassroomDetailScreen.web'; | N/A |
| **LOGIC -> UI** | `./entrypoints/core.ts` | 4:export { default as ClassroomProfileScreenWeb } from '../screens/ClassroomProfileScreen.web'; | N/A |
| **LOGIC -> UI** | `./entrypoints/core.ts` | 5:export { default as ClassroomScreen } from '../screens/ClassroomScreen'; | N/A |
| **LOGIC -> UI** | `./entrypoints/core.ts` | 6:export { default as ClassroomScreenWeb } from '../screens/ClassroomScreen.web'; | N/A |
| **LOGIC -> UI** | `./entrypoints/core.ts` | 7:export { default as GradebookScreen } from '../screens/GradebookScreen'; | N/A |
| **LOGIC -> UI** | `./entrypoints/core.ts` | 8:export { default as GradebookScreenWeb } from '../screens/GradebookScreen.web'; | N/A |
| **LOGIC -> UI** | `./entrypoints/core.ts` | 9:export { default as NoSchoolView } from '../screens/NoSchoolView.web'; | N/A |
| **LOGIC -> UI** | `./entrypoints/core.ts` | 10:export { default as TimetableScreen } from '../screens/TimetableScreen.web'; | N/A |
| **LOGIC -> UI** | `./entrypoints/teacher.ts` | 1:export { default as TeacherClassroomDashboard } from '../screens/TeacherClassroomDashboard'; | N/A |
| **LOGIC -> UI** | `./entrypoints/teacher.ts` | 2:export { default as TeacherClassroomDashboardWeb } from '../screens/TeacherClassroomDashboard.web'; | N/A |
| **LOGIC -> UI** | `./entrypoints/teacher.ts` | 3:export { default as TeacherDashboard } from '../screens/TeacherDashboard'; | N/A |
| **LOGIC -> UI** | `./entrypoints/student.ts` | 1:export { default as StudentClassroomDashboard } from '../screens/StudentClassroomDashboard'; | N/A |
| **LOGIC -> UI** | `./entrypoints/student.ts` | 2:export { default as StudentDashboard } from '../screens/StudentDashboard'; | N/A |
| **LOGIC -> UI** | `./entrypoints/student.ts` | 3:export { default as StudentProfileScreen } from '../screens/StudentProfileScreen'; | N/A |
| **NATIVE POLLUTION** | `./components/AttendanceSheet.tsx` | 28:import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler'; | N/A |
| **NATIVE POLLUTION** | `./components/StudentList.tsx` | 28:import * as Clipboard from 'expo-clipboard'; | N/A |
| **NATIVE POLLUTION** | `./components/SubmissionModal.tsx` | 34:import * as ImagePicker from 'expo-image-picker'; | N/A |
| **NATIVE POLLUTION** | `./screens/TeacherDashboard.web.tsx` | 30:import Animated, { FadeInDown } from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./screens/StudentDashboard.web.tsx` | 25:import Animated, { FadeInDown } from 'react-native-reanimated'; | N/A |
| **STATE DENSITY** | `hooks/useAttendance.ts` | Has 3 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `hooks/useClassroomRoleData.ts` | Has 3 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `hooks/useClassroomProfile.ts` | Has 3 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `workspace/useTeacherWorkspaceShell.tsx` | Has 11 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `hooks/useGradebook.ts` | Has 7 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `workspace/useTeacherClassroomWorkspaceData.ts` | Has 8 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `hooks/useSchoolStats.ts` | Has 5 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `workspace/useStudentClassroomWorkspaceData.ts` | Has 4 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `hooks/useSchoolInvites.ts` | Has 4 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `hooks/useResources.ts` | Has 3 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `hooks/usePrincipalObservations.ts` | Has 4 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/GradebookScreen.web.tsx` | Has 10 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `components/ClassroomHolisticInsights.tsx` | Has 3 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/GradebookScreen.tsx` | Has 3 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/TimetableScreen.web.tsx` | Has 5 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `components/ClassroomEchoSection.tsx` | Has 9 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `components/ClaimInviteModal.tsx` | Has 4 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/ContentLibrary.tsx` | Has 8 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/TeacherClassroomDashboard.web.tsx` | Has 15 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `components/BulkStudentCreation.tsx` | Has 5 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/TeacherClassroomDashboard.tsx` | Has 18 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `components/AttendanceView.tsx` | Has 3 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/ClassroomScreen.tsx` | Has 6 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `components/AddStudentModal.tsx` | Has 6 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `components/teacher/TeacherObservationsWorkspace.tsx` | Has 9 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `components/CreateSchoolModal.tsx` | Has 8 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `components/teacher/TeacherGroupsModal.tsx` | Has 8 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `components/GroupManager.tsx` | Has 9 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `components/CreateClassroomModal.tsx` | Has 12 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/AttendanceScreen.tsx` | Has 4 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `components/teacher/TeacherAssignmentsWorkspace.tsx` | Has 8 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/AttendanceReportScreen.tsx` | Has 5 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `components/ClassroomNotes.tsx` | Has 8 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `components/teacher/TeacherAnalysisWorkspace.tsx` | Has 6 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/NoSchoolView.web.tsx` | Has 3 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `components/ClassroomList.tsx` | Has 10 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `components/SubmissionModal.web.tsx` | Has 6 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `components/grading/GradingSettings.tsx` | Has 3 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `components/grading/GradeEntryForm.tsx` | Has 4 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `components/SubmissionModal.tsx` | Has 5 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/LessonFeed.tsx` | Has 5 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `components/InventoryView.tsx` | Has 8 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `components/GlobalCreateModal.tsx` | Has 9 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `components/StudentList.tsx` | Has 5 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/StudentClassroomDashboard.tsx` | Has 3 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `components/ResourcesView.tsx` | Has 6 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/StudentProfileScreen.tsx` | Has 9 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `components/student/StudentGradesOverview.tsx` | Has 3 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `components/OCRStudentImport.tsx` | Has 3 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **SUBSCRIPTION** | `./hooks/useSchoolStats.ts` | Missing atomic selector. | N/A |
| **SUBSCRIPTION** | `./screens/GradebookScreen.web.tsx` | Missing atomic selector. | N/A |
| **SUBSCRIPTION** | `./screens/TimetableScreen.web.tsx` | Missing atomic selector. | N/A |
| **SUBSCRIPTION** | `./screens/ClassroomScreen.web.tsx` | Missing atomic selector. | N/A |
| **SUBSCRIPTION** | `./screens/AttendanceScreen.web.tsx` | Missing atomic selector. | N/A |
| **SUBSCRIPTION** | `./screens/StudentProfileScreen.tsx` | Missing atomic selector. | N/A |
| **SUBSCRIPTION** | `./screens/ClassroomScreen.tsx` | Missing atomic selector. | N/A |
| **SUBSCRIPTION** | `./screens/StudentDashboard.web.tsx` | Missing atomic selector. | N/A |
| **SUBSCRIPTION** | `./screens/StudentDashboard.tsx` | Missing atomic selector. | N/A |
| **SUBSCRIPTION** | `./screens/NoSchoolView.web.tsx` | Missing atomic selector. | N/A |
| **SUBSCRIPTION** | `./screens/NoSchoolView.web.tsx` | Missing atomic selector. | N/A |
| **SUBSCRIPTION** | `./components/ClassroomEchoSection.tsx` | Missing atomic selector. | N/A |
| **SUBSCRIPTION** | `./components/ClaimInviteModal.tsx` | Missing atomic selector. | N/A |
| **SUBSCRIPTION** | `./components/ClassroomList.tsx` | Missing atomic selector. | N/A |
| **SUBSCRIPTION** | `./components/CreateClassroomModal.tsx` | Missing atomic selector. | N/A |
| **SUBSCRIPTION** | `./components/InventoryView.tsx` | Missing atomic selector. | N/A |
| **SUBSCRIPTION** | `./workspace/useTeacherWorkspaceShell.tsx` | Missing atomic selector. | N/A |
| **SUBSCRIPTION** | `./workspace/useTeacherWorkspaceShell.tsx` | Missing atomic selector. | N/A |
| **SUBSCRIPTION** | `./components/student/StudentHeader.tsx` | Missing atomic selector. | N/A |
| **MEM SINK** | `./workspace/ClassroomWorkspaceCanvas.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./workspace/ClassroomWorkspaceCanvas.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./workspace/useStudentWorkspaceCanvas.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./workspace/useStudentWorkspaceCanvas.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/AddStudentModal.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/AttendanceSheet.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/BulkStudentCreation.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/BulkStudentCreation.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/BulkStudentCreation.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/BulkStudentCreation.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/ClassroomEchoSection.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/ClassroomEchoSection.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/ClassroomEchoSection.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/ClassroomEchoSection.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/ClassroomEchoSection.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/ClassroomList.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./workspace/useTeacherDashboardSurfaces.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./workspace/useTeacherDashboardSurfaces.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./workspace/useTeacherDashboardSurfaces.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./workspace/useTeacherDashboardSurfaces.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./workspace/useTeacherDashboardSurfaces.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./workspace/useTeacherDashboardSurfaces.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./workspace/useTeacherDashboardSurfaces.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/ClassroomNotes.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/ClassroomNotes.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/ClassroomNotes.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/ClassroomNotes.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/ClassroomNotes.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/ClassroomNotes.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/ClassroomNotes.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/CreateClassroomModal.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/CreateClassroomModal.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/CreateClassroomModal.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/CreateClassroomModal.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/CreateClassroomModal.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/CreateClassroomModal.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/CreateClassroomModal.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/CreateClassroomModal.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/GlobalCreateModal.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/GlobalCreateModal.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/GlobalCreateModal.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/GlobalCreateModal.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/GlobalCreateModal.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/GlobalCreateModal.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/GradebookView.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/GradebookView.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/AttendanceReportScreen.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/GroupManager.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/GroupManager.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/GroupManager.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/GroupManager.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/CreateSchoolModal.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/CreateSchoolModal.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/CreateSchoolModal.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/InventoryView.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/InventoryView.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/InventoryView.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/InventoryView.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/InventoryView.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/InventoryView.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/InventoryView.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/InventoryView.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/ClassroomScreen.web.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/OCRStudentImport.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/OCRStudentImport.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/ContentLibrary.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/ContentLibrary.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/ContentLibrary.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/ContentLibrary.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/ContentLibrary.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/ContentLibrary.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/ContentLibrary.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/ContentLibrary.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/ContentLibrary.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/ResourcesView.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/ResourcesView.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/ResourcesView.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/ResourcesView.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/ResourcesView.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/ResourcesView.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/ResourcesView.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/ResourcesView.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/RoleInitialState.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/RoleInitialState.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/StudentList.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/StudentList.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/StudentList.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/StudentList.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/StudentList.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/StudentList.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/StudentList.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/SubmissionModal.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/SubmissionModal.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/SubmissionModal.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/SubmissionModal.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/SubmissionModal.web.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/SubmissionModal.web.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/SubmissionModal.web.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/student/StudentUpcomingAssignments.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/student/StudentGoals.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/onboarding/TeacherOnboardingView.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/onboarding/TeacherOnboardingView.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/onboarding/TeacherOnboardingView.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/student/StudentClassroomList.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/StudentClassroomDashboard.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/teacher/TeacherAssignmentsSidebar.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/teacher/TeacherObservationsWorkspace.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/teacher/TeacherObservationsWorkspace.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/teacher/TeacherObservationsWorkspace.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/teacher/TeacherObservationsWorkspace.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/teacher/TeacherObservationsWorkspace.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/teacher/TeacherObservationsWorkspace.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/teacher/TeacherAnalysisWorkspace.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/teacher/TeacherGroupsModal.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/teacher/TeacherGroupsModal.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/teacher/TeacherGroupsModal.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/teacher/TeacherGroupsModal.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/teacher/TeacherGroupsModal.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/NoSchoolView.web.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/NoSchoolView.web.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/NoSchoolView.web.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/NoSchoolView.web.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/NoSchoolView.web.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/NoSchoolView.web.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/teacher/TeacherAssignmentsWorkspace.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/teacher/TeacherAssignmentsWorkspace.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/teacher/TeacherAssignmentsWorkspace.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/teacher/TeacherClassroomList.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/TeacherDashboard.web.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/onboarding/PrincipalOnboardingView.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/onboarding/PrincipalOnboardingView.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/onboarding/PrincipalOnboardingView.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/poa/CreateClassroomAction.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/LessonFeed.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/LessonFeed.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/LessonFeed.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/LessonFeed.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/LessonFeed.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/LessonFeed.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/LessonFeed.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/LessonFeed.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/LessonFeed.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/LessonFeed.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/onboarding/StudentOnboardingView.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/onboarding/StudentOnboardingView.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/onboarding/StudentOnboardingView.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/poa/TeacherActions.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/GradebookScreen.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/GradebookScreen.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/GradebookScreen.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/GradebookScreen.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/GradebookScreen.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/GradebookScreen.web.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/GradebookScreen.web.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/GradebookScreen.web.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/GradebookScreen.web.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/GradebookScreen.web.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/GradebookScreen.web.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/GradebookScreen.web.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/StudentProfileScreen.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/StudentProfileScreen.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/TeacherClassroomDashboard.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/TeacherClassroomDashboard.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/TeacherClassroomDashboard.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/TeacherClassroomDashboard.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/TeacherClassroomDashboard.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/TeacherClassroomDashboard.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/TeacherClassroomDashboard.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/TeacherClassroomDashboard.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/StudentDashboard.web.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/StudentDashboard.web.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/TeacherClassroomDashboard.web.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/TeacherClassroomDashboard.web.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/TeacherClassroomDashboard.web.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/TeacherClassroomDashboard.web.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/TeacherClassroomDashboard.web.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/TeacherClassroomDashboard.web.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/TeacherClassroomDashboard.web.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/TeacherClassroomDashboard.web.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/TeacherClassroomDashboard.web.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/TeacherClassroomDashboard.web.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/TeacherDashboard.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/StudentDashboard.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/StudentDashboard.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/poa/TeacherPrimaryActions.tsx` | Inline anonymous function in JSX. | N/A |
| **A11Y** | `./components/BulkStudentCreation.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/BulkStudentCreation.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/BulkStudentCreation.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/BulkStudentCreation.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/ClassroomEchoSection.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/ClassroomEchoSection.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/ClassroomEchoSection.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/ClassroomList.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/ClassroomList.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./shared/GuestConversionPrompt.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/GroupManager.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/GroupManager.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/ClassroomNotes.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/ClassroomNotes.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/ClassroomNotes.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/OCRStudentImport.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/onboarding/PrincipalOnboardingView.web.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/onboarding/StudentOnboardingView.web.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/onboarding/TeacherOnboardingView.web.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/SubmissionModal.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/SubmissionModal.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/SubmissionModal.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/StudentList.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/StudentList.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/SubmissionModal.web.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/teacher/TeacherObservationsWorkspace.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/teacher/TeacherObservationsWorkspace.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/teacher/TeacherObservationsWorkspace.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./screens/StudentProfileScreen.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./screens/LessonFeed.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./screens/LessonFeed.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./screens/LessonFeed.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./screens/LessonFeed.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./screens/LessonFeed.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./screens/LessonFeed.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./screens/LessonFeed.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./screens/LessonFeed.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./screens/TeacherClassroomDashboard.web.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./screens/TeacherClassroomDashboard.web.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./screens/TeacherClassroomDashboard.web.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./screens/TeacherClassroomDashboard.web.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./screens/GradebookScreen.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./screens/GradebookScreen.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
