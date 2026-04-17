import React, { useMemo } from 'react';
import {
  Box,
  HStack,
  Pressable,
  Text,
  VStack,
  WorkspaceCanvas,
  type WorkspaceSurfaceDefinition,
} from '@repo/ui';
import {
  type ResolvedWorkspaceSurface,
  type WorkspaceZoneId,
  useWorkspaceLayoutSync,
  WORKSPACE_CANVAS_ZONES,
} from '@repo/core';
import { AlertTriangle, Database, ShieldCheck, GitBranch, Search, RefreshCw } from 'lucide-react-native';
import { getAdminCapabilityMeta, type AdminCapabilityId } from './workspace';

export type AdminWorkspaceSurfaceId =
  | 'operator_brief'
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

export type AdminWorkspaceSurface = WorkspaceSurfaceDefinition<AdminWorkspaceSurfaceId, AdminCapabilityId> & {
  title: string;
  subtitle?: string;
  summary?: string;
  snapshot?: string;
  temporalLabel?: string;
  temporalTone?: 'present' | 'past' | 'future' | 'neutral';
  metadata?: string[];
  content: React.ReactNode;
};

type AdminResolvedSurface = AdminWorkspaceSurface & ResolvedWorkspaceSurface<AdminWorkspaceSurfaceId, AdminCapabilityId>;

const getNextZone = (zone: WorkspaceZoneId): WorkspaceZoneId => {
  const index = WORKSPACE_CANVAS_ZONES.indexOf(zone);
  return WORKSPACE_CANVAS_ZONES[(index + 1) % WORKSPACE_CANVAS_ZONES.length] as WorkspaceZoneId;
};

function SurfaceLauncher({
  icon: Icon,
  title,
  description,
  actionLabel,
  onPress,
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  title: string;
  description: string;
  actionLabel: string;
  onPress: () => void;
}) {
  return (
    <VStack className="gap-4">
      <HStack className="items-center gap-3">
        <Box className="h-10 w-10 items-center justify-center rounded-xl bg-phase-warning/10">
          <Icon size={18} color="#2A2318" />
        </Box>
        <VStack className="flex-1 gap-0.5">
          <Text className="text-[15px] font-bold text-phaseText-primary">{title}</Text>
          <Text className="text-[12px] text-phaseText-secondary">{description}</Text>
        </VStack>
      </HStack>
      <Pressable onPress={onPress} className="self-start rounded-full border border-starlightGray/30 bg-phase-primary px-4 py-2 active:opacity-80">
        <Text className="text-[12px] font-bold text-white">{actionLabel}</Text>
      </Pressable>
    </VStack>
  );
}

function StatGrid({ items }: { items: Array<{ label: string; value: string }> }) {
  return (
    <HStack className="flex-wrap gap-3">
      {items.map((item) => (
        <Box key={item.label} className="min-w-[46%] flex-1 rounded-2xl border border-starlightGray/20 bg-silk p-4">
          <Text className="text-[11px] font-bold uppercase text-phaseText-secondary">{item.label}</Text>
          <Text className="mt-1 text-2xl font-bold text-phaseText-primary">{item.value}</Text>
        </Box>
      ))}
    </HStack>
  );
}

function createAdminSurface(
  surfaceId: AdminWorkspaceSurfaceId,
  config: Omit<AdminWorkspaceSurface, 'surfaceId' | 'workspaceId' | 'capabilityKey' | 'ownerPackage'>,
): AdminWorkspaceSurface {
  const meta = getAdminCapabilityMeta(surfaceId);

  return {
    surfaceId,
    workspaceId: 'admin-workspace',
    capabilityKey: surfaceId,
    ownerPackage: 'admin',
    defaultZone: config.defaultZone,
    defaultOrder: config.defaultOrder,
    hiddenByDefault: config.hiddenByDefault,
    mobileSupport: config.mobileSupport ?? true,
    webSupport: config.webSupport ?? true,
    title: config.title || meta?.title || surfaceId,
    subtitle: config.subtitle ?? meta?.title,
    summary: config.summary ?? meta?.description,
    snapshot: config.snapshot,
    temporalLabel: config.temporalLabel,
    temporalTone: config.temporalTone,
    metadata: config.metadata,
    content: config.content,
  };
}

export function useAdminWorkspaceCanvasSurfaces({
  onOpenIncidentQueue,
  onOpenTenantDetail,
  onOpenAuthorityRepair,
  onOpenJobControl,
  onOpenAuditLog,
  onOpenReleaseControl,
}: {
  onOpenIncidentQueue: () => void;
  onOpenTenantDetail: () => void;
  onOpenAuthorityRepair: () => void;
  onOpenJobControl: () => void;
  onOpenAuditLog: () => void;
  onOpenReleaseControl: () => void;
}) {
  return useMemo<AdminWorkspaceSurface[]>(
    () => [
      createAdminSurface('operator_brief', {
        defaultZone: 'today',
        defaultOrder: 10,
        subtitle: 'Platform operator pulse',
        summary: 'Daily platform signal: what is broken, what is slow, what is blocked, and what needs a controlled intervention now.',
        temporalLabel: 'Today',
        temporalTone: 'present',
        metadata: ['Platform', 'Operations'],
        content: <StatGrid items={[{ label: 'Incidents', value: '7 open' }, { label: 'Tenants at risk', value: '3 watch' }, { label: 'Escalations', value: '2 queued' }, { label: 'Actions ready', value: '5 safe' }]} />,
      }),
      createAdminSurface('incident_queue', {
        defaultZone: 'today',
        defaultOrder: 20,
        subtitle: 'Active incident queue',
        summary: 'Open production incidents and support escalations with the most urgent operator attention.',
        temporalLabel: 'Live',
        metadata: ['Read', 'Triage'],
        content: (
          <SurfaceLauncher
            icon={AlertTriangle}
            title="Incident queue"
            description="Triage outages, broken flows, and noisy regressions before they spread across tenants."
            actionLabel="Open incident room"
            onPress={onOpenIncidentQueue}
          />
        ),
      }),
      createAdminSurface('tenant_health', {
        defaultZone: 'today',
        defaultOrder: 30,
        subtitle: 'Tenant health watch',
        summary: 'Cross-tenant health summary for auth, sync, onboarding, and platform stability.',
        temporalLabel: 'Live',
        metadata: ['Tenancy', 'Health'],
        content: <StatGrid items={[{ label: 'Healthy tenants', value: '42' }, { label: 'Needs review', value: '6' }, { label: 'Sync drift', value: '2' }, { label: 'Auth failures', value: '1' }]} />,
      }),
      createAdminSurface('support_triage', {
        defaultZone: 'work',
        defaultOrder: 40,
        subtitle: 'Support routing',
        summary: 'Cases that need classification, owner assignment, and follow-up.',
        temporalLabel: 'Working',
        metadata: ['Support', 'Routing'],
        content: <StatGrid items={[{ label: 'New cases', value: '12' }, { label: 'Waiting on tenant', value: '4' }, { label: 'Need operator', value: '3' }, { label: 'Closed today', value: '9' }]} />,
      }),
      createAdminSurface('authority_integrity', {
        defaultZone: 'work',
        defaultOrder: 50,
        subtitle: 'Access integrity',
        summary: 'Role assignment and POA anomalies that could expose the wrong workspace or block access.',
        temporalLabel: 'Working',
        metadata: ['POA', 'Safety'],
        content: (
          <SurfaceLauncher
            icon={ShieldCheck}
            title="Authority integrity"
            description="Repair role scopes, mismatched authorizations, and cross-tenant access drift."
            actionLabel="Open repair room"
            onPress={onOpenAuthorityRepair}
          />
        ),
      }),
      createAdminSurface('workspace_integrity', {
        defaultZone: 'work',
        defaultOrder: 60,
        subtitle: 'Workspace parity',
        summary: 'Layout-sync and canvas drift checks for demo, web, and native parity across the platform.',
        temporalLabel: 'Working',
        metadata: ['Workspace', 'Parity'],
        content: <StatGrid items={[{ label: 'Layouts drifted', value: '4' }, { label: 'Demo overlap', value: '1' }, { label: 'Web parity gaps', value: '2' }, { label: 'Native parity', value: 'good' }]} />,
      }),
      createAdminSurface('tenant_directory', {
        defaultZone: 'institution',
        defaultOrder: 70,
        subtitle: 'Tenant registry',
        summary: 'Searchable school and tenancy registry for support, governance, and lifecycle handling.',
        temporalLabel: 'Reference',
        metadata: ['Directory', 'Tenants'],
        content: (
          <SurfaceLauncher
            icon={Search}
            title="Tenant directory"
            description="Jump into a specific school or tenant when the operator needs a deeper drill-in room."
            actionLabel="Open tenant room"
            onPress={onOpenTenantDetail}
          />
        ),
      }),
      createAdminSurface('operator_actions', {
        defaultZone: 'institution',
        defaultOrder: 80,
        subtitle: 'Guarded interventions',
        summary: 'Safe, auditable interventions such as retry, resync, repair, and other controlled remediation tasks.',
        temporalLabel: 'Controlled',
        metadata: ['Actions', 'Guarded'],
        content: (
          <SurfaceLauncher
            icon={RefreshCw}
            title="Operator actions"
            description="Use previews, confirmations, and audit trails before the workspace mutates anything live."
            actionLabel="Open action queue"
            onPress={onOpenJobControl}
          />
        ),
      }),
      createAdminSurface('platform_metrics', {
        defaultZone: 'outlook',
        defaultOrder: 90,
        subtitle: 'Platform metrics',
        summary: 'A weekly and monthly read on growth, adoption, error pressure, and operator load.',
        temporalLabel: 'Outlook',
        temporalTone: 'future',
        metadata: ['Metrics', 'Trend'],
        content: <StatGrid items={[{ label: 'DAU', value: '1.2k' }, { label: 'Active schools', value: '86' }, { label: 'Error trend', value: 'down' }, { label: 'Support load', value: 'steady' }]} />,
      }),
      createAdminSurface('release_watch', {
        defaultZone: 'outlook',
        defaultOrder: 100,
        subtitle: 'Release watch',
        summary: 'Deploy posture, migrations, and feature-flag watchpoints for platform changes.',
        temporalLabel: 'Outlook',
        temporalTone: 'future',
        metadata: ['Release', 'Watch'],
        content: (
          <SurfaceLauncher
            icon={GitBranch}
            title="Release watch"
            description="Monitor the next rollout, flag risky migrations, and confirm post-release health."
            actionLabel="Open release control"
            onPress={onOpenReleaseControl}
          />
        ),
      }),
      createAdminSurface('audit_trail', {
        defaultZone: 'private',
        defaultOrder: 110,
        hiddenByDefault: true,
        subtitle: 'Private accountability',
        summary: 'A private log of interventions, approvals, and operator decisions.',
        temporalLabel: 'Private',
        temporalTone: 'neutral',
        metadata: ['Audit', 'Private'],
        content: (
          <SurfaceLauncher
            icon={Database}
            title="Audit trail"
            description="Review your last controlled interventions before you change anything else."
            actionLabel="Open audit log"
            onPress={onOpenAuditLog}
          />
        ),
      }),
    ],
    [
      onOpenIncidentQueue,
      onOpenTenantDetail,
      onOpenAuthorityRepair,
      onOpenJobControl,
      onOpenAuditLog,
      onOpenReleaseControl,
    ],
  );
}

export function useAdminWorkspaceLayout(userId: string | null | undefined, surfaces: AdminWorkspaceSurface[]) {
  return useWorkspaceLayoutSync({
    workspaceId: 'admin-workspace',
    userId,
    surfaces,
  });
}

export function AdminWorkspaceCanvas({
  layout,
  surfaces,
  onToggleHidden,
  onTogglePinned,
  onMoveToNextZone,
  onOpenSurface,
}: {
  layout: ReturnType<typeof useAdminWorkspaceLayout>['layout'];
  surfaces: Array<AdminWorkspaceSurface & ResolvedWorkspaceSurface<AdminWorkspaceSurfaceId, AdminCapabilityId>>;
  onToggleHidden: (id: AdminWorkspaceSurfaceId, hidden: boolean) => void;
  onTogglePinned: (id: AdminWorkspaceSurfaceId, pinned: boolean) => void;
  onMoveToNextZone: (id: AdminWorkspaceSurfaceId, zone: WorkspaceZoneId) => void;
  onOpenSurface: (surface: AdminResolvedSurface) => void;
}) {
  if (!layout) return null;

  return (
    <WorkspaceCanvas
      surfaces={surfaces}
      layout={layout}
      title="Admin Workspace"
      subtitle="Global platform operations, guarded interventions, and live tenant stewardship."
      emptyMessage="No admin surfaces are available yet."
      renderSurfaceContent={(surface) => <Box className="flex-1">{(surface as AdminResolvedSurface).content}</Box>}
      getSurfaceTitle={(surface) => (surface as AdminResolvedSurface).title}
      getSurfaceSubtitle={(surface) => (surface as AdminResolvedSurface).subtitle}
      getSurfaceSummary={(surface) => (surface as AdminResolvedSurface).summary}
      getSurfaceSnapshot={(surface) => (surface as AdminResolvedSurface).snapshot}
      getSurfaceTemporalLabel={(surface) => (surface as AdminResolvedSurface).temporalLabel}
      getSurfaceTemporalTone={(surface) => (surface as AdminResolvedSurface).temporalTone}
      getSurfaceMetadata={(surface) => (surface as AdminResolvedSurface).metadata}
      onSurfacePress={(surface) => onOpenSurface(surface as AdminResolvedSurface)}
      renderSurfaceActions={(surface) => {
        const typedSurface = surface as AdminResolvedSurface;
        const nextZone = getNextZone(typedSurface.zone);
        const detailView = getAdminCapabilityMeta(typedSurface.surfaceId)?.workspaceView;

        return (
          <HStack className="flex-wrap gap-3">
            <Pressable onPress={() => onTogglePinned(typedSurface.surfaceId, !typedSurface.pinned)} className="active:opacity-80">
              <Box className="rounded-full border border-starlightGray/10 bg-phase-primary/5 px-4 py-2">
                <Text className="text-[12px] font-bold text-phaseText-primary">{typedSurface.pinned ? 'Unpin' : 'Pin'}</Text>
              </Box>
            </Pressable>
            <Pressable onPress={() => onMoveToNextZone(typedSurface.surfaceId, nextZone)} className="active:opacity-80">
              <Box className="rounded-full border border-starlightGray/10 bg-phase-primary/5 px-4 py-2">
                <Text className="text-[12px] font-bold text-phaseText-primary">Move to {nextZone}</Text>
              </Box>
            </Pressable>
            {detailView ? (
              <Pressable onPress={() => onOpenSurface(typedSurface)} className="active:opacity-80">
                <Box className="rounded-full bg-phase-warning px-4 py-2">
                  <Text className="text-[12px] font-bold text-phaseText-primary">Open room</Text>
                </Box>
              </Pressable>
            ) : null}
          </HStack>
        );
      }}
      onToggleHidden={(surface) => onToggleHidden(surface.surfaceId as AdminWorkspaceSurfaceId, !surface.hidden)}
    />
  );
}
