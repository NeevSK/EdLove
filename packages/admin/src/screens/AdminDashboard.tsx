import { useNavigation } from '@react-navigation/native';
import { usePermissions } from '@repo/core/logic';
import { useStore } from '@repo/core/logic';

import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { Box, Text, VStack } from '@repo/ui/primitives';
import {
  AdminWorkspaceCanvas,
  useAdminWorkspaceCanvasSurfaces,
  useAdminWorkspaceLayout,
} from '../admin/useAdminWorkspaceCanvas';
import { useAdminWorkspaceData } from '../admin/useAdminWorkspaceData';
import { resolveAdminWorkspaceView } from '../admin/workspace';

interface AdminDashboardProps {
  userId?: string | null;
}

export default function AdminDashboard({ userId }: AdminDashboardProps) {
  const navigation = useNavigation<any>();
  const { context, flags } = usePermissions();
  const currentUserId = useStore((state) => state.user?.id ?? null);
  const resolvedUserId = userId ?? currentUserId;
  const data = useAdminWorkspaceData();

  const surfaces = useAdminWorkspaceCanvasSurfaces({
    data,
    featureFlags: {
      isInventoryEnabled: flags.isInventoryEnabled,
      isStaffManagementEnabled: flags.isStaffManagementEnabled,
      isTemplateManagementEnabled: flags.isTemplateManagementEnabled,
      isAIAssistantEnabled: flags.isAIAssistantEnabled,
      isDevelopingWorkspace: flags.isDevelopingWorkspace,
      isDevelopingAI: flags.isDevelopingAI,
      isDevelopingAnalyticsDashboard: flags.isDevelopingAnalyticsDashboard,
      isDevelopingFormBuilder: flags.isDevelopingFormBuilder,
      isUnderMaintenance: flags.isUnderMaintenance,
    },
    onOpenIncidentQueue: () => navigation.navigate('AdminIncidentQueue' as never),
    onOpenTenantDetail: () => navigation.navigate('AdminTenantDetail' as never),
    onOpenAuthorityRepair: () => navigation.navigate('AdminAuthorityRepair' as never),
    onOpenJobControl: () => navigation.navigate('AdminJobControl' as never),
    onOpenAuditLog: () => navigation.navigate('AdminAuditLog' as never),
    onOpenReleaseControl: () => navigation.navigate('AdminReleaseControl' as never),
  });

  const workspace = useAdminWorkspaceLayout(resolvedUserId, surfaces);

  if (!context.hasGlobalAccess && !context.roles.includes('admin')) {
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
            if (view === 'admin_registry') {
              navigation.navigate('AdminFeatureRegistry' as never);
              return;
            }

            navigation.navigate(view as never);
          }}
        />
      </Box>
    </ScreenWrapper>
  );
}
