import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { UserRole } from '@repo/core';
import { identityAPI } from '@repo/core/api';
import { supabase } from '@repo/core/native';

import {
  Box,
  Button,
  ButtonText,
  Center,
  Heading,
  HStack,
  Input,
  InputField,
  ScreenWrapper,
  Text,
  Toast,
  ToastTitle,
  useThemedColors,
  useToast,
  VStack,
} from '@repo/ui';
import { ProgressIndicator } from '@repo/ui/components';
import { Pressable } from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme';
import { hapticError, hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';

import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface OnboardingScreenProps {
  onComplete: (name: string, role: UserRole, wantsAccount?: boolean) => void;
  isAnonymous?: boolean;
}

export default function OnboardingScreen({
  onComplete,
  isAnonymous = false,
}: OnboardingScreenProps) {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const colors = useThemedColors();
  const [currentStep, setCurrentStep] = useState(0); // 0: Name, 1: Role, 2-6: Tour
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('teacher');
  const [isCompleting, setIsCompleting] = useState(false);
  const toast = useToast();

  // ── Restore saved progress or pre-fill from existing auth ─────────────
  React.useEffect(() => {
    const initOnboarding = async () => {
      const internalId = await identityAPI.getMyInternalId();

      // Try to restore mid-flow progress for this user
      try {
        const saved = await AsyncStorage.getItem('onboarding_progress');
        if (saved) {
          const progress = JSON.parse(saved);
          if (!internalId || progress.userId === internalId) {
            if (progress.name) setName(progress.name);
            if (progress.role) setRole(progress.role as UserRole);
            if (typeof progress.step === 'number' && progress.step >= 0 && progress.step < 7) {
              setCurrentStep(progress.step);
              return;
            }
          }
        }
      } catch {
        /* ignore corrupt storage */
      }

      // No saved progress — pre-fill for verified (non-anonymous) users with a real name
      if (!internalId) return;
      const { data: profile } = await supabase
        .from('users')
        .select('full_name, is_anonymous, role, onboarding_completed')
        .eq('id', internalId)
        .maybeSingle();

      if (!profile) return;

      // Step 1.1: If already onboarded in DB, just finish locally
      if (profile.onboarding_completed && profile.role) {
        console.log('✅ Onboarding: Profile already marked as completed in DB, finalizing...');
        setName(profile.full_name || '');
        setRole(profile.role as UserRole);
        onComplete(profile.full_name || '', profile.role as UserRole, false);
        return;
      }

      const PLACEHOLDER_NAMES = ['Guest User', 'Gurudevi User', 'Sanctuary User'];
      if (
        !profile.is_anonymous &&
        profile.full_name &&
        !PLACEHOLDER_NAMES.includes(profile.full_name)
      ) {
        setName(profile.full_name);
        if (profile.role) {
          setRole(profile.role as UserRole);
          setCurrentStep(1);
        } else {
          setCurrentStep(1);
        }
      }
    };
    initOnboarding();
  }, [onComplete]);

  const tourScreens = useMemo(
    () => [
      {
        emoji: '🪷',
        title: t('onboarding.philosophyTitle'),
        subtitle: t('onboarding.philosophySubtitle'),
        content: t('onboarding.philosophyContent'),
      },
      {
        emoji: '🏫',
        title: t('onboarding.sectionsTitle'),
        subtitle: t('onboarding.sectionsSubtitle'),
        content: t('onboarding.sectionsContent'),
      },
      {
        emoji: '🌱',
        title: t('onboarding.ecologyTitle'),
        subtitle: t('onboarding.ecologySubtitle'),
        content: t('onboarding.ecologyContent'),
      },
      {
        emoji: '🔒',
        title: t('onboarding.privacyTitle'),
        subtitle: t('onboarding.privacySubtitle'),
        content: t('onboarding.privacyContent'),
      },
      {
        emoji: '🧭',
        title: t('onboarding.navigationTitle'),
        subtitle: t('onboarding.navigationSubtitle'),
        content: t('onboarding.navigationContent'),
      },
    ],
    [t],
  );

  // Steps: 0-Name, 1-Role, 2-6-Tour

  const canProceed = currentStep === 0 ? name.trim().length > 0 : true;

  // Save progress whenever step/name/role/seeds change (so app-close resumes correctly)
  React.useEffect(() => {
    if (currentStep === 0 && !name) return; // Nothing to save yet
    identityAPI.getMyInternalId().then((userId) => {
      AsyncStorage.setItem(
        'onboarding_progress',
        JSON.stringify({
          userId,
          step: currentStep,
          name,
          role,
        }),
      ).catch(() => {
        /* silent */
      });
    });
  }, [currentStep, name, role]);

  const handleNext = async () => {
    if (!canProceed) return;
    hapticLight();

    // If tour completed, finish onboarding
    if (currentStep === 6) {
      handleCompleteOnboarding();
      return;
    }

    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    hapticLight();
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleSkipTour = () => {
    hapticLight();
    handleCompleteOnboarding();
  };

  const handleCompleteOnboarding = async () => {
    setIsCompleting(true);
    try {
      const internalId = await identityAPI.getMyInternalId();
      if (!internalId)
        throw new Error('Failed to resolve internal user ID during onboarding completion');

      hapticSuccess();

      // Check if user already exists in public.users to avoid overwriting critical data
      const { data: existingProfile } = await supabase
        .from('users')
        .select('school_id')
        .eq('id', internalId)
        .single();

      // 1. Create a default school (Personal Workspace) only if they don't have one
      let schoolId = existingProfile?.school_id;
      if (!schoolId) {
        const schoolName = `${name}'s Workspace`;
        const { data: schoolData, error: schoolError } = await supabase
          .from('schools')
          .insert({ name: schoolName, type: 'personal_workspace', created_by: internalId })
          .select()
          .single();
        if (schoolError) console.warn('Workspace creation failed:', schoolError);
        schoolId = schoolData?.id;
      }

      // 2. Update user profile
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      const actuallyAnonymous = currentSession?.user?.is_anonymous ?? true;

      const { error: profileError } = await supabase.from('users').upsert({
        id: internalId,
        full_name: name || 'Gurudevi User',
        role: role,
        school_id: schoolId,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        is_anonymous: actuallyAnonymous,
      });

      if (profileError) {
        console.error('❌ Onboarding: Profile upsert failed:', profileError.message);
        throw profileError;
      }

      console.log('✅ Onboarding: Profile successfully synced to DB.');

      await AsyncStorage.removeItem('onboarding_progress');
      onComplete(name, role, false);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      hapticError();
      setIsCompleting(false);
      toast.show({
        placement: 'bottom',
        render: ({ id }) => (
          <Toast nativeID={id} action="error" variant="solid">
            <ToastTitle>Failed to save profile. Please try again.</ToastTitle>
          </Toast>
        ),
      });
    }
  };

  // --- Renderers ---

  const renderNameStep = () => (
    <VStack space="xl" mt="$8" px="$6">
      <ProgressIndicator currentStep={0} totalSteps={7} />
      <Heading size="2xl" color={colors.action} textAlign="center">
        {t('onboarding.nameTitle') || 'Welcome! What should we call you?'}
      </Heading>
      <Text color={colors.textSecondary} textAlign="center">
        {t('onboarding.nameSubtitle') || "Let's start your journey with a name."}
      </Text>
      <Input
        variant="outline"
        size="xl"
        sx={{ borderColor: colors.textTertiary, borderRadius: Theme.corners.comfortable, mt: '$4' }}
      >
        <InputField
          placeholder={t('onboarding.namePlaceholder')}
          value={name}
          onChangeText={setName}
          color={colors.text}
        />
      </Input>
      <Button
        size="lg"
        onPress={handleNext}
        isDisabled={!canProceed}
        sx={{ backgroundColor: colors.action, mt: '$6' }}
      >
        <ButtonText color={Theme.colors.sacredWhite}>{t('onboarding.continue')}</ButtonText>
      </Button>
      <Button
        variant="link"
        onPress={() => {
          hapticLight();
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Welcome' }],
            });
          }
        }}
        sx={{ mt: '$2' }}
      >
        <ButtonText color={colors.textTertiary}>
          {t('onboarding.backToWelcome') || 'Back to Welcome'}
        </ButtonText>
      </Button>
    </VStack>
  );

  const ROLE_OPTIONS: Array<{ value: UserRole; emoji: string; descKey: string }> = [
    { value: 'teacher', emoji: '🧑‍🏫', descKey: 'onboarding.roleDesc.teacher' },
    { value: 'student', emoji: '🎒', descKey: 'onboarding.roleDesc.student' },
    { value: 'principal', emoji: '🏫', descKey: 'onboarding.roleDesc.principal' },
  ];

  const renderRoleStep = () => (
    <VStack space="xl" mt="$8" px="$6">
      <ProgressIndicator currentStep={1} totalSteps={7} />
      <Heading size="2xl" color={colors.action} textAlign="center">
        {t('onboarding.roleTitle')}
      </Heading>
      <Text size="md" color={colors.textSecondary} textAlign="center">
        {t('onboarding.roleSubtitle')}
      </Text>
      <VStack space="md">
        {ROLE_OPTIONS.map((r) => {
          const selected = role === r.value;
          return (
            <Pressable
              key={r.value}
              onPress={() => {
                setRole(r.value);
                hapticLight();
              }}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              sx={{
                borderWidth: 2,
                borderColor: selected ? colors.action : colors.border,
                borderRadius: Theme.corners.comfortable,
                backgroundColor: selected ? `${colors.action}12` : colors.secondary,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Text size="2xl" mr="$3">
                {r.emoji}
              </Text>
              <VStack flex={1}>
                <Text size="md" fontWeight="$bold" color={selected ? colors.action : colors.text}>
                  {t(`role.${r.value}`)}
                </Text>
                <Text size="sm" color={colors.textSecondary}>
                  {t(r.descKey)}
                </Text>
              </VStack>
              {selected && (
                <Box
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: colors.action,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text size="xs" color={Theme.colors.sacredWhite}>
                    ✓
                  </Text>
                </Box>
              )}
            </Pressable>
          );
        })}
      </VStack>
      <HStack space="md" mt="$6">
        <Button variant="outline" onPress={handleBack} sx={{ flex: 1 }}>
          <ButtonText color={colors.text}>{t('onboarding.back')}</ButtonText>
        </Button>
        <Button onPress={handleNext} sx={{ backgroundColor: colors.action, flex: 2 }}>
          <ButtonText color={Theme.colors.sacredWhite}>{t('onboarding.continue')}</ButtonText>
        </Button>
      </HStack>
    </VStack>
  );

  const renderTourStep = (index: number) => {
    const tourIdx = index - 2; // steps 2-6 map to tour screens 0-4
    const screen = tourScreens[tourIdx];
    if (!screen) return null;

    return (
      <VStack space="xl" mt="$8" px="$6" flex={1}>
        <ProgressIndicator currentStep={index} totalSteps={7} />
        <VStack space="md" alignItems="center">
          <Text size="6xl" textAlign="center" sx={{ lineHeight: 80 }} accessible={false}>
            {screen.emoji}
          </Text>
          <Heading size="2xl" color={colors.action} textAlign="center" accessibilityRole="header">
            {screen.title}
          </Heading>
          <Text color={colors.textSecondary} textAlign="center" size="lg" fontWeight="$bold">
            {screen.subtitle}
          </Text>
          <Box sx={{ flex: 1, justifyContent: 'center', py: '$4' }}>
            <Text textAlign="center" color={colors.text} size="md" lineHeight="$xl">
              {screen.content}
            </Text>
          </Box>
        </VStack>
        <VStack space="md" mt="$auto" pb="$4">
          <HStack space="md">
            <Button variant="outline" onPress={handleBack} sx={{ flex: 1 }}>
              <ButtonText color={colors.text}>{t('onboarding.back')}</ButtonText>
            </Button>
            <Button onPress={handleNext} sx={{ backgroundColor: colors.action, flex: 2 }}>
              <ButtonText color={Theme.colors.sacredWhite}>
                {index === 6 ? t('onboarding.finish') : t('onboarding.next')}
              </ButtonText>
            </Button>
          </HStack>
          <Button variant="link" onPress={handleSkipTour}>
            <ButtonText color={colors.textTertiary}>{t('onboarding.skip')}</ButtonText>
          </Button>
        </VStack>
      </VStack>
    );
  };

  return (
    <ScreenWrapper>
      <VStack flex={1}>
        {isCompleting ? (
          <Center flex={1}>
            <Text color={colors.text}>Finalizing your sanctuary...</Text>
          </Center>
        ) : (
          <>
            {currentStep === 0 && renderNameStep()}
            {currentStep === 1 && renderRoleStep()}
            {currentStep >= 2 && currentStep <= 6 && renderTourStep(currentStep)}
          </>
        )}
      </VStack>
    </ScreenWrapper>
  );
}
