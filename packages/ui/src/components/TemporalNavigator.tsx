import { useTemporalStore } from '@repo/core/logic';
import { Calendar, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react-native';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';
import { Box, HStack, Text } from '../gluestack';
import { Pressable } from '../primitives';
import { useState } from 'react';
import { Platform } from 'react-native';

/**
 * TemporalNavigator
 *
 * A premium UI component that allows users to travel through "Time".
 * Updates the global useTemporalStore which in turn refreshes data across the app.
 */
const loadDateTimePicker = () => {
  try {
    return require('@react-native-community/datetimepicker').default;
  } catch {
    return null;
  }
};

export const TemporalNavigator = () => {
  const { viewDate, setViewDate, resetToToday, phase } = useTemporalStore();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const adjustDate = (days: number) => {
    const date = new Date(viewDate);
    date.setDate(date.getDate() + days);
    const dateStr = date.toISOString().split('T')[0] || '';
    setViewDate(dateStr);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const todayStr = new Date().toISOString().split('T')[0];

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (dateStr === todayStr) return 'Today';
    if (dateStr === yesterdayStr) return 'Yesterday';

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  const isToday = phase === 'present';

  return (
    <Animated.View
      layout={Layout}
      entering={FadeIn}
      className="flex-row items-center justify-between bg-phase-surface/10 mx-4 my-2 py-2.5 px-3 rounded-xl border border-white/5 shadow-sm"
    >
      <HStack className="items-center flex-1 gap-2">
        <Pressable
          accessibilityRole="button"
          className="w-9 h-9 rounded-full bg-white/5 items-center justify-center active:bg-white/10"
          onPress={() => adjustDate(-1)}
        >
          <ChevronLeft size={20} color="#999" />
        </Pressable>

        {!isToday && (
          <Pressable
            accessibilityRole="button"
            className="flex-row items-center ml-2 px-2.5 py-1.5 rounded-lg bg-phase-accent/15 active:bg-phase-accent/25"
            onPress={resetToToday}
          >
            <RotateCcw size={14} color="#F6BF8C" />
            <Text className="text-phase-accent text-xs font-semibold ml-1">Today</Text>
          </Pressable>
        )}
      </HStack>

      <Pressable
        accessibilityRole="button"
        className="flex-row items-center px-3 active:opacity-70"
        onPress={() => {
          if (Platform.OS === 'web') {
            const dateStr = prompt('Enter date (YYYY-MM-DD):', viewDate);
            if (dateStr && !isNaN(Date.parse(dateStr))) {
              setViewDate(new Date(dateStr).toISOString().split('T')[0] || '');
            }
          } else {
            setShowDatePicker(true);
          }
        }}
      >
        <Calendar size={16} color="#F6BF8C" className="mr-1.5" />
        <Box>
          <Text className="text-white text-base font-bold tracking-tight">
            {formatDate(viewDate)}
          </Text>
          {/* Temporal pulse (Phase 2 delighter) */}
          <Box className="w-1 h-1 rounded-full bg-phase-accent absolute -bottom-2 self-center shadow-[0_0_8px_#F6BF8C]" />
        </Box>
      </Pressable>

      <Box className="flex-row items-center justify-end flex-1">
        <Pressable
          accessibilityRole="button"
          className={`w-9 h-9 rounded-full bg-white/5 items-center justify-center ${isToday ? 'opacity-20' : 'active:bg-white/10'}`}
          onPress={() => !isToday && adjustDate(1)}
          disabled={isToday}
        >
          <ChevronRight size={20} color="#999" />
        </Pressable>
      </Box>
      {showDatePicker && Platform.OS !== 'web' && (() => {
        const DateTimePicker = loadDateTimePicker();
        if (!DateTimePicker) return null;
        return (
          <DateTimePicker
            value={new Date(viewDate)}
            mode="date"
            display="default"
            onChange={(event: any, selectedDate?: Date) => {
              setShowDatePicker(false);
              if (selectedDate) {
                const dateStr = selectedDate.toISOString().split('T')[0] || '';
                setViewDate(dateStr);
              }
            }}
          />
        );
      })()}
    </Animated.View>
  );
};
