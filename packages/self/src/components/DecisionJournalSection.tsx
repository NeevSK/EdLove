/**
 * DECISION JOURNAL SECTION
 * Allows users to record and review their decision-making process.
 * Standardized to Zero-Legacy: native layout + RN TextInput + Lucide vector icons.
 */

import { useDraft } from '@repo/ui/context/Drafts';
import React from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeMutation } from '@repo/core/hooks';
import { usePermissions } from '@repo/core/logic';
import { useDecisionJournal } from '@repo/self/hooks/useDecisionJournal';
import { EmptyState } from '@repo/ui/components/native';
import { History, Quote, Send } from '@repo/ui/icons';
import { hapticLight } from '@repo/ui/utils/haptics';
import Animated, { FadeIn, FadeInDown, LinearTransition } from 'react-native-reanimated';

interface DecisionJournalSectionProps {
  userId: string | null;
}

export default function DecisionJournalSection({ userId }: DecisionJournalSectionProps) {
  const { context } = usePermissions();
  const activeUserId = userId || context.userId;
  const { value: decisionText, setValue: setDecisionText } = useDraft('self:decision');
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
    return <EmptyState title="Sign in to record decisions" message="Guest accounts cannot persist journal decisions." />;
  }

  return (
    <View className="flex-1 gap-6">
      <Animated.View layout={LinearTransition} entering={FadeIn.duration(800)}>
        <View className="bg-white/5 rounded-3xl border border-white/10 p-xl shadow-sm">
          <View className="gap-lg">
            <View className="bg-white/5 rounded-2xl border border-white/5 p-4 min-h-[120px]">
              <TextInput
                placeholder="What decision is weighing on you today?"
                multiline
                className="text-sacredWhite text-sm leading-relaxed py-2 h-full"
                style={{ textAlignVertical: 'top' }}
                value={decisionText}
                onChangeText={setDecisionText}
                placeholderTextColor="#6B7280"
              />
            </View>

            <View className="items-end">
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
                  className={`text-[11px] font-black uppercase tracking-widest ${
                    decisionText.trim() ? 'text-obsidian' : 'text-mistGray/40'
                  }`}
                >
                  {isSaving ? 'Awaiting Echo...' : 'Seal Decision'}
                </Text>
                {!isSaving && (
                  <Send
                    size={12}
                    className={decisionText.trim() ? 'text-obsidian' : 'text-mistGray/40'}
                  />
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Animated.View>

      {error ? (
        <View className="rounded-2xl border border-emberRed/30 bg-emberRed/10 p-4">
          <View className="flex-row items-center justify-between gap-3">
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
          </View>
        </View>
      ) : null}

      <View className="gap-lg px-2">
        <View className="flex-row items-center gap-2">
          <History size={14} className="text-mistGray/50" />
          <Text className="text-mistGray/60 uppercase tracking-[0.2em] font-black text-xs">
            Recent Log
          </Text>
        </View>

        <ScrollView className="max-h-[350px]">
          <View className="gap-3 pr-2">
            {decisions.map((decision, index) => (
              <Animated.View key={decision.id} entering={FadeInDown.delay(index * 100)}>
                <View className="bg-white/5 p-lg rounded-2xl border-l-4 border-sanctuarySaffron/50 border-y border-r border-white/5">
                  <View className="gap-3">
                    <View className="flex-row gap-2 items-start opacity-70">
                      <Quote size={10} className="text-sanctuarySaffron mt-1" />
                      <Text className="text-mistGray text-sm leading-relaxed italic pr-2">
                        {decision.decision_text}
                      </Text>
                    </View>
                    <Text className="text-mistGray/30 text-[9px] font-black uppercase tracking-widest text-right">
                      {new Date(decision.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>
              </Animated.View>
            ))}
            {decisions.length === 0 && (
              <View className="items-center py-10 opacity-30">
                <Text className="text-mistGray text-xs font-bold italic">
                  No decisions recorded in the journal.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
