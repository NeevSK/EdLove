/**
 * GRATITUDE GLIMMERS
 * Morning check-in: small moments that made you smile.
 * Standardized to October 29+ UI Kit architecture.
 */

import { useDraft } from '@repo/ui/context/Drafts';
import { useSafeMutation } from '@repo/core/hooks';
import { usePermissions } from '@repo/core/logic';
import { useGratitude } from '@repo/self/hooks/useGratitude';
import { Button, Surface, Text as KitText } from '@repo/ui/components/native';
import { ChevronLeft, Heart, LogIn, MessageCircle, Plus, Save, Sparkles, User } from '@repo/ui/icons';
import { useWorld } from '@repo/ui/theme/native';
import { hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { FadeInRight, FadeInUp } from 'react-native-reanimated';

interface GratitudeGlimmersProps {
  userId?: string;
  disabled?: boolean;
}

export default function GratitudeGlimmers({
  userId,
  disabled: componentDisabled,
}: GratitudeGlimmersProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { context } = usePermissions();
  const activeUserId = userId || context.userId;
  const { tokens } = useWorld();

  const { entries, refreshData, isLoading, addGratitudeEntry, error } = useGratitude(
    activeUserId ?? undefined,
  );

  const [showForm, setShowForm] = useState(false);
  // Half-written gratitude is kept through interruptions, for this person only.
  const { value: content, setValue: setContent } = useDraft('self:gratitude');
  const [category, setCategory] = useState<'student-said' | 'colleague-kindness' | 'personal-win'>(
    'student-said',
  );

  const { mutate, isPending: isSaving } = useSafeMutation(
    async (variables: { content: string; category: string }) => {
      await addGratitudeEntry({
        content: variables.content,
        category: variables.category as any,
      });
    },
    {
      mutationKey: 'addGratitudeEntry',
      scope: 'self',
      mutationType: 'CREATE',
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
    },
    {
      id: 'colleague-kindness',
      label: t('self.colleagueKindness') || 'Team Synergy',
      emoji: '🤝',
      icon: User,
    },
    {
      id: 'personal-win',
      label: t('self.personalWin') || 'Personal Win',
      emoji: '🌟',
      icon: Sparkles,
    },
  ];

  if (isLoading && activeUserId) {
    return (
      <View className="p-4 gap-4">
        <Surface tone="raised" style={{ height: 48, borderRadius: 12 }} />
        <Surface tone="raised" style={{ height: 80, borderRadius: 16 }} />
        <Surface tone="raised" style={{ height: 80, borderRadius: 16 }} />
      </View>
    );
  }

  if (!activeUserId) {
    return (
      <Surface tone="raised" style={{ padding: 24, alignItems: 'center', borderRadius: 16 }}>
        <Heart size={36} color={tokens.lamp} />
        <KitText kind="title" align="center" style={{ marginTop: 12 }}>
          {t('invitation.guestTitle') || 'Gratitude Glimmers'}
        </KitText>
        <KitText kind="body" tone="soft" align="center" style={{ marginTop: 6 }}>
          {t('invitation.guestDesc') || 'Sign in to record and cherish small moments that brought light to your day.'}
        </KitText>
        <View style={{ marginTop: 16 }}>
          <Button label="Sign In" icon={LogIn} onPress={() => router.push('/auth')} />
        </View>
      </Surface>
    );
  }

  return (
    <View className="gap-6">
      {/* Header */}
      <View className="gap-1">
        <View className="flex-row items-center gap-2">
          <Heart size={24} color={tokens.lamp} />
          <Text className="text-sacredWhite text-xl font-bold">
            {t('self.gratitude') || 'Gratitude Glimmers'}
          </Text>
        </View>
        <Text className="text-mistGray text-sm">
          {t('self.gratitudeDesc') || 'Small moments that brought light to your day.'}
        </Text>
      </View>

      {!showForm ? (
        <View className="gap-4">
          {error ? (
            <View className="flex-row items-center justify-between gap-3 rounded-2xl border border-emberRed/30 bg-emberRed/10 p-4">
              <Text className="flex-1 text-sm text-mistGray" accessibilityRole="alert">
                {error} Showing the last available entries.
              </Text>
              <Pressable
                onPress={() => void refreshData()}
                accessibilityRole="button"
                accessibilityLabel="Retry loading gratitude history"
              >
                <Text className="font-bold text-sanctuarySaffron">Retry</Text>
              </Pressable>
            </View>
          ) : null}

          <Button
            label={t('self.addGratitude') || 'Record a Glimmer'}
            icon={Plus}
            variant="primary"
            size="lg"
            disabled={componentDisabled}
            onPress={() => {
              hapticLight();
              setShowForm(true);
            }}
          />

          <ScrollView className="max-h-[500px]">
            <View className="gap-4 pb-20">
              {entries.map((entry, index) => {
                const cat = categories.find((c) => c.id === entry.category);
                return (
                  <Animated.View key={entry.id} entering={FadeInRight.delay(index * 100)}>
                    <View className="p-4 rounded-2xl border border-white/5 bg-white/5 border-l-4 border-l-sanctuarySaffron">
                      <View className="gap-2">
                        <View className="flex-row justify-between items-center">
                          <View className="flex-row gap-2 items-center">
                            <Text className="text-lg">{cat?.emoji}</Text>
                            <Text className="text-[10px] uppercase font-black tracking-widest text-sanctuarySaffron">
                              {cat?.label}
                            </Text>
                          </View>
                          <Text className="text-dimGray text-[10px] italic">
                            {new Date(entry.created_at).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </Text>
                        </View>
                        <Text className="text-sacredWhite/90 text-[15px] leading-relaxed font-medium">
                          "{entry.content}"
                        </Text>
                      </View>
                    </View>
                  </Animated.View>
                );
              })}

              {entries.length === 0 && (
                <Surface tone="raised" style={{ padding: 24, alignItems: 'center', borderRadius: 16 }}>
                  <Heart size={32} color={tokens.lamp} />
                  <KitText kind="title" align="center" style={{ marginTop: 8 }}>
                    {t('self.whatSmiledToday') || 'Capture your first light today.'}
                  </KitText>
                  <KitText kind="caption" tone="soft" align="center" style={{ marginTop: 4 }}>
                    Small moments of gratitude ground your practice.
                  </KitText>
                </Surface>
              )}
            </View>
          </ScrollView>
        </View>
      ) : (
        <Animated.View entering={FadeInUp.duration(400)}>
          <View className="gap-6 bg-white/5 p-5 rounded-2xl border border-white/10">
            {/* Category Selection */}
            <View>
              <Text className="text-mistGray text-xs uppercase font-black tracking-widest mb-3">
                {t('self.category') || 'Source of Joy'}
              </Text>
              <View className="flex-row gap-2 flex-wrap">
                {categories.map((cat) => (
                  <Pressable
                    key={cat.id}
                    onPress={() => {
                      hapticLight();
                      setCategory(cat.id as any);
                    }}
                    accessibilityRole="radio"
                    accessibilityLabel={cat.label}
                    accessibilityState={{ selected: category === cat.id }}
                    className={`flex-row items-center gap-2 px-4 py-2.5 rounded-xl border-2 ${
                      category === cat.id
                        ? 'bg-sanctuarySaffron border-sanctuarySaffron'
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
              </View>
            </View>

            {/* Content Area */}
            <View className="gap-3">
              <Text className="text-mistGray text-xs uppercase font-black tracking-widest">
                {t('self.whatSmiled') || 'The Reflection'}
              </Text>
              <View className="bg-white/5 rounded-xl border border-white/10 p-3 min-h-[120px]">
                <TextInput
                  placeholder={t('self.gratitudePlaceholder') || 'What warmed your heart?'}
                  value={content}
                  onChangeText={setContent}
                  multiline
                  accessibilityLabel="Gratitude reflection"
                  accessibilityHint="Write what warmed your heart"
                  className="text-sacredWhite text-base"
                  placeholderTextColor={tokens.inkFaint}
                />
              </View>
            </View>

            {/* Actions */}
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => {
                  hapticLight();
                  setShowForm(false);
                  setContent('');
                }}
                className="flex-1 border border-white/10 h-12 rounded-full items-center justify-center flex-row gap-2"
                accessibilityRole="button"
                accessibilityLabel="Back"
              >
                <ChevronLeft size={18} color={tokens.inkSoft} />
                <Text className="text-mistGray font-bold uppercase tracking-widest text-xs">
                  Back
                </Text>
              </Pressable>

              <View className="flex-[2]">
                <Button
                  label={t('common.save') || 'Seal Glimmer'}
                  icon={Save}
                  variant="primary"
                  size="lg"
                  disabled={!content.trim() || isSaving}
                  onPress={handleSave}
                />
              </View>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}
