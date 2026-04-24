export type AdminWorkspaceView =
  | 'main'
  | 'admin_registry'
  | 'incident_queue'
  | 'tenant_detail'
  | 'authority_repair'
  | 'job_control'
  | 'audit_log'
  | 'release_control';

export type AdminZoneId = 'today' | 'work' | 'institution' | 'outlook' | 'private';

export type AdminCapabilityId =
  | 'operator_brief'
  | 'admin_registry'
  | 'incident_queue'
  | 'tenant_health'
  | 'support_triage'
  | 'authority_integrity'
  | 'workspace_integrity'
  | 'tenant_directory'
  | 'operator_actions'
  | 'platform_metrics'
  | 'release_watch'
  | 'audit_trail';

export interface AdminCapabilityMeta {
  id: AdminCapabilityId;
  title: string;
  description: string;
  zone: AdminZoneId;
  status: 'live' | 'planned' | 'hidden';
  workspaceView?: AdminWorkspaceView;
}

const CAPABILITIES: Record<AdminCapabilityId, AdminCapabilityMeta> = {
  operator_brief: {
    id: 'operator_brief',
    title: 'Operator Brief',
    description: 'A daily cross-tenant read on incidents, approvals, maintenance pressure, and dogfood signals that need attention now.',
    zone: 'today',
    status: 'live',
  },
  admin_registry: {
    id: 'admin_registry',
    title: 'Admin Registry',
    description: 'A living registry of admin capabilities, feature gates, and maintenance posture across the platform.',
    zone: 'work',
    status: 'live',
    workspaceView: 'admin_registry',
  },
  incident_queue: {
    id: 'incident_queue',
    title: 'Incident Queue',
    description: 'Open production incidents, regressions, and support escalations that need triage or escalation.',
    zone: 'today',
    status: 'live',
    workspaceView: 'incident_queue',
  },
  tenant_health: {
    id: 'tenant_health',
    title: 'Tenant Health',
    description: 'Cross-tenant health summaries for auth, sync, onboarding, and operational continuity.',
    zone: 'today',
    status: 'live',
  },
  support_triage: {
    id: 'support_triage',
    title: 'Support Triage',
    description: 'Cases that need classification, owner assignment, and follow-up.',
    zone: 'work',
    status: 'live',
  },
  authority_integrity: {
    id: 'authority_integrity',
    title: 'Authority Integrity',
    description: 'Role assignment and POA anomalies that could expose the wrong workspace or block access across tenants.',
    zone: 'work',
    status: 'live',
    workspaceView: 'authority_repair',
  },
  workspace_integrity: {
    id: 'workspace_integrity',
    title: 'Workspace Integrity',
    description: 'Layout-sync and canvas drift checks for demo, web, and native parity across the platform.',
    zone: 'work',
    status: 'live',
  },
  tenant_directory: {
    id: 'tenant_directory',
    title: 'Tenant Directory',
    description: 'Searchable school and tenancy registry for support, governance, and lifecycle handling.',
    zone: 'institution',
    status: 'live',
    workspaceView: 'tenant_detail',
  },
  operator_actions: {
    id: 'operator_actions',
    title: 'Operator Actions',
    description: 'Guarded interventions such as retries, resyncs, repairs, and other remediation tasks with explicit accountability.',
    zone: 'institution',
    status: 'live',
    workspaceView: 'job_control',
  },
  platform_metrics: {
    id: 'platform_metrics',
    title: 'Platform Metrics',
    description: 'Daily and weekly platform signal: usage, adoption, error pressure, and operator load.',
    zone: 'outlook',
    status: 'live',
  },
  release_watch: {
    id: 'release_watch',
    title: 'Release Watch',
    description: 'Deploy posture, migrations, and feature-flag watchpoints for platform changes.',
    zone: 'outlook',
    status: 'live',
    workspaceView: 'release_control',
  },
  audit_trail: {
    id: 'audit_trail',
    title: 'Audit Trail',
    description: 'A private log of interventions, approvals, and operator decisions for accountability and postmortems.',
    zone: 'private',
    status: 'live',
    workspaceView: 'audit_log',
  },
};

export function getAdminCapabilityMeta(capabilityId: string): AdminCapabilityMeta | undefined {
  return CAPABILITIES[capabilityId as AdminCapabilityId];
}

export function resolveAdminWorkspaceView(capabilityId: string): AdminWorkspaceView {
  return getAdminCapabilityMeta(capabilityId)?.workspaceView ?? 'main';
}
