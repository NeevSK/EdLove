# Sovereign Monorepo Hygiene Audit Report

> **Generated:** 4/30/2026, 9:21:57 PM
> **Command:** pnpm run check:hygiene
> **Duration:** 39.1s
> **Status:** ✅ Passed

## Executive Summary

| Category | Findings |
| :--- | :---: |
| apps/gurudevi-marketingWeb | 33 |
| apps/gurudevi-mobile | 69 |
| packages/admin | 177 |
| packages/ai | 9 |
| packages/analytics | 36 |
| packages/classroom | 177 |
| packages/community | 15 |
| packages/form-builder | 18 |
| packages/library | 51 |
| packages/people | 18 |
| packages/profile | 74 |
| packages/scanner-kit | 9 |
| packages/self | 159 |

## Detailed Findings

### Category: apps/gurudevi-marketingWeb
- warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/pages/api/durable-agents/teacher-summary.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/pages/api/durable-agents/student-support.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/lib/inngestEvents.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/lib/durableAgents/durableAgentRuns.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/wellbeingHandlers.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/studentSupportHandlers.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/mutationHandlers.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/gradingHandlers.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/durableAgentHandlers.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/classroomHandlers.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/attendanceHandlers.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/pages/api/durable-agents/teacher-summary.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/pages/api/durable-agents/student-support.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/lib/inngestEvents.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/lib/durableAgents/durableAgentRuns.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/wellbeingHandlers.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/studentSupportHandlers.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/mutationHandlers.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/gradingHandlers.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/durableAgentHandlers.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/classroomHandlers.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/attendanceHandlers.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/pages/api/durable-agents/teacher-summary.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/pages/api/durable-agents/student-support.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/lib/inngestEvents.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/lib/durableAgents/durableAgentRuns.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/wellbeingHandlers.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/studentSupportHandlers.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/mutationHandlers.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/gradingHandlers.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/durableAgentHandlers.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/classroomHandlers.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/attendanceHandlers.ts → packages/core/src/index.ts

### Category: apps/gurudevi-mobile
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/utils/LanguageUtils.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/types/navigation.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/shims/lk-edu-geo-web.js → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/providers/SanctuaryProvider.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/SelfStackNavigator.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/ProfileStackNavigator.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/PrincipalStackNavigator.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/PrincipalStackNavigator.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/LibraryStackNavigator.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/GuardianStackNavigator.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/GuardianStackNavigator.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/FounderStackNavigator.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/FounderStackNavigator.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/CommunityStackNavigator.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/CommunityStackNavigator.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/ClassroomStackNavigator.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/ClassroomStackNavigator.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/lib/inngestEvents.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/components/school/StepLocation.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/components/school/StepDemographics.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/__tests__/architecture/profile-poa-enforcement.test.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/__tests__/architecture/poa_enforcement.test.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/App.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/utils/LanguageUtils.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/types/navigation.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/shims/lk-edu-geo-web.js → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/providers/SanctuaryProvider.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/SelfStackNavigator.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/ProfileStackNavigator.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/PrincipalStackNavigator.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/PrincipalStackNavigator.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/LibraryStackNavigator.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/GuardianStackNavigator.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/GuardianStackNavigator.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/FounderStackNavigator.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/FounderStackNavigator.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/CommunityStackNavigator.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/CommunityStackNavigator.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/ClassroomStackNavigator.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/ClassroomStackNavigator.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/lib/inngestEvents.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/components/school/StepLocation.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/components/school/StepDemographics.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/__tests__/architecture/profile-poa-enforcement.test.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/__tests__/architecture/poa_enforcement.test.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/App.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/utils/LanguageUtils.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/types/navigation.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/shims/lk-edu-geo-web.js → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/providers/SanctuaryProvider.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/SelfStackNavigator.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/ProfileStackNavigator.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/PrincipalStackNavigator.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/PrincipalStackNavigator.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/LibraryStackNavigator.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/GuardianStackNavigator.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/GuardianStackNavigator.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/FounderStackNavigator.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/FounderStackNavigator.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/CommunityStackNavigator.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/CommunityStackNavigator.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/ClassroomStackNavigator.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/ClassroomStackNavigator.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/lib/inngestEvents.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/components/school/StepLocation.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/components/school/StepDemographics.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/__tests__/architecture/profile-poa-enforcement.test.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/src/__tests__/architecture/poa_enforcement.test.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: apps/gurudevi-mobile/App.tsx → packages/core/src/index.ts

### Category: packages/admin
- warn L0-L1-subpath-only: packages/admin/src/structure.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/staff.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/SchoolForestScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/PrincipalNativeWorkspace.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/PrincipalDashboard.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/PrincipalDashboard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/principal/StudentPulse.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/principal/PendingApprovals.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/principal/DashboardContent.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/GuardianDashboard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/guardian/GuardianStudentsScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/guardian/GuardianStudentDetailScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/FounderSchoolDashboard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/FounderDashboard.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/FounderDashboard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/DocumentListScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/DocumentListScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/AdminReleaseControl.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/AdminFeatureRegistry.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/AdminDashboard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/AdminAuthorityRepair.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/AcademicCycleManager.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/reporting.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/principal/usePrincipalWorkspaceCanvas.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/notes.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/invites.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/inventory.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/insights.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/hooks/useStaffPresence.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/hooks/useSchoolStats.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/hooks/useDashboardHooks.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/guardian/useGuardianWorkspaceCanvas.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/founder/useFounderWorkspaceCanvas.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/document-workflow/api.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/school/StepLocation.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/school/StepDemographics.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/school/CreateSchoolModal.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/principal/TeacherCarousel.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/principal/SchoolStats.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/principal/SchoolOverview.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/principal/PrincipalNotes.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/principal/PrincipalGovernanceTimeline.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/principal/MorningSituationalBrief.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/principal/LeaveApprovalSection.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/principal/InviteManager.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/principal/InstitutionalCalendarSection.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/principal/HierarchyBuilder.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/founder/GlobalCreateModal.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/founder/GlobalCreateModal.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/calendar.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/bridge/PrincipalNativeDashboardShell.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/bridge/founderWorkspace.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/approvals.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/api/staff.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/analytics/engine.ts → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/analytics/engine.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/admin/useAdminWorkspaceCanvas.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/admin/adminControl.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/__tests__/analytics/engine.test.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/structure.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/staff.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/SchoolForestScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/PrincipalNativeWorkspace.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/PrincipalDashboard.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/PrincipalDashboard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/principal/StudentPulse.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/principal/PendingApprovals.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/principal/DashboardContent.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/GuardianDashboard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/guardian/GuardianStudentsScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/guardian/GuardianStudentDetailScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/FounderSchoolDashboard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/FounderDashboard.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/FounderDashboard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/DocumentListScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/DocumentListScreen.tsx → pack
- warn L0-L1-subpath-only: packages/admin/src/screens/AdminReleaseControl.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/AdminFeatureRegistry.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/AdminDashboard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/AdminAuthorityRepair.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/AcademicCycleManager.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/reporting.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/principal/usePrincipalWorkspaceCanvas.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/notes.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/invites.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/inventory.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/insights.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/hooks/useStaffPresence.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/hooks/useSchoolStats.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/hooks/useDashboardHooks.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/guardian/useGuardianWorkspaceCanvas.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/founder/useFounderWorkspaceCanvas.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/document-workflow/api.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/school/StepLocation.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/school/StepDemographics.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/school/CreateSchoolModal.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/principal/TeacherCarousel.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/principal/SchoolStats.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/principal/SchoolOverview.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/principal/PrincipalNotes.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/principal/PrincipalGovernanceTimeline.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/principal/MorningSituationalBrief.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/principal/LeaveApprovalSection.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/principal/InviteManager.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/principal/InstitutionalCalendarSection.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/principal/HierarchyBuilder.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/founder/GlobalCreateModal.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/founder/GlobalCreateModal.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/calendar.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/bridge/PrincipalNativeDashboardShell.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/bridge/founderWorkspace.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/approvals.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/api/staff.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/analytics/engine.ts → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/analytics/engine.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/admin/useAdminWorkspaceCanvas.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/admin/adminControl.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/__tests__/analytics/engine.test.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/structure.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/staff.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/SchoolForestScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/PrincipalNativeWorkspace.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/PrincipalDashboard.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/PrincipalDashboard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/principal/StudentPulse.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/principal/PendingApprovals.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/principal/DashboardContent.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/GuardianDashboard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/guardian/GuardianStudentsScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/guardian/GuardianStudentDetailScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/FounderSchoolDashboard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/FounderDashboard.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/FounderDashboard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/DocumentListScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/DocumentListScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/AdminReleaseControl.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/AdminFeatureRegistry.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/AdminDashboard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/AdminAuthorityRepair.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/screens/AcademicCycleManager.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/reporting.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/principal/usePrincipalWorkspaceCanvas.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/notes.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/invites.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/inventory.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/insights.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/hooks/useStaffPresence.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/hooks/useSchoolStats.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/hooks/useDashboardHooks.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/guardian/useGuardianWorkspaceCanvas.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/founder/useFounderWorkspaceCanvas.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/document-workflow/api.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/school/StepLocation.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/school/StepDemographics.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/school/CreateSchoolModal.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/principal/TeacherCarousel.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/principal/SchoolStats.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/principal/SchoolOverview.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/principal/PrincipalNotes.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/principal/PrincipalGovernanceTimeline.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/principal/MorningSituationalBrief.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/principal/LeaveApprovalSection.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/principal/InviteManager.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/principal/InstitutionalCalendarSection.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/principal/HierarchyBuilder.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/founder/GlobalCreateModal.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/components/founder/GlobalCreateModal.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/calendar.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/bridge/PrincipalNativeDashboardShell.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/bridge/founderWorkspace.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/approvals.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/api/staff.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/analytics/engine.ts → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/analytics/engine.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/admin/useAdminWorkspaceCanvas.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/admin/adminControl.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/admin/src/__tests__/analytics/engine.test.ts → packages/core/src/index.ts

### Category: packages/ai
- warn L0-L1-subpath-only: packages/ai/src/screens/AIAssistantScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/ai/src/screens/AIAssistantScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/ai/src/hooks/useAIAgent.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/ai/src/screens/AIAssistantScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/ai/src/screens/AIAssistantScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/ai/src/hooks/useAIAgent.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/ai/src/screens/AIAssistantScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/ai/src/screens/AIAssistantScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/ai/src/hooks/useAIAgent.ts → packages/core/src/index.ts

### Category: packages/analytics
- warn L0-L1-subpath-only: packages/analytics/src/index.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/index.js → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/index.d.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/hooks/useAnalytics.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/hooks/useAnalytics.js → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/hooks/queries.js → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/engine/GPACalculator.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/engine/GPACalculator.d.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/components/PerformanceDashboard.tsx → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/components/PerformanceDashboard.js → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/components/AnalyticsChart.tsx → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/components/AnalyticsChart.js → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/index.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/index.js → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/index.d.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/hooks/useAnalytics.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/hooks/useAnalytics.js → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/hooks/queries.js → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/engine/GPACalculator.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/engine/GPACalculator.d.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/components/PerformanceDashboard.tsx → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/components/PerformanceDashboard.js → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/components/AnalyticsChart.tsx → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/components/AnalyticsChart.js → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/index.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/index.js → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/index.d.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/hooks/useAnalytics.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/hooks/useAnalytics.js → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/hooks/queries.js → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/engine/GPACalculator.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/engine/GPACalculator.d.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/components/PerformanceDashboard.tsx → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/components/PerformanceDashboard.js → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/components/AnalyticsChart.tsx → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/analytics/src/components/AnalyticsChart.js → packages/graphics/src/index.ts

### Category: packages/classroom
- warn L0-L1-subpath-only: packages/classroom/src/workspace/useTeacherWorkspaceShell.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/workspace/useStudentWorkspaceCanvas.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/workspace/useStudentClassroomWorkspaceData.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/workspace/useClassroomWorkspaceSurfaces.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/workspace/useClassroomWorkspaceLayout.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/workspace/ClassroomWorkspaceCanvas.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/types/workspace.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/TimetableScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/TeacherDashboard.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/TeacherDashboard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/TeacherClassroomDashboard.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/TeacherClassroomDashboard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/StudentProfileScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/StudentDashboard.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/StudentDashboard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/StudentClassroomDashboard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/NoSchoolView.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/LessonFeed.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/GradebookScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/ContentLibrary.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/ClassroomScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/ClassroomScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/AttendanceScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/AttendanceScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/AttendanceReportScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/hooks/useTeacherDashboardHooks.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/hooks/useStudentDashboardHooks.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/hooks/useSchoolStats.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/hooks/useResources.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/hooks/useInventory.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/hooks/useGradebook.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/hooks/useEcosystemStats.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/hooks/useClassroomRoleData.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/hooks/useClassroomProfile.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/hooks/useAttendance.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/teacher/TeacherWorkspaceShell.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/teacher/TeacherObservationsWorkspace.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/teacher/TeacherAnalysisWorkspace.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/SubmissionModal.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/SubmissionModal.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/StudentList.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/student/StudentProgressOverview.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/ResourcesView.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/QuickAnalytics.tsx → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/poa/TeacherPrimaryActions.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/poa/TeacherEchoActions.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/poa/TeacherActions.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/InventoryView.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/GradebookView.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/GlobalCreateModal.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/CreateClassroomModal.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/ClassroomNotes.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/ClassroomList.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/ClassroomHolisticInsights.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/BulkStudentCreation.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/AttendanceView.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/AttendanceSheet.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/AddStudentModal.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/analytics.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/workspace/useTeacherWorkspaceShell.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/workspace/useStudentWorkspaceCanvas.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/workspace/useStudentClassroomWorkspaceData.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/workspace/useClassroomWorkspaceSurfaces.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/workspace/useClassroomWorkspaceLayout.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/workspace/ClassroomWorkspaceCanvas.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/types/workspace.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/TimetableScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/TeacherDashboard.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/TeacherDashboard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/TeacherClassroomDashboard.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/TeacherClassroomDashboard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/StudentProfileScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/StudentDashboard.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/StudentDashboard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/StudentClassroomDashboard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/NoSchoolView.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/LessonFeed.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/GradebookScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/ContentLibrary.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/ClassroomScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/ClassroomScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/AttendanceScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/AttendanceScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/AttendanceReportScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/hooks/useTeacherDashboardHooks.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/hooks/useStudentDashboardHooks.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/hooks/useSchoolStats.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/hooks/useResources.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/hooks/useInventory.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/hooks/useGradebook.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/hooks/useEcosystemStats.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/hooks/useClassroomRoleData.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/hooks/useClassroomProfile.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/hooks/useAttendance.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/teacher/TeacherWorkspaceShell.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/teacher/TeacherObservationsWorkspace.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/teacher/TeacherAnalysisWorkspace.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/SubmissionModal.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/SubmissionModal.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/StudentList.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/student/StudentProgressOverview.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/ResourcesView.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/QuickAnalytics.tsx → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/poa/TeacherPrimaryActions.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/poa/TeacherEchoActions.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/poa/TeacherActions.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/InventoryView.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/GradebookView.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/GlobalCreateModal.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/CreateClassroomModal.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/ClassroomNotes.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/ClassroomList.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/ClassroomHolisticInsights.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/BulkStudentCreation.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/AttendanceView.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/AttendanceSheet.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/AddStudentModal.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/analytics.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/workspace/useTeacherWorkspaceShell.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/workspace/useStudentWorkspaceCanvas.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/workspace/useStudentClassroomWorkspaceData.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/workspace/useClassroomWorkspaceSurfaces.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/workspace/useClassroomWorkspaceLayout.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/workspace/ClassroomWorkspaceCanvas.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/types/workspace.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/TimetableScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/TeacherDashboard.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/TeacherDashboard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/TeacherClassroomDashboard.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/TeacherClassroomDashboard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/StudentProfileScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/StudentDashboard.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/StudentDashboard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/StudentClassroomDashboard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/NoSchoolView.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/LessonFeed.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/GradebookScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/ContentLibrary.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/ClassroomScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/ClassroomScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/AttendanceScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/AttendanceScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/screens/AttendanceReportScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/hooks/useTeacherDashboardHooks.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/hooks/useStudentDashboardHooks.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/hooks/useSchoolStats.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/hooks/useResources.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/hooks/useInventory.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/hooks/useGradebook.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/hooks/useEcosystemStats.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/hooks/useClassroomRoleData.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/hooks/useClassroomProfile.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/hooks/useAttendance.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/teacher/TeacherWorkspaceShell.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/teacher/TeacherObservationsWorkspace.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/teacher/TeacherAnalysisWorkspace.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/SubmissionModal.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/SubmissionModal.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/StudentList.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/student/StudentProgressOverview.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/ResourcesView.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/QuickAnalytics.tsx → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/poa/TeacherPrimaryActions.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/poa/TeacherEchoActions.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/poa/TeacherActions.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/InventoryView.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/GradebookView.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/GlobalCreateModal.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/CreateClassroomModal.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/ClassroomNotes.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/ClassroomList.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/ClassroomHolisticInsights.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/BulkStudentCreation.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/AttendanceView.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/AttendanceSheet.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/components/AddStudentModal.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/classroom/src/analytics.ts → packages/core/src/index.ts

### Category: packages/community
- warn L0-L1-subpath-only: packages/community/src/screens/GroupChatScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/community/src/screens/DirectMessageScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/community/src/screens/communityWorkspace.shared.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/community/src/screens/CommunityScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/community/src/api/community.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/community/src/screens/GroupChatScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/community/src/screens/DirectMessageScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/community/src/screens/communityWorkspace.shared.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/community/src/screens/CommunityScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/community/src/api/community.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/community/src/screens/GroupChatScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/community/src/screens/DirectMessageScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/community/src/screens/communityWorkspace.shared.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/community/src/screens/CommunityScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/community/src/api/community.ts → packages/core/src/index.ts

### Category: packages/form-builder
- warn L0-L1-subpath-only: packages/form-builder/src/screens/PublicFormScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/form-builder/src/screens/ClimateSensingScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/form-builder/src/screens/ClimateSensingScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/form-builder/src/NativeForm.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/form-builder/src/FormBuilder.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/form-builder/src/DynamicFormDemo.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/form-builder/src/screens/PublicFormScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/form-builder/src/screens/ClimateSensingScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/form-builder/src/screens/ClimateSensingScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/form-builder/src/NativeForm.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/form-builder/src/FormBuilder.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/form-builder/src/DynamicFormDemo.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/form-builder/src/screens/PublicFormScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/form-builder/src/screens/ClimateSensingScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/form-builder/src/screens/ClimateSensingScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/form-builder/src/NativeForm.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/form-builder/src/FormBuilder.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/form-builder/src/DynamicFormDemo.tsx → packages/core/src/index.ts

### Category: packages/library
- warn L0-L1-subpath-only: packages/library/src/types/Library.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/screens/ResourceHubScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/screens/MapScreen.web.tsx → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/screens/MapScreen.tsx → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/screens/MapScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/screens/LibraryScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/screens/LibraryScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/screens/CuratorReviewScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/hooks/useTopologyPulse.ts → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/hooks/usePerspectiveLayout.ts → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/hooks/useMappingSync.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/components/ResourceRow.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/components/ResourceList.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/components/modals/StudentAnalysisModal.tsx → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/components/modals/StudentAnalysisModal.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/components/LibraryThumbnailCard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/api/library.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/types/Library.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/screens/ResourceHubScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/screens/MapScreen.web.tsx → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/screens/MapScreen.tsx → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/screens/MapScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/screens/LibraryScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/screens/LibraryScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/screens/CuratorReviewScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/hooks/useTopologyPulse.ts → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/hooks/usePerspectiveLayout.ts → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/hooks/useMappingSync.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/components/ResourceRow.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/components/ResourceList.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/components/modals/StudentAnalysisModal.tsx → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/components/modals/StudentAnalysisModal.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/components/LibraryThumbnailCard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/api/library.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/types/Library.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/screens/ResourceHubScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/screens/MapScreen.web.tsx → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/screens/MapScreen.tsx → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/screens/MapScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/screens/LibraryScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/screens/LibraryScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/screens/CuratorReviewScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/hooks/useTopologyPulse.ts → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/hooks/usePerspectiveLayout.ts → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/hooks/useMappingSync.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/components/ResourceRow.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/components/ResourceList.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/components/modals/StudentAnalysisModal.tsx → packages/graphics/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/components/modals/StudentAnalysisModal.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/components/LibraryThumbnailCard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/library/src/api/library.ts → packages/core/src/index.ts

### Category: packages/people
- warn L0-L1-subpath-only: packages/people/src/staff.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/people/src/memberships.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/people/src/hooks/useStaffPresence.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/people/src/feedback.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/people/src/directory.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/people/src/components/TeacherAdminWidget.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/people/src/staff.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/people/src/memberships.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/people/src/hooks/useStaffPresence.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/people/src/feedback.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/people/src/directory.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/people/src/components/TeacherAdminWidget.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/people/src/staff.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/people/src/memberships.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/people/src/hooks/useStaffPresence.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/people/src/feedback.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/people/src/directory.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/people/src/components/TeacherAdminWidget.tsx → packages/core/src/index.ts

### Category: packages/profile
- warn L0-L1-subpath-only: packages/profile/src/types/index.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/screens/PublicProfileScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/screens/ProfileScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/screens/ProfileScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/navigation/ProfileNavigationContext.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/navigation/fullProfileParams.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/hooks/useSocialLinks.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/hooks/useSchoolPulse.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/hooks/useSchoolProfile.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/hooks/useProfileCompletion.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/hooks/useProfile.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/domains/profile/services.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/domains/profile/ports.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/config/profileSections.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/components/UserStatsCard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/components/SocialSanctuary.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/components/LivingJourneyPanel.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/components/InlineSocialLinkEditor.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/components/EditProfileModal.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/components/ContactLinktree.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/components/AddSocialLinkModal.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/api/social.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/api/profile.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/adapters/zenstack/profileRepository.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/adapters/supabase/profileRepository.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/types/index.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/screens/PublicProfileScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/screens/ProfileScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/screens/ProfileScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/navigation/fullProfileParams.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/hooks/useSocialLinks.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/hooks/useSchoolPulse.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/hooks/useSchoolProfile.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/hooks/useProfileCompletion.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/hooks/useProfile.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/domains/profile/services.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/domains/profile/ports.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/config/profileSections.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/components/UserStatsCard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/components/SocialSanctuary.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/components/LivingJourneyPanel.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/components/InlineSocialLinkEditor.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/components/EditProfileModal.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/components/ContactLinktree.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/components/AddSocialLinkModal.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/api/social.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/api/profile.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/adapters/zenstack/profileRepository.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/adapters/supabase/profileRepository.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/types/index.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/screens/PublicProfileScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/screens/ProfileScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/screens/ProfileScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/navigation/ProfileNavigationContext.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/navigation/fullProfileParams.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/hooks/useSocialLinks.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/hooks/useSchoolPulse.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/hooks/useSchoolProfile.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/hooks/useProfileCompletion.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/hooks/useProfile.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/domains/profile/services.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/domains/profile/ports.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/config/profileSections.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/components/UserStatsCard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/components/SocialSanctuary.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/components/LivingJourneyPanel.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/components/InlineSocialLinkEditor.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/components/EditProfileModal.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/components/ContactLinktree.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/components/AddSocialLinkModal.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/api/social.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/api/profile.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/adapters/zenstack/profileRepository.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/adapters/supabase/profileRepository.ts → packages/core/src/index.ts

### Category: packages/scanner-kit
- warn L0-L1-subpath-only: packages/scanner-kit/src/qr/index.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/scanner-kit/src/index.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/scanner-kit/src/hooks/useQRDeepLink.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/scanner-kit/src/qr/index.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/scanner-kit/src/index.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/scanner-kit/src/hooks/useQRDeepLink.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/scanner-kit/src/qr/index.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/scanner-kit/src/index.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/scanner-kit/src/hooks/useQRDeepLink.ts → packages/core/src/index.ts

### Category: packages/self
- warn L0-L1-subpath-only: packages/self/src/screens/SelfScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/screens/SelfScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/screens/self/TeacherSelfView.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/screens/self/TeacherSelfView.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/screens/self/StudentSelfView.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/screens/self/StudentSelfView.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/screens/self/PrincipalSelfView.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/screens/self/PrincipalSelfView.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/screens/self/GuardianSelfView.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/screens/self/GuardianSelfView.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/screens/self/FounderSelfView.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/screens/self/FounderSelfView.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/screens/self/AdminSelfView.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/screens/PrivacyLedgerScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useWisdom.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useWellbeingEnrichment.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useTomorrowPrep.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useTimetable.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useStudentGoals.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useSleepTracker.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useOrientationInference.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useMoodLogs.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useJoyJar.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useJourneyData.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useJournalEntries.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useGratitude.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useFireJournal.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useFeatureActivity.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useEnergyForecast.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useDecisionJournal.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useCommunityPresence.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/WisdomSeeds.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/VoiceJournaling.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/SleepTracker.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/ResonancePatternCard.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/ResonancePatternCard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/PulseDashboard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/JoyJar.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/ImpactRipplesCard.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/ImpactRipplesCard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/GratitudeGlimmers.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/FireJournal.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/EnergyForecast.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/DecisionJournalSection.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/BaseSelfView.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/BaseSelfView.types.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/BaseSelfView.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/archive/ShadowAgentDrawer.web.tsx → packages/ui/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/archive/ShadowAgentDrawer.tsx → packages/ui/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/api/wellbeingRepository.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/api/selfInsightsRepository.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/api/selfFeatureRepository.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/api/self.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/screens/SelfScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/screens/SelfScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/screens/self/TeacherSelfView.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/screens/self/TeacherSelfView.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/screens/self/StudentSelfView.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/screens/self/StudentSelfView.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/screens/self/PrincipalSelfView.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/screens/self/PrincipalSelfView.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/screens/self/GuardianSelfView.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/screens/self/GuardianSelfView.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/screens/self/FounderSelfView.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/screens/self/FounderSelfView.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/screens/self/AdminSelfView.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/screens/PrivacyLedgerScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useWisdom.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useWellbeingEnrichment.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useTomorrowPrep.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useTimetable.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useStudentGoals.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useSleepTracker.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useOrientationInference.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useMoodLogs.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useJoyJar.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useJourneyData.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useJournalEntries.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useGratitude.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useFireJournal.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useFeatureActivity.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useEnergyForecast.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useDecisionJournal.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useCommunityPresence.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/WisdomSeeds.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/VoiceJournaling.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/SleepTracker.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/ResonancePatternCard.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/ResonancePatternCard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/PulseDashboard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/JoyJar.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/ImpactRipplesCard.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/ImpactRipplesCard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/GratitudeGlimmers.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/FireJournal.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/EnergyForecast.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/DecisionJournalSection.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/BaseSelfView.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/BaseSelfView.types.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/BaseSelfView.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/archive/ShadowAgentDrawer.web.tsx → packages/ui/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/archive/ShadowAgentDrawer.tsx → packages/ui/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/api/wellbeingRepository.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/api/selfInsightsRepository.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/api/selfFeatureRepository.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/api/self.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/screens/SelfScreen.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/screens/SelfScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/screens/self/TeacherSelfView.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/screens/self/TeacherSelfView.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/screens/self/StudentSelfView.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/screens/self/StudentSelfView.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/screens/self/PrincipalSelfView.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/screens/self/PrincipalSelfView.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/screens/self/GuardianSelfView.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/screens/self/GuardianSelfView.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/screens/self/FounderSelfView.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/screens/self/FounderSelfView.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/screens/self/AdminSelfView.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/screens/PrivacyLedgerScreen.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useWisdom.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useWellbeingEnrichment.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useTomorrowPrep.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useTimetable.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useStudentGoals.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useSleepTracker.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useOrientationInference.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useMoodLogs.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useJoyJar.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useJourneyData.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useJournalEntries.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useGratitude.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useFireJournal.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useFeatureActivity.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useEnergyForecast.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useDecisionJournal.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/hooks/useCommunityPresence.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/WisdomSeeds.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/VoiceJournaling.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/SleepTracker.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/ResonancePatternCard.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/ResonancePatternCard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/PulseDashboard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/JoyJar.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/ImpactRipplesCard.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/ImpactRipplesCard.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/GratitudeGlimmers.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/FireJournal.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/EnergyForecast.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/DecisionJournalSection.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/BaseSelfView.web.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/BaseSelfView.types.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/BaseSelfView.tsx → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/archive/ShadowAgentDrawer.web.tsx → packages/ui/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/components/archive/ShadowAgentDrawer.tsx → packages/ui/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/api/wellbeingRepository.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/api/selfInsightsRepository.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/api/selfFeatureRepository.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/api/self.ts → packages/core/src/index.ts

## Raw Output

```text

> polymath-platform@1.0.0 check:hygiene C:\Users\Naween\projects\polymath-platform
> node ./scripts/check-hygiene.mjs



>>> Starting Unified Hygiene Audit <<<


--- Checking Circular Dependencies ---


> polymath-platform@1.0.0 check:circular C:\Users\Naween\projects\polymath-platform
> node scripts/sovereign-audit.mjs --cmd "pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err" --filter "no-circular" --log "reports/circular_deps.txt"


>>> Starting Sovereign Audit: 2026-04-30T15:51:20.625Z

>>> Command: pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err
>>> Filter: no-circular
--------------------------------------------------------------------------------


  warn no-orphans: packages/ui/src/utils/shareAction.web.ts
  warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
  warn no-orphans: packages/ui/src/utils/haptics.web.ts
  warn no-orphans: packages/ui/src/utils/dialogs.web.ts
  warn no-orphans: packages/ui/src/components/UniversalModal.web.tsx
  warn no-orphans: packages/ui/src/components/ui/list/index.tsx
  warn no-orphans: packages/ui/src/components-native/NoiseOverlay.web.tsx
  warn no-orphans: packages/ui/src/components-native/Livin
gCard.web.tsx
  warn no-orphans: packages/ui/src/code.tsx
  warn no-orphans: packages/ui/src/card.tsx
  warn no-orphans: packages/ui/src/button.tsx
  warn no-orphans: packages/trube-art/src/native/renderers/SoulLibrary.ts
  warn no-orphans: packages/scanner-kit/src/ScannerModal.web.tsx
  warn no-orphans: packages/lk-edu-geo/src/constants.ts
  warn no-orphans: packages/library/src/components/LibraryThumbnailCard.web.tsx
  warn no-orphans: packages/library/src/api/database.web.ts
  warn no-orphans: packages/core/src/utils/temporal.ts
  warn no-orphans: packages/core/src/utils/idempotency.ts
  warn no-orphans: packages/core/src/native/sentry.ts
  warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
  warn no-orphans: packages/core/src/api/growthSignals.generated.zod.ts
  warn no-orphans: packages/analytics/src/utils/analyticsHelpers.ts
  warn no-orphans: packages/analytics/src/types/AnalyticsTypes.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.web.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.js
  warn no-orphans: packages/analytics/src/context/ActivityPulseContext.tsx
  warn no-orphans: packages/admin/src/screens/principal/types.ts
  warn no-orphans: packages/admin/src/screens/index.ts
  warn no-orphans: apps/neevsk-web/src/scripts/theme-switcher.ts
  warn no-orphans: apps/neevsk-web/src/scripts/scroll-to-top.ts
  warn no-orphans: apps/neevsk-web/src/scripts/creative-signatures.ts
  warn no-orphans: apps/neevsk-web/src/scripts/animations.ts
  warn no-orphans: apps/neevsk-web/.astro/content-modules.mjs
  warn no-orphans: apps/neevsk-web/.astro/content-assets.mjs
  warn no-orphans: apps/intuitui-web/.astro/content-modules.mjs
  warn no-orphans: apps/intuitui-web/.astro/content-assets.mjs
  warn no-orphans: apps/gurudevi-mobile/src/utils/validators.ts
  warn no-orphans: apps/gurudevi-mobile/src/utils/usePWAInstallPrompt.ts
  warn no-orphans: apps/gurudevi-mobile/src/utils/device.ts
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebScreenShimmer.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/RedirectToApp.tsx
  warn no-orphans: apps/gurudevi-mobile/plugins/withSentryGradleDisabled.js
  warn no-orphans: apps/gurudevi-mobile/plugins/withGradleProperties.js
  warn no-orphans: apps/gurudevi-mobile/plugins/withAndroidCruncherDisabled.js
  warn no-orphans: apps/gurudevi-mobile/jest-setup.ts
  warn no-orphans: apps/gurudevi-mobile/__mocks__/react-native-reanimated.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/gluestack-themed.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-image-picker.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-camera.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/EnvironmentContext.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/@shopify/react-native-skia.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/@sentry/react-native.js
  warn no-orphans: apps/gurudevi-marketingWeb/src/components/StatsSection.svelte
  warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-modules.mjs
  warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-assets.mjs
  warn no-orphans: apps/edlove-web/src/utils/helpers.ts
  warn no-orphans: apps/edlove-web/src/types/index.ts
  warn no-orphans: apps/edlove-web/src/constants/Theme.ts
  warn no-orphans: apps/edlove-web/.astro/content-modules.mjs
  warn no-orphans: apps/edlove-web/.astro/content-assets.mjs
  warn L0-L1-subpath-only: packages/self/src/screens/SelfScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/screens/SelfScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/screens/self/TeacherSelfView.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/screens/self/TeacherSelfView.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/screens/self/StudentSelfView.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/screens/self/StudentSelfView.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/screens/self/PrincipalSelfView.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/screens/self/PrincipalSelfView.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/screens/self/GuardianSelfView.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/screens/self/GuardianSelfView.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/screens/self/FounderSelfView.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/screens/self/FounderSelfView.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/screens/self/AdminSelfView.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/screens/PrivacyLedgerScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useWisdom.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useWellbeingEnrichment.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useTomorrowPrep.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useTimetable.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useStudentGoals.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useSleepTracker.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useOrientationInference.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useMoodLogs.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useJoyJar.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useJourneyData.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useJournalEntries.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useGratitude.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useFireJournal.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useFeatureActivity.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useEnergyForecast.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useDecisionJournal.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useCommunityPresence.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/WisdomSeeds.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/VoiceJournaling.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/SleepTracker.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/ResonancePatternCard.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/ResonancePatternCard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/PulseDashboard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/JoyJar.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/ImpactRipplesCard.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/ImpactRipplesCard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/GratitudeGlimmers.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/FireJournal.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/EnergyForecast.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/DecisionJournalSection.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/BaseSelfView.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/BaseSelfView.types.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/BaseSelfView.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/archive/ShadowAgentDrawer.web.tsx → packages/ui/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/archive/ShadowAgentDrawer.tsx → packages/ui/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/api/wellbeingRepository.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/api/selfInsightsRepository.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/api/selfFeatureRepository.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/api/self.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/scanner-kit/src/qr/index.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/scanner-kit/src/index.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/scanner-kit/src/hooks/useQRDeepLink.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/types/index.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/screens/PublicProfileScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/screens/ProfileScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/screens/ProfileScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/navigation/ProfileNavigationContext.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/navigation/fullProfileParams.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/hooks/useSocialLinks.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/hooks/useSchoolPulse.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/hooks/useSchoolProfile.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/hooks/useProfileCompletion.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/hooks/useProfile.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/domains/profile/services.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/domains/profile/ports.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/config/profileSections.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/components/UserStatsCard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/components/SocialSanctuary.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/components/LivingJourneyPanel.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/components/InlineSocialLinkEditor.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/components/EditProfileModal.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/components/ContactLinktree.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/components/AddSocialLinkModal.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/api/social.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/api/profile.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/adapters/zenstack/profileRepository.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/adapters/supabase/profileRepository.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/people/src/staff.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/people/src/memberships.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/people/src/hooks/useStaffPresence.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/people/src/feedback.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/people/src/directory.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/people/src/components/TeacherAdminWidget.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/types/Library.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/screens/ResourceHubScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/screens/MapScreen.web.tsx → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/screens/MapScreen.tsx → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/screens/MapScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/screens/LibraryScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/screens/LibraryScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/screens/CuratorReviewScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/hooks/useTopologyPulse.ts → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/hooks/usePerspectiveLayout.ts → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/hooks/useMappingSync.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/components/ResourceRow.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/components/ResourceList.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/components/modals/StudentAnalysisModal.tsx → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/components/modals/StudentAnalysisModal.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/components/LibraryThumbnailCard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/api/library.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/form-builder/src/screens/PublicFormScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/form-builder/src/screens/ClimateSensingScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/form-builder/src/screens/ClimateSensingScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/form-builder/src/NativeForm.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/form-builder/src/FormBuilder.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/form-builder/src/DynamicFormDemo.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/community/src/screens/GroupChatScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/community/src/screens/DirectMessageScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/community/src/screens/communityWorkspace.shared.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/community/src/screens/CommunityScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/community/src/api/community.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/workspace/useTeacherWorkspaceShell.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/workspace/useStudentWorkspaceCanvas.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/workspace/useStudentClassroomWorkspaceData.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/workspace/useClassroomWorkspaceSurfaces.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/workspace/useClassroomWorkspaceLayout.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/workspace/ClassroomWorkspaceCanvas.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/types/workspace.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/TimetableScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/TeacherDashboard.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/TeacherDashboard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/TeacherClassroomDashboard.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/TeacherClassroomDashboard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/StudentProfileScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/StudentDashboard.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/StudentDashboard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/StudentClassroomDashboard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/NoSchoolView.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/LessonFeed.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/GradebookScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/ContentLibrary.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/ClassroomScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/ClassroomScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/AttendanceScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/AttendanceScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/AttendanceReportScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/hooks/useTeacherDashboardHooks.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/hooks/useStudentDashboardHooks.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/hooks/useSchoolStats.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/hooks/useResources.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/hooks/useInventory.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/hooks/useGradebook.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/hooks/useEcosystemStats.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/hooks/useClassroomRoleData.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/hooks/useClassroomProfile.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/hooks/useAttendance.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/teacher/TeacherWorkspaceShell.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/teacher/TeacherObservationsWorkspace.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/teacher/TeacherAnalysisWorkspace.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/SubmissionModal.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/SubmissionModal.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/StudentList.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/student/StudentProgressOverview.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/ResourcesView.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/QuickAnalytics.tsx → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/poa/TeacherPrimaryActions.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/poa/TeacherEchoActions.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/poa/TeacherActions.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/InventoryView.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/GradebookView.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/GlobalCreateModal.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/CreateClassroomModal.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/ClassroomNotes.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/ClassroomList.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/ClassroomHolisticInsights.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/BulkStudentCreation.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/AttendanceView.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/AttendanceSheet.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/AddStudentModal.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/analytics.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/index.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/index.js → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/index.d.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/hooks/useAnalytics.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/hooks/useAnalytics.js → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/hooks/queries.js → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/engine/GPACalculator.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/engine/GPACalculator.d.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/components/PerformanceDashboard.tsx → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/components/PerformanceDashboard.js → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/components/AnalyticsChart.tsx → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/components/AnalyticsChart.js → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/ai/src/screens/AIAssistantScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/ai/src/screens/AIAssistantScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/ai/src/hooks/useAIAgent.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/structure.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/staff.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/SchoolForestScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/PrincipalNativeWorkspace.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/PrincipalDashboard.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/PrincipalDashboard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/principal/StudentPulse.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/principal/PendingApprovals.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/principal/DashboardContent.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/GuardianDashboard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/guardian/GuardianStudentsScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/guardian/GuardianStudentDetailScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/FounderSchoolDashboard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/FounderDashboard.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/FounderDashboard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/DocumentListScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/DocumentListScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/AdminReleaseControl.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/AdminFeatureRegistry.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/AdminDashboard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/AdminAuthorityRepair.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/AcademicCycleManager.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/reporting.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/principal/usePrincipalWorkspaceCanvas.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/notes.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/invites.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/inventory.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/insights.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/hooks/useStaffPresence.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/hooks/useSchoolStats.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/hooks/useDashboardHooks.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/guardian/useGuardianWorkspaceCanvas.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/founder/useFounderWorkspaceCanvas.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/document-workflow/api.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/school/StepLocation.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/school/StepDemographics.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/school/CreateSchoolModal.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/principal/TeacherCarousel.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/principal/SchoolStats.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/principal/SchoolOverview.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/principal/PrincipalNotes.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/principal/PrincipalGovernanceTimeline.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/principal/MorningSituationalBrief.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/principal/LeaveApprovalSection.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/principal/InviteManager.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/principal/InstitutionalCalendarSection.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/principal/HierarchyBuilder.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/founder/GlobalCreateModal.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/founder/GlobalCreateModal.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/calendar.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/bridge/PrincipalNativeDashboardShell.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/bridge/founderWorkspace.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/approvals.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/api/staff.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/analytics/engine.ts → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/analytics/engine.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/admin/useAdminWorkspaceCanvas.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/admin/adminControl.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/__tests__/analytics/engine.test.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/utils/LanguageUtils.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/types/navigation.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/shims/lk-edu-geo-web.js → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/providers/SanctuaryProvider.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/SelfStackNavigator.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/ProfileStackNavigator.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/PrincipalStackNavigator.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/PrincipalStackNavigator.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/LibraryStackNavigator.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/GuardianStackNavigator.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/GuardianStackNavigator.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/FounderStackNavigator.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/FounderStackNavigator.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/CommunityStackNavigator.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/CommunityStackNavigator.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/ClassroomStackNavigator.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/ClassroomStackNavigator.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/lib/inngestEvents.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/components/school/StepLocation.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/components/school/StepDemographics.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/__tests__/architecture/profile-poa-enforcement.test.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/__tests__/architecture/poa_enforcement.test.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/App.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/pages/api/durable-agents/teacher-summary.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/pages/api/durable-agents/student-support.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/lib/inngestEvents.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/lib/durableAgents/durableAgentRuns.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/wellbeingHandlers.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/studentSupportHandlers.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/mutationHandlers.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/gradingHandlers.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/durableAgentHandlers.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/classroomHandlers.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/attendanceHandlers.ts → packages/core/src/index.ts

x 348 dependency violations (0 errors, 348 warnings). 1833 modules, 5925 dependencies cruised.



--------------------------------------------------------------------------------

AUDIT SUMMARY
Duration: 10.7s
Findings: 0
Log File: reports/circular_deps.txt
--------------------------------------------------------------------------------

--- Checking Unused Code ---


> polymath-platform@1.0.0 check:unused C:\Users\Naween\projects\polymath-platform
> node scripts/sovereign-audit.mjs --cmd "pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err" --filter "no-orphans" --log "reports/unused_code.txt"


>>> Starting Sovereign Audit: 2026-04-30T15:51:32.232Z

>>> Command: pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err
>>> Filter: no-orphans
--------------------------------------------------------------------------------


  warn no-orphans: packages/ui/src/utils/shareAction.web.ts
  warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
  warn no-orphans: packages/ui/src/utils/haptics.web.ts
  warn no-orphans: packages/ui/src/utils/dialogs.web.ts
  warn no-orphans: packages/ui/src/components/UniversalModal.web.tsx
  warn no-orphans: packages/ui/src/components/ui/list/index.tsx
  warn no-orphans: packages/ui/src/components-native/NoiseOverlay.web.tsx
  warn no-orphans: packages/ui/src/components-native/Livin
gCard.web.tsx
  warn no-orphans: packages/ui/src/code.tsx
  warn no-orphans: packages/ui/src/card.tsx
  warn no-orphans: packages/ui/src/button.tsx
  warn no-orphans: packages/trube-art/src/native/renderers/SoulLibrary.ts
  warn no-orphans: packages/scanner-kit/src/ScannerModal.web.tsx
  warn no-orphans: packages/lk-edu-geo/src/constants.ts
  warn no-orphans: packages/library/src/components/LibraryThumbnailCard.web.tsx
  warn no-orphans: packages/library/src/api/database.web.ts
  warn no-orphans: packages/core/src/utils/temporal.ts
  warn no-orphans: packages/core/src/utils/idempotency.ts
  warn no-orphans: packages/core/src/native/sentry.ts
  warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
  warn no-orphans: packages/core/src/api/growthSignals.generated.zod.ts
  warn no-orphans: packages/analytics/src/utils/analyticsHelpers.ts
  warn no-orphans: packages/analytics/src/types/AnalyticsTypes.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.web.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.js
  warn no-orphans: packages/analytics/src/context/ActivityPulseContext.tsx
  warn no-orphans: packages/admin/src/screens/principal/types.ts
  warn no-orphans: packages/admin/src/screens/index.ts
  warn no-orphans: apps/neevsk-web/src/scripts/theme-switcher.ts
  warn no-orphans: apps/neevsk-web/src/scripts/scroll-to-top.ts
  warn no-orphans: apps/neevsk-web/src/scripts/creative-signatures.ts
  warn no-orphans: apps/neevsk-web/src/scripts/animations.ts
  warn no-orphans: apps/neevsk-web/.astro/content-modules.mjs
  warn no-orphans: apps/neevsk-web/.astro/content-assets.mjs
  warn no-orphans: apps/intuitui-web/.astro/content-modules.mjs
  warn no-orphans: apps/intuitui-web/.astro/content-assets.mjs
  warn no-orphans: apps/gurudevi-mobile/src/utils/validators.ts
  warn no-orphans: apps/gurudevi-mobile/src/utils/usePWAInstallPrompt.ts
  warn no-orphans: apps/gurudevi-mobile/src/utils/device.ts
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebScreenShimmer.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/RedirectToApp.tsx
  warn no-orphans: apps/gurudevi-mobile/plugins/withSentryGradleDisabled.js
  warn no-orphans: apps/gurudevi-mobile/plugins/withGradleProperties.js
  warn no-orphans: apps/gurudevi-mobile/plugins/withAndroidCruncherDisabled.js
  warn no-orphans: apps/gurudevi-mobile/jest-setup.ts
  warn no-orphans: apps/gurudevi-mobile/__mocks__/react-native-reanimated.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/gluestack-themed.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-image-picker.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-camera.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/EnvironmentContext.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/@shopify/react-native-skia.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/@sentry/react-native.js
  warn no-orphans: apps/gurudevi-marketingWeb/src/components/StatsSection.svelte
  warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-modules.mjs
  warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-assets.mjs
  warn no-orphans: apps/edlove-web/src/utils/helpers.ts
  warn no-orphans: apps/edlove-web/src/types/index.ts
  warn no-orphans: apps/edlove-web/src/constants/Theme.ts
  warn no-orphans: apps/edlove-web/.astro/content-modules.mjs
  warn no-orphans: apps/edlove-web/.astro/content-assets.mjs
  warn L0-L1-subpath-only: packages/self/src/screens/SelfScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/screens/SelfScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/screens/self/TeacherSelfView.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/screens/self/TeacherSelfView.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/screens/self/StudentSelfView.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/screens/self/StudentSelfView.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/screens/self/PrincipalSelfView.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/screens/self/PrincipalSelfView.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/screens/self/GuardianSelfView.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/screens/self/GuardianSelfView.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/screens/self/FounderSelfView.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/screens/self/FounderSelfView.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/screens/self/AdminSelfView.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/screens/PrivacyLedgerScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useWisdom.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useWellbeingEnrichment.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useTomorrowPrep.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useTimetable.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useStudentGoals.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useSleepTracker.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useOrientationInference.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useMoodLogs.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useJoyJar.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useJourneyData.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useJournalEntries.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useGratitude.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useFireJournal.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useFeatureActivity.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useEnergyForecast.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useDecisionJournal.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useCommunityPresence.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/WisdomSeeds.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/VoiceJournaling.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/SleepTracker.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/ResonancePatternCard.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/ResonancePatternCard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/PulseDashboard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/JoyJar.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/ImpactRipplesCard.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/ImpactRipplesCard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/GratitudeGlimmers.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/FireJournal.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/EnergyForecast.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/DecisionJournalSection.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/BaseSelfView.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/BaseSelfView.types.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/BaseSelfView.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/archive/ShadowAgentDrawer.web.tsx → packages/ui/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/archive/ShadowAgentDrawer.tsx → packages/ui/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/api/wellbeingRepository.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/api/selfInsightsRepository.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/api/selfFeatureRepository.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/api/self.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/scanner-kit/src/qr/index.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/scanner-kit/src/index.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/scanner-kit/src/hooks/useQRDeepLink.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/types/index.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/screens/PublicProfileScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/screens/ProfileScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/screens/ProfileScreen.tsx → packages/core/src/index.ts
  warn L0-L
1-subpath-only: packages/profile/src/navigation/ProfileNavigationContext.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/navigation/fullProfileParams.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/hooks/useSocialLinks.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/hooks/useSchoolPulse.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/hooks/useSchoolProfile.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/hooks/useProfileCompletion.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/hooks/useProfile.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/domains/profile/services.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/domains/profile/ports.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/config/profileSections.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/components/UserStatsCard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/components/SocialSanctuary.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/components/LivingJourneyPanel.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/components/InlineSocialLinkEditor.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/components/EditProfileModal.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/components/ContactLinktree.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/components/AddSocialLinkModal.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/api/social.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/api/profile.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/adapters/zenstack/profileRepository.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/adapters/supabase/profileRepository.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/people/src/staff.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/people/src/memberships.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/people/src/hooks/useStaffPresence.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/people/src/feedback.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/people/src/directory.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/people/src/components/TeacherAdminWidget.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/types/Library.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/screens/ResourceHubScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/screens/MapScreen.web.tsx → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/screens/MapScreen.tsx → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/screens/MapScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/screens/LibraryScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/screens/LibraryScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/screens/CuratorReviewScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/hooks/useTopologyPulse.ts → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/hooks/usePerspectiveLayout.ts → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/hooks/useMappingSync.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/components/ResourceRow.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/components/ResourceList.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/components/modals/StudentAnalysisModal.tsx → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/components/modals/StudentAnalysisModal.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/components/LibraryThumbnailCard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/api/library.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/form-builder/src/screens/PublicFormScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/form-builder/src/screens/ClimateSensingScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/form-builder/src/screens/ClimateSensingScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/form-builder/src/NativeForm.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/form-builder/src/FormBuilder.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/form-builder/src/DynamicFormDemo.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/community/src/screens/GroupChatScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/community/src/screens/DirectMessageScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/community/src/screens/communityWorkspace.shared.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/community/src/screens/CommunityScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/community/src/api/community.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/workspace/useTeacherWorkspaceShell.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/workspace/useStudentWorkspaceCanvas.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/workspace/useStudentClassroomWorkspaceData.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/workspace/useClassroomWorkspaceSurfaces.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/workspace/useClassroomWorkspaceLayout.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/workspace/ClassroomWorkspaceCanvas.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/types/workspace.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/TimetableScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/TeacherDashboard.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/TeacherDashboard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/TeacherClassroomDashboard.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/TeacherClassroomDashboard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/StudentProfileScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/StudentDashboard.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/StudentDashboard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/StudentClassroomDashboard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/NoSchoolView.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/LessonFeed.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/GradebookScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/ContentLibrary.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/ClassroomScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/ClassroomScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/AttendanceScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/AttendanceScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/AttendanceReportScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/hooks/useTeacherDashboardHooks.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/hooks/useStudentDashboardHooks.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/hooks/useSchoolStats.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/hooks/useResources.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/hooks/useInventory.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/hooks/useGradebook.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/hooks/useEcosystemStats.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/hooks/useClassroomRoleData.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/hooks/useClassroomProfile.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/hooks/useAttendance.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/teacher/TeacherWorkspaceShell.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/teacher/TeacherObservationsWorkspace.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/teacher/TeacherAnalysisWorkspace.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/SubmissionModal.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/SubmissionModal.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/StudentList.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/student/StudentProgressOverview.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/ResourcesView.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/QuickAnalytics.tsx → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/poa/TeacherPrimaryActions.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/poa/TeacherEchoActions.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/poa/TeacherActions.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/InventoryView.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/GradebookView.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/GlobalCreateModal.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/CreateClassroomModal.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/ClassroomNotes.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/ClassroomList.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/ClassroomHolisticInsights.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/BulkStudentCreation.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/AttendanceView.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/AttendanceSheet.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/AddStudentModal.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/analytics.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/index.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/index.js → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/index.d.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/hooks/useAnalytics.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/hooks/useAnalytics.js → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/hooks/queries.js → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/engine/GPACalculator.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/engine/GPACalculator.d.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/components/PerformanceDashboard.tsx → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/components/PerformanceDashboard.js → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/components/AnalyticsChart.tsx → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/components/AnalyticsChart.js → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/ai/src/screens/AIAssistantScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/ai/src/screens/AIAssistantScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/ai/src/hooks/useAIAgent.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/structure.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/staff.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/SchoolForestScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/PrincipalNativeWorkspace.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/PrincipalDashboard.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/PrincipalDashboard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/principal/StudentPulse.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/principal/PendingApprovals.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/principal/DashboardContent.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/GuardianDashboard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/guardian/GuardianStudentsScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/guardian/GuardianStudentDetailScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/FounderSchoolDashboard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/FounderDashboard.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/FounderDashboard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/DocumentListScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/DocumentListScreen.tsx → pack
ages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/AdminReleaseControl.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/AdminFeatureRegistry.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/AdminDashboard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/AdminAuthorityRepair.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/AcademicCycleManager.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/reporting.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/principal/usePrincipalWorkspaceCanvas.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/notes.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/invites.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/inventory.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/insights.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/hooks/useStaffPresence.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/hooks/useSchoolStats.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/hooks/useDashboardHooks.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/guardian/useGuardianWorkspaceCanvas.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/founder/useFounderWorkspaceCanvas.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/document-workflow/api.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/school/StepLocation.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/school/StepDemographics.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/school/CreateSchoolModal.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/principal/TeacherCarousel.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/principal/SchoolStats.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/principal/SchoolOverview.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/principal/PrincipalNotes.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/principal/PrincipalGovernanceTimeline.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/principal/MorningSituationalBrief.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/principal/LeaveApprovalSection.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/principal/InviteManager.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/principal/InstitutionalCalendarSection.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/principal/HierarchyBuilder.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/founder/GlobalCreateModal.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/founder/GlobalCreateModal.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/calendar.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/bridge/PrincipalNativeDashboardShell.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/bridge/founderWorkspace.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/approvals.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/api/staff.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/analytics/engine.ts → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/analytics/engine.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/admin/useAdminWorkspaceCanvas.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/admin/adminControl.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/__tests__/analytics/engine.test.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/utils/LanguageUtils.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/types/navigation.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/shims/lk-edu-geo-web.js → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/providers/SanctuaryProvider.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/SelfStackNavigator.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/ProfileStackNavigator.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/PrincipalStackNavigator.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/PrincipalStackNavigator.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/LibraryStackNavigator.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/GuardianStackNavigator.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/GuardianStackNavigator.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/FounderStackNavigator.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/FounderStackNavigator.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/CommunityStackNavigator.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/CommunityStackNavigator.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/ClassroomStackNavigator.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/ClassroomStackNavigator.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/lib/inngestEvents.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/components/school/StepLocation.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/components/school/StepDemographics.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/__tests__/architecture/profile-poa-enforcement.test.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/__tests__/architecture/poa_enforcement.test.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/App.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/pages/api/durable-agents/teacher-summary.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/pages/api/durable-agents/student-support.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/lib/inngestEvents.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/lib/durableAgents/durableAgentRuns.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/wellbeingHandlers.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/studentSupportHandlers.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/mutationHandlers.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/gradingHandlers.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/durableAgentHandlers.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/classroomHandlers.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/attendanceHandlers.ts → packages/core/src/index.ts

x 348 dependency violations (0 errors, 348 warnings). 1833 modules, 5925 dependencies cruised.



--------------------------------------------------------------------------------

AUDIT SUMMARY
Duration: 12.6s
Findings: 66
Log File: reports/unused_code.txt

--------------------------------------------------------------------------------

--- Checking Architecture Boundaries ---


> polymath-platform@1.0.0 check:architecture C:\Users\Naween\projects\polymath-platform
> node scripts/sovereign-audit.mjs --cmd "pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err" --log "reports/architecture.txt"


>>> Starting Sovereign Audit: 2026-04-30T15:51:45.604Z

>>> Command: pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err

--------------------------------------------------------------------------------


  warn no-orphans: packages/ui/src/utils/shareAction.web.ts
  warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
  warn no-orphans: packages/ui/src/utils/haptics.web.ts
  warn no-orphans: packages/ui/src/utils/dialogs.web.ts
  warn no-orphans: packages/ui/src/components/UniversalModal.web.tsx
  warn no-orphans: packages/ui/src/components/ui/list/index.tsx
  warn no-orphans: packages/ui/src/components-native/NoiseOverlay.web.tsx
  warn no-orphans: packages/ui/src/components-native/Livin
gCard.web.tsx
  warn no-orphans: packages/ui/src/code.tsx
  warn no-orphans: packages/ui/src/card.tsx
  warn no-orphans: packages/ui/src/button.tsx
  warn no-orphans: packages/trube-art/src/native/renderers/SoulLibrary.ts
  warn no-orphans: packages/scanner-kit/src/ScannerModal.web.tsx
  warn no-orphans: packages/lk-edu-geo/src/constants.ts
  warn no-orphans: packages/library/src/components/LibraryThumbnailCard.web.tsx
  warn no-orphans: packages/library/src/api/database.web.ts
  warn no-orphans: packages/core/src/utils/temporal.ts
  warn no-orphans: packages/core/src/utils/idempotency.ts
  warn no-orphans: packages/core/src/native/sentry.ts
  warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
  warn no-orphans: packages/core/src/api/growthSignals.generated.zod.ts
  warn no-orphans: packages/analytics/src/utils/analyticsHelpers.ts
  warn no-orphans: packages/analytics/src/types/AnalyticsTypes.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.web.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.js
  warn no-orphans: packages/analytics/src/context/ActivityPulseContext.tsx
  warn no-orphans: packages/admin/src/screens/principal/types.ts
  warn no-orphans: packages/admin/src/screens/index.ts
  warn no-orphans: apps/neevsk-web/src/scripts/theme-switcher.ts
  warn no-orphans: apps/neevsk-web/src/scripts/scroll-to-top.ts
  warn no-orphans: apps/neevsk-web/src/scripts/creative-signatures.ts
  warn no-orphans: apps/neevsk-web/src/scripts/animations.ts
  warn no-orphans: apps/neevsk-web/.astro/content-modules.mjs
  warn no-orphans: apps/neevsk-web/.astro/content-assets.mjs
  warn no-orphans: apps/intuitui-web/.astro/content-modules.mjs
  warn no-orphans: apps/intuitui-web/.astro/content-assets.mjs
  warn no-orphans: apps/gurudevi-mobile/src/utils/validators.ts
  warn no-orphans: apps/gurudevi-mobile/src/utils/usePWAInstallPrompt.ts
  warn no-orphans: apps/gurudevi-mobile/src/utils/device.ts
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebScreenShimmer.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/RedirectToApp.tsx
  warn no-orphans: apps/gurudevi-mobile/plugins/withSentryGradleDisabled.js
  warn no-orphans: apps/gurudevi-mobile/plugins/withGradleProperties.js
  warn no-orphans: apps/gurudevi-mobile/plugins/withAndroidCruncherDisabled.js
  warn no-orphans: apps/gurudevi-mobile/jest-setup.ts
  warn no-orphans: apps/gurudevi-mobile/__mocks__/react-native-reanimated.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/gluestack-themed.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-image-picker.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-camera.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/EnvironmentContext.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/@shopify/react-native-skia.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/@sentry/react-native.js
  warn no-orphans: apps/gurudevi-marketingWeb/src/components/StatsSection.svelte
  warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-modules.mjs
  warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-assets.mjs
  warn no-orphans: apps/edlove-web/src/utils/helpers.ts
  warn no-orphans: apps/edlove-web/src/types/index.ts
  warn no-orphans: apps/edlove-web/src/constants/Theme.ts
  warn no-orphans: apps/edlove-web/.astro/content-modules.mjs
  warn no-orphans: apps/edlove-web/.astro/content-assets.mjs
  warn L0-L1-subpath-only: packages/self/src/screens/SelfScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/screens/SelfScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/screens/self/TeacherSelfView.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/screens/self/TeacherSelfView.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/screens/self/StudentSelfView.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/screens/self/StudentSelfView.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/screens/self/PrincipalSelfView.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/screens/self/PrincipalSelfView.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/screens/self/GuardianSelfView.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/screens/self/GuardianSelfView.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/screens/self/FounderSelfView.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/screens/self/FounderSelfView.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/screens/self/AdminSelfView.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/screens/PrivacyLedgerScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useWisdom.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useWellbeingEnrichment.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useTomorrowPrep.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useTimetable.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useStudentGoals.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useSleepTracker.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useOrientationInference.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useMoodLogs.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useJoyJar.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useJourneyData.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useJournalEntries.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useGratitude.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useFireJournal.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useFeatureActivity.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useEnergyForecast.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useDecisionJournal.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/hooks/useCommunityPresence.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/WisdomSeeds.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/VoiceJournaling.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/SleepTracker.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/ResonancePatternCard.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/ResonancePatternCard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/PulseDashboard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/JoyJar.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/ImpactRipplesCard.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/ImpactRipplesCard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/GratitudeGlimmers.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/FireJournal.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/EnergyForecast.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/DecisionJournalSection.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/BaseSelfView.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/BaseSelfView.types.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/BaseSelfView.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/archive/ShadowAgentDrawer.web.tsx → packages/ui/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/components/archive/ShadowAgentDrawer.tsx → packages/ui/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/api/wellbeingRepository.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/api/selfInsightsRepository.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/api/selfFeatureRepository.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/self/src/api/self.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/scanner-kit/src/qr/index.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/scanner-kit/src/index.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/scanner-kit/src/hooks/useQRDeepLink.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/types/index.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/screens/PublicProfileScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/screens/ProfileScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/screens/ProfileScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/navigation/ProfileNavigationContext.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/navigation/fullProfileParams.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/hooks/useSocialLinks.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/hooks/useSchoolPulse.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/hooks/useSchoolProfile.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/hooks/useProfileCompletion.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/hooks/useProfile.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/domains/profile/services.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/domains/profile/ports.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/config/profileSections.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/components/UserStatsCard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/components/SocialSanctuary.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/components/LivingJourneyPanel.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/components/InlineSocialLinkEditor.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/components/EditProfileModal.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/components/ContactLinktree.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/components/AddSocialLinkModal.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/api/social.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/api/profile.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/adapters/zenstack/profileRepository.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/adapters/supabase/profileRepository.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/people/src/staff.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/people/src/memberships.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/people/src/hooks/useStaffPresence.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/people/src/feedback.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/people/src/directory.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/people/src/components/TeacherAdminWidget.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/types/Library.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/screens/ResourceHubScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/screens/MapScreen.web.tsx → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/screens/MapScreen.tsx → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/screens/MapScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/screens/LibraryScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/screens/LibraryScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/screens/CuratorReviewScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/hooks/useTopologyPulse.ts → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/hooks/usePerspectiveLayout.ts → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/hooks/useMappingSync.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/components/ResourceRow.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/components/ResourceList.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/components/modals/StudentAnalysisModal.tsx → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/components/modals/StudentAnalysisModal.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/components/LibraryThumbnailCard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/library/src/api/library.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/form-builder/src/screens/PublicFormScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/form-builder/src/screens/ClimateSensingScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/form-builder/src/screens/ClimateSensingScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/form-builder/src/NativeForm.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/form-builder/src/FormBuilder.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/form-builder/src/DynamicFormDemo.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/community/src/screens/GroupChatScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/community/src/screens/DirectMessageScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/community/src/screens/communityWorkspace.shared.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/community/src/screens/CommunityScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/community/src/api/community.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/workspace/useTeacherWorkspaceShell.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/workspace/useStudentWorkspaceCanvas.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/workspace/useStudentClassroomWorkspaceData.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/workspace/useClassroomWorkspaceSurfaces.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/workspace/useClassroomWorkspaceLayout.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/workspace/ClassroomWorkspaceCanvas.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/types/workspace.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/TimetableScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/TeacherDashboard.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/TeacherDashboard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/TeacherClassroomDashboard.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/TeacherClassroomDashboard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/StudentProfileScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/StudentDashboard.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/StudentDashboard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/StudentClassroomDashboard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/NoSchoolView.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/LessonFeed.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/GradebookScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/ContentLibrary.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/ClassroomScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/ClassroomScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/AttendanceScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/AttendanceScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/screens/AttendanceReportScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/hooks/useTeacherDashboardHooks.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/hooks/useStudentDashboardHooks.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/hooks/useSchoolStats.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/hooks/useResources.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/hooks/useInventory.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/hooks/useGradebook.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/hooks/useEcosystemStats.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/hooks/useClassroomRoleData.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/hooks/useClassroomProfile.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/hooks/useAttendance.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/teacher/TeacherWorkspaceShell.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/teacher/TeacherObservationsWorkspace.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/teacher/TeacherAnalysisWorkspace.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/SubmissionModal.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/SubmissionModal.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/StudentList.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/student/StudentProgressOverview.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/ResourcesView.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/QuickAnalytics.tsx → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/poa/TeacherPrimaryActions.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/poa/TeacherEchoActions.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/poa/TeacherActions.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/InventoryView.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/GradebookView.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/GlobalCreateModal.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/CreateClassroomModal.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/ClassroomNotes.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/ClassroomList.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/ClassroomHolisticInsights.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/BulkStudentCreation.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/AttendanceView.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/AttendanceSheet.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/components/AddStudentModal.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/classroom/src/analytics.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/index.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/index.js → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/index.d.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/hooks/useAnalytics.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/hooks/useAnalytics.js → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/hooks/queries.js → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/engine/GPACalculator.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/engine/GPACalculator.d.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/components/PerformanceDashboard.tsx → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/components/PerformanceDashboard.js → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/components/AnalyticsChart.tsx → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/analytics/src/components/AnalyticsChart.js → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/ai/src/screens/AIAssistantScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/ai/src/screens/AIAssistantScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/ai/src/hooks/useAIAgent.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/structure.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/staff.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/SchoolForestScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/PrincipalNativeWorkspace.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/PrincipalDashboard.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/PrincipalDashboard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/principal/StudentPulse.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/principal/PendingApprovals.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/principal/DashboardContent.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/GuardianDashboard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/guardian/GuardianStudentsScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/guardian/GuardianStudentDetailScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/FounderSchoolDashboard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/FounderDashboard.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/FounderDashboard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/DocumentListScreen.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/DocumentListScreen.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/AdminReleaseControl.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/AdminFeatureRegistry.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/AdminDashboard.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/AdminAuthorityRepair.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/screens/AcademicCycleManager.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/reporting.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/principal/usePrincipalWorkspaceCanvas.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/notes.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/invites.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/inventory.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/insights.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/hooks/useStaffPresence.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/hooks/useSchoolStats.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/hooks/useDashboardHooks.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/guardian/useGuardianWorkspaceCanvas.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/founder/useFounderWorkspaceCanvas.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/document-workflow/api.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/school/StepLocation.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/school/StepDemographics.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/school/CreateSchoolModal.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/principal/TeacherCarousel.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/principal/SchoolStats.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/principal/SchoolOverview.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/principal/PrincipalNotes.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/principal/PrincipalGovernanceTimeline.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/principal/MorningSituationalBrief.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/principal/LeaveApprovalSection.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/principal/InviteManager.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/principal/InstitutionalCalendarSection.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/principal/HierarchyBuilder.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/founder/GlobalCreateModal.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/components/founder/GlobalCreateModal.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/calendar.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/bridge/PrincipalNativeDashboardShell.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/bridge/founderWorkspace.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/approvals.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/api/staff.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/analytics/engine.ts → packages/graphics/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/analytics/engine.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/admin/useAdminWorkspaceCanvas.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/admin/adminControl.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/admin/src/__tests__/analytics/engine.test.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/utils/LanguageUtils.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/types/navigation.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/shims/lk-edu-geo-web.js → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/providers/SanctuaryProvider.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/SelfStackNavigator.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/ProfileStackNavigator.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/PrincipalStackNavigator.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/PrincipalStackNavigator.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/LibraryStackNavigator.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/GuardianStackNavigator.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/GuardianStackNavigator.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/FounderStackNavigator.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/FounderStackNavigator.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/CommunityStackNavigator.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/CommunityStackNavigator.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/ClassroomStackNavigator.web.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/navigation/ClassroomStackNavigator.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/lib/inngestEvents.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/components/school/StepLocation.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/components/school/StepDemographics.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/__tests__/architecture/profile-poa-enforcement.test.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/src/__tests__/architecture/poa_enforcement.test.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-mobile/App.tsx → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/pages/api/durable-agents/teacher-summary.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/pages/api/durable-agents/student-support.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/lib/inngestEvents.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/lib/durableAgents/durableAgentRuns.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/wellbeingHandlers.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/studentSupportHandlers.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/mutationHandlers.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/gradingHandlers.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/durableAgentHandlers.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/classroomHandlers.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: apps/gurudevi-marketingWeb/src/inngest/functions/attendanceHandlers.ts → packages/core/src/index.ts

x 348 dependency violations (0 errors, 348 warnings). 1833 modules, 5925 dependencies cruised.



--------------------------------------------------------------------------------

AUDIT SUMMARY
Duration: 12.0s
Findings: 349
Log File: reports/architecture.txt

--------------------------------------------------------------------------------


✅ All hygiene checks passed!

```
