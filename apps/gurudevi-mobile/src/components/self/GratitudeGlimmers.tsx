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
} from '@gluestack-ui/themed';
import { Heart, Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Theme } from '../../constants/Theme';
import { supabase } from '../../lib/supabase';
import { hapticLight, hapticSuccess } from '../../utils/haptics';
import { GratitudeEntry } from '../../types/Wellbeing';

interface GratitudeGlimmersProps {
  userId?: string;
}

export default function GratitudeGlimmers({ userId }: GratitudeGlimmersProps) {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'student-said' | 'colleague-kindness' | 'personal-win'>('student-said');

  useEffect(() => {
    if (userId) {
      loadEntries();
    }
  }, [userId]);

  const loadEntries = async () => {
    if (!userId) return;
    
    const { data, error } = await supabase
      .from('gratitude_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) {
      setEntries(data);
    }
  };

  const handleSave = async () => {
    if (!userId || !content.trim()) return;
    
    setLoading(true);
    hapticLight();

    const { error } = await supabase
      .from('gratitude_entries')
      .insert({
        user_id: userId,
        content: content.trim(),
        category
      });

    if (!error) {
      hapticSuccess();
      setContent('');
      setShowForm(false);
      await loadEntries();
    }
    
    setLoading(false);
  };

  const categories = [
    { id: 'student-said', label: t('self.studentSaid'), emoji: '💬', color: '#FFD700' },
    { id: 'colleague-kindness', label: t('self.colleagueKindness'), emoji: '🤝', color: '#87CEEB' },
    { id: 'personal-win', label: t('self.personalWin'), emoji: '🌟', color: '#98FB98' }
  ];

  return (
    <VStack space="lg" sx={{ flex: 1 }}>
      <VStack space="xs">
        <HStack space="sm" alignItems="center">
          <Heart color={Theme.colors.sanctuarySaffron} size={24} />
          <Heading color={Theme.colors.sacredWhite} size="lg">
            {t('self.gratitude')}
          </Heading>
        </HStack>
        <Text color={Theme.colors.mistGray} size="sm">
          {t('self.gratitudeDesc')}
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
            <Plus color={Theme.colors.white} size={20} />
            <ButtonText ml="$2">{t('self.addGratitude')}</ButtonText>
          </Button>

          <ScrollView sx={{ flex: 1, maxHeight: 400 }}>
            <VStack space="md">
              {entries.map((entry) => {
                const cat = categories.find(c => c.id === entry.category);
                return (
                  <Box
                    key={entry.id}
                    p={Theme.spacing.md}
                    sx={{
                      backgroundColor: Theme.colors.deepIndigo,
                      borderRadius: Theme.corners.comfortable,
                      borderLeftWidth: 3,
                      borderLeftColor: cat?.color || Theme.colors.sanctuarySaffron
                    }}
                  >
                    <HStack justifyContent="space-between" alignItems="flex-start">
                      <VStack space="xs" sx={{ flex: 1 }}>
                        <HStack space="xs" alignItems="center">
                          <Text fontSize="$md">{cat?.emoji}</Text>
                          <Text color={Theme.colors.dimGray} size="xs">
                            {cat?.label}
                          </Text>
                        </HStack>
                        <Text color={Theme.colors.sacredWhite} size="md">
                          {entry.content}
                        </Text>
                        <Text color={Theme.colors.dimGray} size="xs">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                );
              })}
              
              {entries.length === 0 && (
                <Box p={Theme.spacing.xl}>
                  <Text
                    color={Theme.colors.dimGray}
                    size="md"
                    textAlign="center"
                  >
                    {t('self.whatSmiledToday')}
                  </Text>
                </Box>
              )}
            </VStack>
          </ScrollView>
        </>
      ) : (
        <VStack space="md">
          {/* Category Selection */}
          <Box>
            <Text color={Theme.colors.mistGray} size="sm" mb="$2">
              {t('self.category')}
            </Text>
            <VStack space="sm">
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => {
                    hapticLight();
                    setCategory(cat.id as any);
                  }}
                >
                  <HStack
                    space="sm"
                    alignItems="center"
                    p="$3"
                    sx={{
                      backgroundColor:
                        category === cat.id
                          ? Theme.colors.sanctuarySaffron
                          : Theme.colors.deepIndigo,
                      borderRadius: Theme.corners.comfortable,
                      borderWidth: 2,
                      borderColor:
                        category === cat.id
                          ? Theme.colors.sanctuarySaffron
                          : 'transparent'
                    }}
                  >
                    <Text fontSize="$xl">{cat.emoji}</Text>
                    <Text
                      color={
                        category === cat.id
                          ? Theme.colors.white
                          : Theme.colors.mistGray
                      }
                      size="md"
                      bold={category === cat.id}
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
            <Text color={Theme.colors.mistGray} size="sm" mb="$2">
              {t('self.whatSmiled')}
            </Text>
            <Input
              variant="outline"
              size="md"
              sx={{
                backgroundColor: Theme.colors.deepIndigo,
                borderWidth: 1,
                borderColor: Theme.colors.transparent,
                minHeight: 100
              }}
            >
              <InputField
                placeholder={t('self.whatSmiled')}
                value={content}
                onChangeText={setContent}
                multiline
                color={Theme.colors.sacredWhite}
                placeholderTextColor={Theme.colors.dimGray}
                sx={{ textAlignVertical: 'top' }}
              />
            </Input>
          </Box>

          {/* Actions */}
          <HStack space="md" justifyContent="flex-end">
            <Button
              size="md"
              variant="outline"
              onPress={() => {
                hapticLight();
                setShowForm(false);
                setContent('');
              }}
              sx={{
                borderColor: Theme.colors.deepIndigo,
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
              isDisabled={!content.trim() || loading}
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
