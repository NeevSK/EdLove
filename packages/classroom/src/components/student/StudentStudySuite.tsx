import {
  BookOpen,
  ChevronRight,
  MessageSquare,
  PanelsTopLeft,
  Star,
  TrendingUp,
} from '@repo/ui/icons';
import { useWorld } from '@repo/ui/theme/native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useNavigator } from '@repo/ui/components/native/navigation';

export const StudentStudySuite = () => {
  const router = useNavigator();
  const { tokens } = useWorld();

  const items = [
    {
      label: 'Library',
      icon: BookOpen,
      colorClass: 'text-sanctuarySaffron',
      onClick: () => router.push('/library'),
    },
    {
      label: 'Community',
      icon: MessageSquare,
      colorClass: 'text-sanctuary-info',
      onClick: () => router.push('/community'),
    },
    {
      label: 'Rewards',
      icon: Star,
      colorClass: 'text-sanctuarySaffron',
      onClick: () => {},
    },
    {
      label: 'Timetable',
      icon: PanelsTopLeft,
      colorClass: 'text-sanctuary-success',
      onClick: () => router.push('/workspace'),
    },
    {
      label: 'Self Reflection',
      icon: TrendingUp,
      colorClass: 'text-sanctuary-info',
      onClick: () => router.push('/self'),
    },
  ];

  return (
    <View className="bg-sanctuary-surface rounded-[32px] border border-sanctuary-border p-6">
      <Text className="text-xs font-black text-sanctuary-text-tertiary uppercase tracking-widest mb-4">
        Study Suite
      </Text>
      <View className="gap-1">
        {items.map((item, i) => {
          const IconComp = item.icon;
          return (
            <Pressable
              key={i}
              onPress={item.onClick}
              className="flex-row items-center gap-4 p-3 rounded-2xl active:bg-sanctuary-surface-secondary"
            >
              <View className="w-10 h-10 bg-sanctuary-surface-secondary rounded-xl items-center justify-center border border-sanctuary-border/50">
                <IconComp size={16} className={item.colorClass} />
              </View>
              <Text className="text-sm font-black text-sanctuary-text flex-1 tracking-tight">
                {item.label}
              </Text>
              <ChevronRight size={14} color={tokens.inkFaint} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default StudentStudySuite;
