import { useTemporalStore } from '@repo/core/logic';
import { TemporalScrubber } from '@repo/ui/components/TemporalScrubber';
import { Calendar, PanelsTopLeft as LayoutIcon, Wifi, WifiOff, Zap } from '@repo/ui/icons';
import { Box, HStack, Pressable, Text } from '@repo/ui/primitives';
import { tokens } from '@repo/ui/tokens';
import type React from 'react';
import { useState } from 'react';
import { Modal } from 'react-native';

/**
 * TemporalPilot
 *
 * The ultimate temporal command center.
 * Merges the intuitive flow of the Scrubber with the tactical precision of a Calendar.
 */
export interface TemporalPilotProps {
  onSearch?: () => void;
}

export const TemporalPilot: React.FC<TemporalPilotProps> = ({ onSearch }) => {
  const {
    viewScale,
    setScale,
    viewMode,
    setViewMode,
    timelineFocus,
    setTimelineFocus,
    readPolicy,
    setReadPolicy,
  } = useTemporalStore();
  const [isCalendarVisible, setCalendarVisible] = useState(false);

  return (
    <Box className="bg-white/5 rounded-3xl p-4 mx-4 border border-white/10">
      {/* Tactical Switcher */}
      <HStack className="justify-between items-center mb-4">
        <HStack className="gap-2">
          {(['day', 'week', 'month'] as const).map((s) => (
            <Pressable
              accessibilityRole="button"
              key={s}
              onPress={() => setScale(s)}
              className={`py-1.5 px-3 rounded-xl ${viewScale === s ? 'bg-white/20' : 'bg-white/5'}`}
            >
              <Text
                className={`text-[10px] font-bold ${viewScale === s ? 'text-white' : 'text-white/40'}`}
              >
                {s.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </HStack>

        <HStack className="gap-3">
          {/* View Mode Toggle */}
          <Pressable
            accessibilityRole="button"
            onPress={() => setViewMode(viewMode === 'spotlight' ? 'timeline' : 'spotlight')}
            className={`w-9 h-9 rounded-full items-center justify-center ${viewMode === 'timeline' ? 'bg-white/20 border border-phase-accent/50' : 'bg-white/5'}`}
          >
            {viewMode === 'spotlight' ? (
              <Zap size={20} color={tokens.colors.primary} />
            ) : (
              <LayoutIcon size={20} color={tokens.colors.primary} />
            )}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              readPolicy === 'cached-only' ? 'Allow live reads' : 'Use cached reads only'
            }
            accessibilityState={{ selected: readPolicy === 'cached-only' }}
            onPress={() => setReadPolicy(readPolicy === 'cached-only' ? 'live' : 'cached-only')}
            className="w-9 h-9 rounded-full bg-white/5 items-center justify-center active:bg-white/10"
          >
            {readPolicy === 'cached-only' ? (
              <WifiOff size={20} color={tokens.colors.error} />
            ) : (
              <Wifi size={20} color={tokens.colors.primary} />
            )}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => setCalendarVisible(true)}
            className="w-9 h-9 rounded-full bg-white/5 items-center justify-center active:bg-white/10"
          >
            <Calendar size={20} color={tokens.colors.primary} />
          </Pressable>

          {onSearch ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Search temporal records"
              onPress={onSearch}
              className="w-9 h-9 rounded-full bg-white/5 items-center justify-center active:bg-white/10"
            >
              <LayoutIcon size={20} color={tokens.colors.primary} />
            </Pressable>
          ) : null}
        </HStack>
      </HStack>

      {/* Focus Selector (Only in Timeline Mode) */}
      {viewMode === 'timeline' && (
        <HStack className="gap-2 mb-4 justify-center">
          {(['all', 'mood', 'journal'] as const).map((f) => (
            <Pressable
              accessibilityRole="button"
              key={f}
              onPress={() => setTimelineFocus(f)}
              className={`py-1 px-3 rounded-full border ${timelineFocus === f ? 'bg-phase-accent/10 border-phase-accent' : 'bg-white/5 border-white/10'}`}
            >
              <Text
                className={`text-[9px] font-extrabold tracking-widest ${timelineFocus === f ? 'text-phase-accent' : 'text-white/30'}`}
              >
                {f.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </HStack>
      )}

      {/* Intuitive Flow */}
      <TemporalScrubber />

      {/* Tactical Calendar Modal */}
      <Modal visible={isCalendarVisible} transparent animationType="fade">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close temporal calendar"
          onPress={() => setCalendarVisible(false)}
          className="flex-1 bg-black/80 justify-center items-center"
        >
          <Box className="w-[90%] bg-phase-canvas rounded-[32px] p-6 border border-white/10">
            <Text className="text-white text-lg font-bold mb-6 text-center">
              Select Temporal Point
            </Text>

            <Box className="h-[300px] bg-white/5 rounded-2xl items-center justify-center mb-6">
              <Text className="text-white/50">[Tactical Calendar Utility]</Text>
            </Box>

            <Pressable
              accessibilityRole="button"
              onPress={() => setCalendarVisible(false)}
              className="bg-phase-accent p-4 rounded-2xl items-center active:opacity-90"
            >
              <Text className="text-black font-extrabold tracking-widest">LOCK TEMPORAL VIEW</Text>
            </Pressable>
          </Box>
        </Pressable>
      </Modal>
    </Box>
  );
};
