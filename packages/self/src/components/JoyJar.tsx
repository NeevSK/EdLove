/**
 * JOY JAR
 * Captures small teaching sparks, student breakthroughs, and great questions.
 * Standardized to October 29+ UI Kit architecture.
 */

import { useSafeMutation } from '@repo/core/hooks';
import { usePermissions } from '@repo/core/logic';
import { useJoyJar } from '@repo/self/hooks/useJoyJar';
import { Button, Surface, Text as KitText } from '@repo/ui/components/native';
import { BookOpen, LogIn, MessageSquare, Plus, Save, Sparkles, Star, User, X } from '@repo/ui/icons';
import { useWorld } from '@repo/ui/theme/native';
import { hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { FadeInUp, SlideInRight } from 'react-native-reanimated';

interface JoyJarProps {
  userId?: string;
  disabled?: boolean;
}

export default function JoyJar({ userId, disabled: componentDisabled }: JoyJarProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { context } = usePermissions();
  const activeUserId = userId || context.userId;
  const { tokens } = useWorld();

  const { joyMoments, refreshData, isLoading, addJoyMoment, error } = useJoyJar(
    activeUserId ?? undefined,
  );
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [studentName, setStudentName] = useState('');
  const [momentDescription, setMomentDescription] = useState('');
  const [category, setCategory] = useState<'breakthrough' | 'question' | 'connection' | 'other'>(
    'breakthrough',
  );

  const { mutate, isPending: isSaving } = useSafeMutation(
    async (variables: { studentName: string | null; description: string; category: string }) => {
      await addJoyMoment({
        student_name: variables.studentName || undefined,
        moment_description: variables.description,
        category: variables.category as any,
      });
    },
    {
      mutationKey: 'addJoyMoment',
      scope: 'self',
      mutationType: 'CREATE',
      onSuccess: () => {
        hapticSuccess();
        setStudentName('');
        setMomentDescription('');
        setCategory('breakthrough');
        setShowForm(false);
        refreshData();
      },
    },
  );

  const handleSaveMoment = async () => {
    if (!activeUserId || !momentDescription.trim() || isSaving) return;
    hapticLight();
    await mutate({
      studentName: studentName.trim() || null,
      description: momentDescription.trim(),
      category,
    });
  };

  const categories = [
    {
      id: 'breakthrough',
      label: t('self.breakthrough') || 'Breakthrough',
      emoji: '🎉',
      icon: Star,
    },
    {
      id: 'question',
      label: t('self.question') || 'Great Question',
      emoji: '❓',
      icon: MessageSquare,
    },
    {
      id: 'connection',
      label: t('self.connection') || 'Connection',
      emoji: '💫',
      icon: BookOpen,
    },
    {
      id: 'other',
      label: t('self.other') || 'Other',
      emoji: '✨',
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
        <Sparkles size={36} color={tokens.lamp} />
        <KitText kind="title" align="center" style={{ marginTop: 12 }}>
          {t('invitation.guestTitle') || 'Welcome to the Joy Jar'}
        </KitText>
        <KitText kind="body" tone="soft" align="center" style={{ marginTop: 6 }}>
          {t('invitation.guestDesc') || 'Sign in to collect sparks of inspiration and student breakthroughs.'}
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
          <Sparkles size={24} color={tokens.lamp} />
          <Text className="text-sacredWhite text-xl font-bold">
            {t('self.joyJar') || 'Joy Jar'}
          </Text>
        </View>
        <Text className="text-mistGray text-sm italic">
          {t('self.joyJarDesc') ||
            'Capture the small sparks that keep the flame of teaching alive.'}
        </Text>
      </View>

      {!showForm ? (
        <View className="gap-4">
          {error ? (
            <View className="flex-row items-center justify-between gap-3 rounded-2xl border border-emberRed/30 bg-emberRed/10 p-4">
              <Text className="flex-1 text-sm text-mistGray" accessibilityRole="alert">
                {error} Showing the last available moments.
              </Text>
              <Pressable
                onPress={() => void refreshData()}
                accessibilityRole="button"
                accessibilityLabel="Retry loading Joy Jar history"
              >
                <Text className="font-bold text-sanctuarySaffron">Retry</Text>
              </Pressable>
            </View>
          ) : null}

          <Button
            label={t('self.captureJoy') || 'Add a Spark'}
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
              {joyMoments.map((moment, index) => {
                const catInfo = categories.find((c) => c.id === moment.category) || categories[3];
                return (
                  <Animated.View key={moment.id} entering={SlideInRight.delay(index * 100)}>
                    <View className="p-5 bg-white/5 rounded-2xl border border-white/5 border-l-4 border-l-sanctuarySaffron">
                      <View className="flex-row justify-between items-start">
                        <View className="flex-1 mr-4 gap-2">
                          {moment.student_name && (
                            <View className="flex-row items-center gap-1.5">
                              <User size={12} color={tokens.lamp} />
                              <Text className="text-sanctuarySaffron text-[10px] font-black uppercase tracking-widest">
                                {moment.student_name}
                              </Text>
                            </View>
                          )}
                          <Text className="text-sacredWhite text-[15px] leading-relaxed font-medium">
                            "{moment.moment_description}"
                          </Text>
                          <Text className="text-dimGray text-[10px] italic">
                            {new Date(moment.created_at).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </Text>
                        </View>
                        <View className="bg-white/5 p-2 rounded-full border border-white/10 items-center justify-center">
                          <Text className="text-2xl">{catInfo?.emoji || '✨'}</Text>
                        </View>
                      </View>
                    </View>
                  </Animated.View>
                );
              })}

              {joyMoments.length === 0 && (
                <Surface tone="raised" style={{ padding: 24, alignItems: 'center', borderRadius: 16 }}>
                  <Sparkles size={32} color={tokens.lamp} />
                  <KitText kind="title" align="center" style={{ marginTop: 8 }}>
                    {t('self.startCapturing') || 'Collect your first spark of inspiration.'}
                  </KitText>
                  <KitText kind="caption" tone="soft" align="center" style={{ marginTop: 4 }}>
                    Breakthroughs, questions, or moments of connection.
                  </KitText>
                </Surface>
              )}
            </View>
          </ScrollView>
        </View>
      ) : (
        <Animated.View entering={FadeInUp}>
          <View className="gap-6 bg-white/5 p-5 rounded-3xl border border-white/10">
            {/* Student Name */}
            <View className="gap-2">
              <Text className="text-mistGray text-xs uppercase font-black tracking-widest px-1">
                {t('self.studentName') || 'Whose spark was it? (Optional)'}
              </Text>
              <View className="bg-obsidian rounded-xl border border-white/10 px-4 py-2">
                <TextInput
                  placeholder={t('self.exampleStudent') || 'e.g. Rahul, Class 10B'}
                  value={studentName}
                  onChangeText={setStudentName}
                  accessibilityLabel="Student name"
                  accessibilityHint="Optional name or class connected to this spark"
                  className="text-sacredWhite h-10"
                  placeholderTextColor={tokens.inkFaint}
                />
              </View>
            </View>

            {/* Category Selection */}
            <View className="gap-3">
              <Text className="text-mistGray text-xs uppercase font-black tracking-widest px-1">
                {t('self.category') || 'Nature of the spark'}
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
                    className={`flex-row items-center gap-2 px-4 py-2.5 rounded-full border-2 ${
                      category === cat.id
                        ? 'bg-sanctuarySaffron border-sanctuarySaffron'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <Text className="text-lg">{cat.emoji}</Text>
                    <Text
                      className={`text-[11px] font-black uppercase tracking-wider ${
                        category === cat.id ? 'text-obsidian' : 'text-mistGray'
                      }`}
                    >
                      {cat.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Moment Description */}
            <View className="gap-3">
              <Text className="text-mistGray text-xs uppercase font-black tracking-widest px-1">
                {t('self.momentDescription') || 'The Moment'}
              </Text>
              <View className="bg-obsidian rounded-xl border border-white/10 p-3 min-h-[120px]">
                <TextInput
                  placeholder={t('self.momentDescriptionPlaceholder') || 'What made you smile?'}
                  value={momentDescription}
                  onChangeText={setMomentDescription}
                  accessibilityLabel="Joy moment description"
                  accessibilityHint="Describe the teaching spark you want to remember"
                  multiline
                  className="text-sacredWhite text-base"
                  placeholderTextColor={tokens.inkFaint}
                />
              </View>
            </View>

            {/* Actions */}
            <View className="flex-row gap-3 mt-2">
              <Pressable
                onPress={() => {
                  hapticLight();
                  setShowForm(false);
                  setStudentName('');
                  setMomentDescription('');
                }}
                className="flex-1 border border-white/10 h-12 rounded-full items-center justify-center"
                accessibilityRole="button"
                accessibilityLabel="Cancel"
              >
                <X size={20} color={tokens.inkSoft} />
              </Pressable>

              <View className="flex-[3]">
                <Button
                  label="Seal in Jar"
                  icon={Save}
                  variant="primary"
                  size="lg"
                  disabled={!momentDescription.trim() || isSaving}
                  onPress={handleSaveMoment}
                />
              </View>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}
