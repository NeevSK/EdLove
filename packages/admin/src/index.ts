import { approvalsAPI } from './approvals';
import { adminCalendarAPI } from './calendar';
import { governanceAPI } from './governance';
import { adminInventoryAPI } from './inventory';
import { insightsAPI } from './insights';
import { invitesAPI } from './invites';
import { notesAPI } from './notes';
import { observationsAPI } from './observations';
import { documentsAPI, reportingAPI } from './reporting';
import { sectionsAPI } from './sections';
import { structureAPI } from './structure';
import { documentWorkflowAPI } from './document-workflow/api';
import { guardianAPI } from './guardian/api';
import { multiTenantAnalyticsAPI } from './analytics/api';
import { multiTenantAnalyticsEngine } from './analytics/engine';
import type { TenantMetrics, LiveMetrics, CustomReportConfig } from './analytics/types';

export * from './approvals';
export * from './calendar';
export * from './components';
export * from './governance';
export * from './inventory';
export * from './insights';
export * from './invites';
export * from './notes';
export * from './observations';
export * from './screens/PrincipalNativeWorkspace';
export * from './reporting';
export { default as SchoolForestScreen } from './screens/SchoolForestScreen.web';
export { default as SchoolProfileScreen } from './screens/SchoolProfileScreen.web';
export { default as DocumentListScreen } from './screens/DocumentListScreen';
export { default as DocumentListScreenWeb } from './screens/DocumentListScreen.web';
export { GuardianDashboardScreen as default } from './screens/GuardianDashboardScreen';
export { default as AnalyticsDashboardScreen } from './screens/AnalyticsDashboardScreen';
export { default as FounderDashboard } from './screens/FounderDashboard';
export { default as FounderDashboardWeb } from './screens/FounderDashboard.web';
export { default as FounderSchoolDashboard } from './screens/FounderSchoolDashboard';
export { default as AdminDashboard } from './screens/AdminDashboard';
export { default as AdminDashboardWeb } from './screens/AdminDashboard.web';
export { default as AdminIncidentQueue } from './screens/AdminIncidentQueue';
export { default as AdminTenantDetail } from './screens/AdminTenantDetail';
export { default as AdminAuthorityRepair } from './screens/AdminAuthorityRepair';
export { default as AdminJobControl } from './screens/AdminJobControl';
export { default as AdminAuditLog } from './screens/AdminAuditLog';
export { default as AdminReleaseControl } from './screens/AdminReleaseControl';
export {
  PrincipalDashboard,
  PrincipalDashboardWeb,
  PrincipalNativeWorkspace,
  PrincipalWorkspaceContainer,
  SectionHeadDashboard,
  GradeHeadDashboard,
  AcademicCycleManager} from './screens';
export { default as SchoolCreationScreen } from './screens/SchoolCreationScreen';
export * from './sections';
export * from './structure';
export * from './document-workflow/api';
export * from './document-workflow/types';
export * from './bridge/PrincipalNativeDashboardShell';
export * from './bridge/principalWorkspaceShell';
export * from './bridge/founderWorkspace';
export * from './guardian/api';
export * from './guardian/types';
export * from './guardian/useGuardianWorkspaceData';
export * from './analytics/api';
export * from './analytics/engine';
export * from './analytics/types';
export * from './principal/workspace';
export * from './principal/usePrincipalWorkspaceSurfaces';
export * from './screens';

export const adminAPI = {
  approvals: approvalsAPI,
  calendar: adminCalendarAPI,
  governance: governanceAPI,
  inventory: adminInventoryAPI,
  insights: insightsAPI,
  invites: invitesAPI,
  notes: notesAPI,
  observations: observationsAPI,
  sections: sectionsAPI,
  reporting: reportingAPI,
  documents: documentsAPI,
  structure: structureAPI};
