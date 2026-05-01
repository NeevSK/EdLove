import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FounderStackParamList, School } from '@repo/core/types';
import { useStore } from '@repo/core/logic';

import GlobalHeader from '@repo/ui/components/GlobalHeader';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { useRegisterFAB } from '@repo/ui/context/FABContext';
import { ChevronRight, HeartPulse, LayoutGrid, Plus, School as SchoolIcon, Users, Wind, Zap } from '@repo/ui/icons';
import {
  Box,
  Heading,
  HStack,
  Icon,
  Pressable,
  ScrollView,
  Spinner,
  Text,
  VStack,
} from '@repo/ui/primitives';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFounderEcosystemStats } from '../bridge/founderWorkspace';
import { GlobalCreateModal } from '../components';

export default function FounderDashboard() {
  const { t } = useTranslation();
  const user = useStore((s) => s.user);
  const setBreathingOpen = useStore((s) => s.setBreathingOpen);
  const _isDemoMode = useStore((s) => s.isDemoMode);
  const navigation = useNavigation<NativeStackNavigationProp<FounderStackParamList>>();

  const { stats, schools, isLoading, refreshData } = useFounderEcosystemStats();
  const [searchQuery, _setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredSchools = (schools || []).filter((s) =>
    s?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCreateSuccess = (type: string, data: any) => {
    console.log(`Successfully created ${type}:`, data);
    refreshData();
  };

  // Event Handlers
  const handleOpenCreateModal = React.useCallback(() => setIsCreateModalOpen(true), []);
  const handleCloseCreateModal = React.useCallback(() => setIsCreateModalOpen(false), []);
  const handleOpenBreathing = React.useCallback(() => setBreathingOpen(true), [setBreathingOpen]);

  const handleNavigateToSchool = React.useCallback(
    (schoolId: string) => {
      navigation.navigate('FounderSchoolDashboard', {
        schoolId: schoolId,
        userId: user?.id || 'founder-id',
      });
    },
    [navigation, user?.id],
  );

  const handleOpenInstitute = React.useCallback(() => {
    const schoolId = user?.school_id;
    if (schoolId) handleNavigateToSchool(schoolId);
  }, [user?.school_id, handleNavigateToSchool]);

  // Register FAB globally
  useRegisterFAB({
    tabType: 'founder',
    onPress: handleOpenCreateModal,
    icon: <Icon as={Plus} size={24} className="text-white" />,
    visible: true,
  });

  return (
    <ScreenWrapper>
      <GlobalHeader
        title={t('founder.platformDashboard') || 'Platform Dashboard'}
        subtitle={t('founder.ecosystemTitle') || 'The Gurudevi Ecology'}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <VStack className="p-5 gap-8">
          {/* 1. Ecosystem Pulse */}
          <VStack className="gap-4">
            <HStack className="justify-between items-center">
              <Heading className="text-xl font-bold text-phaseText-primary">
                Ecosystem Pulse
              </Heading>
              <Box className="flex-row items-center gap-2 bg-phase-success/10 px-3 py-1.5 rounded-full">
                <Icon as={HeartPulse} size={16} className="text-phase-success" />
                <Text className="text-xs font-black text-phase-success">
                  Health: {stats?.ecosystem_health || 0}%
                </Text>
              </Box>
            </HStack>

            {/* Quick Access to Main School */}
            {schools.find((s) => s.id === user?.school_id) && (
              <Pressable onPress={handleOpenInstitute}>
                <Box className="p-4 bg-phase-interactive/5 rounded-3xl border border-phase-interactive/20">
                  <HStack className="justify-between items-center">
                    <HStack className="gap-4 items-center flex-1">
                      <Box className="w-12 h-12 bg-phase-interactive/10 rounded-2xl items-center justify-center">
                        <Icon as={SchoolIcon} size={24} className="text-phase-interactive" />
                      </Box>
                      <VStack className="flex-1">
                        <Text className="font-bold text-phaseText-primary">
                          Manage My Institution
                        </Text>
                        <Text className="text-xs text-phaseText-secondary">
                          Full principal oversight for your school
                        </Text>
                      </VStack>
                    </HStack>
                    <Icon as={ChevronRight} size={20} className="text-phaseText-muted" />
                  </HStack>
                </Box>
              </Pressable>
            )}

            {isLoading ? (
              <HStack className="gap-4">
                <Box className="flex-1 h-24 bg-phase-canvas rounded-3xl animate-pulse items-center justify-center">
                  <Spinner />
                </Box>
                <Box className="flex-1 h-24 bg-phase-canvas rounded-3xl animate-pulse items-center justify-center">
                  <Spinner />
                </Box>
              </HStack>
            ) : (
              <VStack className="gap-4">
                <HStack className="gap-4">
                  <StatCard
                    label="Total Schools"
                    value={stats?.total_schools || 0}
                    icon={<Icon as={SchoolIcon} size={20} />}
                    variant="primary"
                  />
                  <StatCard
                    label="Total Souls"
                    value={stats?.total_users || 0}
                    icon={<Icon as={Users} size={20} />}
                    variant="success"
                  />
                </HStack>
                <HStack className="gap-4">
                  <StatCard
                    label="Classrooms"
                    value={stats?.total_classrooms || 0}
                    icon={<Icon as={LayoutGrid} size={20} />}
                    variant="warning"
                  />
                  <StatCard
                    label="Teachers"
                    value={stats?.total_teachers || 0}
                    icon={<Icon as={Zap} size={20} />}
                    variant="accent"
                  />
                </HStack>
              </VStack>
            )}

            {/* Quick Actions */}
            <HStack className="gap-4 mt-2">
              <QuickAction
                icon={Wind}
                label={t('founder.breathing') || 'Breathing Reset'}
                onPress={handleOpenBreathing}
                className="text-phase-interactive"
              />
              <Box className="flex-1" />
              <Box className="flex-1" />
            </HStack>
          </VStack>

          {/* 2. School Gallery */}
          <VStack className="gap-4">
            <HStack className="justify-between items-center">
              <Heading className="text-xl font-bold text-phaseText-primary">Institutions</Heading>
              <Box className="px-3 py-1 bg-phase-canvas rounded-full">
                <Text className="text-xs text-phaseText-secondary font-bold">
                  {filteredSchools.length} Registered
                </Text>
              </Box>
            </HStack>

            {isLoading ? (
              <VStack className="gap-4">
                <Box className="w-full h-24 bg-phase-canvas rounded-3xl animate-pulse items-center justify-center">
                  <Spinner />
                </Box>
                <Box className="w-full h-24 bg-phase-canvas rounded-3xl animate-pulse items-center justify-center">
                  <Spinner />
                </Box>
              </VStack>
            ) : (
              <VStack className="gap-3">
                {filteredSchools.map((school) => (
                  <SchoolGalleryItem
                    key={school.id}
                    school={school}
                    onPress={handleNavigateToSchool}
                  />
                ))}

                {filteredSchools.length === 0 && (
                  <Box className="p-10 items-center justify-center bg-phase-canvas rounded-3xl border border-dashed border-phase-border">
                    <Text className="text-phaseText-muted font-bold">No institutions found</Text>
                  </Box>
                )}
              </VStack>
            )}
          </VStack>
        </VStack>
      </ScrollView>

      <GlobalCreateModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSuccess={handleCreateSuccess}
        availableSchools={schools}
      />
    </ScreenWrapper>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
  className,
}: {
  icon: any;
  label: string;
  onPress: () => void;
  className?: string;
}) {
  return (
    <VStack className="flex-1 gap-2 items-center">
      <Pressable
        onPress={onPress}
        className="w-16 h-16 rounded-[20px] bg-phase-surface border border-phase-border items-center justify-center shadow-sm active:bg-phase-canvas"
      >
        <Icon as={icon} size={28} className={className} />
      </Pressable>
      <Text className="text-center text-[11px] font-bold text-phaseText-primary">{label}</Text>
    </VStack>
  );
}

function StatCard({
  label,
  value,
  icon,
  variant,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  variant: 'primary' | 'success' | 'warning' | 'accent';
}) {
  const variantClasses = {
    primary: 'border-phase-interactive/20 text-phase-interactive bg-phase-interactive/5',
    success: 'border-phase-success/20 text-phase-success bg-phase-success/5',
    warning: 'border-phase-interactive/20 text-phase-interactive bg-phase-interactive/5',
    accent: 'border-phase-interactive/20 text-phase-interactive bg-phase-interactive/5',
  };

  return (
    <Box className={`flex-1 p-5 rounded-3xl border ${variantClasses[variant]}`}>
      <Box className="mb-2 opacity-60">{icon}</Box>
      <Text className="text-2xl font-black text-phaseText-primary">{value.toLocaleString()}</Text>
      <Text className="text-[10px] font-extrabold uppercase tracking-widest text-phaseText-muted mt-1">
        {label}
      </Text>
    </Box>
  );
}

function SchoolGalleryItem({ school, onPress }: { school: School; onPress: (id: string) => void }) {
  const handlePress = React.useCallback(() => onPress(school.id), [onPress, school.id]);
  return (
    <Pressable onPress={handlePress}>
      <Box className="p-4 bg-phase-surface rounded-3xl border border-phase-border flex-row items-center gap-4 active:bg-phase-canvas">
        <Box className="w-12 h-12 rounded-2xl bg-phase-interactive/10 items-center justify-center">
          <Icon as={SchoolIcon} size={24} className="text-phase-interactive" />
        </Box>
        <VStack className="flex-1">
          <Text className="font-bold text-base text-phaseText-primary">{school.name}</Text>
          <Text className="text-xs text-phaseText-secondary">
            {school.type} • {school.id.substring(0, 8)}...
          </Text>
        </VStack>
        <Icon as={ChevronRight} size={20} className="text-phaseText-muted" />
      </Box>
    </Pressable>
  );
}
