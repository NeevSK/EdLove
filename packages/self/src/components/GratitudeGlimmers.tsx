/**
 * GRATITUDE GLIMMERS
 * morning check-in: small moments that made you smile.
 * Standardized to Zero-Legacy: purged sx props and fixed syntax corruption in event handlers.
 */

import { useNavigation } from '@react-navigation/native';
import { usePermissions } from '@repo/core';
import { useSafeMutation } from '@repo/core/hooks';
import { supabase } from '@repo/core/native';

import PositiveInvitation from '@repo/ui/components/PositiveInvitation';
import { Box, Button } from '@repo/ui/primitives';
import { ButtonText, HStack, Heading, Icon, InputField, Text, VStack } from '@repo/ui/primitives';
import { SkeletonCard } from '@repo/ui/components/SkeletonLoader';
import { Pressable, ScrollView } from '@repo/ui/primitives';
import { hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';

import { ChevronLeft, Heart, MessageCircle, Plus, Save, Sparkles, User } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInRight, FadeInUp } from 'react-native-reanimated';
import { useGratitude } from '../hooks/useGratitude';

interface GratitudeGlimmersProps {
  userId?: string;
  disabled?: boolean;
}

export default function GratitudeGlimmers({
  userId,
  disabled: componentDisabled,
}: GratitudeGlimmersProps) {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { context } = usePermissions();
  const activeUserId = userId || context.userId;

  const { entries, refreshData, isLoading } = useGratitude(activeUserId ?? undefined);

  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'student-said' | 'colleague-kindness' | 'personal-win'>(
    'student-said',
  );

  const { mutate, isLoading: isSaving } = useSafeMutation(
    async (variables: { content: string; category: string }) => {
      const { error } = await supabase.from('gratitude_entries').insert({
        user_id: activeUserId,
        content: variables.content,
        category: variables.category,
      });
      if (error) throw error;
    },
    {
      onSuccess: () => {
        hapticSuccess();
        setContent('');
        setShowForm(false);
        refreshData();
      },
    },
  );

  const handleSave = async () => {
    if (!activeUserId || !content.trim() || isSaving) return;
    hapticLight();
    await mutate({
      content: content.trim(),
      category,
    });
  };

  const categories = [
    {
      id: 'student-said',
      label: t('self.studentSaid') || 'Student Joy',
      emoji: '💬',
      icon: MessageCircle,
      color: 'text-templeGold',
      bg: 'bg-templeGold/10',
      border: 'border-templeGold/20',
    },
    {
      id: 'colleague-kindness',
      label: t('self.colleagueKindness') || 'Team Synergy',
      emoji: '🤝',
      icon: User,
      color: 'text-skyBlue',
      bg: 'bg-skyBlue/10',
      border: 'border-skyBlue/20',
    },
    {
      id: 'personal-win',
      label: t('self.personalWin') || 'Personal Win',
      emoji: '🌟',
      icon: Sparkles,
      color: 'text-emeraldGreen',
      bg: 'bg-emeraldGreen/10',
      border: 'border-emeraldGreen/20',
    },
  ];

  if (isLoading && activeUserId) {
    return (
      <VStack className="p-lg gap-lg">
        <SkeletonCard height={48} />
        <SkeletonCard height={80} />
        <SkeletonCard height={80} />
      </VStack>
    );
  }

  if (!activeUserId) {
    return (
      <PositiveInvitation type="guest" onAction={() => navigation.navigate('Auth' as never)} />
    );
  }

  return (
    <VStack className="gap-lg">
      {/* Header */}
      <VStack className="gap-1">
        <HStack className="items-center gap-2">
          <Icon as={Heart} className="text-sanctuarySaffron" size={24} fill="currentColor" />
          <Heading className="text-sacredWhite" size="lg">
            {t('self.gratitude') || 'Gratitude Glimmers'}
          </Heading>
        </HStack>
        <Text className="text-mistGray text-sm">
          {t('self.gratitudeDesc') || 'Small moments that brought light to your day.'}
        </Text>
      </VStack>

      {!showForm ? (
        <VStack className="gap-md">
          <Button
            onPress={() => {
              hapticLight();
              setShowForm(true);
            }}
            isDisabled={componentDisabled}
            className="bg-sanctuarySaffron rounded-comfortable py-4 shadow-lg shadow-sanctuarySaffron/20"
          >
            <HStack className="gap-2 items-center">
              <Icon as={Plus} className="text-obsidian" size={20} />
              <ButtonText className="text-obsidian font-black uppercase tracking-wider text-sm">
                {t('self.addGratitude') || 'Record a Glimmer'}
              </ButtonText>
            </HStack>
          </Button>

          <ScrollView className="max-h-[500px]" showsVerticalScrollIndicator={false}>
            <VStack className="gap-4 pb-20">
              {entries.map((entry, index) => {
                const cat = categories.find((c) => c.id === entry.category);
                return (
                  <Animated.View key={entry.id} entering={FadeInRight.delay(index * 100)}>
                    <Box
                      className={`p-md rounded-comfortable border border-white/5 bg-white/5 shadow-sm border-l-4 ${cat?.border.replace('border-', 'border-l-') || 'border-l-sanctuarySaffron'}`}
                    >
                      <VStack className="gap-2">
                        <HStack className="justify-between items-center">
                          <HStack className="gap-2 items-center">
                            <Text className="text-lg">{cat?.emoji}</Text>
                            <Text
                              className={`text-[10px] uppercase font-black tracking-widest ${cat?.color || 'text-sanctuarySaffron'}`}
                            >
                              {cat?.label}
                            </Text>
                          </HStack>
                          <Text className="text-dimGray text-[10px] italic">
                            {new Date(entry.created_at).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </Text>
                        </HStack>
                        <Text className="text-sacredWhite/90 text-[15px] leading-relaxed font-medium">
                          "{entry.content}"
                        </Text>
                      </VStack>
                    </Box>
                  </Animated.View>
                );
              })}

              {entries.length === 0 && (
                <Box className="py-10">
                  <PositiveInvitation
                    icon={Heart}
                    title={t('self.whatSmiledToday') || 'Capture your first light today.'}
                  />
                </Box>
              )}
            </VStack>
          </ScrollView>
        </VStack>
      ) : (
        <Animated.View entering={FadeInUp.duration(400)}>
          <VStack className="gap-6 bg-white/5 p-lg rounded-comfortable border border-white/10">
            {/* Category Selection */}
            <Box>
              <Text className="text-mistGray text-xs uppercase font-black tracking-widest mb-3">
                {t('self.category') || 'Source of Joy'}
              </Text>
              <HStack className="gap-2 flex-wrap">
                {categories.map((cat) => (
                  <Pressable
                    key={cat.id}
                    onPress={() => {
                      hapticLight();
                      setCategory(cat.id as any);
                    }}
                    className={`flex-row items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                      category === cat.id
                        ? 'bg-sanctuarySaffron border-sanctuarySaffron shadow-md'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <Text className="text-lg">{cat.emoji}</Text>
                    <Text
                      className={`text-xs font-bold ${
                        category === cat.id ? 'text-obsidian' : 'text-mistGray'
                      }`}
                    >
                      {cat.label}
                    </Text>
                  </Pressable>
                ))}
              </HStack>
            </Box>

            {/* Content Area */}
            <VStack className="gap-3">
              <Text className="text-mistGray text-xs uppercase font-black tracking-widest">
                {t('self.whatSmiled') || 'The Reflection'}
              </Text>
              <Box className="bg-white/5 rounded-xl border border-white/10 p-4 min-h-[140px]">
                <InputField
                  placeholder={t('self.gratitudePlaceholder') || 'What warmed your heart?'}
                  value={content}
                  onChangeText={setContent}
                  multiline
                  className="text-sacredWhite text-base text-start align-top"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                />
              </Box>
            </VStack>

            {/* Actions */}
            <HStack className="gap-3">
              <Button
                onPress={() => {
                  hapticLight();
                  setShowForm(false);
                  setContent('');
                }}
                variant="outline"
                className="flex-1 border-white/10 h-14"
              >
                <HStack className="items-center gap-2">
                  <Icon as={ChevronLeft} size={18} className="text-mistGray" />
                  <ButtonText className="text-mistGray font-bold uppercase tracking-widest text-xs">
                    Back
                  </ButtonText>
                </HStack>
              </Button>

              <Button
                onPress={handleSave}
                isDisabled={!content.trim() || isSaving}
                className="flex-[2] bg-emeraldGreen h-14 shadow-lg shadow-emeraldGreen/20"
              >
                <HStack className="items-center gap-2">
                  <Icon as={Save} size={18} className="text-white" />
                  <ButtonText className="text-white font-black uppercase tracking-widest text-xs">
                    {t('common.save') || 'Seal Glimmer'}
                  </ButtonText>
                </HStack>
              </Button>
            </HStack>
          </VStack>
        </Animated.View>
      )}
    </VStack>
  );
}
