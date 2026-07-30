export type { FounderEcosystemStats } from '@repo/admin/bridge/founderWorkspace';
export {
  founderWorkspaceAPI,
  useFounderEcosystemStats,
  useFounderSchoolStats,
} from '@repo/admin/bridge/founderWorkspace';
export * from '@repo/admin/components';
// Constants & Hooks
export * from '@repo/admin/constants/adminRegistry';
export * from '@repo/admin/hooks';
export type { InviteCode } from '@repo/admin/invites';
export { invitesAPI } from '@repo/admin/invites';
export type { PrincipalObservation } from '@repo/admin/observations';
export { observationsAPI } from '@repo/admin/observations';
export type {
  DocumentTemplateDefinition,
  OperationalSnapshot,
  ReportDefinition,
  ReportingTenantFilter,
} from '@repo/admin/reporting';
export { documentsAPI, reportingAPI } from '@repo/admin/reporting';
export { default as FounderVisionScreen } from '@repo/admin/screens/FounderVisionScreen';
export { PrincipalNativeWorkspace } from '@repo/admin/screens/PrincipalNativeWorkspace';
export { default as SchoolProfileScreen } from '@repo/admin/screens/SchoolProfileScreen.web';
