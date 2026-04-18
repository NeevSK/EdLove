import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  useFeatureAccess,
  usePermissions,
  useStore} from '@repo/core';
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
  
  hapticLight,
  QRBuilder,
  QRCodeGenerator,
  useThemedColors,
  useRegisterFAB} from '@repo/ui';
import {
  Building2,
  LayoutGrid,
  NotebookPen} from 'lucide-react-native';
import {
  PrincipalNativeWorkspace} from './PrincipalNativeWorkspace';
import { PrincipalNativeDashboardShell } from '../bridge/PrincipalNativeDashboardShell';
import { 
  PrincipalNotes,
  CreateSchoolModal} from '../components';
import { type PrincipalZoneId, type PrincipalWorkspaceView } from '../principal/workspace';
import { usePrincipalWorkspaceSurfaces } from '../principal/usePrincipalWorkspaceSurfaces';
import { useTranslation } from 'react-i18next';
import { useSchoolStats } from '../hooks/useSchoolStats';
import AcademicCycleManager from './AcademicCycleManager';

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
  onRefresh}: PrincipalDashboardProps) {
  const { t } = useTranslation();
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
    onEditSchool: () => setIsCreateModalOpen(true)});

  useRegisterFAB({
    tabType: 'principal',
    visible: !isGuest && !isDemoExperience && schoolId !== 'demo-school' && activeView === 'main',
    actions: [
      ...(canManageSchool
        ? [
            {
              label: t('principal.actions.hierarchy') || 'Manage Hierarchy',
              onPress: () => setActiveView('hierarchy'),
              icon: LayoutGrid}]
        : []),
      ...(canManageStaff
        ? [
            {
              label: t('principal.actions.invites') || 'Manage Invites',
              onPress: () => setActiveView('invites'),
              icon: Building2}]
        : []),
      {
        label: t('principal.actions.notes') || 'School Logbook',
        onPress: () => setActiveView('notes'),
        icon: NotebookPen}]});

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
              {surfaces[activeZone].content}
            </PrincipalNativeDashboardShell>
          </ScreenWrapper>
        )}
        renderAdditionalView={({ activeView: nextView, navigatePrincipalView }) => {
          if (nextView === 'notes' || nextView === 'log') {
            return <PrincipalNotes schoolId={schoolId} onBack={() => navigatePrincipalView('main')} />;
          }

          if (nextView === 'cycles') {
            return <AcademicCycleManager schoolId={schoolId} onBack={() => navigatePrincipalView('main')} />;
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
                type: school.type as any}
            : undefined
        }
        onSuccess={() => {
          onRefresh?.();
          refreshData();
        }}
      />

      <Modal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)}>
        <ModalBackdrop />
        <ModalContent className="bg-phase-surface rounded-[40px] max-w-[340px]">
          <ModalHeader className="mb-4">
            <Heading className="text-lg font-black text-ink uppercase tracking-widest">
              School QR Code
            </Heading>
          </ModalHeader>
          <ModalBody className="items-center gap-6 py-5">
            <Box className="p-6 bg-white rounded-3xl border border-border">
              <QRCodeGenerator
                value={QRBuilder.school(schoolId, '', school?.handle ?? undefined)}
                size={220}
              />
            </Box>
            <Text className="text-ink/60 text-center leading-relaxed font-bold">
              Scan to join the <Text className="text-ink font-black">{school?.name}</Text> sanctuary.
            </Text>
            {school?.handle ? (
              <Text className="text-ink/30 mt-2 text-xs font-bold uppercase tracking-widest">
                @{school.handle}
              </Text>
            ) : null}
          </ModalBody>
          <ModalFooter className="mt-4">
            <Button
              onPress={() => {
                hapticLight();
                setIsQrModalOpen(false);
              }}
              className="w-full bg-phase-interactive h-14 rounded-2xl"
            >
              <ButtonText className="text-inverted font-black uppercase tracking-widest">Close</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
