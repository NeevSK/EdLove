/**
 * DECISION JOURNAL SECTION
 * Allows users to record and review their decision-making process.
 * Standardized to Zero-Legacy: purged corrupted mutation options and migrated to NativeWind v4.
 */

import { useSafeMutation } from '@repo/core/hooks';
import { usePermissions } from '@repo/core/logic';
import { useDecisionJournal } from '@repo/self/hooks/useDecisionJournal';
import PositiveInvitation from '@repo/ui/components/PositiveInvitation';
import { History, Quote, Send } from '@repo/ui/icons';
import {
  Box,
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
import { hapticLight } from '@repo/ui/utils/haptics';
import { useState } from 'react';
import Animated, { FadeIn, FadeInDown, Layout } from 'react-native-reanimated';

interface DecisionJournalSectionProps {
  userId: string | null;
}

export default function DecisionJournalSection({ userId }: DecisionJournalSectionProps) {
  const { context } = usePermissions();
  const activeUserId = userId || context.userId;
  const [decisionText, setDecisionText] = useState('');
  const { decisions, refreshData, addDecision, error } = useDecisionJournal(
    activeUserId ?? undefined,
  );

  const { mutate, isPending: isSaving } = useSafeMutation(
    async (text: string) => {
      await addDecision(text);
    },
    {
      mutationKey: 'addDecision',
      scope: 'self',
      mutationType: 'CREATE',
      onSuccess: () => {
        hapticLight();
        setDecisionText('');
        void refreshData();
      },
    },
  );

  const handleSave = async () => {
    if (!activeUserId || !decisionText.trim()) return;
    hapticLight();
    await mutate(decisionText.trim());
  };

  if (!activeUserId) {
    return <PositiveInvitation type="anonymous" />;
  }

  return (
    <VStack className="flex-1 gap-6">
      <Animated.View layout={Layout} entering={FadeIn.duration(800)}>
        <Box className="bg-white/5 rounded-3xl border border-white/10 p-xl shadow-sm">
          <VStack className="gap-lg">
            <Box className="bg-white/5 rounded-2xl border border-white/5 p-4 min-h-[120px]">
              <Input className="border-0 bg-transparent">
                <InputField
                  placeholder="What decision is weighing on you today?"
                  multiline
                  className="text-sacredWhite text-sm leading-relaxed py-2 h-full"
                  style={{ textAlignVertical: 'top' }}
                  value={decisionText}
                  onChangeText={setDecisionText}
                  placeholderTextColor="#6B7280"
                />
              </Input>
            </Box>

            <Box className="items-end">
              <Pressable
                onPress={handleSave}
                disabled={!decisionText.trim() || isSaving}
                accessibilityRole="button"
                accessibilityLabel={isSaving ? 'Saving decision' : 'Seal decision'}
                accessibilityHint="Saves this reflection to your decision journal"
                accessibilityState={{ disabled: !decisionText.trim() || isSaving, busy: isSaving }}
                className={`flex-row items-center gap-2 px-6 py-3 rounded-full border transition-all active:scale-95 ${
                  decisionText.trim()
                    ? 'bg-sanctuarySaffron border-sanctuarySaffron shadow-lg shadow-sanctuarySaffron/20'
                    : 'bg-white/5 border-white/10 opacity-50'
                }`}
              >
                <Text
                  className={`text-[11px] font-black uppercase tracking-widest ${decisionText.trim() ? 'text-obsidian' : 'text-mistGray/40'}`}
                >
                  {isSaving ? 'Awaiting Echo...' : 'Seal Decision'}
                </Text>
                {!isSaving && (
                  <Icon
                    as={Send}
                    size={12}
                    className={decisionText.trim() ? 'text-obsidian' : 'text-mistGray/40'}
                  />
                )}
              </Pressable>
            </Box>
          </VStack>
        </Box>
      </Animated.View>

      {error ? (
        <Box className="rounded-2xl border border-emberRed/30 bg-emberRed/10 p-4">
          <HStack className="items-center justify-between gap-3">
            <Text className="flex-1 text-sm text-mistGray" accessibilityRole="alert">
              {error} Showing the last available entries.
            </Text>
            <Pressable
              onPress={() => void refreshData()}
              accessibilityRole="button"
              accessibilityLabel="Retry loading decision history"
            >
              <Text className="font-bold text-sanctuarySaffron">Retry</Text>
            </Pressable>
          </HStack>
        </Box>
      ) : null}

      <VStack className="gap-lg px-2">
        <HStack className="items-center gap-2">
          <Icon as={History} size={14} className="text-mistGray/50" />
          <Heading size="xs" className="text-mistGray/60 uppercase tracking-[0.2em] font-black">
            Recent Log
          </Heading>
        </HStack>

        <ScrollView className="max-h-[350px]">
          <VStack className="gap-3 pr-2">
            {decisions.map((decision, index) => (
              <Animated.View key={decision.id} entering={FadeInDown.delay(index * 100)}>
                <Box className="bg-white/5 p-lg rounded-2xl border-l-4 border-sanctuarySaffron/50 border-y border-r border-white/5">
                  <VStack className="gap-3">
                    <HStack className="gap-2 items-start opacity-70">
                      <Icon as={Quote} size={10} className="text-sanctuarySaffron mt-1" />
                      <Text className="text-mistGray text-sm leading-relaxed italic pr-2">
                        {decision.decision_text}
                      </Text>
                    </HStack>
                    <Text className="text-mistGray/30 text-[9px] font-black uppercase tracking-widest text-right">
                      {new Date(decision.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                  </VStack>
                </Box>
              </Animated.View>
            ))}
            {decisions.length === 0 && (
              <Box className="items-center py-10 opacity-30">
                <Text className="text-mistGray text-xs font-bold italic">
                  No decisions recorded in the journal.
                </Text>
              </Box>
            )}
          </VStack>
        </ScrollView>
      </VStack>
    </VStack>
  );
}
