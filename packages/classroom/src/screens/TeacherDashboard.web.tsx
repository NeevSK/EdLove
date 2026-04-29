import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ClassroomStackParamList } from '@repo/core';
import { useWorkspaceLayoutSync } from '@repo/core/native';;

import {
  TeacherAdminPortalModal,
  TeacherEchoHistoryModal,
  TeacherFeedbackModal,
} from '@repo/people';
import { ScannerModal } from '@repo/scanner-kit';
import { BreathGuide } from '@repo/self';
import SandboxBanner from '@repo/ui/components/SandboxBanner';
import { useThemedColors } from '@repo/ui/hooks';
import { X } from '@repo/ui/icons';
import { Box } from '@repo/ui/primitives';
import { HStack, Heading, Icon, Modal, ModalBackdrop, ModalBody, ModalContent, ModalHeader } from '@repo/ui/primitives';
import { Pressable, ScrollView } from '@repo/ui/primitives';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CreateClassroomModal } from '../components';
import { TeacherWorkspaceShell } from '../components/teacher/TeacherWorkspaceShell';
import {
  type TeacherDashboardCapabilityKey,
  type TeacherDashboardSurface,
  type TeacherDashboardSurfaceId,
  useTeacherDashboardSurfaces,
} from '../workspace/useTeacherDashboardSurfaces';
import { useTeacherWorkspaceShell } from '../workspace/useTeacherWorkspaceShell';

interface TeacherDashboardProps {
  onRefresh?: () => void;
  schoolId?: string;
  userId?: string;
}

export default function TeacherDashboardWeb({
  onRefresh,
  schoolId,
  userId,
}: TeacherDashboardProps) {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<ClassroomStackParamList>>();
  const colors = useThemedColors();
  const {
    isDemoMode,
    stats,
    modalMode,
    refreshTrigger,
    isCreateModalOpen,
    isFeedbackModalOpen,
    isAdminModalOpen,
    isBreathingOpen,
    showEchoHistory,
    isPastView,
    isScannerOpen,
    openCreateFlow,
    setIsCreateModalOpen,
    setIsFeedbackModalOpen,
    setIsAdminModalOpen,
    setIsBreathingOpen,
    setShowEchoHistory,
    setIsScannerOpen,
    handleClassroomsLoaded,
    handleScan,
    handleAdminAction,
    completeBreathingReset,
    bumpRefresh,
    hapticLight,
    isGuest,
  } = useTeacherWorkspaceShell(navigation as any, onRefresh);

  const dashboardSurfaces = useTeacherDashboardSurfaces({
    colors,
    isDemoMode,
    isGuest,
    isPastView,
    stats,
    refreshTrigger,
    openCreateFlow,
    setIsScannerOpen,
    setIsAdminModalOpen,
    setIsFeedbackModalOpen,
    setShowEchoHistory,
    setIsBreathingOpen,
    onOpenLibrary: () => {
      navigation.getParent()?.navigate('Library' as never);
    },
    handleClassroomsLoaded,
    onOpenClassroom: (classroom: any) => {
      hapticLight();
      navigation.navigate('Classroom' as any, {
        screen: 'TeacherClassroomDashboard',
        params: {
          classroomId: classroom.id,
          classroomName: classroom.name,
        },
      });
    },
  });

  const { layout } = useWorkspaceLayoutSync<
    TeacherDashboardSurfaceId,
    TeacherDashboardCapabilityKey,
    TeacherDashboardSurface
  >({
    workspaceId: 'teacher-dashboard',
    userId: userId || 'teacher-dashboard-web-guest',
    surfaces: dashboardSurfaces,
    enableRemoteSync: false,
  });

  if (!layout) {
    return <Box className="flex-1 bg-phase-canvas" />;
  }

  return (
    <Box className="flex-1 bg-phase-canvas">
      {isDemoMode ? <SandboxBanner /> : null}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 24,
          gap: 24,
          paddingBottom: 80,
        }}
      >
        <Animated.View entering={FadeInDown.delay(50)}>
          <TeacherWorkspaceShell
            surfaces={dashboardSurfaces as any}
            layout={layout}
            title="Teacher Workspace"
            subtitle={t('classroom.dashboardIntro') || 'Lead the classroom with love and care.'}
            stats={stats}
            isDemoMode={isDemoMode}
          />
        </Animated.View>
      </ScrollView>

      <CreateClassroomModal
        isOpen={isCreateModalOpen}
        mode={modalMode}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={bumpRefresh}
      />

      <ScannerModal
        visible={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScan}
        title="Join Classroom"
        accentColor="#F59E0B"
      />

      <TeacherFeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        schoolId={schoolId || ''}
        teacherId={userId || ''}
      />

      <TeacherEchoHistoryModal
        visible={showEchoHistory}
        teacherId={userId || ''}
        onClose={() => setShowEchoHistory(false)}
      />

      <TeacherAdminPortalModal
        visible={isAdminModalOpen}
        title={t('teacher.admin.portal') || 'Administrative Portal'}
        onClose={() => setIsAdminModalOpen(false)}
        onAction={handleAdminAction}
      />

      <Modal isOpen={isBreathingOpen} onClose={() => setIsBreathingOpen(false)}>
        <ModalBackdrop />
        <ModalContent className="flex-1 bg-phase-canvas">
          <ModalHeader className="pt-12 pb-4 px-6 border-b border-phase-border">
            <HStack className="justify-between items-center w-full">
              <Heading size="md" className="text-phaseText-primary">
                {t('self.breathingReset') || 'Breathing Reset'}
              </Heading>
              <Pressable
                onPress={() => {
                  hapticLight();
                  setIsBreathingOpen(false);
                }}
                className="p-2 rounded-full bg-phase-surface border border-phase-border"
              >
                <Icon as={X} size="sm" className="text-phaseText-primary" />
              </Pressable>
            </HStack>
          </ModalHeader>
          <ModalBody>
            <ScrollView contentContainerStyle={{ flex: 1, justifyContent: 'center' }}>
              <BreathGuide onComplete={completeBreathingReset} />
            </ScrollView>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
