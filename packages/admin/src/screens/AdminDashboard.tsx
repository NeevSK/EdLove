import AdminAuditLog from '@repo/admin/screens/AdminAuditLog';
import AdminAuthorityRepair from '@repo/admin/screens/AdminAuthorityRepair';
import AdminIncidentQueue from '@repo/admin/screens/AdminIncidentQueue';
import AdminJobControl from '@repo/admin/screens/AdminJobControl';
import AdminReleaseControl from '@repo/admin/screens/AdminReleaseControl';
import AdminTenantDetail from '@repo/admin/screens/AdminTenantDetail';
import { useAuthStore } from '@repo/core/store';
import { useDomainRollout } from '@repo/core/hooks';
import { usePermissions } from '@repo/core/logic';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { Box, Text, VStack } from '@repo/ui/primitives';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  AdminWorkspaceCanvas,
  useAdminWorkspaceCanvasSurfaces,
  useAdminWorkspaceLayout,
} from '@repo/admin/admin/useAdminWorkspaceCanvas';
import { useAdminWorkspaceData } from '@repo/admin/admin/useAdminWorkspaceData';
import { resolveAdminWorkspaceView, type AdminWorkspaceView } from '@repo/admin/admin/workspace';

interface AdminDashboardProps {
  userId?: string | null;
}

export default function AdminDashboard({ userId }: AdminDashboardProps) {
  const router = useRouter();
  const { context, flags } = usePermissions();
  const isStaffManagementEnabled = useDomainRollout('staff-management');
  const currentUserId = useAuthStore(state => state.user?.id ?? null);
  const resolvedUserId = userId ?? currentUserId;
  const data = useAdminWorkspaceData();

  const [activeRoom, setActiveRoom] = useState<
    'incident_queue' | 'tenant_detail' | 'authority_repair' | 'job_control' | 'audit_log' | 'release_control' | null
  >(null);

  const surfaces = useAdminWorkspaceCanvasSurfaces({
    data,
    featureFlags: {
      isUnderMaintenance: flags.isUnderMaintenance,
    },
    onOpenIncidentQueue: () => setActiveRoom('incident_queue'),
    onOpenTenantDetail: () => setActiveRoom('tenant_detail'),
    onOpenAuthorityRepair: () => setActiveRoom('authority_repair'),
    onOpenJobControl: () => setActiveRoom('job_control'),
    onOpenAuditLog: () => setActiveRoom('audit_log'),
    onOpenReleaseControl: () => setActiveRoom('release_control'),
  });

  const workspace = useAdminWorkspaceLayout(resolvedUserId, surfaces);

  const isAdmin =
    (context.bonds ?? []).some((b) => b.capacity === 'admin' && b.status === 'active') ||
    context.hasGlobalAccess;

  if (!isAdmin) {
    return (
      <ScreenWrapper scroll={false}>
        <VStack className="flex-1 items-center justify-center gap-3 px-6">
          <Text className="text-lg font-bold text-phaseText-primary">Admin access required</Text>
          <Text className="text-center text-sm text-phaseText-secondary">
            This workspace is reserved for platform-system administrators.
          </Text>
        </VStack>
      </ScreenWrapper>
    );
  }

  if (activeRoom === 'incident_queue') {
    return <AdminIncidentQueue onBack={() => setActiveRoom(null)} />;
  }
  if (activeRoom === 'tenant_detail') {
    return <AdminTenantDetail onBack={() => setActiveRoom(null)} />;
  }
  if (activeRoom === 'authority_repair') {
    return <AdminAuthorityRepair onBack={() => setActiveRoom(null)} />;
  }
  if (activeRoom === 'job_control') {
    return <AdminJobControl onBack={() => setActiveRoom(null)} />;
  }
  if (activeRoom === 'audit_log') {
    return <AdminAuditLog onBack={() => setActiveRoom(null)} />;
  }
  if (activeRoom === 'release_control') {
    return <AdminReleaseControl onBack={() => setActiveRoom(null)} />;
  }

  return (
    <ScreenWrapper scroll={false} noTopInset>
      <Box className="flex-1 bg-phase-canvas">
        <Box className="border-b border-phase-canvas px-4 py-3">
          <VStack className="gap-1">
            <Text className="text-sm font-bold text-phaseText-primary">
              {data.isLoading
                ? 'Loading platform signal...'
                : `${data.schoolCount} schools, ${data.userCount} users, ${data.pendingApprovalCount} approvals, ${data.incidentCount} incident signals`}
            </Text>
            <Text className="text-xs text-phaseText-secondary">
              {data.error
                ? data.error
                : 'Global operator view for live platform stewardship, dogfood maintenance, and cross-tenant repair.'}
            </Text>
          </VStack>
        </Box>
        <AdminWorkspaceCanvas
          layout={workspace.layout}
          surfaces={workspace.surfaces}
          onToggleHidden={workspace.setSurfaceHidden}
          onTogglePinned={workspace.setSurfacePinned}
          onMoveToNextZone={workspace.setSurfaceZone}
          onOpenSurface={(surface) => {
            const view = resolveAdminWorkspaceView(surface.capabilityKey);
            if (
              view === 'incident_queue' ||
              view === 'tenant_detail' ||
              view === 'authority_repair' ||
              view === 'job_control' ||
              view === 'audit_log' ||
              view === 'release_control'
            ) {
              setActiveRoom(view);
              return;
            }
          }}
        />
      </Box>
    </ScreenWrapper>
  );
}
