import { FireflyMascot } from '@repo/ui';
import {
  ChevronRight,
  CircleArrowRight,
  GraduationCap,
  Search,
  ShieldCheck,
  UserPlus,
  Zap,
} from '@repo/ui/icons';
import {
  Box,
  Heading,
  HStack,
  Icon,
  Pressable,
  ScrollView,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { hapticLight } from '@repo/ui/utils/haptics';

interface StudentOnboardingViewProps {
  onTryDemo: () => void;
  onJoinClass: () => void;
  onFindSchool: () => void;
  isGuest: boolean;
}

export default function StudentOnboardingView({
  onTryDemo,
  onJoinClass,
  onFindSchool,
  isGuest,
}: StudentOnboardingViewProps) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerClassName="p-6 self-center w-full max-w-[800px]"
    >
      <VStack className="gap-10 py-10">
        {/* Welcome Header */}
        <VStack className="gap-2 items-center">
          <Box className="p-2 mb-2 items-center justify-center">
            <FireflyMascot size={88} mode="glowing" role="guide" />
          </Box>
          <Heading className="text-3xl font-black text-phaseText-primary text-center">
            Welcome to Your Sanctuary
          </Heading>
          <Text className="text-center text-phaseText-secondary text-base max-w-[500px] leading-relaxed">
            Tutii is here to guide your learning journey. Join your classroom, connect with your mentors, and explore your path of growth.
          </Text>
        </VStack>

        {/* Primary Actions Grid */}
        <VStack className="gap-6">
          {/* Join Class Card */}
          <Pressable
            onPress={() => {
              hapticLight();
              onJoinClass();
            }}
            className="w-full bg-phase-surface p-6 rounded-generous border border-phase-canvas shadow-sm"
            style={({ pressed }) => [
              pressed ? { transform: [{ scale: 0.98 }] } : null,
            ]}
          >
            <HStack className="gap-5 items-center">
              <Box className="w-16 h-16 rounded-comfortable bg-templeGold items-center justify-center shadow-lg">
                <Icon as={UserPlus} className="text-white" size="lg" />
              </Box>
              <VStack className="flex-1 gap-1">
                <Heading className="text-lg font-black text-phaseText-primary">
                  Join a Classroom
                </Heading>
                <Text className="text-phaseText-secondary text-sm font-medium leading-snug">
                  Enter a class code or scan a QR code provided by your teacher to enter your
                  learning space.
                </Text>
                {isGuest && (
                  <HStack className="gap-1.5 items-center mt-1">
                    <Icon as={ShieldCheck} size="xs" className="text-templeGold" />
                    <Text className="text-[10px] text-templeGold font-black uppercase tracking-widest">
                      Guest Access
                    </Text>
                  </HStack>
                )}
              </VStack>
              <Icon as={ChevronRight} className="text-phaseText-tertiary" size="sm" />
            </HStack>
          </Pressable>

          {/* Find School Card */}
          <Pressable
            onPress={() => {
              hapticLight();
              onFindSchool();
            }}
            className="w-full bg-phase-canvas/50 p-6 rounded-generous border border-phase-canvas"
            style={({ pressed }) => [
              pressed ? { transform: [{ scale: 0.98 }] } : null,
            ]}
          >
            <HStack className="gap-5 items-center">
              <Box className="w-16 h-16 rounded-comfortable bg-phase-canvas items-center justify-center">
                <Icon as={Search} className="text-phaseText-secondary" size="lg" />
              </Box>
              <VStack className="flex-1 gap-1">
                <Heading className="text-base font-black text-phaseText-primary">
                  Find My School
                </Heading>
                <Text className="text-phaseText-secondary text-sm font-medium leading-snug">
                  Search for your institution to find available classes and school events.
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
                  See Your Future
                </Heading>
                <Text className="text-white/70 text-sm text-center max-w-[400px] font-medium leading-relaxed">
                  Experience Gurudevi from a student's perspective. Join a demo class and explore
                  your learning portal.
                </Text>
              </VStack>

              <Pressable
                onPress={() => {
                  hapticLight();
                  onTryDemo();
                }}
                className="bg-templeGold px-8 h-[54px] rounded-full items-center justify-center shadow-lg"
                style={({ pressed }) => [
                  pressed ? { transform: [{ scale: 0.95 }] } : null,
                ]}
              >
                <HStack className="items-center gap-2">
                  <Text className="text-white font-black text-base uppercase tracking-widest">
                    Start Learning Demo
                  </Text>
                  <Icon as={CircleArrowRight} size="sm" className="text-white" />
                </HStack>
              </Pressable>
            </VStack>
          </Box>
        </VStack>

        <Text className="text-center text-phaseText-tertiary text-[10px] font-black uppercase tracking-[0.2em] mt-5">
          Gurudevi Portals &bull; Joyful Learning
        </Text>
      </VStack>
    </ScrollView>
  );
}
