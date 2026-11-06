import { Target } from '@repo/ui/icons';
import { useWorld } from '@repo/ui/theme/native';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

export const StudentGoals = ({ goals, loading }: { goals: any[]; loading: boolean }) => {
  const router = useRouter();
  const { tokens } = useWorld();

  return (
    <View className="bg-sanctuary-surface rounded-[32px] border border-sanctuary-border p-6">
      <View className="flex-row items-center gap-2 mb-6">
        <Target size={14} color={tokens.inkFaint} />
        <Text className="text-xs font-black text-sanctuary-text-tertiary uppercase tracking-widest">
          Active Goals
        </Text>
      </View>

      {loading ? (
        <View className="h-32 rounded-2xl bg-white/5" />
      ) : goals.length === 0 ? (
        <Text className="text-sm font-medium text-sanctuary-text-tertiary leading-relaxed">
          No goals set yet. Start your growth journey.
        </Text>
      ) : (
        <View className="gap-6">
          {goals.slice(0, 3).map((goal: any) => (
            <View key={goal.id} className="gap-2">
              <Text className="text-sm font-black text-sanctuary-text tracking-tight">
                {goal.text}
              </Text>
              <View className="h-2 bg-sanctuary-border/20 rounded-full overflow-hidden">
                <View
                  className="h-full bg-sanctuary-info rounded-full"
                  style={{ width: `${goal.progress ?? 0}%` }}
                />
              </View>
              <Text className="text-[10px] font-black text-sanctuary-text-tertiary text-right tracking-widest uppercase">
                {goal.progress ?? 0}% Complete
              </Text>
            </View>
          ))}
        </View>
      )}

      <Pressable
        className="w-full mt-6 h-12 rounded-[18px] border border-sanctuary-border/60 items-center justify-center active:bg-white/5"
        onPress={() => router.push('/self')}
      >
        <Text className="text-xs font-bold text-sanctuary-text">View All Goals →</Text>
      </Pressable>
    </View>
  );
};

export default StudentGoals;
