/**
 * JOY JAR
 * Captures small teaching sparks, student breakthroughs, and great questions.
 * Standardized to Zero-Legacy: purged sx props and fixed syntax corruption in handlers.
 */

import { useSafeMutation } from '@repo/core/hooks';
import { usePermissions } from '@repo/core/logic';
import PositiveInvitation from '@repo/ui/components/PositiveInvitation';
import { SkeletonCard } from '@repo/ui/components/SkeletonLoader';
import { BookOpen, MessageSquare, Plus, Save, Sparkles, Star, User, X } from '@repo/ui/icons';
import {
  AnimatedView,
  Box,
  Button,
  ButtonText,
  Heading,
  HStack,
  Icon,
  InputField,
  Pressable,
  ScrollView,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FadeInUp, SlideInRight } from 'react-native-reanimated';
import { useJoyJar } from '@repo/self/hooks/useJoyJar';

interface JoyJarProps {
  userId?: string;
  disabled?: boolean;
}

export default function JoyJar({ userId, disabled: componentDisabled }: JoyJarProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { context } = usePermissions();
  const activeUserId = userId || context.userId;

  const { joyMoments, refreshData, isLoading, addJoyMoment } = useJoyJar(activeUserId ?? undefined);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [studentName, setStudentName] = useState('');
  const [momentDescription, setMomentDescription] = useState('');
  const [category, setCategory] = useState<'breakthrough' | 'question' | 'connection' | 'other'>(
    'breakthrough',
  );

  const { mutate, isLoading: isSaving } = useSafeMutation(
    async (variables: { studentName: string | null; description: string; category: string }) => {
      await addJoyMoment({
        student_name: variables.studentName || undefined,
        moment_description: variables.description,
        category: variables.category as any,
      });
    },
    {
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
      color: 'text-sanctuarySaffron',
    },
    {
      id: 'question',
      label: t('self.question') || 'Great Question',
      emoji: '❓',
      icon: MessageSquare,
      color: 'text-skyBlue',
    },
    {
      id: 'connection',
      label: t('self.connection') || 'Connection',
      emoji: '💫',
      icon: BookOpen,
      color: 'text-emeraldGreen',
    },
    {
      id: 'other',
      label: t('self.other') || 'Other',
      emoji: '✨',
      icon: Sparkles,
      color: 'text-templeGold',
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
    return <PositiveInvitation type="anonymous" onAction={() => router.push('/auth')} />;
  }

  return (
    <VStack className="gap-lg">
      {/* Header */}
      <VStack className="gap-1">
        <HStack className="items-center gap-2">
          <Icon as={Sparkles} className="text-sanctuarySaffron" size={24} />
          <Heading className="text-sacredWhite" size="lg">
            {t('self.joyJar') || 'Joy Jar'}
          </Heading>
        </HStack>
        <Text className="text-mistGray text-sm italic">
          {t('self.joyJarDesc') ||
            'Capture the small sparks that keep the flame of teaching alive.'}
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
            className="bg-sanctuarySaffron rounded-full py-4 shadow-xl shadow-sanctuarySaffron/20"
          >
            <HStack className="gap-2 items-center">
              <Icon as={Plus} className="text-obsidian" size={20} />
              <ButtonText className="text-obsidian font-black uppercase tracking-wider text-sm">
                {t('self.captureJoy') || 'Add a Spark'}
              </ButtonText>
            </HStack>
          </Button>

          <ScrollView className="max-h-[500px]" showsVerticalScrollIndicator={false}>
            <VStack className="gap-4 pb-20">
              {joyMoments.map((moment, index) => {
                const catInfo = categories.find((c) => c.id === moment.category) || categories[3];
                return (
                  <AnimatedView key={moment.id} entering={SlideInRight.delay(index * 100)}>
                    <Box className="p-6 bg-white/5 rounded-2xl border border-white/5 shadow-sm border-l-4 border-l-sanctuarySaffron">
                      <HStack className="justify-between items-start">
                        <VStack className="flex-1 mr-4 gap-2">
                          {moment.student_name && (
                            <HStack className="items-center gap-2">
                              <Icon as={User} size={10} className="text-sanctuarySaffron" />
                              <Text className="text-sanctuarySaffron text-[10px] font-black uppercase tracking-widest">
                                {moment.student_name}
                              </Text>
                            </HStack>
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
                        </VStack>
                        <Box className="bg-white/5 p-2 rounded-full border border-white/10">
                          <Text className="text-2xl">{catInfo?.emoji || '✨'}</Text>
                        </Box>
                      </HStack>
                    </Box>
                  </AnimatedView>
                );
              })}

              {joyMoments.length === 0 && (
                <Box className="py-10">
                  <PositiveInvitation
                    icon={Sparkles}
                    title={t('self.startCapturing') || 'Collect your first spark of inspiration.'}
                  />
                </Box>
              )}
            </VStack>
          </ScrollView>
        </VStack>
      ) : (
        <AnimatedView entering={FadeInUp}>
          <VStack className="gap-6 bg-white/5 p-lg rounded-3xl border border-white/10">
            {/* Student Name */}
            <VStack className="gap-2">
              <Text className="text-mistGray text-xs uppercase font-black tracking-widest px-1">
                {t('self.studentName') || 'Whose spark was it? (Optional)'}
              </Text>
              <Box className="bg-obsidian rounded-xl border border-white/10">
                <InputField
                  placeholder={t('self.exampleStudent') || 'e.g. Rahul, Class 10B'}
                  value={studentName}
                  onChangeText={setStudentName}
                  className="text-sacredWhite h-12 px-4"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                />
              </Box>
            </VStack>

            {/* Category Selection */}
            <VStack className="gap-3">
              <Text className="text-mistGray text-xs uppercase font-black tracking-widest px-1">
                {t('self.category') || 'Nature of the spark'}
              </Text>
              <HStack className="gap-2 flex-wrap">
                {categories.map((cat) => (
                  <Pressable
                    key={cat.id}
                    onPress={() => {
                      hapticLight();
                      setCategory(cat.id as any);
                    }}
                    className={`flex-row items-center gap-2 px-4 py-3 rounded-full border-2 transition-all ${
                      category === cat.id
                        ? 'bg-sanctuarySaffron border-sanctuarySaffron shadow-md'
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
              </HStack>
            </VStack>

            {/* Moment Description */}
            <VStack className="gap-3">
              <Text className="text-mistGray text-xs uppercase font-black tracking-widest px-1">
                {t('self.momentDescription') || 'The Moment'}
              </Text>
              <Box className="bg-obsidian rounded-xl border border-white/10 p-4 min-h-[140px]">
                <InputField
                  placeholder={t('self.momentDescriptionPlaceholder') || 'What made you smile?'}
                  value={momentDescription}
                  onChangeText={setMomentDescription}
                  multiline
                  className="text-sacredWhite text-base text-start align-top"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                />
              </Box>
            </VStack>

            {/* Actions */}
            <HStack className="gap-3 mt-2">
              <Button
                onPress={() => {
                  hapticLight();
                  setShowForm(false);
                  setStudentName('');
                  setMomentDescription('');
                }}
                variant="outline"
                className="flex-1 border-white/10 h-14 rounded-full"
              >
                <Icon as={X} size={20} className="text-mistGray" />
              </Button>

              <Button
                onPress={handleSaveMoment}
                isDisabled={!momentDescription.trim() || isSaving}
                className="flex-[3] bg-emeraldGreen h-14 rounded-full shadow-lg shadow-emeraldGreen/20"
              >
                <HStack className="items-center gap-2">
                  <Icon as={Save} size={18} className="text-white" />
                  <ButtonText className="text-white font-black uppercase tracking-widest text-sm">
                    Seal in Jar
                  </ButtonText>
                </HStack>
              </Button>
            </HStack>
          </VStack>
        </AnimatedView>
      )}
    </VStack>
  );
}
