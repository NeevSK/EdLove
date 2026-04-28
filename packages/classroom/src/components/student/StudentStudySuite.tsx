import { useNavigation } from '@react-navigation/native';
import {
  BookOpen,
  Box,
  ChevronRight,
  Heading,
  HStack,
  Icon,
  Layout,
  MessageSquare,
  Pressable,
  Star,
  Text,
  TrendingUp,
  VStack,
} from '@repo/ui';
import React from 'react';

export const StudentStudySuite = () => {
  const navigation = useNavigation<any>();

  const items = [
    {
      label: 'Library',
      icon: BookOpen,
      colorClass: 'text-sanctuarySaffron',
      onClick: () => navigation.navigate('Main', { screen: 'Library' }),
    },
    {
      label: 'Community',
      icon: MessageSquare,
      colorClass: 'text-sanctuary-info',
      onClick: () => navigation.navigate('Main', { screen: 'Community' }),
    },
    { label: 'Rewards', icon: Star, colorClass: 'text-sanctuarySaffron', onClick: () => {} },
    {
      label: 'Timetable',
      icon: Layout,
      colorClass: 'text-sanctuary-success',
      onClick: () => navigation.navigate('Timetable', {}),
    },
    {
      label: 'Self Reflection',
      icon: TrendingUp,
      colorClass: 'text-sanctuary-info',
      onClick: () => navigation.navigate('Main', { screen: 'Self' }),
    },
  ];

  return (
    <Box className="bg-sanctuary-surface rounded-[32px] border border-sanctuary-border p-6">
      <Heading className="text-xs font-black text-sanctuary-text-tertiary uppercase tracking-widest mb-4">
        Study Suite
      </Heading>
      <VStack className="gap-1">
        {items.map((item, i) => (
          <Pressable
            key={i}
            onPress={item.onClick}
            className="flex-row items-center gap-4 p-3 rounded-2xl active:bg-sanctuary-surface-secondary"
          >
            <Box className="w-10 h-10 bg-sanctuary-surface-secondary rounded-xl items-center justify-center border border-sanctuary-border/50">
              <Icon as={item.icon} size="sm" className={item.colorClass} />
            </Box>
            <Text className="text-sm font-black text-sanctuary-text flex-1 tracking-tight">
              {item.label}
            </Text>
            <Icon as={ChevronRight} size="xs" className="text-sanctuary-text-tertiary" />
          </Pressable>
        ))}
      </VStack>
    </Box>
  );
};
