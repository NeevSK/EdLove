import React from 'react';
import { Text, View } from 'react-native';

export const StudentStatCard = ({ stat, isDemo }: { stat: any; isDemo: boolean }) => {
  if (!stat) return null;
  const IconComp = stat.icon;

  return (
    <View className="flex-1 bg-sanctuary-surface rounded-[32px] border border-sanctuary-border p-6 gap-4 min-w-[150px]">
      <View className="w-10 h-10 bg-sanctuary-surface-secondary rounded-2xl items-center justify-center border border-sanctuary-border/30">
        {IconComp && <IconComp size={16} className={stat.colorClass || 'text-sanctuarySaffron'} />}
      </View>
      <View>
        <View className="flex-row items-baseline gap-1">
          <Text className="text-3xl font-black text-sanctuary-text tracking-tighter">
            {stat.value}
          </Text>
          {isDemo && stat.value !== '' && (
            <Text className="text-sm font-black text-sanctuarySaffron mb-1">&</Text>
          )}
        </View>
        <Text className="text-[10px] font-black text-sanctuary-text-tertiary uppercase tracking-widest mt-1">
          {stat.label}
        </Text>
      </View>
    </View>
  );
};

export const StudentStats = ({ stats, isDemo }: { stats: any[]; isDemo: boolean }) => {
  return (
    <View className="flex-row flex-wrap gap-4 mb-10 w-full">
      {stats.map((stat, i) => (
        <StudentStatCard key={i} stat={stat} isDemo={isDemo} />
      ))}
    </View>
  );
};

export default StudentStats;
