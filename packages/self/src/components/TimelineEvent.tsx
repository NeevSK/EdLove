/**
 * TIMELINE EVENT
 * A high-fidelity node representing a single step in the user's sanctuary journey.
 * Standardized to Zero-Legacy: purged corrupted StyleSheet and migrated to NativeWind v4.
 */

import { View, Text } from 'react-native';
import { Compass, Heart, MessageSquare, Star } from '@repo/ui/icons';
import type React from 'react';
import Animated, { FadeInLeft } from 'react-native-reanimated';

interface TimelineEventProps {
  type: 'mood' | 'journal' | 'growth' | 'path';
  title: string;
  content?: string;
  timestamp: string;
  intensity: number;
  isLast?: boolean;
}

export const TimelineEvent: React.FC<TimelineEventProps> = ({
  type,
  title,
  content,
  timestamp,
  intensity,
  isLast,
}) => {
  // Determine visuals based on event type
  const { icon: Icon, colorClass, borderClass } = (() => {
    switch (type) {
      case 'mood':
        return {
          icon: Heart,
          colorClass: 'text-rose-400',
          borderClass: 'border-rose-400/20',
        };
      case 'journal':
        return {
          icon: MessageSquare,
          colorClass: 'text-skyBlue',
          borderClass: 'border-skyBlue/20',
        };
      case 'growth':
        return {
          icon: Star,
          colorClass: 'text-sanctuarySaffron',
          borderClass: 'border-sanctuarySaffron/20',
        };
      case 'path':
        return {
          icon: Compass,
          colorClass: 'text-emeraldGreen',
          borderClass: 'border-emeraldGreen/20',
        };
      default:
        return {
          icon: Star,
          colorClass: 'text-mistGray',
          borderClass: 'border-white/10',
        };
    }
  })();

  return (
    <Animated.View entering={FadeInLeft.duration(600)}>
      <View className="flex-row items-center min-h-[80px] gap-2">
        {/* Visual Connector Path */}
        <View className="w-10 items-center">
          <View
            className={`w-3 h-3 rounded-full z-10 mt-1.5 shadow-sm ${colorClass.replace('text-', 'bg-')}`}
            style={{ opacity: intensity * 0.8 + 0.2 }}
          />
          {!isLast && (
            <View
              className={`w-0.5 flex-1 -mt-1 z-0 rounded-full ${colorClass.replace('text-', 'bg-')}/10`}
            />
          )}
        </View>

        {/* Event Card Content */}
        <View
          className={`flex-1 p-4 mb-4 rounded-2xl bg-white/5 border border-white/5 shadow-sm ${borderClass}/10`}
        >
          <View className="flex-row items-center items-center justify-between mb-1">
            <View className="flex-row items-center items-center gap-2">
              <Icon size={12} className={colorClass} />
              <Text className={`text-[10px] font-black uppercase tracking-[0.2em] ${colorClass}`}>
                {type}
              </Text>
            </View>
            <Text className="text-mistGray/30 text-[10px] font-bold">
              {new Date(timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>

          <Text className="text-sacredWhite/90 text-sm font-black mb-1">{title}</Text>

          {content && (
            <Text className="text-mistGray/60 text-xs leading-relaxed italic" numberOfLines={2}>
              {content}
            </Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

export default TimelineEvent;
