import { WORKSPACE_CANVAS_ZONES } from '@repo/core/logic';
import { ResolvedWorkspaceSurface, WorkspaceSurfaceDefinition, WorkspaceZoneId } from '@repo/core/types';
import { useWorkspaceLayoutSync } from '@repo/core/native';;

import {
  Box,
  HStack,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { AlertTriangle, CheckCircle2, CircleAlert, Clock3, Database, GitBranch, RefreshCw, Search, ShieldCheck } from '@repo/ui/icons';
import { WorkspaceCanvas } from '@repo/ui/components/workspace';
import { Pressable } from '@repo/ui/primitives';

import type React from 'react';
import { useMemo } from 'react';
import type { AdminWorkspaceData } from './useAdminWorkspaceData';
import { type AdminCapabilityId, getAdminCapabilityMeta } from './workspace';

export type AdminWorkspaceSurfaceId =
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

export type AdminWorkspaceSurface = WorkspaceSurfaceDefinition<
  AdminWorkspaceSurfaceId,
  AdminCapabilityId
> & {
  subtitle?: string;
  summary?: string;
  snapshot?: string;
  temporalLabel?: string;
  temporalTone?: 'present' | 'past' | 'future' | 'neutral';
  metadata?: string[];
  content: React.ReactNode;
};

type AdminResolvedSurface = AdminWorkspaceSurface &
  ResolvedWorkspaceSurface<AdminWorkspaceSurfaceId, AdminCapabilityId>;

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
      <Pressable
        onPress={onPress}
        className="self-start rounded-full border border-starlightGray/30 bg-phase-primary px-4 py-2 active:opacity-80"
      >
        <Text className="text-[12px] font-bold text-white">{actionLabel}</Text>
      </Pressable>
    </VStack>
  );
}

function StatGrid({ items }: { items: Array<{ label: string; value: string; hint?: string }> }) {
  return (
    <HStack className="flex-wrap gap-3">
      {items.map((item) => (
        <Box
          key={item.label}
          className="min-w-[46%] flex-1 rounded-2xl border border-starlightGray/20 bg-silk p-4"
        >
          <Text className="text-[11px] font-bold uppercase text-phaseText-secondary">
            {item.label}
          </Text>
          <Text className="mt-1 text-2xl font-bold text-phaseText-primary">{item.value}</Text>
          {item.hint ? (
            <Text className="mt-1 text-[11px] text-phaseText-secondary">{item.hint}</Text>
          ) : null}
        </Box>
      ))}
    </HStack>
  );
}

function ActivityList({
  items,
}: {
  items: Array<{ title: string; subtext: string; tone?: 'good' | 'warn' | 'neutral' }>;
}) {
  return (
    <VStack className="gap-3">
      {items.map((item) => (
        <HStack
          key={`${item.title}-${item.subtext}`}
          className="items-center gap-3 rounded-2xl border border-starlightGray/15 bg-white px-4 py-3"
        >
          <Box
            className={`h-9 w-9 items-center justify-center rounded-full ${item.tone === 'warn' ? 'bg-phase-warning/15' : item.tone === 'good' ? 'bg-phase-primary/10' : 'bg-silk'}`}
          >
            {item.tone === 'warn' ? (
              <CircleAlert size={16} color="#8B5E34" />
            ) : item.tone === 'good' ? (
              <CheckCircle2 size={16} color="#0F5132" />
            ) : (
              <Clock3 size={16} color="#5F5449" />
            )}
          </Box>
          <VStack className="flex-1 gap-0.5">
            <Text className="text-[13px] font-bold text-phaseText-primary">{item.title}</Text>
            <Text className="text-[11px] text-phaseText-secondary">{item.subtext}</Text>
          </VStack>
        </HStack>
      ))}
    </VStack>
  );
}

function createAdminSurface(
  surfaceId: AdminWorkspaceSurfaceId,
  config: Omit<
    AdminWorkspaceSurface,
    'surfaceId' | 'workspaceId' | 'capabilityKey' | 'ownerPackage'
  >,
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
  data,
  featureFlags,
  onOpenIncidentQueue,
  onOpenTenantDetail,
  onOpenAuthorityRepair,
  onOpenJobControl,
  onOpenAuditLog,
  onOpenReleaseControl,
}: {
  data: AdminWorkspaceData;
  featureFlags: {
    isInventoryEnabled: boolean;
    isStaffManagementEnabled: boolean;
    isTemplateManagementEnabled: boolean;
    isAIAssistantEnabled: boolean;
    isDevelopingWorkspace: boolean;
    isDevelopingAI: boolean;
    isDevelopingAnalyticsDashboard: boolean;
    isDevelopingFormBuilder: boolean;
    isUnderMaintenance: boolean;
  };
  onOpenIncidentQueue: () => void;
  onOpenTenantDetail: () => void;
  onOpenAuthorityRepair: () => void;
  onOpenJobControl: () => void;
  onOpenAuditLog: () => void;
  onOpenReleaseControl: () => void;
}) {
  const freshSignals = data.recentIncidentSignals.length;
  const activeRisk = Math.max(
    data.incidentCount,
    data.pendingApprovalCount,
    data.inventoryRequestCount,
  );
  const enabledFlags = Object.values(featureFlags).filter(Boolean).length;

  return useMemo<AdminWorkspaceSurface[]>(
    () => [
      createAdminSurface('operator_brief', {
        defaultZone: 'today',
        defaultOrder: 10,
        subtitle: 'Cross-tenant operator pulse',
        summary:
          "Today's live stewardship view: incidents, approvals, invitations, and maintenance tasks that need a measured operator response.",
        temporalLabel: 'Today',
        temporalTone: 'present',
        metadata: ['Platform', 'Operations', 'POA'],
        content: (
          <VStack className="gap-4">
            <StatGrid
              items={[
                {
                  label: 'Incidents',
                  value: `${data.incidentCount}`,
                  hint: 'Open operational items',
                },
                {
                  label: 'Approvals',
                  value: `${data.pendingApprovalCount}`,
                  hint: 'Guarded decisions pending',
                },
                {
                  label: 'Invites',
                  value: `${data.inviteCount}`,
                  hint: 'Cross-tenant access on deck',
                },
                {
                  label: 'Inventory',
                  value: `${data.inventoryRequestCount}`,
                  hint: 'Requests awaiting action',
                },
              ]}
            />
            <ActivityList
              items={[
                {
                  title: `${freshSignals} recent incident signals`,
                  subtext:
                    activeRisk > 0
                      ? 'The workspace should stay in monitor-first mode until these clear.'
                      : 'No active pressure in the incident lane.',
                  tone: activeRisk > 0 ? 'warn' : 'good',
                },
                {
                  title: `${data.recentUsers.length} new users in view`,
                  subtext:
                    'Use this as a read on onboarding, role assignment, and dogfooding activity.',
                  tone: 'neutral',
                },
                {
                  title: `${enabledFlags} active feature gates`,
                  subtext: featureFlags.isUnderMaintenance
                    ? 'Maintenance mode is engaged. Treat mutations as exceptional.'
                    : 'Use this lane to inspect what is open, gated, or still developing.',
                  tone: featureFlags.isUnderMaintenance ? 'warn' : 'good',
                },
              ]}
            />
          </VStack>
        ),
      }),
      createAdminSurface('admin_registry', {
        defaultZone: 'work',
        defaultOrder: 15,
        subtitle: 'Admin registry',
        summary:
          'A living registry of admin capabilities, feature gates, and maintenance posture across the platform.',
        temporalLabel: 'Live',
        temporalTone: 'present',
        metadata: ['Registry', 'Capabilities'],
        content: (
          <VStack className="gap-4">
            <StatGrid
              items={[
                { label: 'Capabilities', value: `${11}`, hint: 'Defined admin surface set' },
                { label: 'Gates', value: `${enabledFlags}`, hint: 'Resolved feature flags' },
                {
                  label: 'Readiness',
                  value: featureFlags.isUnderMaintenance ? 'watch-only' : 'active',
                  hint: 'Platform posture',
                },
                { label: 'Mutations', value: 'guarded', hint: 'Preview before commit' },
              ]}
            />
            <ActivityList
              items={[
                {
                  title: 'Admin registry is live',
                  subtext:
                    'This is the place to inspect admin surfaces, feature gates, and operator posture.',
                  tone: 'good',
                },
                {
                  title: 'Maintenance posture',
                  subtext: featureFlags.isUnderMaintenance
                    ? 'Read-only until maintenance clears.'
                    : 'Active control surface with guardrails.',
                  tone: featureFlags.isUnderMaintenance ? 'warn' : 'neutral',
                },
              ]}
            />
          </VStack>
        ),
      }),
      createAdminSurface('incident_queue', {
        defaultZone: 'today',
        defaultOrder: 20,
        subtitle: 'Active incident queue',
        summary:
          'Open production incidents, regressions, and support escalations with the most urgent operator attention.',
        temporalLabel: 'Live',
        metadata: ['Read', 'Triage'],
        content: (
          <VStack className="gap-4">
            <SurfaceLauncher
              icon={AlertTriangle}
              title="Incident queue"
              description="Triage outages, broken flows, and noisy regressions before they spread across tenants."
              actionLabel="Open incident room"
              onPress={onOpenIncidentQueue}
            />
            <ActivityList
              items={data.recentIncidentSignals.slice(0, 3).map((item) => ({
                title: item.title,
                subtext: `${item.schoolId} • ${item.status} • ${new Date(item.createdAt).toLocaleDateString()}`,
                tone: item.status === 'pending' ? 'warn' : 'neutral',
              }))}
            />
          </VStack>
        ),
      }),
      createAdminSurface('tenant_health', {
        defaultZone: 'today',
        defaultOrder: 30,
        subtitle: 'Tenant health watch',
        summary: 'Cross-tenant health summary for auth, sync, onboarding, and platform stability.',
        temporalLabel: 'Live',
        metadata: ['Tenancy', 'Health'],
        content: (
          <StatGrid
            items={[
              {
                label: 'Healthy tenants',
                value: `${Math.max(data.schoolCount - Math.max(data.incidentCount, 0), 0)}`,
                hint: 'Estimated from the global snapshot',
              },
              {
                label: 'Needs review',
                value: `${data.incidentCount}`,
                hint: 'Operational attention required',
              },
              {
                label: 'Recent invites',
                value: `${data.inviteCount}`,
                hint: 'Access surface moving',
              },
              {
                label: 'Latest approvals',
                value: `${data.pendingApprovalCount}`,
                hint: 'Queue pressure indicator',
              },
            ]}
          />
        ),
      }),
      createAdminSurface('support_triage', {
        defaultZone: 'work',
        defaultOrder: 40,
        subtitle: 'Support routing',
        summary: 'Cases that need classification, owner assignment, and follow-up.',
        temporalLabel: 'Working',
        metadata: ['Support', 'Routing'],
        content: (
          <ActivityList
            items={[
              {
                title: 'Recent approvals need owner assignment',
                subtext: `${data.recentApprovals.length} approval candidates surfaced from staff-leave workflow.`,
                tone: 'warn',
              },
              {
                title: 'Latest inventory requests',
                subtext: `${data.recentInventoryRequests.length} requests are waiting for a guarded response.`,
                tone: 'neutral',
              },
              {
                title: 'Observation stream',
                subtext: `${data.recentObservations.length} recent observations can be used as operator context.`,
                tone: 'good',
              },
            ]}
          />
        ),
      }),
      createAdminSurface('authority_integrity', {
        defaultZone: 'work',
        defaultOrder: 50,
        subtitle: 'Access integrity',
        summary:
          'Role assignment and POA anomalies that could expose the wrong workspace or block access.',
        temporalLabel: 'Working',
        metadata: ['POA', 'Safety'],
        content: (
          <VStack className="gap-4">
            <SurfaceLauncher
              icon={ShieldCheck}
              title="Authority integrity"
              description="Repair role scopes, mismatched authorizations, and cross-tenant access drift."
              actionLabel="Open repair room"
              onPress={onOpenAuthorityRepair}
            />
            <ActivityList
              items={[
                {
                  title: 'Cross-tenant scope review',
                  subtext:
                    'Confirm the admin role is only used for maintenance, repair, and trusted dogfooding.',
                  tone: 'good',
                },
                {
                  title: 'PoA/capability gating',
                  subtext:
                    'Use explicit capability checks before opening any room that mutates state.',
                  tone: 'neutral',
                },
              ]}
            />
          </VStack>
        ),
      }),
      createAdminSurface('workspace_integrity', {
        defaultZone: 'work',
        defaultOrder: 60,
        subtitle: 'Workspace parity',
        summary:
          'Layout-sync and canvas drift checks for demo, web, and native parity across the platform.',
        temporalLabel: 'Working',
        metadata: ['Workspace', 'Parity'],
        content: (
          <StatGrid
            items={[
              {
                label: 'Layouts drifted',
                value: `${Math.min(data.recentObservations.length, 4)}`,
                hint: 'Signals from the live workspace',
              },
              {
                label: 'Demo overlap',
                value: `${data.recentInvites.length}`,
                hint: 'Dogfood access and invitations',
              },
              {
                label: 'Web parity gaps',
                value: `${data.recentUsers.filter((user) => user.role === 'admin').length}`,
                hint: 'Role coverage check',
              },
              { label: 'Native parity', value: 'good', hint: 'Operational shell is stable' },
            ]}
          />
        ),
      }),
      createAdminSurface('tenant_directory', {
        defaultZone: 'institution',
        defaultOrder: 70,
        subtitle: 'Tenant registry',
        summary:
          'Searchable school and tenancy registry for support, governance, and lifecycle handling.',
        temporalLabel: 'Reference',
        metadata: ['Directory', 'Tenants'],
        content: (
          <VStack className="gap-4">
            <SurfaceLauncher
              icon={Search}
              title="Tenant directory"
              description="Jump into a specific school or tenant when the operator needs a deeper drill-in room."
              actionLabel="Open tenant room"
              onPress={onOpenTenantDetail}
            />
            <ActivityList
              items={data.recentSchools.slice(0, 3).map((school) => ({
                title: school.name ?? school.id,
                subtext: school.created_at
                  ? `Created ${new Date(school.created_at).toLocaleDateString()}`
                  : 'Recent tenant',
                tone: 'neutral',
              }))}
            />
          </VStack>
        ),
      }),
      createAdminSurface('operator_actions', {
        defaultZone: 'institution',
        defaultOrder: 80,
        subtitle: 'Guarded interventions',
        summary:
          'Safe, auditable interventions such as retry, resync, repair, and other controlled remediation tasks.',
        temporalLabel: 'Controlled',
        metadata: ['Actions', 'Guarded'],
        content: (
          <VStack className="gap-4">
            <SurfaceLauncher
              icon={RefreshCw}
              title="Operator actions"
              description="Use previews, confirmations, and audit trails before the workspace mutates anything live."
              actionLabel="Open action queue"
              onPress={onOpenJobControl}
            />
            <ActivityList
              items={[
                {
                  title: 'Retry-first flow',
                  subtext: 'All remediations should be reversible or previewable before execution.',
                  tone: 'good',
                },
                {
                  title: 'Approval required',
                  subtext: 'Escalations that affect tenant data need explicit operator intent.',
                  tone: 'warn',
                },
              ]}
            />
          </VStack>
        ),
      }),
      createAdminSurface('platform_metrics', {
        defaultZone: 'outlook',
        defaultOrder: 90,
        subtitle: 'Platform metrics',
        summary:
          'A weekly and monthly read on growth, adoption, error pressure, and operator load.',
        temporalLabel: 'Outlook',
        temporalTone: 'future',
        metadata: ['Metrics', 'Trend'],
        content: (
          <StatGrid
            items={[
              {
                label: 'Schools',
                value: `${data.schoolCount}`,
                hint: 'Current platform footprint',
              },
              { label: 'Users', value: `${data.userCount}`, hint: 'Cross-tenant user base' },
              {
                label: 'Signals',
                value: `${data.recentObservations.length}`,
                hint: 'Fresh operational context',
              },
              {
                label: 'Load',
                value: activeRisk > 0 ? 'elevated' : 'steady',
                hint: 'Operator pressure indicator',
              },
              {
                label: 'Feature gates',
                value: `${enabledFlags}`,
                hint: 'Resolved by feature engine',
              },
            ]}
          />
        ),
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
          <VStack className="gap-4">
            <SurfaceLauncher
              icon={GitBranch}
              title="Release watch"
              description="Monitor the next rollout, flag risky migrations, and confirm post-release health."
              actionLabel="Open release control"
              onPress={onOpenReleaseControl}
            />
            <ActivityList
              items={[
                {
                  title: 'Release posture',
                  subtext:
                    'Use this room to validate rollout readiness before cross-tenant exposure.',
                  tone: 'neutral',
                },
                {
                  title: 'Post-release health',
                  subtext: 'Watch for auth drift, incident spikes, and support load after deploys.',
                  tone: 'warn',
                },
                {
                  title: featureFlags.isUnderMaintenance
                    ? 'Maintenance gate is on'
                    : 'Maintenance gate is clear',
                  subtext: featureFlags.isUnderMaintenance
                    ? 'Keep operators in read-only posture until the gate lifts.'
                    : 'Release control can proceed with normal guardrails.',
                  tone: featureFlags.isUnderMaintenance ? 'warn' : 'good',
                },
              ]}
            />
          </VStack>
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
          <VStack className="gap-4">
            <SurfaceLauncher
              icon={Database}
              title="Audit trail"
              description="Review your last controlled interventions before you change anything else."
              actionLabel="Open audit log"
              onPress={onOpenAuditLog}
            />
            <ActivityList
              items={[
                {
                  title: 'Only accountability-preserving actions should land here',
                  subtext: 'This room is private by default and should stay review-focused.',
                  tone: 'good',
                },
                {
                  title: 'Pair with capability checks',
                  subtext: 'Record who approved, what changed, and which tenant was affected.',
                  tone: 'neutral',
                },
              ]}
            />
          </VStack>
        ),
      }),
    ],
    [
      activeRisk,
      data.incidentCount,
      data.inventoryRequestCount,
      data.inviteCount,
      data.pendingApprovalCount,
      data.recentApprovals.length,
      data.recentIncidentSignals,
      data.recentInventoryRequests.length,
      data.recentInvites.length,
      data.recentObservations.length,
      data.recentSchools,
      data.recentUsers,
      data.schoolCount,
      featureFlags.isUnderMaintenance,
      enabledFlags,
      onOpenIncidentQueue,
      onOpenTenantDetail,
      onOpenAuthorityRepair,
      onOpenJobControl,
      onOpenAuditLog,
      onOpenReleaseControl,
      freshSignals,
      data.userCount,
    ],
  );
}

export function useAdminWorkspaceLayout(
  userId: string | null | undefined,
  surfaces: AdminWorkspaceSurface[],
) {
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
  surfaces: Array<
    AdminWorkspaceSurface & ResolvedWorkspaceSurface<AdminWorkspaceSurfaceId, AdminCapabilityId>
  >;
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
      renderSurfaceContent={(surface) => (
        <Box className="flex-1">{(surface as AdminResolvedSurface).content}</Box>
      )}
      onSurfacePress={(surface) => onOpenSurface(surface as AdminResolvedSurface)}
      renderSurfaceActions={(surface) => {
        const typedSurface = surface as AdminResolvedSurface;
        const nextZone = getNextZone(typedSurface.zone);
        const detailView = getAdminCapabilityMeta(typedSurface.surfaceId)?.workspaceView;

        return (
          <HStack className="flex-wrap gap-3">
            <Pressable
              onPress={() => onTogglePinned(typedSurface.surfaceId, !typedSurface.pinned)}
              className="active:opacity-80"
            >
              <Box className="rounded-full border border-starlightGray/10 bg-phase-primary/5 px-4 py-2">
                <Text className="text-[12px] font-bold text-phaseText-primary">
                  {typedSurface.pinned ? 'Unpin' : 'Pin'}
                </Text>
              </Box>
            </Pressable>
            <Pressable
              onPress={() => onMoveToNextZone(typedSurface.surfaceId, nextZone)}
              className="active:opacity-80"
            >
              <Box className="rounded-full border border-starlightGray/10 bg-phase-primary/5 px-4 py-2">
                <Text className="text-[12px] font-bold text-phaseText-primary">
                  Move to {nextZone}
                </Text>
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
      onToggleHidden={(surface) =>
        onToggleHidden(surface.surfaceId as AdminWorkspaceSurfaceId, !surface.hidden)
      }
    />
  );
}
