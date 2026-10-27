import { useUIStore } from '@repo/core/store';
import { useAuthStore } from '@repo/core/store';
import { ClaimInviteModal, ClassroomList, CreateClassroomModal } from '@repo/classroom/components';
import CreateSchoolModal from '@repo/classroom/components/CreateSchoolModal';
import { useClassroomRoleData } from '@repo/classroom/hooks';
import { ClassroomWorkspaceCanvas } from '@repo/classroom/workspace/ClassroomWorkspaceCanvas';
import { useClassroomWorkspaceInsights } from '@repo/classroom/workspace/useClassroomWorkspaceInsights';
import { useClassroomWorkspaceLayout } from '@repo/classroom/workspace/useClassroomWorkspaceLayout';
import { useClassroomWorkspaceSurfaces } from '@repo/classroom/workspace/useClassroomWorkspaceSurfaces';
import { useIsGuest } from '@repo/core/hooks';
import { resolveWorkspaceAppearanceColor, usePermissions } from '@repo/core/logic';
import GlobalHeader from '@repo/ui/components/GlobalHeader';
import PositiveInvitation from '@repo/ui/components/PositiveInvitation';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { SkeletonCard } from '@repo/ui/components/SkeletonLoader';
import { Box, VStack } from '@repo/ui/primitives';
import { hapticLight } from '@repo/ui/utils/haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function ClassroomScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { can, context } = usePermissions();
  const canForWorkspace = (action: string, subject: string, _field?: string) =>
    can(action as Parameters<typeof can>[0], subject as Parameters<typeof can>[1]);
  const isGuest = useIsGuest();
  const storeSchoolId = useAuthStore(state => state.user?.school_id);
  const storeUserId = useAuthStore(state => state.user?.id);
  const setBreathingOpen = useUIStore(state => state.setBreathingOpen);
  const [refreshTrigger, _setRefreshTrigger] = useState(0);
  const { data: classroomData, loading, fetchRoleData } = useClassroomRoleData(refreshTrigger);
  const [isCreateSchoolOpen, setIsCreateSchoolOpen] = useState(false);
  const [isCreateClassroomOpen, setIsCreateClassroomOpen] = useState(false);
  const [isClaimInviteOpen, setIsClaimInviteOpen] = useState(false);
  const [isDemoModeTriggered, setIsDemoModeTriggered] = useState(false);
  const surfaceInsights = useClassroomWorkspaceInsights({
    userId: classroomData?.userId || storeUserId,
    schoolId: classroomData?.schoolId || storeSchoolId,
    can,
  });

  useEffect(() => {
    void fetchRoleData();
  }, [fetchRoleData]);

  useFocusEffect(
    React.useCallback(() => {
      void fetchRoleData();
    }, [fetchRoleData]),
  );

  const { surfaces: workspaceSurfaces, renderNudge } = useClassroomWorkspaceSurfaces({
    can: canForWorkspace,
    t,
    isGuest,
    classroomData,
    schoolIdToUse: classroomData?.schoolId || storeSchoolId,
    isDemoModeTriggered,
    setIsDemoModeTriggered,
    setIsCreateSchoolOpen,
    setIsCreateClassroomOpen,
    setIsClaimInviteOpen,
    setBreathingOpen,
    fetchRoleData,
    surfaceInsights,
    citizenship: context.citizenship || 'WANDERER',
    isPro: context.pricing_tier === 'PRO',
    userCapabilities: context.features || [],
  });
  const {
    surfaces: arrangedWorkspaceSurfaces,
    layout,
    setSurfaceHidden,
    setSurfacePinned,
    setSurfaceZone,
    setSurfaceOrder,
  } = useClassroomWorkspaceLayout(classroomData?.userId, workspaceSurfaces);

  const renderContent = () => {
    if (loading && !classroomData) {
      return (
        <ScreenWrapper
          backgroundColor={resolveWorkspaceAppearanceColor(layout?.appearance?.preset)}
          scroll={false}
          noTopInset={true}
        >
          <VStack className="gap-4 p-4">
            <SkeletonCard height={60} />
            <SkeletonCard height={200} />
            <SkeletonCard height={120} />
          </VStack>
        </ScreenWrapper>
      );
    }

    if (classroomData && arrangedWorkspaceSurfaces.length > 0) {
      return (
        <Box className="flex-1">
          <ScreenWrapper
            backgroundColor={resolveWorkspaceAppearanceColor(layout?.appearance?.preset)}
            scroll={false}
            noTopInset={true}
          >
            <Box className="flex-1 p-4">
              <ClassroomWorkspaceCanvas
                layout={layout}
                surfaces={arrangedWorkspaceSurfaces}
                onToggleHidden={setSurfaceHidden}
                onTogglePinned={setSurfacePinned}
                onMoveToNextZone={setSurfaceZone}
                onReorder={setSurfaceOrder}
                isGuest={isGuest}
                classroomData={classroomData}
                schoolIdToUse={classroomData?.schoolId || storeSchoolId}
                isDemoModeTriggered={isDemoModeTriggered}
                setIsDemoModeTriggered={setIsDemoModeTriggered}
                setIsCreateClassroomOpen={setIsCreateClassroomOpen}
                setIsClaimInviteOpen={setIsClaimInviteOpen}
                fetchRoleData={fetchRoleData}
                renderNudge={renderNudge}
                t={t}
              />
            </Box>
          </ScreenWrapper>
          <CreateSchoolModal
            isOpen={isCreateSchoolOpen}
            onClose={() => setIsCreateSchoolOpen(false)}
            onSuccess={() => {
              setIsCreateSchoolOpen(false);
              fetchRoleData();
            }}
          />
          <CreateClassroomModal
            isOpen={isCreateClassroomOpen}
            mode="create"
            onClose={() => setIsCreateClassroomOpen(false)}
            onSuccess={() => {
              setIsCreateClassroomOpen(false);
              fetchRoleData();
            }}
          />
          <ClaimInviteModal
            isOpen={isClaimInviteOpen}
            onClose={() => setIsClaimInviteOpen(false)}
            onSuccess={() => {
              setIsClaimInviteOpen(false);
              fetchRoleData();
            }}
          />
        </Box>
      );
    }

    if (!can('read', 'ClassroomList')) {
      return (
        <ScreenWrapper
          backgroundColor={resolveWorkspaceAppearanceColor(layout?.appearance?.preset)}
          scroll={false}
          noTopInset={true}
        >
          <Box className="flex-1 p-4 gap-6">
            <GlobalHeader
              title={t('classroom.welcome') || 'Welcome to Sanctuary'}
              subtitle={undefined}
            />
            <PositiveInvitation
              type="anonymous"
              onAction={() => {
                hapticLight();
                router.push('/auth');
              }}
            />
          </Box>
        </ScreenWrapper>
      );
    }

    return (
      <ScreenWrapper
        backgroundColor={resolveWorkspaceAppearanceColor(layout?.appearance?.preset)}
        scroll={false}
        noTopInset={true}
      >
        <Box className="flex-1 p-4 gap-6">
          <GlobalHeader
            title={t('classroom.journeyTitle') || 'Learning Journey'}
            subtitle={t('classroom.mySanctuary') || 'My Sanctuary'}
          />
          <ClassroomList
            refreshTrigger={refreshTrigger}
            onClassroomPress={(classroom) => {
              router.push({
                pathname: '/workspace',
                params: {
                  classroomId: classroom.id,
                  classroomName: classroom.name,
                },
              });
            }}
          />
        </Box>
      </ScreenWrapper>
    );
  };

  return renderContent();
}
