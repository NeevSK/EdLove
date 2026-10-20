import { useTemporalStore } from '@repo/core/logic';
import { Calendar, ChevronLeft, ChevronRight, RotateCcw } from '@repo/ui/icons';
import { Box, HStack, Pressable, Text } from '@repo/ui/primitives';
import { useMemo, useState } from 'react';
import { Modal, Platform, TextInput, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';

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
  const [manualDateInput, setManualDateInput] = useState('');

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0] || '', []);

  const adjustDate = (days: number) => {
    const date = new Date(viewDate + 'T12:00:00');
    date.setDate(date.getDate() + days);
    const dateStr = date.toISOString().split('T')[0] || '';
    setViewDate(dateStr);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T12:00:00');

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

  const phaseLabel = useMemo(() => {
    switch (phase) {
      case 'past':
        return 'Archival Review';
      case 'future':
        return 'Future Horizon';
      case 'present':
      default:
        return 'Live Practice';
    }
  }, [phase]);

  const relativeLabel = useMemo(() => {
    if (viewDate === todayStr) return 'Today';
    const dView = new Date(viewDate + 'T12:00:00');
    const dToday = new Date(todayStr + 'T12:00:00');
    const diffDays = Math.round((dView.getTime() - dToday.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === -1) return 'Yesterday';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < -1) return `${Math.abs(diffDays)}d ago`;
    if (diffDays > 1) return `+${diffDays}d`;
    return phaseLabel;
  }, [viewDate, todayStr, phaseLabel]);

  const handleOpenPicker = () => {
    setManualDateInput(viewDate);
    setShowDatePicker(true);
  };

  const handleManualDateConfirm = () => {
    if (manualDateInput && !Number.isNaN(Date.parse(manualDateInput))) {
      const parsedIso = new Date(manualDateInput + 'T12:00:00').toISOString().split('T')[0] || '';
      setViewDate(parsedIso);
    }
    setShowDatePicker(false);
  };

  const shiftDaysFromToday = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const dateStr = d.toISOString().split('T')[0] || '';
    setViewDate(dateStr);
    setShowDatePicker(false);
  };

  return (
    <Animated.View
      layout={LinearTransition}
      entering={FadeIn}
      className="bg-phase-surface/10 mx-3 my-1.5 py-1.5 px-2.5 rounded-full border border-white/10 shadow-sm flex-row items-center justify-between"
    >
      {/* Left: Dynamic Phase Badge */}
      <View
        className={`px-2.5 py-1 rounded-full flex-row items-center ${
          phase === 'present'
            ? 'bg-phase-accent/20 border border-phase-accent/40'
            : phase === 'past'
              ? 'bg-amber-900/25 border border-amber-600/40'
              : 'bg-cyan-900/25 border border-cyan-600/40'
        }`}
      >
        <Text
          className={`text-xs font-bold ${
            phase === 'present'
              ? 'text-phase-accent'
              : phase === 'past'
                ? 'text-amber-400'
                : 'text-cyan-400'
          }`}
        >
          {relativeLabel}
        </Text>
      </View>

      {/* Center: Stepper & Formatted Date */}
      <HStack className="items-center gap-1.5">
        <Pressable
          accessibilityRole="button"
          className="w-7 h-7 rounded-full bg-white/5 items-center justify-center active:bg-white/10"
          onPress={() => adjustDate(-1)}
          accessibilityLabel="Previous day"
        >
          <ChevronLeft size={16} color="#bbb" />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          className="px-1.5 py-0.5 active:opacity-75"
          onPress={handleOpenPicker}
        >
          <Text className="text-white text-xs font-semibold tracking-tight">
            {formatDate(viewDate)}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          className={`w-7 h-7 rounded-full bg-white/5 items-center justify-center ${
            isToday ? 'opacity-20' : 'active:bg-white/10'
          }`}
          onPress={() => !isToday && adjustDate(1)}
          disabled={isToday}
          accessibilityLabel="Next day"
        >
          <ChevronRight size={16} color="#bbb" />
        </Pressable>
      </HStack>

      {/* Right: Calendar Icon & Conditional Today Reset */}
      <HStack className="items-center gap-1.5">
        <Pressable
          accessibilityRole="button"
          className="w-7 h-7 rounded-full bg-white/10 items-center justify-center active:bg-white/20 border border-white/10"
          onPress={handleOpenPicker}
          accessibilityLabel="Calendar"
        >
          <Calendar size={13} color="#F6BF8C" />
        </Pressable>

        {!isToday && (
          <Pressable
            accessibilityRole="button"
            className="flex-row items-center px-2 py-1 rounded-full bg-phase-accent/20 border border-phase-accent/40 active:bg-phase-accent/30"
            onPress={resetToToday}
            accessibilityLabel="Go to Today"
          >
            <RotateCcw size={11} color="#F6BF8C" />
            <Text className="text-phase-accent text-[11px] font-bold ml-1">Go to Today</Text>
          </Pressable>
        )}
      </HStack>

      {/* Cross-platform Modal Date Picker Dialog (Eradicating prompt()) */}
      {showDatePicker && (
        <Modal
          transparent
          animationType="fade"
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View className="flex-1 bg-black/75 items-center justify-center p-4">
            <View className="bg-neutral-900 border border-white/10 rounded-2xl p-5 w-full max-w-sm">
              <Text className="text-white text-base font-bold mb-3">Choose Calendar Date</Text>

              {/* Quick Jump Options */}
              <View className="flex-row flex-wrap gap-2 mb-4">
                <Pressable
                  className="px-3 py-1.5 rounded-full bg-white/10 active:bg-white/20"
                  onPress={() => shiftDaysFromToday(0)}
                >
                  <Text className="text-white text-xs font-medium">★ Today</Text>
                </Pressable>
                <Pressable
                  className="px-3 py-1.5 rounded-full bg-white/10 active:bg-white/20"
                  onPress={() => shiftDaysFromToday(-1)}
                >
                  <Text className="text-white text-xs font-medium">Yesterday</Text>
                </Pressable>
                <Pressable
                  className="px-3 py-1.5 rounded-full bg-white/10 active:bg-white/20"
                  onPress={() => shiftDaysFromToday(-7)}
                >
                  <Text className="text-white text-xs font-medium">7 Days Ago</Text>
                </Pressable>
                <Pressable
                  className="px-3 py-1.5 rounded-full bg-white/10 active:bg-white/20"
                  onPress={() => shiftDaysFromToday(1)}
                >
                  <Text className="text-white text-xs font-medium">Tomorrow</Text>
                </Pressable>
              </View>

              {/* Manual Date Input */}
              <Text className="text-white/60 text-xs mb-1">Date (YYYY-MM-DD):</Text>
              <TextInput testID="direct-date-input"
                accessibilityLabel="Direct date input"
                value={manualDateInput}
                onChangeText={setManualDateInput}
                placeholder="2026-10-18"
                placeholderTextColor="#666"
                className="bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-white text-sm mb-4 font-mono"
                autoCapitalize="none"
              />

              <View className="flex-row justify-end gap-2">
                <Pressable
                  className="px-4 py-2 rounded-lg bg-white/5 active:bg-white/10"
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text className="text-white/70 text-xs font-semibold">Cancel</Text>
                </Pressable>
                <Pressable
                  className="px-4 py-2 rounded-lg bg-phase-accent/25 border border-phase-accent/40 active:bg-phase-accent/35"
                  onPress={handleManualDateConfirm}
                >
                  <Text className="text-phase-accent text-xs font-bold">Go to Date</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Native DateTimePicker if available on native */}
      {showDatePicker &&
        Platform.OS !== 'web' &&
        (() => {
          const DateTimePicker = loadDateTimePicker();
          if (!DateTimePicker) return null;
          return (
            <DateTimePicker
              value={new Date(viewDate + 'T12:00:00')}
              mode="date"
              display="default"
              onChange={(_event: any, selectedDate?: Date) => {
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
