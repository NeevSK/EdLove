import { Trophy } from '@repo/ui/icons';
import { useWorld } from '@repo/ui/theme/native';
import React from 'react';
import { Text, View } from 'react-native';

interface StudentGrowthPointsProps {
  points: number;
  isDemo: boolean;
}

export const StudentGrowthPoints = ({ points, isDemo }: StudentGrowthPointsProps) => {
  const { tokens } = useWorld();
  if (!isDemo) return null; // Only for demo for now based on original code

  return (
    <View className="bg-sanctuarySaffron/5 rounded-[32px] border border-sanctuarySaffron/20 p-6">
      <View className="flex-row items-center gap-2.5 mb-5">
        <View className="w-8 h-8 bg-sanctuarySaffron/10 rounded-xl items-center justify-center border border-sanctuarySaffron/20">
          <Trophy size={14} color={tokens.lampDeep} />
        </View>
        <Text className="text-sm font-black text-sanctuary-text uppercase tracking-widest">
          Growth Journey
        </Text>
      </View>

      <View className="flex-row items-baseline mb-1">
        <Text className="text-4xl font-black text-sanctuarySaffron tracking-tighter">{points}</Text>
        <Text className="text-sm font-black text-sanctuary-text-tertiary ml-1.5 uppercase tracking-widest">
          pts
        </Text>
      </View>

      <Text className="text-xs font-bold text-sanctuary-text-tertiary mb-5">
        Level 4 • Inquisitive Learner
      </Text>

      <View className="h-2 bg-sanctuarySaffron/10 rounded-full overflow-hidden mb-3">
        <View className="h-full bg-sanctuarySaffron rounded-full" style={{ width: '68%' }} />
      </View>

      <Text className="text-[10px] font-black text-sanctuary-text-tertiary uppercase tracking-widest">
        160 pts to next level
      </Text>
    </View>
  );
};

export default StudentGrowthPoints;
