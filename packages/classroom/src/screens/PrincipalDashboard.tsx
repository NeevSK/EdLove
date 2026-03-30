import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  useFeatureAccess,
  usePermissions,
  useStore,
} from '@repo/core';
import {
  Box,
  Button,
  ButtonText,
  Heading,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ScreenWrapper,
  Text,
  Theme,
  hapticLight,
  QRBuilder,
  QRCodeGenerator,
  useThemedColors,
  useRegisterFAB,
} from '@repo/ui';
import {
  Building2,
  LayoutGrid,
  NotebookPen,
} from 'lucide-react-native';
import {
  PrincipalNotes,
  PrincipalNativeDashboardShell,
  PrincipalNativeWorkspace,
  CreateSchoolModal,
  type PrincipalWorkspaceView,
  type PrincipalZoneId,
} from '@repo/admin';
import { useTranslation } from 'react-i18next';
import { useSchoolStats } from '../hooks/useSchoolStats';
import AcademicCycleManager from './AcademicCycleManager';
import { usePrincipalWorkspaceSurfaces } from '../workspace/usePrincipalWorkspaceSurfaces';

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
  const colors = useThemedColors();
  const navigation = useNavigation<any>();
  const { isGuest } = useFeatureAccess();
  const { can } = usePermissions();
  const isDemoMode = useStore((state: any) => state.isDemoMode);
  const setBreathingOpen = useStore((state: any) => state.setBreathingOpen);
  const { school, stats, isLoading, error, refreshData } = useSchoolStats(schoolId);

  const isDemoExperience = isDemoMode || forceDemo === true;
  const canManageSchool = can('manage', 'School');
  const canManageStaff = can('manage', 'Staff');

  const [activeView, setActiveView] = useState<PrincipalWorkspaceView>('main');
  const [activeZone, setActiveZone] = useState<PrincipalZoneId>('today');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const { zoneCounts, surfaces } = usePrincipalWorkspaceSurfaces({
    schoolId,
    userId,
    stats,
    navigatePrincipalView: (view) => setActiveView(view),
    onOpenProfile: () => navigation.navigate('SchoolProfile', { schoolId }),
    onOpenCommons: () => navigation.navigate('CommunityStack' as any),
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
    ],
  });

  return (
    <      <PrincipalNativeWorkspace
        schoolId={schoolId}
        userId={userId}
        activeView={activeView}
        onActiveViewChange={setActiveView}
        renderMain={() => (
          <ScreenWrapper scroll={false} noTopInset            <PrincipalNativeDashboardShell
              title={t('classroom.schoolManagement') || 'Principal Workspace'}
              subtitle={school?.name || 'Balanced cockpit for institutional leadership'}
              showSandboxBanner={schoolId === 'demo-school' || isDemoExperience}
              activeZone={activeZone}
              onZoneChange={setActiveZone}
              zoneCounts={zoneCounts}
              isLoading={isLoading}
              error={error}>
                          {surfaces[activeZone].content}
            </PrincipalNativeDashboardShell          </ScreenWrapper        )}
        renderAdditionalView={({ activeView: nextView, navigatePrincipalView }) => {
          if (nextView === 'notes' || nextView === 'log') {
            return <PrincipalNotes schoolId={schoolId} onBack={() => navigatePrincipalView('main')} />;
          }

          if (nextView === 'cycles') {
            return <AcademicCycleManager schoolId={schoolId} onBack={() => navigatePrincipalView('main')} />;
          }

          return null;
        }}
      /
      ><CreateSchoolModal
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
          onRefresh?.();
          refreshData();
        }}
      /
      ><Modal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)}        <ModalBackdrop /        ><ModalContent sx={{ backgroundColor: colors.secondary, borderRadius: Theme.corners.generous }}          <ModalHeader            <Heading >color={colors.text} sx={{ fontSize: 18 }}              School QR Code
            </Heading          </ModalHeader          <ModalBody sx={{ alignItems: 'center', paddingVertical: 20 }}            <Box sx={{ padding: 16, backgroundColor: Theme.colors.sacredWhite, borderRadius: 16 }}              <QRCodeGenerator
                value={QRBuilder.school(schoolId, '', school?.handle ?? undefined)}
                size={220}
              /            ></Box            <Text color={colors.textSecondary} sx={{ marginTop: 20, textAlign: 'center' }}              Scan to join the <Text color={colors.text} sx={{ fontWeight: 'bold' }}>{school?.name}</Text> sanctuary.
            </Text            {school?.handle ? (
              <Text color={colors.textTertiary} sx={{ marginTop: 8, fontSize: 12 }}                @{school.handle}
              </Text            ) : null}>
          </ModalBody          <ModalFooter            <Button
              action="primary"
              onPress={() => {
                hapticLight();
                setIsQrModalOpen(false);
              }}
              sx={{ width: '100%', backgroundColor: Theme.colors.sanctuarySaffron }}
                          <ButtonText color={Theme.colors.sacredWhite}>Close</ButtonText            ></Button          </ModalFooter        </ModalContent      </Modal    </  );
}
