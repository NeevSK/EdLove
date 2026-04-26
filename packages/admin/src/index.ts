import { multiTenantAnalyticsAPI } from './analytics/api';
import { multiTenantAnalyticsEngine } from './analytics/engine';
import type { CustomReportConfig, LiveMetrics, TenantMetrics } from './analytics/types';
import { approvalsAPI } from './approvals';
import { adminCalendarAPI } from './calendar';
import { documentWorkflowAPI } from './document-workflow/api';
import { governanceAPI } from './governance';
import { guardianAPI } from './guardian/api';
import { insightsAPI } from './insights';
import { adminInventoryAPI } from './inventory';
import { invitesAPI } from './invites';
import { notesAPI } from './notes';
import { observationsAPI } from './observations';
import { documentsAPI, reportingAPI } from './reporting';
import { sectionsAPI } from './sections';
import { structureAPI } from './structure';

export * from './admin/adminControl';
export * from './admin/adminRepository';
export * from './analytics/api';
export * from './analytics/engine';
export * from './analytics/types';
export * from './approvals';
export * from './bridge/founderWorkspace';
export * from './bridge/PrincipalNativeDashboardShell';
export * from './bridge/principalWorkspaceShell';
export * from './calendar';
export * from './components';
export * from './document-workflow/api';
export * from './document-workflow/types';
export * from './governance';
export * from './guardian/api';
export * from './guardian/types';
export * from './guardian/useGuardianWorkspaceData';
export * from './insights';
export * from './inventory';
export * from './invites';
export * from './notes';
export * from './observations';
export * from './principal/usePrincipalWorkspaceSurfaces';
export * from './principal/workspace';
export * from './reporting';
export * from './screens';
export {
  AcademicCycleManager,
  GradeHeadDashboard,
  PrincipalDashboard,
  PrincipalDashboardWeb,
  PrincipalNativeWorkspace,
  PrincipalWorkspaceContainer,
  SectionHeadDashboard,
} from './screens';
export { default as AdminAuditLog } from './screens/AdminAuditLog';
export { default as AdminAuthorityRepair } from './screens/AdminAuthorityRepair';
export { default as AdminDashboard } from './screens/AdminDashboard';
export { default as AdminDashboardWeb } from './screens/AdminDashboard.web';
export { default as AdminFeatureRegistry } from './screens/AdminFeatureRegistry';
export { default as AdminIncidentQueue } from './screens/AdminIncidentQueue';
export { default as AdminJobControl } from './screens/AdminJobControl';
export { default as AdminReleaseControl } from './screens/AdminReleaseControl';
export { default as AdminTenantDetail } from './screens/AdminTenantDetail';
export { default as AnalyticsDashboardScreen } from './screens/AnalyticsDashboardScreen';
export { default as DocumentListScreen } from './screens/DocumentListScreen';
export { default as DocumentListScreenWeb } from './screens/DocumentListScreen.web';
export { default as FounderDashboard } from './screens/FounderDashboard';
export { default as FounderDashboardWeb } from './screens/FounderDashboard.web';
export { default as FounderSchoolDashboard } from './screens/FounderSchoolDashboard';
export { GuardianDashboardScreen as default } from './screens/GuardianDashboardScreen';
export * from './screens/PrincipalNativeWorkspace';
export { default as SchoolCreationScreen } from './screens/SchoolCreationScreen';
export { default as SchoolForestScreen } from './screens/SchoolForestScreen.web';
export { default as SchoolProfileScreen } from './screens/SchoolProfileScreen.web';
export * from './sections';
export * from './structure';

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
  structure: structureAPI,
};
