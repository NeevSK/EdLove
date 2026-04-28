import {
  ArrowRightCircle,
  BookOpen,
  Box,
  Heading,
  HStack,
  Icon,
  Plus,
  Pressable,
  School,
  Search,
  Text,
  Users,
  VStack,
  Zap,
} from '@repo/ui';
import React from 'react';

interface TeacherOnboardingViewProps {
  onTryDemo: () => void;
  onCreateClassroom: () => void;
  onJoinSchool: () => void;
  isGuest: boolean;
}

export default function TeacherOnboardingViewWeb({
  onTryDemo,
  onCreateClassroom,
  onJoinSchool,
  isGuest,
}: TeacherOnboardingViewProps) {
  return (
    <VStack className="flex-1 bg-phase-canvas p-10 max-w-[1200px] self-center w-full gap-12">
      {/* Header */}
      <VStack className="gap-2 items-center">
        <Box className="p-4 rounded-generous bg-templeGold/10 mb-3">
          <Icon as={School} className="text-templeGold" size="xl" />
        </Box>
        <Heading className="text-4xl font-black text-phaseText-primary text-center">
          Empower Your Teaching Sanctuary
        </Heading>
        <Text className="text-phaseText-secondary text-lg max-w-[600px] text-center leading-relaxed font-medium">
          Gurudevi provides teachers with AI-powered tools to manage classrooms, track student
          growth, and create engaging learning experiences.
        </Text>
      </VStack>

      <HStack className="gap-8 flex-wrap justify-center">
        {/* Interactive Lesson Planner Promotion */}
        <Box className="flex-1 min-w-[350px] p-8 bg-phase-surface rounded-generous border border-phase-canvas shadow-xl">
          <VStack className="gap-6">
            <HStack className="gap-4 items-center">
              <Box className="p-3 bg-templeGold/10 rounded-comfortable">
                <Icon as={BookOpen} className="text-templeGold" size="lg" />
              </Box>
              <Heading className="text-xl font-black text-phaseText-primary">
                Intelligent Lesson Planning
              </Heading>
            </HStack>

            <Text className="text-phaseText-secondary text-sm font-medium leading-relaxed">
              Draft comprehensive lesson plans in seconds with AI assistance. Align your curriculum
              with national standards and generate interactive resources for your students.
            </Text>

            <Box className="p-4 bg-phase-canvas/50 rounded-comfortable border border-dashed border-phase-canvas flex-row items-center gap-3">
              <Icon as={Zap} className="text-templeGold" size="xs" />
              <Text className="text-xs text-phaseText-secondary font-black uppercase tracking-widest">
                AI-powered curriculum alignment incoming
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
                  onPress={onCreateClassroom}
                  className="flex-row items-center p-4 bg-templeGold rounded-comfortable border border-templeGold active:opacity-90 transition-opacity"
                >
                  <Icon as={Plus} className="mr-4 text-white" size="sm" />
                  <Text className="text-white font-black">Create New Classroom</Text>
                </Pressable>

                <Pressable
                  onPress={onJoinSchool}
                  className="flex-row items-center p-4 bg-phase-canvas/50 rounded-comfortable border border-phase-canvas active:bg-phase-canvas transition-colors"
                >
                  <Icon as={Search} className="mr-4 text-phaseText-primary" size="sm" />
                  <Text className="text-phaseText-primary font-black">Join Existing Sanctuary</Text>
                </Pressable>

                <Pressable onPress={onTryDemo} className="items-center p-4 active:opacity-60">
                  <HStack className="items-center gap-2">
                    <Text className="text-templeGold font-black uppercase tracking-widest text-sm">
                      Explore Teacher Sandbox
                    </Text>
                    <Icon as={ArrowRightCircle} size={16} color="#D4843A" />
                  </HStack>
                </Pressable>
              </VStack>
            </VStack>
          </Box>

          <Box className="p-6 bg-phase-canvas/50 rounded-comfortable border border-phase-canvas">
            <VStack className="gap-4">
              <HStack className="gap-3 items-center">
                <Icon as={Users} className="text-phaseText-secondary" size={18} />
                <Heading className="text-sm font-black text-phaseText-primary uppercase tracking-widest">
                  Community & Collaboration
                </Heading>
              </HStack>
              <Text className="text-[12px] text-phaseText-secondary font-medium leading-normal">
                Connect with other educators in your sanctuary, share resources, and collaborate on
                institutional growth.
              </Text>
            </VStack>
          </Box>
        </VStack>
      </HStack>
    </VStack>
  );
}
