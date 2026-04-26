import { Box, Heading, HStack, Icon, Pressable, Text, VStack } from '@repo/ui';
import {
  ArrowRightCircle,
  BookOpen,
  GraduationCap,
  Layout,
  QrCode,
  Search,
  Sparkles,
} from 'lucide-react-native';
import React from 'react';

interface StudentOnboardingViewProps {
  onTryDemo: () => void;
  onJoinClass: () => void;
  onFindSchool: () => void;
  isGuest: boolean;
}

export default function StudentOnboardingViewWeb({
  onTryDemo,
  onJoinClass,
  onFindSchool,
  isGuest,
}: StudentOnboardingViewProps) {
  return (
    <VStack className="flex-1 bg-phase-canvas p-10 max-w-[1200px] self-center w-full gap-12">
      {/* Header */}
      <VStack className="gap-2 items-center">
        <Box className="p-4 rounded-generous bg-templeGold/10 mb-3">
          <Icon as={GraduationCap} className="text-templeGold" size="xl" />
        </Box>
        <Heading className="text-4xl font-black text-phaseText-primary text-center">
          Your Learning Sanctuary Awaits
        </Heading>
        <Text className="text-phaseText-secondary text-lg max-w-[600px] text-center leading-relaxed font-medium">
          Join your classrooms, track your growth, and collaborate with your peers in a digitally
          empowered environment.
        </Text>
      </VStack>

      <HStack className="gap-8 flex-wrap justify-center">
        {/* Digital Portfolio Promotion */}
        <Box className="flex-1 min-w-[350px] p-8 bg-phase-surface rounded-generous border border-phase-canvas shadow-xl">
          <VStack className="gap-6">
            <HStack className="gap-4 items-center">
              <Box className="p-3 bg-templeGold/10 rounded-comfortable">
                <Icon as={BookOpen} className="text-templeGold" size="lg" />
              </Box>
              <Heading className="text-xl font-black text-phaseText-primary">
                Digital Portfolio & Growth
              </Heading>
            </HStack>

            <Text className="text-phaseText-secondary text-sm font-medium leading-relaxed">
              Keep track of your achievements, submissions, and feedback in a beautiful digital
              portfolio. Watch your growth over time as you complete your learning quests.
            </Text>

            <Box className="p-4 bg-phase-canvas/50 rounded-comfortable border border-dashed border-phase-canvas flex-row items-center gap-3">
              <Icon as={Sparkles} className="text-templeGold" size="xs" />
              <Text className="text-xs text-phaseText-secondary font-black uppercase tracking-widest">
                Personalized learning paths coming soon
              </Text>
            </Box>
          </VStack>
        </Box>

        {/* Core Onboarding Options */}
        <VStack className="flex-1 min-w-[350px] gap-6">
          <Box className="p-8 bg-phase-surface rounded-generous border border-phase-canvas shadow-sm">
            <VStack className="gap-6">
              <Heading className="text-lg font-black text-phaseText-primary">Get Started</Heading>
              <VStack className="gap-4">
                <Pressable
                  onPress={onJoinClass}
                  className="flex-row items-center p-4 bg-templeGold rounded-comfortable border border-templeGold active:opacity-90 transition-opacity"
                >
                  <Icon as={QrCode} className="mr-4 text-white" size="sm" />
                  <Text className="text-white font-black">Join a Classroom</Text>
                </Pressable>

                <Pressable
                  onPress={onFindSchool}
                  className="flex-row items-center p-4 bg-phase-canvas/50 rounded-comfortable border border-phase-canvas active:bg-phase-canvas transition-colors"
                >
                  <Icon as={Search} className="mr-4 text-phaseText-primary" size="sm" />
                  <Text className="text-phaseText-primary font-black">Find Your School</Text>
                </Pressable>

                <Pressable onPress={onTryDemo} className="items-center p-4 active:opacity-60">
                  <HStack className="items-center gap-2">
                    <Text className="text-templeGold font-black uppercase tracking-widest text-sm">
                      Explore Student Sandbox
                    </Text>
                    <ArrowRightCircle size={16} color="#D4843A" />
                  </HStack>
                </Pressable>
              </VStack>
            </VStack>
          </Box>

          <Box className="p-6 bg-phase-canvas/50 rounded-comfortable border border-phase-canvas">
            <VStack className="gap-4">
              <HStack className="gap-3 items-center">
                <Icon as={Layout} className="text-phaseText-secondary" size={18} />
                <Heading className="text-sm font-black text-phaseText-primary uppercase tracking-widest">
                  Platform Sovereignty
                </Heading>
              </HStack>
              <Text className="text-[12px] text-phaseText-secondary font-medium leading-normal">
                Your data and learning journey are yours. Gurudevi ensures a safe, private, and
                dignified environment for every student.
              </Text>
            </VStack>
          </Box>
        </VStack>
      </HStack>
    </VStack>
  );
}
