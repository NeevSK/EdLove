import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { FounderStackParamList } from '@repo/core';
import { useFeatureAccess } from '@repo/core/hooks';
import { useStore } from '@repo/core/logic';

import {
  Box,
  Compass,
  GlobalHeader,
  Globe,
  Heading,
  Heart,
  HStack,
  Icon,
  Plus,
  PositiveInvitation,
  SandboxBanner,
  ScreenWrapper,
  Text,
  VStack,
  Zap,
} from '@repo/ui';
import { SkeletonCard } from '@repo/ui/components';
import { Pressable, ScrollView } from '@repo/ui/primitives';
import { hapticLight } from '@repo/ui/utils/haptics';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFounderSchoolStats } from '../bridge/founderWorkspace';
import { CreateSchoolModal } from '../components';

interface FounderSchoolDashboardProps {
  schoolId: string;
  userId: string;
  onRefresh?: () => void;
}

export default function FounderSchoolDashboard({ schoolId, userId }: FounderSchoolDashboardProps) {
  const { t } = useTranslation();
  const { isGuest } = useFeatureAccess();
  const navigation = useNavigation<NativeStackNavigationProp<FounderStackParamList>>();

  const { school, stats, isLoading, refreshData } = useFounderSchoolStats(schoolId);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const isDemoMode = useStore((s) => s.isDemoMode);

  return (
    <ScreenWrapper noTopInset={true}>
      {isDemoMode && <SandboxBanner />}
      <GlobalHeader
        title={t('founder.platformVision')}
        subtitle={school?.name || t('founder.educationalEcology')}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack className="p-6 gap-6">
          {/* Main Content */}
          {stats && !isLoading && (
            <VStack className="gap-6">
              {(stats as any).is_sample && (
                <Box className="p-4 rounded-xl border items-center justify-center flex-row gap-2 mb-2 bg-phase-reward/10 border-phase-reward">
                  <Icon as={Zap} size="sm" className="text-phase-reward fill-phase-reward" />
                  <Text className="text-xs font-bold text-phase-reward">
                    {t('demoMode.visionaryEcology') ||
                      'VISIONARY ECOLOGY: Previewing platform potential'}
                  </Text>
                </Box>
              )}

              {/* Visionary Summary */}
              <Box className="p-8 rounded-3xl bg-phase-interactive shadow-lg">
                <VStack className="gap-2">
                  <HStack className="items-center gap-2">
                    <Icon as={Compass} className="text-phaseText-inverse" size="lg" />
                    <Text className="font-bold text-lg text-phaseText-inverse">
                      {t('founder.ecologyStatus', { status: 'Balanced' })}
                    </Text>
                  </HStack>
                  <Text className="text-sm opacity-90 text-phaseText-inverse">
                    {t('founder.visionManifesting', { count: stats?.total_sections || 0 })}
                  </Text>
                </VStack>
              </Box>

              {/* Platform Metrics */}
              <VStack className="gap-4">
                <Heading className="text-base text-phaseText-primary">
                  {t('founder.executiveOversight')}
                </Heading>
                <HStack className="gap-4">
                  <Box className="flex-1 p-4 rounded-xl bg-phase-surface">
                    <HStack className="justify-between items-center">
                      <Icon as={Globe} className="text-phase-interactive" size="md" />
                      {isDemoMode && (
                        <Icon as={Zap} size="xs" className="text-phase-reward fill-phase-reward" />
                      )}
                    </HStack>
                    <Text className="font-bold text-2xl mt-2 text-phaseText-primary">
                      {stats?.total_students || 0}
                    </Text>
                    <Text className="text-xs text-phaseText-secondary">
                      {t('founder.totalSouls')}
                    </Text>
                  </Box>
                  <Box className="flex-1 p-4 rounded-xl bg-phase-surface">
                    <Icon as={Zap} className="text-amber-500" size="md" />
                    <Text className="font-bold text-2xl mt-2 text-phaseText-primary">
                      {stats?.total_teachers || 0}
                    </Text>
                    <Text className="text-xs text-phaseText-secondary">
                      {t('founder.guidingSpirits')}
                    </Text>
                  </Box>
                </HStack>
              </VStack>

              {/* Ecology Health */}
              <VStack className="gap-4">
                <Heading className="text-sm text-phaseText-secondary">
                  {t('founder.visionaryInsights')}
                </Heading>
                <Box className="p-4 rounded-xl border bg-phase-surface border-phase-border">
                  <HStack className="justify-between items-center">
                    <VStack className="gap-1">
                      <Text className="font-bold text-phaseText-primary">
                        {t('founder.wellnessIndex')}
                      </Text>
                      <Text className="text-xs text-phase-success font-bold">
                        {t('founder.wellnessIncrease', { percent: 12 })}
                      </Text>
                    </VStack>
                    <Icon as={Heart} className="text-phase-danger fill-phase-danger" size={24} />
                  </HStack>
                </Box>
              </VStack>

              {/* Operational Shortcut for Founders */}
              <Pressable
                onPress={() => {
                  hapticLight();
                  (navigation as any).navigate('PrincipalDashboard', {
                    schoolId: schoolId,
                    userId: userId,
                  });
                }}
                className="p-4 rounded-xl border flex-row items-center gap-4 bg-phase-surface border-phase-interactive active:bg-phaseText-primary/5"
              >
                <Box className="w-10 h-10 rounded-full justify-center items-center bg-phase-interactive/10">
                  <Icon as={Zap} className="text-phase-interactive" size="md" />
                </Box>
                <VStack className="flex-1">
                  <Text className="font-bold text-phaseText-primary">
                    {t('founder.principalsOffice') || "Principal's Office"}
                  </Text>
                  <Text className="text-xs text-phaseText-secondary">
                    {t('founder.manageOperations') || 'Manage staff, students, and operations'}
                  </Text>
                </VStack>
                <Icon as={Compass} className="text-phaseText-secondary" size="md" />
              </Pressable>

              {isGuest && (
                <PositiveInvitation
                  type="guest"
                  onAction={() => {
                    hapticLight();
                  }}
                />
              )}
            </VStack>
          )}

          {isLoading && (
            <VStack className="gap-4">
              <SkeletonCard height={120} />
              <HStack className="gap-4">
                <Box className="flex-1">
                  <SkeletonCard height={100} />
                </Box>
                <Box className="flex-1">
                  <SkeletonCard height={100} />
                </Box>
              </HStack>
              <SkeletonCard height={80} />
            </VStack>
          )}
        </VStack>
      </ScrollView>

      <Pressable
        onPress={() => setIsCreateModalOpen(true)}
        className="absolute bottom-5 right-5 w-14 h-14 rounded-full justify-center items-center z-10 bg-phase-interactive active:scale-95 shadow-lg"
      >
        <Icon as={Plus} size="lg" className="text-white" />
      </Pressable>

      <CreateSchoolModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          refreshData();
        }}
      />
    </ScreenWrapper>
  );
}
