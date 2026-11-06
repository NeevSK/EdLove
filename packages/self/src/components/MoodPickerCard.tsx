/**
 * MOOD PICKER CARD
 * Self-contained mood resonance card for logging and viewing reflections.
 * Reconstructed: Purged legacy UI primitives and replaced with React Native primitives + @repo/ui/theme/native.
 */

import { MOOD_COLORS, MOOD_LABELS, MOOD_OPTIONS } from '@repo/self/constants/wellbeing';
import type { MoodLog } from '@repo/self/types/Wellbeing';
import { WaitingSign } from '@repo/ui/components/native';
import { History, MessageSquare, Plus, X } from '@repo/ui/icons';
import { useWorld } from '@repo/ui/theme/native';
import { formatDistanceToNow } from 'date-fns';
import React, { useMemo, useState } from 'react';
import {
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInUp, LinearTransition } from 'react-native-reanimated';

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
  const { tokens } = useWorld();
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

  const IconComp = isDisabled ? History : isOpen ? X : Plus;

  return (
    <Animated.View layout={LinearTransition} entering={FadeIn.duration(800)}>
      <View className={`p-5 rounded-3xl border ${bgClass} shadow-sm overflow-hidden`}>
        <View className="gap-4">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <View className="gap-0.5">
              <Text className="text-sacredWhite/90 uppercase tracking-widest font-black text-xs">
                Mood Resonance
              </Text>
              {!isOpen && latestMood && (
                <Text className="text-mistGray/40 text-[9px] uppercase font-bold tracking-tighter">
                  Last pulse:{' '}
                  {formatDistanceToNow(new Date(latestMood.created_at), {
                    addSuffix: true,
                  })}
                </Text>
              )}
            </View>

            <Pressable
              onPress={onToggle}
              disabled={isDisabled || isSaving}
              className={`flex-row items-center gap-2 px-4 py-2 rounded-full border ${
                isOpen ? 'bg-obsidian border-white/10' : 'bg-white/5 border-white/10'
              } active:scale-95`}
            >
              <IconComp
                size={12}
                color={isOpen ? tokens.ink : tokens.lampDeep}
              />
              <Text
                className={`text-[10px] font-black uppercase tracking-widest ${
                  isOpen ? 'text-sacredWhite' : 'text-sacredWhite/80'
                }`}
              >
                {isDisabled ? 'History' : isOpen ? 'Cancel' : 'Log Mood'}
              </Text>
            </Pressable>
          </View>

          {/* Picker overlay */}
          {isOpen && (
            <Animated.View entering={FadeInUp.springify().damping(15)}>
              <View className="bg-white/5 p-4 rounded-2xl gap-4 border border-white/5">
                <Text className="text-mistGray text-xs font-bold px-1">
                  How are you feeling right now?
                </Text>

                <View className="flex-row flex-wrap gap-2.5">
                  {MOOD_OPTIONS.map((opt) => (
                    <Pressable
                      key={opt.value}
                      disabled={isSaving}
                      onPress={() => void handleSelect(opt.value)}
                      className={`items-center justify-center p-3 rounded-xl min-w-[64px] bg-white/5 border border-white/5 active:bg-white/10 active:scale-90 ${
                        isSaving ? 'opacity-30' : ''
                      }`}
                    >
                      <Text className="text-2xl mb-1">{opt.emoji}</Text>
                      <Text className="text-sacredWhite/60 text-[9px] font-black uppercase tracking-tighter">
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <View className="bg-white/5 rounded-xl border border-white/10 px-4 py-1">
                  <TextInput
                    value={note}
                    onChangeText={setNote}
                    placeholder="Optional somatic note..."
                    placeholderTextColor={tokens.inkFaint}
                    className="text-sacredWhite text-sm py-2"
                  />
                </View>

                {isSaving && (
                  <View className="flex-row items-center gap-2 justify-center py-2">
                    <WaitingSign size={20} />
                    <Text className="text-sanctuarySaffron text-[10px] uppercase font-black">
                      Recording Breath...
                    </Text>
                  </View>
                )}
              </View>
            </Animated.View>
          )}

          {/* Latest mood display */}
          {!isOpen && (
            <View>
              {isLoading ? (
                <View className="flex-row items-center justify-center py-6 gap-3">
                  <WaitingSign size={20} />
                  <Text className="text-skyBlue opacity-60 text-xs font-bold uppercase tracking-widest">
                    Sensing resonance...
                  </Text>
                </View>
              ) : latestMood ? (
                <View className="flex-row items-center gap-6 py-2">
                  <View className="w-20 h-20 items-center justify-center bg-white/5 rounded-full border-2 border-white/5">
                    <Text className="text-4xl">
                      {MOOD_OPTIONS.find((o) => o.value === latestMood.mood)?.emoji || '✨'}
                    </Text>
                    <View className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-obsidian border border-white/10">
                      <Text
                        className="text-[10px] font-black"
                        style={{
                          color: MOOD_COLORS[latestMood.mood_score] ?? tokens.lampDeep,
                        }}
                      >
                        {latestMood.mood_score}/5
                      </Text>
                    </View>
                  </View>

                  <View className="flex-1 gap-2">
                    <Text className="text-sacredWhite text-lg font-black tracking-tight leading-tight">
                      {latestMood.mood
                        ? latestMood.mood.charAt(0).toUpperCase() + latestMood.mood.slice(1)
                        : MOOD_LABELS[latestMood.mood_score]}
                    </Text>

                    {latestMood.note ? (
                      <View className="flex-row gap-2 items-start opacity-70">
                        <MessageSquare size={10} color={tokens.inkFaint} style={{ marginTop: 4 }} />
                        <Text className="text-mistGray text-[11px] leading-relaxed italic pr-2">
                          "{latestMood.note}"
                        </Text>
                      </View>
                    ) : (
                      <Text className="text-mistGray/30 text-[10px] italic">
                        No somatic note recorded.
                      </Text>
                    )}
                  </View>
                </View>
              ) : (
                <View className="items-center py-8 gap-3 opacity-30">
                  <Plus size={32} color={tokens.inkFaint} />
                  <Text className="text-mistGray text-xs font-bold text-center max-w-[200px]">
                    Awaiting your first resonance log.
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

export default MoodPickerCard;
