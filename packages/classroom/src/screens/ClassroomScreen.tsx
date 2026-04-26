import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { FeatureGuard, useFeatureAccess, usePermissions, useStore } from '@repo/core';
import {
  Box,
  GlobalHeader,
  hapticLight,
  PositiveInvitation,
  ScreenWrapper,
  SkeletonCard,
  VStack,
} from '@repo/ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClaimInviteModal, ClassroomList, CreateClassroomModal } from '../components';
import CreateSchoolModal from '../components/CreateSchoolModal';
import { useClassroomRoleData } from '../hooks';
import { ClassroomWorkspaceCanvas } from '../workspace/ClassroomWorkspaceCanvas';
import { useClassroomWorkspaceInsights } from '../workspace/useClassroomWorkspaceInsights';
import { useClassroomWorkspaceLayout } from '../workspace/useClassroomWorkspaceLayout';
import { useClassroomWorkspaceSurfaces } from '../workspace/useClassroomWorkspaceSurfaces';

export default function ClassroomScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { can } = usePermissions();
  const canForWorkspace = (action: string, subject: string, field?: string) =>
    can(action as any, subject as any, field);
  const { isGuest } = useFeatureAccess();
  const { schoolId: storeSchoolId, userId: storeUserId } = useStore((state) => ({
    schoolId: state.user?.school_id,
    userId: state.user?.id,
  }));
  const { setBreathingOpen } = useStore();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
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
    fetchRoleData();
  }, [storeSchoolId, storeUserId]);

  useFocusEffect(
    React.useCallback(() => {
      fetchRoleData();
    }, [fetchRoleData]),
  );

  const workspaceSurfaces = useClassroomWorkspaceSurfaces({
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
    navigation,
    surfaceInsights,
  });
  const {
    surfaces: arrangedWorkspaceSurfaces,
    layout,
    setSurfaceHidden,
    setSurfacePinned,
    setSurfaceZone,
  } = useClassroomWorkspaceLayout(classroomData?.userId, workspaceSurfaces);

  const renderContent = () => {
    if (loading && !classroomData) {
      return (
        <ScreenWrapper scroll={false} noTopInset={true}>
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
          <ScreenWrapper scroll={false} noTopInset={true}>
            <Box className="flex-1 p-4">
              <ClassroomWorkspaceCanvas
                layout={layout}
                surfaces={arrangedWorkspaceSurfaces}
                onToggleHidden={setSurfaceHidden}
                onTogglePinned={setSurfacePinned}
                onMoveToNextZone={setSurfaceZone}
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

    return (
      <FeatureGuard
        action="read"
        subject="ClassroomList"
        fallback={
          <ScreenWrapper scroll={false} noTopInset={true}>
            <Box className="flex-1 p-4 gap-6">
              <GlobalHeader
                title={t('classroom.welcome') || 'Welcome to Sanctuary'}
                subtitle={undefined}
              />
              <PositiveInvitation
                type="guest"
                onAction={() => {
                  hapticLight();
                  navigation.navigate('Auth' as never);
                }}
              />
            </Box>
          </ScreenWrapper>
        }
      >
        <ScreenWrapper scroll={false} noTopInset={true}>
          <Box className="flex-1 p-4 gap-6">
            <GlobalHeader
              title={t('classroom.journeyTitle') || 'Learning Journey'}
              subtitle={t('classroom.mySanctuary') || 'My Sanctuary'}
            />
            <ClassroomList
              refreshTrigger={refreshTrigger}
              onClassroomPress={(classroom) => {
                navigation.navigate(
                  'Classroom' as never,
                  {
                    screen: 'ClassroomDashboard',
                    params: { classroomId: classroom.id, classroomName: classroom.name },
                  } as never,
                );
              }}
            />
          </Box>
        </ScreenWrapper>
      </FeatureGuard>
    );
  };

  return renderContent();
}
