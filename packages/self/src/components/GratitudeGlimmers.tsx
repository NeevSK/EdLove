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
  Pressable,
  ScrollView
} from '@repo/ui';
import { Heart, Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Theme } from '@repo/ui';
import { supabase, useSafeMutation, usePermissions } from '@repo/core';
import { GratitudeEntry } from '../types';
import { hapticLight, hapticSuccess, SkeletonCard, PositiveInvitation } from '@repo/ui';
import { useGratitude } from '../hooks/useGratitude';
import { useNavigation } from '@react-navigation/native';

interface GratitudeGlimmersProps {
  userId?: string;
  disabled?: boolean;
}

export default function GratitudeGlimmers({ userId, disabled }: GratitudeGlimmersProps) {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { context } = usePermissions();
  const activeUserId = userId || context.userId;
  
  // Resilient Data Hook
  const { entries, refreshData, isLoading } = useGratitude(activeUserId ?? undefined);

  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'student-said' | 'colleague-kindness' | 'personal-win'>('student-said');

  const { mutate, isLoading: isSaving } = useSafeMutation(
    async (variables: { content: string, category: string }) => {
      const { error } = await supabase
        .from('gratitude_entries')
        .insert({
          user_id: activeUserId,
          content: variables.content,
          category: variables.category
        });
      if (error) throw error;
    },
    {
      onSuccess: () => {
        hapticSuccess();
        setContent('');
        setShowForm(false);
        refreshData(); // Refresh local cache
      },
      retryCount: 3
    }
  );

  const handleSave = async () => {
    if (!activeUserId || !content.trim()) return;

    hapticLight();
    await mutate({
      content: content.trim(),
      category
    });
  };

  const categories = [
    { id: 'student-said', label: t('self.studentSaid') || 'Student Said', emoji: '💬', color: Theme.colors.templeGold },
    { id: 'colleague-kindness', label: t('self.colleagueKindness') || 'Colleague Kindness', emoji: '🤝', color: Theme.colors.skyBlue },
    { id: 'personal-win', label: t('self.personalWin') || 'Personal Win', emoji: '🌟', color: Theme.colors.sageGreen }
  ];

  if (isLoading && activeUserId) {
    return (
      <VStack sx={{ gap: Theme.spacing.lg, flex: 1, padding: Theme.spacing.lg }}>
        <SkeletonCard height={48} />
        <SkeletonCard height={80} />
        <SkeletonCard height={80} />
      </VStack>
    );
  }

  if (!activeUserId) {
    return (
      <PositiveInvitation
        type="guest"
        onAction={() => navigation.navigate('Auth')}
      />
    );
  }

  return (
    <VStack sx={{ gap: Theme.spacing.lg, flex: 1 }}>
      <VStack sx={{ gap: Theme.spacing.xs }}>
        <HStack sx={{ gap: Theme.spacing.sm, alignItems: 'center' }}>
          <Heart color={Theme.colors.sanctuarySaffron} size={24} />
          <Heading sx={{ color: Theme.colors.sacredWhite }} size="lg">
            {t('self.gratitude') || 'Gratitude Glimmers'}
          </Heading>
        </HStack>
        <Text sx={{ color: Theme.colors.mistGray }} size="sm">
          {t('self.gratitudeDesc') || 'Small moments that made you smile today.'}
        </Text>
      </VStack>

      {!showForm ? (
        <VStack sx={{ gap: Theme.spacing.md, flex: 1 }}>
          <Button
            size="md"
            onPress={() => {
              if (disabled) return;
              hapticLight();
              setShowForm(true);
            }}
            isDisabled={disabled}
            sx={{
              backgroundColor: Theme.colors.sanctuarySaffron,
              borderRadius: Theme.corners.comfortable,
              opacity: disabled ? 0.6 : 1
            }}
          >
            <HStack sx={{ gap: 8, alignItems: 'center' }}>
              <Plus color={Theme.colors.obsidian} size={20} />
              <ButtonText sx={{ color: Theme.colors.obsidian, fontWeight: '700' }}>
                {t('self.addGratitude') || 'Record a Glimmer'}
              </ButtonText>
            </HStack>
          </Button>

          <ScrollView sx={{ flex: 1, maxHeight: 400 }}>
            <VStack sx={{ gap: Theme.spacing.md }}>
              {entries.map((entry) => {
                const cat = categories.find(c => c.id === entry.category);
                return (
                  <Box
                    key={entry.id}
                    sx={{
                      padding: Theme.spacing.md,
                      backgroundColor: Theme.colors.ink,
                      borderRadius: Theme.corners.comfortable,
                      borderLeftWidth: 3,
                      borderLeftColor: cat?.color || Theme.colors.sanctuarySaffron
                    }}
                  >
                    <VStack sx={{ gap: Theme.spacing.xs }}>
                      <HStack sx={{ gap: Theme.spacing.xs, alignItems: 'center' }}>
                        <Text sx={{ fontSize: 16 }}>{cat?.emoji}</Text>
                        <Text sx={{ color: Theme.colors.dimGray, fontSize: 12 }}>
                          {cat?.label}
                        </Text>
                      </HStack>
                      <Text sx={{ color: Theme.colors.sacredWhite, fontSize: 16 }}>
                        {entry.content}
                      </Text>
                      <Text sx={{ color: Theme.colors.dimGray, fontSize: 10 }}>
                        {new Date(entry.created_at).toLocaleDateString()}
                      </Text>
                    </VStack>
                  </Box>
                );
              })}

              {entries.length === 0 && (
                <PositiveInvitation
                   icon={Heart}
                   title={t('self.whatSmiledToday') || "What made you smile today?"}
                />
              )}
            </VStack>
          </ScrollView>
        </VStack>
      ) : (
        <VStack sx={{ gap: Theme.spacing.md }}>
          {/* Category Selection */}
          <Box>
            <Text sx={{ color: Theme.colors.mistGray, fontSize: 14, marginBottom: 8 }}>
              {t('self.category') || 'Category'}
            </Text>
            <VStack sx={{ gap: Theme.spacing.sm }}>
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => {
                    hapticLight();
                    setCategory(cat.id as any);
                  }}
                >
                  <HStack
                    sx={{
                      gap: Theme.spacing.sm,
                      alignItems: 'center',
                      padding: Theme.spacing.md,
                      backgroundColor: category === cat.id ? Theme.colors.sanctuarySaffron : Theme.colors.ink,
                      borderRadius: Theme.corners.comfortable,
                      borderWidth: 2,
                      borderColor: category === cat.id ? Theme.colors.sanctuarySaffron : 'transparent'
                    }}
                  >
                    <Text sx={{ fontSize: 20 }}>{cat.emoji}</Text>
                    <Text
                      sx={{
                        color: category === cat.id ? Theme.colors.obsidian : Theme.colors.mistGray,
                        fontSize: 14,
                        fontWeight: category === cat.id ? '700' : '400'
                      }}
                    >
                      {cat.label}
                    </Text>
                  </HStack>
                </Pressable>
              ))}
            </VStack>
          </Box>

          {/* Content */}
          <Box>
            <Text sx={{ color: Theme.colors.mistGray, fontSize: 14, marginBottom: 8 }}>
              {t('self.whatSmiled') || 'Detail it here...'}
            </Text>
            <Input
              sx={{
                backgroundColor: Theme.colors.ink,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.1)',
                minHeight: 100,
                borderRadius: Theme.corners.comfortable
              }}
            >
              <InputField
                placeholder={t('self.whatSmiled') || "I'm grateful for..."}
                value={content}
                onChangeText={setContent}
                multiline
                sx={{ color: Theme.colors.sacredWhite, textAlignVertical: 'top' }}
                placeholderTextColor={Theme.colors.dimGray}
              />
            </Input>
          </Box>

          {/* Actions */}
          <HStack sx={{ gap: Theme.spacing.md, justifyContent: 'flex-end' }}>
            <Button
              onPress={() => {
                hapticLight();
                setShowForm(false);
                setContent('');
              }}
              variant="outline"
              sx={{
                borderColor: Theme.colors.ink,
                borderRadius: Theme.corners.comfortable
              }}
            >
              <ButtonText sx={{ color: Theme.colors.mistGray }}>
                {t('common.cancel') || 'Cancel'}
              </ButtonText>
            </Button>
            <Button
              onPress={handleSave}
              isDisabled={!content.trim() || isSaving}
              sx={{
                backgroundColor: Theme.colors.sanctuarySaffron,
                borderRadius: Theme.corners.comfortable
              }}
            >
              <ButtonText sx={{ color: Theme.colors.obsidian, fontWeight: '700' }}>
                {t('common.save') || 'Save'}
              </ButtonText>
            </Button>
          </HStack>
        </VStack>
      )}
    </VStack>
  );
}
