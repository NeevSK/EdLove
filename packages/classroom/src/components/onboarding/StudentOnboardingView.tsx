import { View, Text, Pressable, ScrollView } from 'react-native';
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
      <View className="gap-10 py-10">
        {/* Welcome Header */}
        <View className="gap-2 items-center">
          <View className="p-2 mb-2 items-center justify-center">
            <FireflyMascot size={88} mode="glowing" role="guide" />
          </View>
          <Text className="text-3xl font-black text-phaseText-primary text-center">
            Welcome to Your Sanctuary
          </Text>
          <Text className="text-center text-phaseText-secondary text-base max-w-[500px] leading-relaxed">
            Tutii is here to guide your learning journey. Join your classroom, connect with your mentors, and explore your path of growth.
          </Text>
        </View>

        {/* Primary Actions Grid */}
        <View className="gap-6">
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
            <View className="flex-row items-center gap-5 items-center">
              <View className="w-16 h-16 rounded-comfortable bg-templeGold items-center justify-center shadow-lg">
                <UserPlus size={24} className="text-white" />
              </View>
              <View className="flex-1 gap-1">
                <Text className="text-lg font-black text-phaseText-primary">
                  Join a Classroom
                </Text>
                <Text className="text-phaseText-secondary text-sm font-medium leading-snug">
                  Enter a class code or scan a QR code provided by your teacher to enter your
                  learning space.
                </Text>
                {isGuest && (
                  <View className="flex-row items-center gap-1.5 items-center mt-1">
                    <ShieldCheck size={12} className="text-templeGold" />
                    <Text className="text-[10px] text-templeGold font-black uppercase tracking-widest">
                      Guest Access
                    </Text>
                  </View>
                )}
              </View>
              <ChevronRight size={16} className="text-phaseText-tertiary" />
            </View>
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
            <View className="flex-row items-center gap-5 items-center">
              <View className="w-16 h-16 rounded-comfortable bg-phase-canvas items-center justify-center">
                <Search size={24} className="text-phaseText-secondary" />
              </View>
              <View className="flex-1 gap-1">
                <Text className="text-base font-black text-phaseText-primary">
                  Find My School
                </Text>
                <Text className="text-phaseText-secondary text-sm font-medium leading-snug">
                  Search for your institution to find available classes and school events.
                </Text>
              </View>
              <ChevronRight size={16} className="text-phaseText-tertiary" />
            </View>
          </Pressable>

          {/* Try Demo Banner */}
          <View className="mt-8 p-8 rounded-generous bg-[#1A1A1A] overflow-hidden relative border border-[#2A2A2A]">
            <View className="absolute -right-5 -top-5 w-40 h-40 rounded-full bg-templeGold/15" />
            <View className="gap-6 items-center">
              <View className="p-3 rounded-comfortable bg-white/10 border border-white/10">
                <Zap size={24} className="text-templeGold" />
              </View>
              <View className="gap-2 items-center">
                <Text className="text-2xl font-black text-white text-center">
                  See Your Future
                </Text>
                <Text className="text-white/70 text-sm text-center max-w-[400px] font-medium leading-relaxed">
                  Experience Gurudevi from a student's perspective. Join a demo class and explore
                  your learning portal.
                </Text>
              </View>

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
                <View className="flex-row items-center items-center gap-2">
                  <Text className="text-white font-black text-base uppercase tracking-widest">
                    Start Learning Demo
                  </Text>
                  <CircleArrowRight size={16} className="text-white" />
                </View>
              </Pressable>
            </View>
          </View>
        </View>

        <Text className="text-center text-phaseText-tertiary text-[10px] font-black uppercase tracking-[0.2em] mt-5">
          Gurudevi Portals &bull; Joyful Learning
        </Text>
      </View>
    </ScrollView>
  );
}
