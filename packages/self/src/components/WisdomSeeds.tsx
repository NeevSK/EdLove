/**
 * WISDOM SEEDS
 * Allows users to record and review their insights and realizations.
 * Standardized to Zero-Legacy: purged corrupted StyleSheet and migrated to NativeWind v4.
 */

import { useSafeMutation } from '@repo/core/hooks';
import { usePermissions } from '@repo/core/logic';
import { useWisdom } from '@repo/self/hooks/useWisdom';
import { ChevronRight, Leaf, Plus, Send, Sprout } from '@repo/ui/icons';
import {
  Box,
  Button,
  ButtonText,
  Heading,
  HStack,
  Icon,
  Input,
  InputField,
  Pressable,
  ScrollView,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn, FadeInDown, Layout } from 'react-native-reanimated';

interface WisdomSeedsProps {
  userId?: string;
}

export default function WisdomSeeds({ userId }: WisdomSeedsProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { context } = usePermissions();
  const activeUserId = userId || context?.userId;

  // Resilient Data Hook
  const {
    notes = [],
    refreshData,
    isLoading,
    error: historyError,
    addWisdomNote,
  } = useWisdom(activeUserId ?? undefined);

  const [showForm, setShowForm] = useState(false);
  const [insight, setInsight] = useState('');

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
    <VStack className="flex-1 gap-6 p-5">
      <HStack className="justify-between items-center">
        <HStack className="items-center gap-3">
          <Box className="w-10 h-10 rounded-full bg-emeraldGreen/10 items-center justify-center">
            <Icon as={Leaf} size={18} className="text-emeraldGreen" />
          </Box>
          <Heading size="sm" className="text-sacredWhite/90 tracking-tight">
            {t('self.wisdomSeeds') || 'Wisdom Seeds'}
          </Heading>
        </HStack>

        <Pressable
          onPress={() => setShowForm(!showForm)}
          className={`w-10 h-10 rounded-full items-center justify-center transition-all active:scale-90 ${showForm ? 'bg-obsidian border border-white/10' : 'bg-emeraldGreen shadow-lg shadow-emeraldGreen/20'}`}
        >
          <Icon
            as={showForm ? ChevronRight : Plus}
            size={20}
            className={showForm ? 'text-mistGray' : 'text-obsidian'}
          />
        </Pressable>
      </HStack>

      {showForm && (
        <Animated.View entering={FadeInDown.duration(400)}>
          <Box className="bg-white/5 rounded-3xl border border-white/10 p-xl shadow-xl">
            <VStack className="gap-lg">
              <Text className="text-mistGray text-xs font-bold px-1">
                {t('self.plantSeed') || 'Plant a new seed of wisdom'}
              </Text>

              <Box className="bg-white/5 rounded-2xl border border-white/5 p-4 min-h-[100px]">
                <Input className="border-0">
                  <InputField
                    value={insight}
                    onChangeText={setInsight}
                    multiline
                    className="text-sacredWhite text-sm leading-relaxed py-1 h-full"
                    style={{ textAlignVertical: 'top' }}
                    placeholder={t('self.wisdomPlaceholder') || 'What have you realized today?'}
                    placeholderTextColor="#6B7280"
                  />
                </Input>
              </Box>

              <Box className="items-end">
                <Button
                  onPress={handleSave}
                  isDisabled={!insight.trim() || isSaving}
                  className={`bg-emeraldGreen rounded-full px-8 py-3 h-12 shadow-md shadow-emeraldGreen/10 ${isSaving ? 'opacity-50' : ''}`}
                >
                  <HStack className="items-center gap-2">
                    {isSaving ? (
                      <Text className="text-obsidian text-[11px] font-black uppercase tracking-widest">
                        Growing...
                      </Text>
                    ) : (
                      <>
                        <Icon as={Send} size={12} className="text-obsidian" />
                        <ButtonText className="text-obsidian font-black uppercase tracking-widest text-[11px]">
                          {t('common.plant') || 'Plant Seed'}
                        </ButtonText>
                      </>
                    )}
                  </HStack>
                </Button>
              </Box>
            </VStack>
          </Box>
        </Animated.View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        className="flex-1"
      >
        <VStack className="gap-3">
          {historyError ? (
            <HStack className="items-center justify-between gap-3 rounded-2xl border border-emberRed/30 bg-emberRed/10 p-4">
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
            </HStack>
          ) : notes.length === 0 && !isLoading ? (
            <Box className="py-20 items-center gap-4 opacity-20">
              <Icon as={Sprout} size={48} className="text-mistGray" />
              <Text className="text-mistGray text-xs font-bold text-center italic max-w-[200px]">
                {t('self.noWisdomYet') || 'No wisdom seeds planted in this sanctuary yet.'}
              </Text>
            </Box>
          ) : (
            notes.map((note, index) => (
              <Animated.View key={note.id} entering={FadeIn.delay(index * 100)} layout={Layout}>
                <Pressable
                  onPress={() =>
                    router.push({ pathname: '/self/wisdom/[id]', params: { id: note.id } })
                  }
                  className="bg-white/5 p-lg rounded-2xl border border-white/5 active:bg-white/10 active:scale-[0.98] transition-all"
                >
                  <HStack className="items-center justify-between">
                    <VStack className="flex-1 gap-1 pr-4">
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
                    </VStack>
                    <Icon as={ChevronRight} size={14} className="text-mistGray/20" />
                  </HStack>
                </Pressable>
              </Animated.View>
            ))
          )}
        </VStack>
      </ScrollView>
    </VStack>
  );
}
