import { View, Text } from 'react-native';
import { Surface } from '@repo/ui/components/native';
import { Pressable } from 'react-native';
import { BookOpen, GraduationCap, Lock, Users } from '@repo/ui/icons';
import React from 'react';
import type { GroupType } from '@repo/community/types';

interface GroupCardProps {
  id: string;
  name: string;
  memberCount: number;
  type: GroupType;
  description?: string;
  onPress: () => void;
}

const GroupCard = React.memo(function GroupCard({
  name,
  memberCount,
  type,
  description,
  onPress,
}: GroupCardProps) {
  const getIcon = () => {
    switch (type) {
      case 'teachers_only':
      case 'admin_only':
        return <Lock size={12} className="text-phase-interactive" />;
      case 'class':
      case 'grade':
        return <GraduationCap size={12} className="text-phase-interactive" />;
      case 'subject':
        return <BookOpen size={12} className="text-phase-interactive" />;
      default:
        return <Users size={12} className="text-phase-interactive" />;
    }
  };

  return (
    <Pressable onPress={onPress} className="mb-3 active:opacity-90"><Surface tone="raised" className="rounded-3xl p-4 overflow-hidden">
      <View className="flex-row items-center items-center gap-4">
        {/* Avatar with Modern Gradient/Placeholder */}
        <View
          className={`w-14 h-14 rounded-2xl justify-center items-center ${type === 'general' ? 'bg-phase-interactive/10' : 'bg-phase-interactive/5'}`}
        >
          <Text className="text-2xl font-bold text-phase-interactive shadow-sm">
            {(name || 'G').charAt(0).toUpperCase()}
          </Text>
        </View>

        <View className="flex-1 gap-1">
          <View className="flex-row items-center justify-between items-center">
            <Text className="text-ink font-bold text-[17px] flex-1 mr-2" numberOfLines={1}>
              {name}
            </Text>
            <View className="px-2 py-0.5 rounded-full bg-phase-interactive/10 border border-phase-interactive/20">
              {getIcon()}
            </View>
          </View>

          <Text className="text-ink/60 text-[13px] leading-relaxed pr-2" numberOfLines={1}>
            {description || 'A space for shared exploration and connection.'}
          </Text>

          <View className="flex-row items-center items-center mt-1 gap-3">
            <View className="flex-row items-center items-center gap-1.5">
              <Users size={12} className="text-ink/40" />
              <Text className="text-ink/40 text-xs font-medium">{memberCount} members</Text>
            </View>
            <Text className="text-ink/10 text-xs">•</Text>
            <Text className="text-ink/40 text-[10px] font-bold uppercase tracking-widest">
              {type}
            </Text>
          </View>
        </View>
      </View>
    </Surface></Pressable>
  );
});

export default GroupCard;
