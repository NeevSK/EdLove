/**
 * WISDOM SEEDS
 * Allows users to record and review their insights and realizations.
 * Standardized to October 29+ UI Kit architecture.
 */

import { useDraft } from '@repo/ui/context/Drafts';
import { useSafeMutation } from '@repo/core/hooks';
import { usePermissions } from '@repo/core/logic';
import { useWisdom } from '@repo/self/hooks/useWisdom';
import { Button, Surface } from '@repo/ui/components/native';
import { ChevronRight, Leaf, Plus, Send, Sprout } from '@repo/ui/icons';
import { useWorld } from '@repo/ui/theme/native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, LinearTransition } from 'react-native-reanimated';

interface WisdomSeedsProps {
  userId?: string;
}

export default function WisdomSeeds({ userId }: WisdomSeedsProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { context } = usePermissions();
  const activeUserId = userId || context?.userId;
  const { tokens } = useWorld();

  // Resilient Data Hook
  const {
    notes = [],
    refreshData,
    isLoading,
    error: historyError,
    addWisdomNote,
  } = useWisdom(activeUserId ?? undefined);

  const [showForm, setShowForm] = useState(false);
  const { value: insight, setValue: setInsight } = useDraft('self:wisdom');

  const { mutate, isPending: isSaving } = useSafeMutation(
    async (insightText: string) => {
      if (!activeUserId) throw new Error('User not authenticated');
      await addWisdomNote(insightText);
    },
    {
      mutationKey: 'addWisdomNote',
      scope: 'self',
      mutationType: 'CREATE',
      onSuccess: () => {
        setInsight('');
        setShowForm(false);
        refreshData();
      },
    },
  );

  const handleSave = () => {
    if (!insight.trim() || isSaving) return;
    mutate(insight);
  };

  return (
    <View className="flex-1 gap-6 p-5">
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full bg-emeraldGreen/10 items-center justify-center">
            <Leaf size={18} color={tokens.success} />
          </View>
          <Text className="text-sacredWhite/90 text-base font-bold tracking-tight">
            {t('self.wisdomSeeds') || 'Wisdom Seeds'}
          </Text>
        </View>

        <Pressable
          onPress={() => setShowForm(!showForm)}
          className={`w-10 h-10 rounded-full items-center justify-center ${
            showForm ? 'bg-obsidian border border-white/10' : 'bg-emeraldGreen'
          }`}
          accessibilityRole="button"
          accessibilityLabel={showForm ? 'Collapse form' : 'Plant seed'}
        >
          {showForm ? (
            <ChevronRight size={20} color={tokens.inkSoft} />
          ) : (
            <Plus size={20} color={tokens.onLamp} />
          )}
        </Pressable>
      </View>

      {showForm && (
        <Animated.View entering={FadeInDown.duration(400)}>
          <View className="bg-white/5 rounded-3xl border border-white/10 p-5 shadow-xl gap-4">
            <Text className="text-mistGray text-xs font-bold px-1">
              {t('self.plantSeed') || 'Plant a new seed of wisdom'}
            </Text>

            <View className="bg-white/5 rounded-2xl border border-white/5 p-4 min-h-[100px]">
              <TextInput
                value={insight}
                onChangeText={setInsight}
                multiline
                className="text-sacredWhite text-sm leading-relaxed"
                style={{ textAlignVertical: 'top' }}
                placeholder={t('self.wisdomPlaceholder') || 'What have you realized today?'}
                placeholderTextColor={tokens.inkFaint}
              />
            </View>

            <View className="items-end">
              <Button
                label={isSaving ? 'Growing...' : t('common.plant') || 'Plant Seed'}
                icon={Send}
                variant="primary"
                disabled={!insight.trim() || isSaving}
                onPress={handleSave}
              />
            </View>
          </View>
        </Animated.View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        className="flex-1"
      >
        <View className="gap-3">
          {historyError ? (
            <View className="flex-row items-center justify-between gap-3 rounded-2xl border border-emberRed/30 bg-emberRed/10 p-4">
              <Text className="flex-1 text-sm text-mistGray" accessibilityRole="alert">
                {historyError} Showing the last available notes.
              </Text>
              <Pressable
                onPress={() => void refreshData()}
                accessibilityRole="button"
                accessibilityLabel="Retry loading wisdom notes"
              >
                <Text className="font-bold text-sanctuarySaffron">Retry</Text>
              </Pressable>
            </View>
          ) : notes.length === 0 && !isLoading ? (
            <View className="py-20 items-center gap-4 opacity-20">
              <Sprout size={48} color={tokens.inkSoft} />
              <Text className="text-mistGray text-xs font-bold text-center italic max-w-[200px]">
                {t('self.noWisdomYet') || 'No wisdom seeds planted in this sanctuary yet.'}
              </Text>
            </View>
          ) : (
            notes.map((note, index) => (
              <Animated.View key={note.id} entering={FadeIn.delay(index * 100)} layout={LinearTransition}>
                <Pressable
                  onPress={() =>
                    router.push({ pathname: '/self/wisdom/[id]', params: { id: note.id } })
                  }
                  className="bg-white/5 p-4 rounded-2xl border border-white/5"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 gap-1 pr-4">
                      <Text
                        className="text-sacredWhite/80 text-sm leading-relaxed"
                        numberOfLines={2}
                      >
                        {note.insight}
                      </Text>
                      {note.created_at ? (
                        <Text className="text-mistGray/30 text-[9px] font-black uppercase tracking-widest">
                          {new Date(note.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </Text>
                      ) : null}
                    </View>
                    <ChevronRight size={14} color={tokens.inkFaint} />
                  </View>
                </Pressable>
              </Animated.View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
