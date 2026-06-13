import { useWorkspaceLayoutSync } from '@repo/core/native';

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
import {
  AnimatedView,
  Box,
  Heading,
  HStack,
  Icon,
  Modal,
  Pressable,
  ScrollView,
} from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FadeInDown } from 'react-native-reanimated';
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

export default function TeacherDashboard({ onRefresh, schoolId, userId }: TeacherDashboardProps) {
  const { t } = useTranslation();
  const router = useRouter();
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
    isPastView,
  } = useTeacherWorkspaceShell(onRefresh);

  const dashboardSurfaces = useTeacherDashboardSurfaces({
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
      router.push('/library');
    },
    handleClassroomsLoaded,
    onOpenClassroom: (classroom) => {
      hapticLight();
      router.push({
        pathname: '/workspace',
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
    userId: userId || 'teacher-dashboard-guest',
    surfaces: dashboardSurfaces,
    enableRemoteSync: false,
  });

  if (!layout) {
    return <Box className="flex-1 bg-phase-surface" />;
  }

  return (
    <Box className="flex-1 bg-phase-surface">
      {isDemoMode ? <SandboxBanner /> : null}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 80,
        }}
      >
        <AnimatedView entering={FadeInDown.delay(50)}>
          <TeacherWorkspaceShell
            surfaces={dashboardSurfaces as any}
            layout={layout}
            title="Teacher Workspace"
            subtitle={t('classroom.dashboardIntro') || 'Lead the classroom with love and care.'}
            stats={stats}
            isDemoMode={isDemoMode}
          />
        </AnimatedView>
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
        accentColor={Theme.colors.sanctuarySaffron}
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
        <Box className="flex-1 bg-phase-surface">
          <Box className="pt-[50px] pb-md px-md border-b border-phase-border">
            <HStack className="justify-between items-center">
              <Heading size="lg" className="text-phaseText-primary">
                {t('self.breathingReset') || 'Breathing Reset'}
              </Heading>
              <Pressable
                onPress={() => {
                  hapticLight();
                  setIsBreathingOpen(false);
                }}
                className="p-2 rounded-full bg-phase-interactive/10 border border-phase-border"
              >
                <Icon as={X} size={24} color={colors.text} />
              </Pressable>
            </HStack>
          </Box>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
            <BreathGuide onComplete={completeBreathingReset} />
          </ScrollView>
        </Box>
      </Modal>
    </Box>
  );
}
