import { View, Text, Pressable, ScrollView } from 'react-native';
import {
  Building,
  Building2,
  ChevronRight,
  CircleArrowRight,
  Search,
  ShieldCheck,
  Zap,
} from '@repo/ui/icons';
import { hapticLight } from '@repo/ui/utils/haptics';

interface PrincipalOnboardingViewProps {
  onTryDemo: () => void;
  onCreateSchool: () => void;
  onJoinSchool: () => void;
  isGuest: boolean;
}

export default function PrincipalOnboardingView({
  onTryDemo,
  onCreateSchool,
  onJoinSchool,
  isGuest,
}: PrincipalOnboardingViewProps) {
  return (
    <ScrollView
      contentContainerClassName="p-6 self-center w-full max-w-[800px]"
    >
      <View className="gap-10 py-10">
        {/* Welcome Header */}
        <View className="gap-2 items-center">
          <View className="p-4 rounded-generous bg-templeGold/10 mb-3">
            <Building2 size={32} className="text-templeGold" />
          </View>
          <Text className="text-3xl font-black text-phaseText-primary text-center">
            Welcome, Principal
          </Text>
          <Text className="text-center text-phaseText-secondary text-base max-w-[500px] leading-relaxed">
            Your journey to digitize and empower your institution begins here. Choose how you'd like
            to proceed.
          </Text>
        </View>

        {/* Primary Actions Grid */}
        <View className="gap-6">
          {/* Establish Sanctuary Card */}
          <Pressable
            onPress={() => {
              hapticLight();
              onCreateSchool();
            }}
            className="w-full bg-phase-surface p-6 rounded-generous border border-phase-canvas shadow-sm"
            style={({ pressed }) => [
              pressed ? { transform: [{ scale: 0.98 }] } : null,
            ]}
          >
            <View className="flex-row items-center gap-5 items-center">
              <View className="w-16 h-16 rounded-comfortable bg-templeGold items-center justify-center shadow-lg">
                <Building size={24} className="text-white" />
              </View>
              <View className="flex-1 gap-1">
                <Text className="text-lg font-black text-phaseText-primary">
                  Found New Sanctuary
                </Text>
                <Text className="text-phaseText-secondary text-sm font-medium leading-snug">
                  Establish a digital presence for your school, manage staff, and track student
                  progress.
                </Text>
                {isGuest && (
                  <View className="flex-row items-center gap-1.5 items-center mt-1">
                    <ShieldCheck size={12} className="text-templeGold" />
                    <Text className="text-[10px] text-templeGold font-black uppercase tracking-widest">
                      Requires Account
                    </Text>
                  </View>
                )}
              </View>
              <ChevronRight size={16} className="text-phaseText-tertiary" />
            </View>
          </Pressable>

          {/* Join School Card */}
          <Pressable
            onPress={() => {
              hapticLight();
              onJoinSchool();
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
                  Join Existing Institution
                </Text>
                <Text className="text-phaseText-secondary text-sm font-medium leading-snug">
                  Search for your school and request administrative access.
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
                  Experience the Future
                </Text>
                <Text className="text-white/70 text-sm text-center max-w-[400px] font-medium leading-relaxed">
                  Explore a fully populated sample dashboard to see how Gurudevi transforms school
                  management.
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
                    Launch Demo Sandbox
                  </Text>
                  <CircleArrowRight size={16} className="text-white" />
                </View>
              </Pressable>
            </View>
          </View>
        </View>

        <Text className="text-center text-phaseText-tertiary text-[10px] font-black uppercase tracking-[0.2em] mt-5">
          Gurudevi Sanctuaries &bull; Dignified Growth
        </Text>
      </View>
    </ScrollView>
  );
}
