export { founderWorkspaceAPI, useFounderEcosystemStats, useFounderSchoolStats } from './bridge/founderWorkspace';
export type { FounderEcosystemStats } from './bridge/founderWorkspace';
export { invitesAPI } from './invites';
export type { InviteCode } from './invites';
export { observationsAPI } from './observations';
export type { PrincipalObservation } from './observations';
export { documentsAPI, reportingAPI } from './reporting';
export type {
  DocumentTemplateDefinition,
  OperationalSnapshot,
  ReportDefinition,
  ReportingTenantFilter,
} from './reporting';

export { default as AdminAuditLog } from './screens/AdminAuditLog';
export { default as AdminAuthorityRepair } from './screens/AdminAuthorityRepair';
export { default as AdminDashboard } from './screens/AdminDashboard';
export { default as AdminIncidentQueue } from './screens/AdminIncidentQueue';
export { default as AdminJobControl } from './screens/AdminJobControl';
export { default as AdminReleaseControl } from './screens/AdminReleaseControl';
export { default as AdminTenantDetail } from './screens/AdminTenantDetail';
export { default as FounderDashboard } from './screens/FounderDashboard';
export { default as FounderDashboardWeb } from './screens/FounderDashboard.web';
export { default as FounderSchoolDashboard } from './screens/FounderSchoolDashboard';
export { default as FounderVisionScreen } from './screens/FounderVisionScreen';
export { default as GradeHeadDashboard } from './screens/GradeHeadDashboard';
export { default as GuardianDashboard } from './screens/GuardianDashboard';
export { default as PrincipalDashboard } from './screens/PrincipalDashboard';
export { default as PrincipalDashboardWeb } from './screens/PrincipalDashboard.web';
export { PrincipalNativeWorkspace } from './screens/PrincipalNativeWorkspace';
export { default as SchoolCreationScreen } from './screens/SchoolCreationScreen';
export { default as SchoolForestScreen } from './screens/SchoolForestScreen.web';
export { default as SchoolForestScreenWeb } from './screens/SchoolForestScreen.web';
export { default as SchoolProfileScreen } from './screens/SchoolProfileScreen.web';
export { default as SchoolProfileScreenWeb } from './screens/SchoolProfileScreen.web';
export { default as SectionHeadDashboard } from './screens/SectionHeadDashboard';

export { default as GuardianCommunicationBridgeScreen } from './screens/guardian/GuardianCommunicationBridgeScreen';
export { default as GuardianEventsScreen } from './screens/guardian/GuardianEventsScreen';
export { default as GuardianNotificationsScreen } from './screens/guardian/GuardianNotificationsScreen';
export { default as GuardianStudentDetailScreen } from './screens/guardian/GuardianStudentDetailScreen';
export { default as GuardianStudentsScreen } from './screens/guardian/GuardianStudentsScreen';

export { DashboardContent } from './screens/principal/DashboardContent';
