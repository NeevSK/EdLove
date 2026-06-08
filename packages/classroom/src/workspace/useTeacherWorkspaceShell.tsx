import type { NavigationProp } from '@react-navigation/native';
import { identityAPI } from '@repo/core/api';
import { useFeatureAccess } from '@repo/core/hooks';
import { useStore, useTemporalStore } from '@repo/core/logic';
import { FlowResolver } from '@repo/core/native';
import type { ClassroomStackParamList } from '@repo/core/types';

import { resolveQR } from '@repo/scanner-kit';
import { useRegisterFAB } from '@repo/ui/context/FABContext';
import { useSanctuaryToast } from '@repo/ui/hooks';
import { Plus } from '@repo/ui/icons';
import { Icon } from '@repo/ui/primitives';
import { hapticLight } from '@repo/ui/utils/haptics';

import { useCallback, useState } from 'react';

type WorkspaceClassroom = {
  id: string;
  name: string;
  student_count?: number | null;
};

export function useTeacherWorkspaceShell(
  navigation: NavigationProp<ClassroomStackParamList>,
  _onRefresh?: () => void,
) {
  const { isDemoMode } = useStore();
  const { isGuest } = useFeatureAccess();
  const { showToast } = useSanctuaryToast();
  const { isPastView } = useTemporalStore();

  const [uiState, setUiState] = useState({
    isCreateModalOpen: false,
    isFeedbackModalOpen: false,
    isAdminModalOpen: false,
    isBreathingOpen: false,
    showEchoHistory: false,
    isScannerOpen: false,
    modalMode: 'create' as 'create' | 'join',
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [classrooms, setClassrooms] = useState<WorkspaceClassroom[]>([]);
  const [stats, setStats] = useState({
    activeClasses: 0,
    totalStudents: 0,
  });

  const setIsScannerOpen = useCallback((value: boolean) => {
    setUiState((prev) => ({ ...prev, isScannerOpen: value }));
  }, []);

  useRegisterFAB({
    tabType: 'classroom',
    onPress: () => {
      setUiState((prev) => ({ ...prev, modalMode: 'create', isCreateModalOpen: true }));
    },
    icon: <Icon as={Plus} size={24} color="#FFF" />,
    visible: !isGuest && !isPastView,
  });

  const openCreateFlow = useCallback((mode: 'create' | 'join') => {
    setUiState((prev) => ({ ...prev, modalMode: mode, isCreateModalOpen: true }));
  }, []);

  const bumpRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const handleClassroomsLoaded = useCallback((loadedClassrooms: WorkspaceClassroom[]) => {
    setClassrooms(loadedClassrooms);
    setStats({
      activeClasses: loadedClassrooms.length,
      totalStudents: loadedClassrooms.reduce((acc, curr) => acc + (curr.student_count || 0), 0),
    });
  }, []);

  const handleScan = useCallback(
    async (data: string) => {
      setIsScannerOpen(false);
      const result = resolveQR(data);

      if (!result.ok) {
        showToast({
          message: 'This QR code is not recognised by Gurudevi.',
          type: 'error',
        });
        return;
      }

      const { payload } = result;

      try {
        const internalUserId = await identityAPI.getMyInternalId();
        if (!internalUserId) return;

        if (payload.action === 'join_class') {
          const flowResult = await FlowResolver.resolveQR(payload, internalUserId);
          if (flowResult && flowResult.outcome === 'success') {
            bumpRefresh();
            showToast({ message: 'Joined classroom!', type: 'success' });
          } else {
            showToast({
              message: flowResult?.message || 'Could not join classroom.',
              type: 'error',
            });
          }
        } else if (payload.action === 'join_school') {
          showToast({
            message: 'Open the school join flow from the welcome screen.',
            type: 'info',
          });
        } else {
          showToast({
            message: `QR scanned. Action: ${payload.action}`,
            type: 'info',
          });
        }
      } catch (error) {
        console.error('Failed to handle QR', error);
        showToast({
          message: 'Could not process QR. Please try again.',
          type: 'error',
        });
      }
    },
    [bumpRefresh, showToast, setIsScannerOpen],
  );

  const handleAdminAction = useCallback(
    (action: string) => {
      if (action === 'Attendance' && classrooms.length > 0 && classrooms[0]) {
        setUiState((prev) => ({ ...prev, isAdminModalOpen: false }));
        navigation.navigate('Attendance', {
          classroomId: classrooms[0].id,
          classroomName: classrooms[0].name,
        });
      }
    },
    [classrooms, navigation],
  );

  return {
    isDemoMode,
    isGuest,
    isPastView,
    classrooms,
    stats,
    modalMode: uiState.modalMode,
    refreshTrigger,
    isCreateModalOpen: uiState.isCreateModalOpen,
    isFeedbackModalOpen: uiState.isFeedbackModalOpen,
    isAdminModalOpen: uiState.isAdminModalOpen,
    isBreathingOpen: uiState.isBreathingOpen,
    showEchoHistory: uiState.showEchoHistory,
    isScannerOpen: uiState.isScannerOpen,
    openCreateFlow,
    setIsCreateModalOpen: (value: boolean) =>
      setUiState((prev) => ({ ...prev, isCreateModalOpen: value })),
    setIsFeedbackModalOpen: (value: boolean) =>
      setUiState((prev) => ({ ...prev, isFeedbackModalOpen: value })),
    setIsAdminModalOpen: (value: boolean) =>
      setUiState((prev) => ({ ...prev, isAdminModalOpen: value })),
    setIsBreathingOpen: (value: boolean) =>
      setUiState((prev) => ({ ...prev, isBreathingOpen: value })),
    setShowEchoHistory: (value: boolean) =>
      setUiState((prev) => ({ ...prev, showEchoHistory: value })),
    setIsScannerOpen,
    handleClassroomsLoaded,
    handleScan,
    handleAdminAction,
    completeBreathingReset: () => {
      showToast({
        message: 'Well done. Take this peace into your next class.',
        type: 'success',
      });
      setUiState((prev) => ({ ...prev, isBreathingOpen: false }));
    },
    bumpRefresh,
    hapticLight,
  };
}
