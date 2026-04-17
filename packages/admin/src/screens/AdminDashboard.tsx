import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { Box, ScreenWrapper, Text, VStack, useTheme } from '@repo/ui';
import { usePermissions, useStore } from '@repo/core';
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
  const { scene } = useTheme();
  const navigation = useNavigation<any>();
  const { context } = usePermissions();
  const currentUserId = useStore((state) => state.user?.id ?? null);
  const resolvedUserId = userId ?? currentUserId;
  const data = useAdminWorkspaceData();

  const surfaces = useAdminWorkspaceCanvasSurfaces({
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
      <Box className="flex-1" style={{ backgroundColor: scene.canvas.bg }}>
        <Box className="border-b border-starlightGray/10 px-4 py-3">
          <VStack className="gap-1">
            <Text className="text-sm font-bold text-phaseText-primary">
              {data.isLoading ? 'Loading platform signal...' : `${data.schoolCount} schools, ${data.userCount} users, ${data.pendingApprovalCount} approvals`}
            </Text>
            <Text className="text-xs text-phaseText-secondary">
              {data.error ? data.error : 'Global operator view for live platform stewardship.'}
            </Text>
          </VStack>
        </Box>
        <AdminWorkspaceCanvas
          layout={workspace.layout}
          surfaces={workspace.surfaces}
          onToggleHidden={workspace.setSurfaceHidden}
          onTogglePinned={workspace.setSurfacePinned}
          onMoveToNextZone={workspace.setSurfaceZone}
          onOpenSurface={(surface) => navigation.navigate(resolveAdminWorkspaceView(surface.capabilityKey) as never)}
        />
      </Box>
    </ScreenWrapper>
  );
}
