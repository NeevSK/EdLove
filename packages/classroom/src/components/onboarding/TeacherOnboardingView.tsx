import {
  ArrowRightCircle,
  Box,
  ChevronRight,
  Heading,
  HStack,
  hapticLight,
  Icon,
  Plus,
  Pressable,
  School,
  ScrollView,
  Search,
  ShieldCheck,
  Text,
  VStack,
  Zap,
} from '@repo/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface TeacherOnboardingViewProps {
  onTryDemo: () => void;
  onCreateClassroom: () => void;
  onJoinSchool: () => void;
  isGuest: boolean;
}

export default function TeacherOnboardingView({
  onTryDemo,
  onCreateClassroom,
  onJoinSchool,
  isGuest,
}: TeacherOnboardingViewProps) {
  const { t } = useTranslation();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerClassName="p-6 self-center w-full max-w-[800px]"
    >
      <VStack className="gap-10 py-10">
        {/* Welcome Header */}
        <VStack className="gap-2 items-center">
          <Box className="p-4 rounded-generous bg-templeGold/10 mb-3">
            <Icon as={School} className="text-templeGold" size="xl" />
          </Box>
          <Heading className="text-3xl font-black text-phaseText-primary text-center">
            Welcome, Teacher
          </Heading>
          <Text className="text-center text-phaseText-secondary text-base max-w-[500px] leading-relaxed">
            Lead your students with digital tools designed for holistic growth. Create your
            workbench to begin.
          </Text>
        </VStack>

        {/* Primary Actions Grid */}
        <VStack className="gap-6">
          {/* Create Classroom Card */}
          <Pressable
            onPress={() => {
              hapticLight();
              onCreateClassroom();
            }}
            className="w-full bg-phase-surface p-6 rounded-generous border border-phase-canvas shadow-sm active:scale-[0.98] transition-transform"
          >
            <HStack className="gap-5 items-center">
              <Box className="w-16 h-16 rounded-comfortable bg-templeGold items-center justify-center shadow-lg">
                <Icon as={Plus} className="text-white" size="lg" />
              </Box>
              <VStack className="flex-1 gap-1">
                <Heading className="text-lg font-black text-phaseText-primary">
                  Create New Classroom
                </Heading>
                <Text className="text-phaseText-secondary text-sm font-medium leading-snug">
                  Establish a personal sanctuary for your students, manage lessons, and track
                  holistic growth.
                </Text>
                {isGuest && (
                  <HStack className="gap-1.5 items-center mt-1">
                    <Icon as={ShieldCheck} size="xs" className="text-templeGold" />
                    <Text className="text-[10px] text-templeGold font-black uppercase tracking-widest">
                      Requires Account
                    </Text>
                  </HStack>
                )}
              </VStack>
              <Icon as={ChevronRight} className="text-phaseText-tertiary" size="sm" />
            </HStack>
          </Pressable>

          {/* Join School Card */}
          <Pressable
            onPress={() => {
              hapticLight();
              onJoinSchool();
            }}
            className="w-full bg-phase-canvas/50 p-6 rounded-generous border border-phase-canvas active:scale-[0.98] transition-transform"
          >
            <HStack className="gap-5 items-center">
              <Box className="w-16 h-16 rounded-comfortable bg-phase-canvas items-center justify-center">
                <Icon as={Search} className="text-phaseText-secondary" size="lg" />
              </Box>
              <VStack className="flex-1 gap-1">
                <Heading className="text-base font-black text-phaseText-primary">
                  Join or Search School
                </Heading>
                <Text className="text-phaseText-secondary text-sm font-medium leading-snug">
                  Connect with your institution to access shared resources and school-wide
                  dashboards.
                </Text>
              </VStack>
              <Icon as={ChevronRight} className="text-phaseText-tertiary" size="sm" />
            </HStack>
          </Pressable>

          {/* Try Demo Banner */}
          <Box className="mt-8 p-8 rounded-generous bg-[#1A1A1A] overflow-hidden relative border border-[#2A2A2A]">
            <Box className="absolute -right-5 -top-5 w-40 h-40 rounded-full bg-templeGold/15" />
            <VStack className="gap-6 items-center">
              <Box className="p-3 rounded-comfortable bg-white/10 border border-white/10">
                <Icon as={Zap} className="text-templeGold" size="lg" />
              </Box>
              <VStack className="gap-2 items-center">
                <Heading className="text-2xl font-black text-white text-center">
                  Explore the Experience
                </Heading>
                <Text className="text-white/70 text-sm text-center max-w-[400px] font-medium leading-relaxed">
                  Launch a sample teacher dashboard to witness how Gurudevi simplifies classroom
                  orchestration.
                </Text>
              </VStack>

              <Pressable
                onPress={() => {
                  hapticLight();
                  onTryDemo();
                }}
                className="bg-templeGold px-8 h-[54px] rounded-full items-center justify-center shadow-lg active:scale-95 transition-transform"
              >
                <HStack className="items-center gap-2">
                  <Text className="text-white font-black text-base uppercase tracking-widest">
                    Launch Teacher Sandbox
                  </Text>
                  <Icon as={ArrowRightCircle} size="sm" className="text-white" />
                </HStack>
              </Pressable>
            </VStack>
          </Box>
        </VStack>
        <Text className="text-center text-phaseText-tertiary text-[10px] font-black uppercase tracking-[0.2em] mt-5">
          Gurudevi Workbenches &bull; Intentional Teaching
        </Text>
      </VStack>
    </ScrollView>
  );
}
