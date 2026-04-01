import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { 
    VStack, 
    HStack, 
    Text, 
    Theme, 
    useThemedColors,
    GlassCard,
    Box,
    Input,
    InputField,
    SanctuaryButton
} from '@repo/ui';
import { Leaf, Plus, Send, ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { supabase, useSafeMutation, usePermissions } from '@repo/core';
import { useWisdom } from '../hooks/useWisdom';
import { WisdomNote } from '../types';
import { useNavigation } from '@react-navigation/native';

interface WisdomSeedsProps {
  userId?: string;
}

export default function WisdomSeeds({ userId }: WisdomSeedsProps) {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { context } = usePermissions();
  const activeUserId = userId || context?.userId;
  const colors = useThemedColors();

  // Resilient Data Hook
  const { notes = [], refreshData, isLoading } = useWisdom(activeUserId ?? undefined);

  const [showForm, setShowForm] = useState(false);
  const [insight, setInsight] = useState('');

  const { mutate, isLoading: isSaving } = useSafeMutation(
    async (insightText: string) => {
      if (!activeUserId) throw new Error('User not authenticated');
      const { error } = await supabase
        .from('wisdom_notes')
        .insert({
          user_id: activeUserId,
          insight: insightText
        });
      if (error) throw error;
    },
    {
      onSuccess: () => {
        setInsight('');
        setShowForm(false);
        refreshData();
      }
    }
  );

  const handleSave = () => {
    if (!insight.trim()) return;
    mutate(insight);
  };

  return (
    <VStack space="lg" style={styles.container}>
      <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <HStack space="sm" sx={{ alignItems: 'center' }}>
          <Leaf size={24} color={Theme.colors.sageGreen} />
          <Text size="lg" fontWeight="700">{t('self.wisdomSeeds') || 'Wisdom Seeds'}</Text>
        </HStack>
        <TouchableOpacity 
          onPress={() => setShowForm(!showForm)}
          style={[styles.addBtn, { backgroundColor: Theme.colors.sageGreen }]}
        >
          <Plus size={20} color="white" />
        </TouchableOpacity>
      </HStack>

      {showForm && (
        <GlassCard style={styles.formCard}>
          <VStack space="md">
            <Text size="sm" fontWeight="600">{t('self.plantSeed') || 'Plant a new seed of wisdom'}</Text>
            <Input>
              <InputField 
                value={insight}
                onChangeText={setInsight}
                multiline
                numberOfLines={4}
                placeholder={t('self.wisdomPlaceholder') || 'What have you realized today?'}
              />
            </Input>
            <HStack sx={{ justifyContent: 'flex-end' }}>
              <SanctuaryButton 
                onPress={handleSave}
                isLoading={isSaving}
                disabled={!insight.trim()}
                variant="solid"
                size="sm"
              >
                <HStack space="xs" sx={{ alignItems: 'center' }}>
                  <Send size={16} color="white" />
                  <Text color="white" fontWeight="600">{t('common.plant') || 'Plant'}</Text>
                </HStack>
              </SanctuaryButton>
            </HStack>
          </VStack>
        </GlassCard>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {notes.length === 0 && !isLoading ? (
          <Box sx={{ py: 40, alignItems: 'center' }}>
            <Text color={colors.textSecondary}>{t('self.noWisdomYet') || 'No wisdom seeds planted yet.'}</Text>
          </Box>
        ) : (
          notes.map((note: WisdomNote) => (
            <TouchableOpacity 
              key={note.id} 
              onPress={() => navigation.navigate('WisdomDetail', { id: note.id })}
            >
              <GlassCard style={styles.noteCard}>
                <VStack space="xs">
                  <Text size="sm" color={colors.textSecondary} numberOfLines={2}>
                    {note.insight}
                  </Text>
                  <HStack sx={{ justifyContent: 'flex-end' }}>
                    <ChevronRight size={16} color={colors.textTertiary} />
                  </HStack>
                </VStack>
              </GlassCard>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </VStack>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  listContent: {
    gap: 12,
  },
  noteCard: {
    padding: 16,
    borderRadius: 16,
  }
});
