# 🏛️ sovereign_audit:architecture - @repo/admin
> **Timestamp:** 2026-04-27T02:44:25.150Z
> **Target Path:** `C:\Users\Naween\projects\polymath-platform\packages\admin`
> **Audit Score:** 🔴 ACTION REQUIRED

## 📊 Executive Summary
| Metric | Value |
| :--- | :--- |
| **Total Violations** | 218 |
| **Hygiene Warnings** | 5 |
| **Subpath Exports** | 20 subpaths |

## ⚠️ Hygiene Warnings
- Wildcard export in src/guardian/index.ts
- Wildcard export in src/hooks/index.ts
- Wildcard export in src/components/guardian/index.ts
- Wildcard export in src/components/poa/index.ts
- Wildcard export in src/api/index.ts

## ❌ Architectural Violations
| Type | File | Issue | Documentation |
| :--- | :--- | :--- | :--- |
| **LOGIC -> UI** | `./entrypoints/founder.ts` | 1:export { default as FounderDashboard } from '../screens/FounderDashboard'; | N/A |
| **LOGIC -> UI** | `./entrypoints/founder.ts` | 2:export { default as FounderSchoolDashboard } from '../screens/FounderSchoolDashboard'; | N/A |
| **LOGIC -> UI** | `./entrypoints/founder.ts` | 3:export { default as SchoolCreationScreen } from '../screens/SchoolCreationScreen'; | N/A |
| **LOGIC -> UI** | `./entrypoints/founder.ts` | 4:export { default as SchoolForestScreen } from '../screens/SchoolForestScreen.web'; | N/A |
| **NATIVE POLLUTION** | `./__tests__/screens/GuardianDashboardScreen.test.tsx` | 2:import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'; | N/A |
| **NATIVE POLLUTION** | `./__tests__/screens/DocumentListScreen.test.tsx` | 2:import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/founder/GlobalCreateModal.tsx` | 32:import { ChevronDown, LayoutGrid, School as SchoolIcon, Users, UserPlus } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./screens/AcademicCycleManager.tsx` | 20:import { Calendar, CheckCircle2, Circle, Clock, Plus, Trash2 } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/principal/InstitutionalCalendarSection.tsx` | 22:import { Plus } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/principal/PrincipalGovernanceTimeline.tsx` | 15:import { Activity, Clock, FileText, History, Plus, ShieldCheck } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/principal/PrincipalNotes.tsx` | 32:} from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/principal/PrincipalObservationsSection.tsx` | 23:import { Plus } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./screens/principal/InvitesDashboard.tsx` | 13:import { ArrowLeft, Copy, Plus, X, UserPlus } from 'lucide-react-native'; | N/A |
| **NATIVE POLLUTION** | `./screens/principal/InvitesDashboard.tsx` | 17:import { Platform } from 'react-native'; | N/A |
| **STATE DENSITY** | `admin/adminRepository.ts` | Has 4 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `hooks/useStaffPresence.ts` | Has 4 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `hooks/useSchoolStats.ts` | Has 5 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `components/school/CreateSchoolModal.tsx` | Has 4 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `guardian/useGuardianWorkspaceData.ts` | Has 4 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `components/founder/GlobalCreateModal.web.tsx` | Has 9 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/AnalyticsDashboardScreen.tsx` | Has 5 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/DocumentListScreen.tsx` | Has 5 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `components/principal/LeaveApprovalSection.tsx` | Has 4 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `components/principal/InviteManager.tsx` | Has 6 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/DocumentListScreen.web.tsx` | Has 8 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `components/principal/MorningSituationalBrief.tsx` | Has 5 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `components/principal/ResourceNeedsDashboard.tsx` | Has 3 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/FounderDashboard.tsx` | Has 3 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/FounderDashboard.web.tsx` | Has 4 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `components/principal/DashboardEcho.tsx` | Has 6 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `components/principal/StudentEnrollmentPulse.tsx` | Has 3 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `components/principal/TeacherCarousel.tsx` | Has 3 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `components/principal/CurriculumPulse.tsx` | Has 3 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/PrincipalDashboard.tsx` | Has 5 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/principal/CyclesDashboard.tsx` | Has 7 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/SchoolCreationScreen.tsx` | Has 3 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/SchoolForestScreen.web.tsx` | Has 4 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/principal/LogbookDashboard.tsx` | Has 6 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/PrincipalDashboard.web.tsx` | Has 5 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **SUBSCRIPTION** | `./components/principal/PrincipalGovernanceTimeline.tsx` | Missing atomic selector. | N/A |
| **MEM SINK** | `./bridge/principalWorkspaceShell.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./bridge/PrincipalNativeDashboardShell.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./guardian/useGuardianWorkspaceCanvas.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./guardian/useGuardianWorkspaceCanvas.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./guardian/useGuardianWorkspaceCanvas.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./guardian/useGuardianWorkspaceCanvas.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./guardian/useGuardianWorkspaceCanvas.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./guardian/useGuardianWorkspaceCanvas.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./guardian/useGuardianWorkspaceCanvas.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./principal/usePrincipalWorkspaceCanvas.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./principal/usePrincipalWorkspaceCanvas.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./principal/usePrincipalWorkspaceCanvas.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./principal/usePrincipalWorkspaceCanvas.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./principal/usePrincipalWorkspaceCanvas.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./principal/usePrincipalWorkspaceCanvas.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./principal/usePrincipalWorkspaceCanvas.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./principal/usePrincipalWorkspaceCanvas.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./founder/useFounderWorkspaceCanvas.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./founder/useFounderWorkspaceCanvas.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./founder/useFounderWorkspaceCanvas.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./founder/useFounderWorkspaceCanvas.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./founder/useFounderWorkspaceCanvas.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./founder/useFounderWorkspaceCanvas.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./founder/useFounderWorkspaceCanvas.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/founder/GlobalCreateModal.web.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/founder/GlobalCreateModal.web.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/founder/GlobalCreateModal.web.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/founder/GlobalCreateModal.web.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/founder/GlobalCreateModal.web.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/founder/GlobalCreateModal.web.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/founder/GlobalCreateModal.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/founder/GlobalCreateModal.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/founder/GlobalCreateModal.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/founder/GlobalCreateModal.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/founder/GlobalCreateModal.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/founder/GlobalCreateModal.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/school/StepHierarchy.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/school/StepHierarchy.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/guardian/GuardianEvents.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/school/StepDemographics.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/school/StepDemographics.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/guardian/GuardianNotifications.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/AdminAuthorityRepair.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/AdminAuthorityRepair.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/guardian/GuardianStudentsGrid.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/school/CreateSchoolModal.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/school/CreateSchoolModal.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/school/CreateSchoolModal.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/school/CreateSchoolModal.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/school/CreateSchoolModal.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/school/CreateSchoolModal.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/school/CreateSchoolModal.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./admin/useAdminWorkspaceCanvas.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./admin/useAdminWorkspaceCanvas.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./admin/useAdminWorkspaceCanvas.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/AcademicCycleManager.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/AcademicCycleManager.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/AcademicCycleManager.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/AcademicCycleManager.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/AdminFeatureRegistry.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/AdminFeatureRegistry.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/AdminFeatureRegistry.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/AdminReleaseControl.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/AdminReleaseControl.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/AdminReleaseControl.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/AnalyticsDashboardScreen.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/DocumentListScreen.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/DocumentListScreen.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/DocumentListScreen.web.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/DocumentListScreen.web.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/DocumentListScreen.web.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/DocumentListScreen.web.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/DocumentListScreen.web.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/principal/LeaveApprovalSection.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/principal/LeaveApprovalSection.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/principal/InviteManager.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/principal/InviteManager.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/principal/InviteManager.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/principal/InviteManager.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/principal/InviteManager.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/principal/InviteManager.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/principal/InviteManager.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/principal/InviteManager.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/principal/InstitutionalCalendarSection.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/principal/InstitutionalCalendarSection.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/FounderSchoolDashboard.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/FounderSchoolDashboard.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/principal/PrincipalOnboardingView.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/principal/PrincipalOnboardingView.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/principal/PrincipalOnboardingView.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/principal/TeacherCarousel.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/FounderDashboard.web.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/principal/PrincipalObservationsSection.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/principal/PrincipalObservationsSection.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/principal/PrincipalObservationsSection.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/principal/StudentEnrollmentPulse.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/principal/StudentEnrollmentPulse.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/principal/StudentEnrollmentPulse.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/principal/PrincipalNotes.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/principal/PrincipalNotes.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/principal/PrincipalNotes.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/principal/PrincipalNotes.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/principal/PrincipalNotes.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/principal/PrincipalNotes.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/principal/PrincipalNotes.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/principal/PrincipalNotes.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/principal/DashboardEcho.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/principal/DashboardEcho.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/principal/DashboardEcho.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/principal/DashboardEcho.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/principal/PrincipalActions.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/principal/PrincipalActions.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/GradeHeadDashboard.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/GradeHeadDashboard.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/GradeHeadDashboard.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/principal/PrincipalGovernanceTimeline.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/principal/PrincipalGovernanceTimeline.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/principal/PrincipalGovernanceTimeline.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/principal/PrincipalGovernanceTimeline.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/GuardianDashboard.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/PrincipalDashboard.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/principal/StaffDirectory.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/principal/MorningSituationalBrief.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/principal/MorningSituationalBrief.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/guardian/GuardianCommunicationBridgeScreen.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/guardian/GuardianCommunicationBridgeScreen.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/guardian/GuardianCommunicationBridgeScreen.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/SchoolCreationScreen.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./components/principal/ManagementStation.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/SchoolProfileScreen.web.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/SchoolProfileScreen.web.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/guardian/GuardianStudentsScreen.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/SectionHeadDashboard.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/SectionHeadDashboard.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/principal/CommandCenter.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/principal/CyclesDashboard.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/principal/CyclesDashboard.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/principal/DashboardContent.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/principal/DashboardContent.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/principal/DashboardContent.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/principal/DashboardContent.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/principal/DashboardContent.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/principal/HierarchyDashboard.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/principal/InstitutionalArcCard.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/principal/InstitutionalArcCard.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/principal/InstitutionalArcCard.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/principal/LogbookDashboard.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/principal/LogbookDashboard.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/principal/InvitesDashboard.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/principal/InvitesDashboard.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/principal/InvitesDashboard.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/principal/InvitesDashboard.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/principal/PendingApprovals.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/principal/PendingApprovals.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/principal/PrincipalRoomShell.tsx` | Inline anonymous function in JSX. | N/A |
| **MEM SINK** | `./screens/principal/StudentPulse.tsx` | Inline anonymous function in JSX. | N/A |
| **A11Y** | `./admin/useAdminWorkspaceCanvas.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./guardian/useGuardianWorkspaceCanvas.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./guardian/useGuardianWorkspaceCanvas.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./guardian/useGuardianWorkspaceCanvas.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./guardian/useGuardianWorkspaceCanvas.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./guardian/useGuardianWorkspaceCanvas.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./principal/usePrincipalWorkspaceCanvas.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./principal/usePrincipalWorkspaceCanvas.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./principal/usePrincipalWorkspaceCanvas.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/school/StepHierarchy.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/guardian/GuardianEvents.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./bridge/principalWorkspaceShell.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./founder/useFounderWorkspaceCanvas.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./bridge/PrincipalNativeDashboardShell.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./screens/AdminRoomShell.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./screens/FounderDashboard.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./screens/FounderDashboard.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./screens/guardian/GuardianCommunicationBridgeScreen.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./screens/guardian/GuardianRoomShell.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/principal/InviteManager.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/principal/DashboardEcho.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./components/principal/HierarchyBuilder.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
