import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Input,
  InputField,
  Button,
  ButtonText,
  ScrollView
} from '@repo/ui';
import { Lightbulb, Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Theme } from '@repo/ui';
import { supabase, useSafeMutation } from '@repo/core';
import { WisdomNote } from '@repo/self';
import { hapticLight, hapticSuccess, SkeletonCard, PositiveInvitation } from '@repo/ui';
import { useWisdom } from '@repo/self';
import { useNavigation } from '@react-navigation/native';

interface WisdomSeedsProps {
  userId?: string;
}

export default function WisdomSeeds({ userId }: WisdomSeedsProps) {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  // Resilient Data Hook
  const { notes, refreshData, isLoading } = useWisdom(userId);

  const [showForm, setShowForm] = useState(false);

  const [insight, setInsight] = useState('');

  // Removed manual loadNotes as it's handled by the hook

  const { mutate, isLoading: isSaving } = useSafeMutation(
    async (insightText: string) => {
      const { error } = await supabase
        .from('wisdom_notes')
        .insert({
          user_id: userId,
          insight: insightText
        });
      if (error) throw error;
    },
    {
      onSuccess: () => {
        hapticSuccess();
        setInsight('');
        setShowForm(false);
        refreshData(); // Refresh local cache
      },
      retryCount: 3
    }
  );

  const handleSave = async () => {
    if (!userId || !insight.trim()) return;

    hapticLight();
    await mutate(insight.trim());
  };

  const wisdomPrompts = [
    "Questions work better than answers",
    "Silence creates space for thinking",
    "Small wins compound into confidence",
    "Mistakes are data, not disasters",
    "Connection before content"
  ];

  if (isLoading && userId) {
    return (
      <VStack space="lg" sx={{ flex: 1, padding: Theme.spacing.lg }}>
        <SkeletonCard height={48} />
        <SkeletonCard height={80} />
        <SkeletonCard height={80} />
      </VStack>
    );
  }

  if (!userId) {
    return (
      <PositiveInvitation
        type="guest"
        onAction={() => navigation.navigate('Auth' as never)}
      />
    );
  }

  return (
    <VStack space="lg" sx={{ flex: 1 }}>
      <VStack space="xs">
        <HStack space="sm" alignItems="center">
          <Lightbulb color={Theme.colors.sanctuarySaffron} size={24} />
          <Heading color={Theme.colors.sacredWhite} size="lg">
            {t('self.wisdom')}
          </Heading>
        </HStack>
        <Text color={Theme.colors.mistGray} size="sm">
          {t('self.wisdomDesc')}
        </Text>
      </VStack>

      {!showForm ? (
        <>
          <Button
            size="md"
            action="primary"
            onPress={() => {
              hapticLight();
              setShowForm(true);
            }}
            sx={{
              backgroundColor: Theme.colors.sanctuarySaffron,
              borderRadius: Theme.corners.comfortable
            }}
          >
            <Plus color={Theme.colors.sacredWhite} size={20} />
            <ButtonText ml="$2">{t('self.addWisdom')}</ButtonText>
          </Button>

          <ScrollView sx={{ flex: 1, maxHeight: 400 }}>
            <VStack space="md">
              {notes.map((note) => (
                <Box
                  key={note.id}
                  p={Theme.spacing.md}
                  sx={{
                    backgroundColor: Theme.colors.ink,
                    borderRadius: Theme.corners.comfortable,
                    borderLeftWidth: 3,
                    borderLeftColor: Theme.colors.sanctuarySaffron
                  }}
                >
                  <VStack space="xs">
                    <Text
                      color={Theme.colors.sacredWhite}
                      size="md"
                      fontStyle="italic"
                    >
                      "{note.insight}"
                    </Text>
                    <Text color={Theme.colors.dimGray} size="xs">
                      {new Date(note.created_at).toLocaleDateString()}
                    </Text>
                  </VStack>
                </Box>
              ))}

              {notes.length === 0 && (
                <PositiveInvitation
                  icon={Lightbulb}
                  title={t('self.yourPedagogyJournal')}
                  description={t('self.exampleInsights')}
                />
              )}
            </VStack>
          </ScrollView>
        </>
      ) : (
        <VStack space="md">
          {/* Insight Input */}
          <Box>
            <Text color={Theme.colors.mistGray} size="sm" mb="$2">
              {t('self.yourInsight')}
            </Text>
            <Input
              variant="outline"
              size="md"
              sx={{
                backgroundColor: Theme.colors.ink,
                borderWidth: 1,
                borderColor: Theme.colors.transparent,
                minHeight: 120
              }}
            >
              <InputField
                placeholder={t('self.insightPlaceholder')}
                value={insight}
                onChangeText={setInsight}
                multiline
                color={Theme.colors.sacredWhite}
                placeholderTextColor={Theme.colors.dimGray}
                sx={{ textAlignVertical: 'top' }}
              />
            </Input>
          </Box>

          {/* Quick prompts */}
          <Box>
            <Text color={Theme.colors.dimGray} size="xs" mb="$2">
              {t('self.needInspiration')}
            </Text>
            <VStack space="xs">
              {wisdomPrompts.slice(0, 3).map((prompt, idx) => (
                <Text
                  key={idx}
                  color={Theme.colors.mistGray}
                  size="xs"
                  fontStyle="italic"
                >
                  • {prompt}
                </Text>
              ))}
            </VStack>
          </Box>

          {/* Actions */}
          <HStack space="md" justifyContent="flex-end">
            <Button
              size="md"
              variant="outline"
              onPress={() => {
                hapticLight();
                setShowForm(false);
                setInsight('');
              }}
              sx={{
                borderColor: Theme.colors.ink,
                borderRadius: Theme.corners.comfortable
              }}
            >
              <ButtonText color={Theme.colors.mistGray}>
                {t('common.cancel')}
              </ButtonText>
            </Button>
            <Button
              size="md"
              action="primary"
              onPress={handleSave}
              isDisabled={!insight.trim() || isSaving}
              sx={{
                backgroundColor: Theme.colors.sanctuarySaffron,
                borderRadius: Theme.corners.comfortable
              }}
            >
              <ButtonText>{t('common.save')}</ButtonText>
            </Button>
          </HStack>
        </VStack>
      )}
    </VStack>
  );
}
