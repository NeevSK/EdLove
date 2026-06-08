/**
 * MOOD PICKER CARD
 * Self-contained mood resonance card for logging and viewing reflections.
 * Standardized to Zero-Legacy: purged corrupted StyleSheet and migrated to NativeWind v4.
 */

import {
  Box,
  Heading,
  HStack,
  Icon,
  Input,
  InputField,
  Pressable,
  Spinner,
  Text,
  VStack,
} from '@repo/ui/primitives';

import { formatDistanceToNow } from 'date-fns';
import { History, MessageSquare, Plus, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import Animated, { FadeIn, FadeInUp, Layout } from 'react-native-reanimated';
import { MOOD_COLORS, MOOD_LABELS, MOOD_OPTIONS } from '../constants/wellbeing';
import type { MoodLog } from '../types/Wellbeing';

interface MoodPickerCardProps {
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (mood: MoodLog['mood'], note: string) => Promise<void>;
  isSaving: boolean;
  latestMood: MoodLog | null | undefined;
  isLoading: boolean;
  accent?: 'dark' | 'water' | 'light' | 'earth' | 'fire';
  isDisabled?: boolean;
}

export function MoodPickerCard({
  isOpen,
  onToggle,
  onSelect,
  isSaving,
  latestMood,
  isLoading,
  accent = 'dark',
  isDisabled = false,
}: MoodPickerCardProps) {
  const [note, setNote] = useState('');

  const bgClass = useMemo(() => {
    switch (accent) {
      case 'water':
        return 'bg-skyBlue/10 border-skyBlue/20';
      case 'light':
        return 'bg-mistGray/5 border-white/10';
      case 'earth':
        return 'bg-emeraldGreen/10 border-emeraldGreen/20';
      case 'fire':
        return 'bg-sanctuarySaffron/10 border-sanctuarySaffron/20';
      default:
        return 'bg-white/5 border-white/10';
    }
  }, [accent]);

  const activeColorClass = useMemo(() => {
    switch (accent) {
      case 'water':
        return 'text-skyBlue';
      case 'earth':
        return 'text-emeraldGreen';
      case 'fire':
        return 'text-sanctuarySaffron';
      default:
        return 'text-sanctuarySaffron';
    }
  }, [accent]);

  const handleSelect = async (mood: MoodLog['mood']) => {
    await onSelect(mood, note);
    setNote('');
  };

  return (
    <Animated.View layout={Layout} entering={FadeIn.duration(800)}>
      <Box className={`p-xl rounded-3xl border ${bgClass} shadow-sm overflow-hidden`}>
        <VStack className="gap-lg">
          {/* Header */}
          <HStack className="items-center justify-between">
            <VStack className="gap-0.5">
              <Heading
                size="xs"
                className="text-sacredWhite/90 uppercase tracking-widest font-black"
              >
                Mood Resonance
              </Heading>
              {!isOpen && latestMood && (
                <Text className="text-mistGray/40 text-[9px] uppercase font-bold tracking-tighter">
                  Last pulse:{' '}
                  {formatDistanceToNow(new Date(latestMood.created_at), {
                    addSuffix: true,
                  })}
                </Text>
              )}
            </VStack>

            <Pressable
              onPress={onToggle}
              disabled={isDisabled || isSaving}
              className={`flex-row items-center gap-2 px-4 py-2 rounded-full border ${isOpen ? 'bg-obsidian border-white/10' : 'bg-white/5 border-white/10'} active:scale-95 transition-all`}
            >
              <Icon
                as={isDisabled ? History : isOpen ? X : Plus}
                size={12}
                className={isOpen ? 'text-sacredWhite' : activeColorClass}
              />
              <Text
                className={`text-[10px] font-black uppercase tracking-widest ${isOpen ? 'text-sacredWhite' : 'text-sacredWhite/80'}`}
              >
                {isDisabled ? 'History' : isOpen ? 'Cancel' : 'Log Mood'}
              </Text>
            </Pressable>
          </HStack>

          {/* Picker overlay */}
          {isOpen && (
            <Animated.View entering={FadeInUp.springify().damping(15)}>
              <VStack className="bg-white/5 p-lg rounded-2xl gap-lg border border-white/5">
                <Text className="text-mistGray text-xs font-bold px-1">
                  How are you feeling right now?
                </Text>

                <HStack className="flex-wrap gap-2.5">
                  {MOOD_OPTIONS.map((opt) => (
                    <Pressable
                      key={opt.value}
                      disabled={isSaving}
                      onPress={() => void handleSelect(opt.value)}
                      className={`items-center justify-center p-3 rounded-xl min-w-[64px] bg-white/5 border border-white/5 active:bg-white/10 active:scale-90 transition-all ${isSaving ? 'opacity-30' : ''}`}
                    >
                      <Text className="text-2xl mb-1">{opt.emoji}</Text>
                      <Text className="text-sacredWhite/60 text-[9px] font-black uppercase tracking-tighter">
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </HStack>

                <Box className="bg-white/5 rounded-xl border border-white/10 px-4 py-1">
                  <Input className="border-0">
                    <InputField
                      value={note}
                      onChangeText={setNote}
                      placeholder="Optional somatic note..."
                      placeholderTextColor="#6B7280"
                      className="text-sacredWhite text-sm py-2"
                    />
                  </Input>
                </Box>

                {isSaving && (
                  <HStack className="items-center gap-2 justify-center py-2">
                    <Spinner size="small" className="text-sanctuarySaffron" />
                    <Text className="text-sanctuarySaffron text-[10px] uppercase font-black">
                      Recording Breath...
                    </Text>
                  </HStack>
                )}
              </VStack>
            </Animated.View>
          )}

          {/* Latest mood display */}
          {!isOpen && (
            <Box>
              {isLoading ? (
                <HStack className="items-center justify-center py-6 gap-3">
                  <Spinner size="small" className="text-skyBlue" />
                  <Text className="text-skyBlue opacity-60 text-xs font-bold uppercase tracking-widest">
                    Sensing resonance...
                  </Text>
                </HStack>
              ) : latestMood ? (
                <HStack className="items-center gap-6 py-2">
                  <Box className="w-20 h-20 items-center justify-center bg-white/5 rounded-full border-2 border-white/5">
                    <Text className="text-4xl">
                      {MOOD_OPTIONS.find((o) => o.value === latestMood.mood)?.emoji || '✨'}
                    </Text>
                    <Box className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-obsidian border border-white/10">
                      <Text
                        className="text-[10px] font-black"
                        style={{
                          color: MOOD_COLORS[latestMood.mood_score] ?? '#FCD34D',
                        }}
                      >
                        {latestMood.mood_score}/5
                      </Text>
                    </Box>
                  </Box>

                  <VStack className="flex-1 gap-2">
                    <Text className="text-sacredWhite text-lg font-black tracking-tight leading-tight">
                      {latestMood.mood
                        ? latestMood.mood.charAt(0).toUpperCase() + latestMood.mood.slice(1)
                        : MOOD_LABELS[latestMood.mood_score]}
                    </Text>

                    {latestMood.note ? (
                      <HStack className="gap-2 items-start opacity-70">
                        <Icon as={MessageSquare} size={10} className="text-mistGray mt-1" />
                        <Text className="text-mistGray text-[11px] leading-relaxed italic pr-2">
                          "{latestMood.note}"
                        </Text>
                      </HStack>
                    ) : (
                      <Text className="text-mistGray/30 text-[10px] italic">
                        No somatic note recorded.
                      </Text>
                    )}
                  </VStack>
                </HStack>
              ) : (
                <VStack className="items-center py-8 gap-3 opacity-30">
                  <Icon as={Plus} size={32} className="text-mistGray" />
                  <Text className="text-mistGray text-xs font-bold text-center max-w-[200px]">
                    Awaiting your first resonance log.
                  </Text>
                </VStack>
              )}
            </Box>
          )}
        </VStack>
      </Box>
    </Animated.View>
  );
}

export default MoodPickerCard;
