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

  // Removed manual loadEntries as it's handled by the hook

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
    if (!userId || !content.trim()) return;

    hapticLight();
    await mutate({
      content: content.trim(),
      category
    });
  };

  const categories = [
    { id: 'student-said', label: t('self.studentSaid'), emoji: '\uD83D\uDCAC', color: Theme.colors.templeGold },
    { id: 'colleague-kindness', label: t('self.colleagueKindness'), emoji: '\uD83E\uDD1D', color: Theme.colors.skyBlue },
    { id: 'personal-win', label: t('self.personalWin'), emoji: '\uD83C\uDF1F', color: Theme.colors.sageGreen }
  ];

  if (isLoading && activeUserId) {
    return (
      <VStack space="lg" sx={{ flex: 1, padding: Theme.spacing.lg }}
        <SkeletonCard height={48} /
        ><SkeletonCard height={80} /
        ><SkeletonCard height={80} /
      ></VStack
    );
  }

  if (!activeUserId) {
    return (
      <PositiveInvitation
        type="guest"
        onAction={() => navigation.navigate('Auth' as never)}
      /
    >);
  }

  return (
    <VStack space="lg" sx={{ flex: 1 }}
      <VStack space="xs">
        <HStack space="sm" alignItems="center"
          <Heart color={Theme.colors.sanctuarySaffron} size={24} /
          ><Heading color={Theme.colors.sacredWhite} size="lg"
            {t('self.gratitude')}
          </Heading>
        </HStack>
        <Text color={Theme.colors.mistGray} size="sm"
          {t('self.gratitudeDesc')}>
        </Text>
      </VStack>

      {!showForm ? (
        <
          <Button
            size="md"
            action="primary"
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
          
            <Plus color={Theme.colors.sacredWhite} size={20} /
            ><ButtonText ml="$2">{t('self.addGratitude')}</ButtonText
          ></Button

          <ScrollView sx={{ flex: 1, maxHeight: 400 }}
            <VStack space="md">
              {entries.map((entry) => {
                const cat = categories.find(c => c.id === entry.category);
                return (
                  <Box
                    key={entry.id}
                    p={Theme.spacing.md}
                    sx={{
                      backgroundColor: Theme.colors.ink,
                      borderRadius: Theme.corners.comfortable,
                      borderLeftWidth: 3,
                      borderLeftColor: cat?.color || Theme.colors.sanctuarySaffron>
                    }}
                  
                    <HStack justifyContent="space-between" alignItems="flex-start"
                      <VStack space="xs" sx={{ flex: 1 }}>
                        <HStack space="xs" alignItems="center"
                          <Text fontSize="$md">{cat?.emoji}</Text
                          ><Text color={Theme.colors.dimGray} size="xs"
                            {cat?.label}
                          </Text>
                        </HStack>
                        <Text color={Theme.colors.sacredWhite} size="md"
                          {entry.content}>
                        </Text>
                        <Text color={Theme.colors.dimGray} size="xs"
                          {new Date(entry.created_at).toLocaleDateString()}>
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                );
              })}

              {entries.length === 0 && (
                <PositiveInvitation
                  icon={Heart}
                  title={t('self.whatSmiledToday')}
                /
              >)}
            </VStack>
          </ScrollView>
        </
      ) : (
        <VStack space="md"
          {/* Category Selection */}>
          <Box
            <Text >color={Theme.colors.mistGray} size="sm" mb="$2"
              {t('self.category')}
            </Text>
            <VStack space="sm"
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => {
                    hapticLight();
                    setCategory(cat.id as any);
                  }}
                
                  <HStack
                    space="sm"
                    alignItems="center"
                    p="$3"
                    sx={{
                      backgroundColor:
                        category === cat.id
                          ? Theme.colors.sanctuarySaffron
                          : Theme.colors.ink,
                      borderRadius: Theme.corners.comfortable,
                      borderWidth: 2,
                      borderColor:
                        category === cat.id
                          ? Theme.colors.sanctuarySaffron
                          : 'transparent'>
                    }}
                  
                    <Text fontSize="$xl">{cat.emoji}</Text
                    ><Text
                      color={
                        category === cat.id
                          ? Theme.colors.sacredWhite
                          : Theme.colors.mistGray
                      }
                      size="md"
                      bold={category === cat.id}
                    
                      {cat.label}
                    </Text>
                  </HStack>
                </Pressable>
              ))}
            </VStack>
          </Box>

          {/* Content */}
          <Box
            <Text >color={Theme.colors.mistGray} size="sm" mb="$2"
              {t('self.whatSmiled')}
            </Text>
            <Input
              variant="outline"
              size="md"
              sx={{
                backgroundColor: Theme.colors.ink,
                borderWidth: 1,
                borderColor: Theme.colors.transparent,
                minHeight: 100>
              }}
            
              <InputField
                placeholder={t('self.whatSmiled')}
                value={content}
                onChangeText={setContent}
                multiline
                color={Theme.colors.sacredWhite}
                placeholderTextColor={Theme.colors.dimGray}
                sx={{ textAlignVertical: 'top' }}
              /
            ></Input
          </Box>

          {/* Actions */}
          <HStack space="md" justifyContent="flex-end"
            <Button
              size="md"
              variant="outline"
              onPress={() => {
                hapticLight();
                setShowForm(false);
                setContent('');
              }}
              sx={{
                borderColor: Theme.colors.ink,
                borderRadius: Theme.corners.comfortable
              }}
            
              <ButtonText color={Theme.colors.mistGray}
                {t('common.cancel')}>
              </ButtonText>
            </Button>
            <Button
              size="md"
              action="primary"
              onPress={handleSave}
              isDisabled={!content.trim() || isSaving}
              sx={{
                backgroundColor: Theme.colors.sanctuarySaffron,
                borderRadius: Theme.corners.comfortable>
              }}
            
              <ButtonText>{t('common.save')}</ButtonText
            ></Button
          </HStack>
        </VStack>
      )}
    </VStack>
  );
}
