import { useAuthStore } from '@repo/core/store';
import { Star } from '@repo/ui/icons';
import { useWorld } from '@repo/ui/theme/native';
import React from 'react';
import { Text, View } from 'react-native';

export function StudentHeader({ isDemo }: { isDemo: boolean }) {
  const { tokens } = useWorld();
  const user = useAuthStore((state) => state.user);

  return (
    <View className="mb-10 mt-2">
      <View className="flex-row items-center gap-3 mb-4">
        <View className="w-10 h-10 bg-sanctuary-info/10 rounded-xl items-center justify-center border border-sanctuary-info/20">
          <Star size={16} color={tokens.lampDeep} />
        </View>
        <Text className="text-[10px] font-black text-sanctuary-text-tertiary uppercase tracking-[3px]">
          Your Learning Journey
        </Text>
      </View>
      <Text className="text-4xl font-black text-sanctuary-text leading-[1.2] tracking-tighter">
        Radiate <Text className="text-sanctuary-info text-4xl font-black italic">Curiosity</Text>
        {isDemo ? ', Amara' : user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}.
      </Text>
    </View>
  );
}

export default StudentHeader;
