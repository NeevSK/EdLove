import { PrincipalNativeDashboardShell } from '@repo/admin/bridge/PrincipalNativeDashboardShell';
import { CreateSchoolModal, PrincipalNotes, PrincipalSetupWizard } from '@repo/admin/components';
import { useSchoolStats } from '@repo/admin/hooks/useSchoolStats';
import { usePrincipalWorkspaceSurfaces } from '@repo/admin/principal/usePrincipalWorkspaceSurfaces';
import type { PrincipalWorkspaceView, PrincipalZoneId } from '@repo/admin/principal/workspace';
import AcademicCycleManager from '@repo/admin/screens/AcademicCycleManager';
import { PrincipalNativeWorkspace } from '@repo/admin/screens/PrincipalNativeWorkspace';
import { useIsGuest, useScaffoldDismissal } from '@repo/core/hooks';
import { useExperienceState } from '@repo/core/lib/experienceState';
import { usePermissions } from '@repo/core/logic';
import { useUIStore } from '@repo/core/store';
import { QRBuilder } from '@repo/scanner-kit';
import QRCodeGenerator from '@repo/ui/components/QRCodeGenerator';
import SanctuaryModal from '@repo/ui/components/SanctuaryModal';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { useRegisterFAB } from '@repo/ui/context/FABContext';
import { Building2, LayoutGrid, NotebookPen, Send } from '@repo/ui/icons';
import { Box, Button, ButtonText, Text, VStack } from '@repo/ui/primitives';
import { hapticLight } from '@repo/ui/utils/haptics';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface PrincipalDashboardProps {
  schoolId: string;
  userId: string;
  forceDemo?: boolean;
  onRefresh?: () => void;
}

export default function PrincipalDashboard({
  schoolId,
  userId,
  forceDemo,
  onRefresh,
}: PrincipalDashboardProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const isGuest = useIsGuest();
  const { can } = usePermissions();
  const isDemoMode = useExperienceState((state) => state.isDemoMode);
  const setBreathingOpen = useUIStore((state) => state.setBreathingOpen);
  const { school, stats, isLoading, error, refreshData } = useSchoolStats(schoolId);

  const isDemoExperience = isDemoMode || forceDemo === true;
  const canManageSchool = can('manage', 'School');
  const canManageStaff = can('manage', 'Staff');

  const [activeView, setActiveView] = useState<PrincipalWorkspaceView>('main');
  const [activeZone, setActiveZone] = useState<PrincipalZoneId>('today');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const { isDismissed: isSchoolScaffoldDismissed, completeScaffold: completeSchoolScaffold } =
    useScaffoldDismissal('principal_first_school_scaffold', 1);

  const { zoneCounts, surfaces } = usePrincipalWorkspaceSurfaces({
    schoolId,
    userId,
    stats,
    navigatePrincipalView: (view) => setActiveView(view),
    onOpenProfile: () => router.push('/profile'),
    onOpenCommons: () => router.push('/community'),
    onOpenQr: () => setIsQrModalOpen(true),
    onOpenBreathing: () => setBreathingOpen(true),
    onEditSchool: () => setIsCreateModalOpen(true),
  });

  useRegisterFAB({
    tabType: 'principal',
    visible: !isGuest && !isDemoExperience && schoolId !== 'demo-school' && activeView === 'main',
    actions: [
      ...(canManageSchool
        ? [
            {
              label: t('principal.actions.hierarchy') || 'Manage Hierarchy',
              onPress: () => setActiveView('hierarchy'),
              icon: LayoutGrid,
            },
          ]
        : []),
      ...(canManageStaff
        ? [
            {
              label: t('principal.actions.invites') || 'Manage Invites',
              onPress: () => setActiveView('invites'),
              icon: Building2,
            },
          ]
        : []),
      {
        label: t('principal.actions.notes') || 'School Logbook',
        onPress: () => setActiveView('notes'),
        icon: NotebookPen,
      },
      ...(can('create', 'Announcement')
        ? [
            {
              label: t('planBridge.title', 'Plan & notices'),
              onPress: () => router.push('/workspace/plan'),
              icon: Send,
            },
          ]
        : []),
    ],
  });

  return (
    <>
      <PrincipalNativeWorkspace
        schoolId={schoolId}
        userId={userId}
        activeView={activeView}
        onActiveViewChange={setActiveView}
        renderMain={() => (
          <ScreenWrapper scroll={false} noTopInset>
            <PrincipalNativeDashboardShell
              title={t('classroom.schoolManagement') || 'Principal Workspace'}
              subtitle={school?.name || 'Balanced cockpit for institutional leadership'}
              showSandboxBanner={schoolId === 'demo-school' || isDemoExperience}
              activeZone={activeZone}
              onZoneChange={setActiveZone}
              zoneCounts={zoneCounts}
              isLoading={isLoading}
              error={error}
            >
              {!isSchoolScaffoldDismissed &&
              (!school || schoolId === 'demo-school' || isDemoExperience) ? (
                <Box className="px-4 pb-4">
                  <PrincipalSetupWizard
                    userId={userId}
                    onComplete={() => {
                      completeSchoolScaffold();
                      refreshData();
                    }}
                    onDismiss={() => completeSchoolScaffold()}
                  />
                </Box>
              ) : null}
              {surfaces[activeZone].content}
            </PrincipalNativeDashboardShell>
          </ScreenWrapper>
        )}
        renderAdditionalView={({ activeView: nextView, navigatePrincipalView }) => {
          if (nextView === 'notes' || nextView === 'log') {
            return (
              <PrincipalNotes schoolId={schoolId} onBack={() => navigatePrincipalView('main')} />
            );
          }

          if (nextView === 'cycles') {
            return (
              <AcademicCycleManager
                schoolId={schoolId}
                onBack={() => navigatePrincipalView('main')}
              />
            );
          }

          return null;
        }}
      />

      <CreateSchoolModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        initialData={
          school
            ? {
                id: school.id,
                name: school.name,
                handle: school.handle ?? undefined,
                type: school.type as any,
              }
            : undefined
        }
        onSuccess={() => {
          completeSchoolScaffold();
          onRefresh?.();
          refreshData();
        }}
      />

      <SanctuaryModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        title="School QR Code"
      >
        <VStack className="items-center gap-6 py-5">
          <Box className="p-6 bg-phase-surface rounded-3xl border border-phase-border">
            <QRCodeGenerator
              value={QRBuilder.school(schoolId, '', school?.handle ?? undefined)}
              size={220}
            />
          </Box>
          <Text className="text-phaseText-secondary text-center leading-relaxed font-bold">
            Scan to join the{' '}
            <Text className="text-phaseText-primary font-black">{school?.name}</Text> sanctuary.
          </Text>
          {school?.handle ? (
            <Text className="text-phaseText-muted mt-2 text-xs font-bold uppercase tracking-widest">
              @{school.handle}
            </Text>
          ) : null}

          <Button
            onPress={() => {
              hapticLight();
              setIsQrModalOpen(false);
            }}
            className="w-full bg-phase-interactive h-14 rounded-2xl mt-4"
          >
            <ButtonText className="text-phaseText-inverse font-black uppercase tracking-widest">
              Close
            </ButtonText>
          </Button>
        </VStack>
      </SanctuaryModal>
    </>
  );
}
