import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { authAPI, identityAPI, schoolAPI } from '@repo/core/api';
import type { Role } from '@repo/core/logic';

import React, { useCallback, useMemo, useReducer, useEffect, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ProgressIndicator } from '../components/ProgressIndicator';
import ScreenWrapper from '../components/ScreenWrapper';
import {
  Box,
  Button,
  ButtonText,
  Center,
  Heading,
  HStack,
  Input,
  InputField,
  Pressable,
  Text,
  VStack,
} from '../gluestack';
import { useTheme } from '../hooks/useTheme';
import { useSanctuaryToast } from '../providers/ToastProvider';
import { hapticError, hapticLight, hapticSuccess } from '../utils/haptics';

// ──────────────────────────────────────────────────────────
// CONSTANTS
// ──────────────────────────────────────────────────────────

const JOURNEY_PILLARS = ['Self', 'Classroom', 'Community', 'Library'];
const TOTAL_STEPS = 7;
const ROLE_OPTIONS: Array<{ value: Role; emoji: string; descKey: string }> = [
  { value: 'teacher', emoji: '🧑‍🏫', descKey: 'onboarding.roleDesc.teacher' },
  { value: 'student', emoji: '🎒', descKey: 'onboarding.roleDesc.student' },
  {
    value: 'principal',
    emoji: '🏫',
    descKey: 'onboarding.roleDesc.principal',
  },
];

// ──────────────────────────────────────────────────────────
// TYPES & REDUCER
// ──────────────────────────────────────────────────────────

interface OnboardingState {
  currentStep: number;
  name: string;
  role: Role;
  isCompleting: boolean;
}

type OnboardingAction =
  | { type: 'SET_STEP'; step: number }
  | { type: 'SET_NAME'; name: string }
  | { type: 'SET_ROLE'; role: Role }
  | { type: 'SET_COMPLETING'; isCompleting: boolean }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'RESTORE_PROGRESS'; progress: Partial<OnboardingState> };

function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.step };
    case 'SET_NAME':
      return { ...state, name: action.name };
    case 'SET_ROLE':
      return { ...state, role: action.role };
    case 'SET_COMPLETING':
      return { ...state, isCompleting: action.isCompleting };
    case 'NEXT_STEP':
      return { ...state, currentStep: Math.min(6, state.currentStep + 1) };
    case 'PREV_STEP':
      return { ...state, currentStep: Math.max(0, state.currentStep - 1) };
    case 'RESTORE_PROGRESS':
      return { ...state, ...action.progress };
    default:
      return state;
  }
}

// ──────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ──────────────────────────────────────────────────────────

const StepShell = memo(({
  currentStep,
  step,
  title,
  subtitle,
  children,
}: {
  currentStep: number;
  step: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) => (
  <VStack className="flex-1 px-5 pt-5 pb-6">
    <Box
      className="rounded-generous border border-phase-border bg-phase-secondary overflow-hidden elevation-4"
      style={{
        shadowColor: '#6B6480', // shadowViolet
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
      }}
    >
      <Box className="px-6 py-6 bg-phase-surface border-b border-phase-border">
        <VStack className="gap-4">
          <HStack className="gap-2 flex-wrap">
            {JOURNEY_PILLARS.map((pillar) => (
              <Box
                key={pillar}
                className="px-3 py-1 rounded-full bg-phase-canvas border border-phase-border"
              >
                <Text className="text-xs text-phase-text-secondary font-bold">{pillar}</Text>
              </Box>
            ))}
          </HStack>
          <ProgressIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
          <VStack className="gap-1">
            <Text className="text-xs text-phase-accent font-bold tracking-widest uppercase">
              {step}
            </Text>
            <Heading size="2xl" className="text-phase-text-primary">
              {title}
            </Heading>
            <Text className="text-phase-text-secondary">{subtitle}</Text>
          </VStack>
        </VStack>
      </Box>
      <Box className="px-6 py-8">{children}</Box>
    </Box>
  </VStack>
));

const NameStep = memo(({ 
  t, 
  name, 
  onNameChange, 
  onNext, 
  canProceed, 
  onBackToWelcome 
}: { 
  t: any; 
  name: string; 
  onNameChange: (text: string) => void; 
  onNext: () => void; 
  canProceed: boolean; 
  onBackToWelcome: () => void;
}) => (
  <StepShell
    currentStep={0}
    step="STEP 1 · ARRIVAL"
    title={t('onboarding.nameTitle') || 'Welcome! What should we call you?'}
    subtitle={t('onboarding.nameSubtitle') || "Let's start your journey with a name."}
  >
    <VStack className="gap-6">
      <Input className="rounded-comfortable border-phase-text-tertiary">
        <InputField
          placeholder={t('onboarding.namePlaceholder')}
          value={name}
          onChangeText={onNameChange}
          className="text-phase-text-primary"
        />
      </Input>
      <Text className="text-phase-text-secondary text-sm">
        This name becomes the gentle way Gurudevi addresses you across your sanctuary surfaces.
      </Text>
      <Button
        size="lg"
        onPress={onNext}
        isDisabled={!canProceed}
        className="bg-phase-accent mt-2"
      >
        <ButtonText className="text-phase-text-on-accent font-bold">
          {t('onboarding.continue')}
        </ButtonText>
      </Button>
      <Button
        variant="ghost"
        onPress={onBackToWelcome}
        className="mt-1"
      >
        <ButtonText className="text-phase-text-tertiary">
          {t('onboarding.backToWelcome') || 'Back to Welcome'}
        </ButtonText>
      </Button>
    </VStack>
  </StepShell>
));

const RoleStep = memo(({
  t,
  role,
  onRoleSelect,
  onBack,
  onNext
}: {
  t: any;
  role: Role;
  onRoleSelect: (role: Role) => void;
  onBack: () => void;
  onNext: () => void;
}) => (
  <VStack className="gap-6 mt-8 px-6">
    <ProgressIndicator currentStep={1} totalSteps={TOTAL_STEPS} />
    <Heading size="2xl" className="text-phase-accent text-center">
      {t('onboarding.roleTitle')}
    </Heading>
    <Text className="text-md text-phase-text-secondary text-center">
      {t('onboarding.roleSubtitle')}
    </Text>
    <VStack className="gap-4">
      {ROLE_OPTIONS.map((r) => {
        const selected = role === r.value;
        return (
          <Pressable
            key={r.value}
            onPress={() => onRoleSelect(r.value as Role)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            className={`
              border-2 rounded-comfortable p-4 flex-row items-center
              ${selected ? 'border-phase-accent bg-phase-accent/10' : 'border-phase-border bg-phase-secondary'}
            `}
          >
            <Text className="text-2xl mr-3">{r.emoji}</Text>
            <VStack className="flex-1">
              <Text
                className={`text-md font-bold ${selected ? 'text-phase-accent' : 'text-phase-text-primary'}`}
              >
                {t(`role.${r.value}`)}
              </Text>
              <Text className="text-sm text-phase-text-secondary">{t(r.descKey)}</Text>
            </VStack>
            {selected && (
              <Box className="w-5.5 h-5.5 rounded-full bg-phase-accent items-center justify-center">
                <Text className="text-xs text-phase-text-on-accent">✓</Text>
              </Box>
            )}
          </Pressable>
        );
      })}
    </VStack>
    <HStack className="gap-4 mt-6">
      <Button variant="outline" onPress={onBack} className="flex-1 border-phase-border">
        <ButtonText className="text-phase-text-primary">{t('onboarding.back')}</ButtonText>
      </Button>
      <Button onPress={onNext} className="bg-phase-accent flex-[2]">
        <ButtonText className="text-phase-text-on-accent font-bold">
          {t('onboarding.continue')}
        </ButtonText>
      </Button>
    </HStack>
  </VStack>
));

const TourStep = memo(({
  t,
  index,
  screen,
  onBack,
  onNext,
  onSkip
}: {
  t: any;
  index: number;
  screen: any;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
}) => (
  <VStack className="gap-6 mt-8 px-6 flex-1">
    <ProgressIndicator currentStep={index} totalSteps={TOTAL_STEPS} />
    <VStack className="gap-4 items-center">
      <Text className="text-6xl text-center leading-[80px]" accessible={false}>
        {screen.emoji}
      </Text>
      <Heading size="2xl" className="text-phase-accent text-center" accessibilityRole="header">
        {screen.title}
      </Heading>
      <Text className="text-phase-text-secondary text-center text-lg font-bold">
        {screen.subtitle}
      </Text>
      <Box className="flex-1 justify-center py-4">
        <Text className="text-center text-phase-text-primary text-md leading-relaxed">
          {screen.content}
        </Text>
      </Box>
    </VStack>
    <VStack className="gap-4 mt-auto pb-6">
      <HStack className="gap-4">
        <Button variant="outline" onPress={onBack} className="flex-1 border-phase-border">
          <ButtonText className="text-phase-text-primary">{t('onboarding.back')}</ButtonText>
        </Button>
        <Button onPress={onNext} className="bg-phase-accent flex-[2]">
          <ButtonText className="text-phase-text-on-accent font-bold">
            {index === 6 ? t('onboarding.finish') : t('onboarding.next')}
          </ButtonText>
        </Button>
      </HStack>
      <Button variant="ghost" onPress={onSkip}>
        <ButtonText className="text-phase-text-tertiary">{t('onboarding.skip')}</ButtonText>
      </Button>
    </VStack>
  </VStack>
));

// ──────────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────────

interface OnboardingScreenProps {
  onComplete: (name: string, role: Role, wantsAccount?: boolean) => void;
  isAnonymous?: boolean;
}

export default memo(function OnboardingScreen({
  onComplete,
  isAnonymous = false,
}: OnboardingScreenProps) {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const _theme = useTheme();

  const [state, dispatch] = useReducer(onboardingReducer, {
    currentStep: 0,
    name: '',
    role: 'teacher' as Role,
    isCompleting: false,
  });

  const { currentStep, name, role, isCompleting } = state;
  const toast = useSanctuaryToast();

  // ── Restore saved progress or pre-fill from existing auth ──────────
  useEffect(() => {
    const initOnboarding = async () => {
      const internalId = await identityAPI.getMyInternalId();

      // Try to restore mid-flow progress for this user
      try {
        const saved = await AsyncStorage.getItem('onboarding_progress');
        if (saved) {
          const progress = JSON.parse(saved);
          if (!internalId || progress.userId === internalId) {
            dispatch({
              type: 'RESTORE_PROGRESS',
              progress: {
                name: progress.name || '',
                role: (progress.role as Role) || 'teacher',
                currentStep:
                  typeof progress.step === 'number' && progress.step >= 0 && progress.step < 7
                    ? progress.step
                    : 0,
              },
            });
            return;
          }
        }
      } catch {
        /* ignore corrupt storage */
      }

      // No saved progress — pre-fill for verified (non-anonymous) users with a real name
      if (!internalId) {
        console.log('🧭 OnboardingScreen: No internalId found, initiating anonymous session...');
        await authAPI.signInAnonymously();
        return initOnboarding();
      }
      const profile = await identityAPI.getProfile(internalId);

      if (!profile) return;

      // Step 1.1: If already onboarded in DB, just finish locally
      if (profile.onboarding_completed && profile.role) {
        console.log('✅ Onboarding: Profile already marked as completed in DB, finalizing...');
        dispatch({ type: 'SET_NAME', name: profile.full_name || '' });
        dispatch({ type: 'SET_ROLE', role: profile.role as Role });
        onComplete(profile.full_name || '', profile.role as Role, false);
        return;
      }

      const PLACEHOLDER_NAMES = ['Guest User', 'Gurudevi User', 'Sanctuary User'];
      if (!isAnonymous && profile.full_name && !PLACEHOLDER_NAMES.includes(profile.full_name)) {
        dispatch({ type: 'SET_NAME', name: profile.full_name });
        if (profile.role) {
          dispatch({ type: 'SET_ROLE', role: profile.role as Role });
          dispatch({ type: 'SET_STEP', step: 1 });
        } else {
          dispatch({ type: 'SET_STEP', step: 1 });
        }
      }
    };
    initOnboarding();
  }, [onComplete, isAnonymous]);

  const tourScreens = useMemo(
    () => [
      {
        emoji: '💠',
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

  const canProceed = useMemo(() => currentStep === 0 ? name.trim().length > 0 : true, [currentStep, name]);

  // Save progress whenever step/name/role/seeds change (so app-close resumes correctly)
  useEffect(() => {
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

  const handleCompleteOnboarding = useCallback(async () => {
    dispatch({ type: 'SET_COMPLETING', isCompleting: true });
    try {
      const internalId = await identityAPI.getMyInternalId();
      if (!internalId)
        throw new Error('Failed to resolve internal user ID during onboarding completion');

      hapticSuccess();

      // Check if user already exists in public.users to avoid overwriting critical data
      const existingProfile = await identityAPI.getProfile(internalId);

      // 1. Create a default school (Personal Workspace) only if they don't have one
      let schoolId = existingProfile?.school_id;
      if (!schoolId) {
        schoolId = await schoolAPI.initializePersonalWorkspace(internalId, name || 'My');
        if (schoolId) {
          console.log('✅ [Onboarding] Personal workspace created:', schoolId);
        }
      }

      // 2. Update user profile
      const currentSession = await authAPI.getAuthSession().catch(() => null);
      const actuallyAnonymous = currentSession?.user?.is_anonymous ?? true;

      await identityAPI.updateProfile(internalId, {
        full_name: name || 'Gurudevi User',
        role: role,
        school_id: schoolId,
        onboarding_completed: true,
        onboarding_completed_at: new Date(),
        is_anonymous: actuallyAnonymous,
      });

      console.log('✅ Onboarding: Profile successfully synced to DB.');

      await AsyncStorage.removeItem('onboarding_progress');
      onComplete(name, role, false);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      hapticError();
      dispatch({ type: 'SET_COMPLETING', isCompleting: false });
      toast.showToast({
        message: 'Failed to save profile. Please try again.',
        type: 'error',
      });
    }
  }, [name, role, onComplete, toast]);

  const handleNext = useCallback(async () => {
    if (!canProceed) return;
    hapticLight();

    // If tour completed, finish onboarding
    if (currentStep === 6) {
      handleCompleteOnboarding();
      return;
    }

    dispatch({ type: 'NEXT_STEP' });
  }, [canProceed, currentStep, handleCompleteOnboarding]);

  const handleBack = useCallback(() => {
    hapticLight();
    dispatch({ type: 'PREV_STEP' });
  }, []);

  const handleSkipTour = useCallback(() => {
    hapticLight();
    handleCompleteOnboarding();
  }, [handleCompleteOnboarding]);

  const handleNameChange = useCallback((text: string) => dispatch({ type: 'SET_NAME', name: text }), []);
  const handleRoleSelect = useCallback((r: Role) => {
    dispatch({ type: 'SET_ROLE', role: r });
    hapticLight();
  }, []);
  const handleBackToWelcome = useCallback(() => {
    hapticLight();
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    }
  }, [navigation]);

  const currentTourScreen = useMemo(() => {
    if (currentStep < 2 || currentStep > 6) return null;
    return tourScreens[currentStep - 2];
  }, [currentStep, tourScreens]);

  return (
    <ScreenWrapper>
      <Box className="flex-1 bg-phase-world">
        {/* Decorative Elements */}
        <Box className="absolute -top-12 -right-10 w-44 h-44 rounded-full bg-phase-accent/10" />
        <Box className="absolute -left-5 bottom-24 w-40 h-40 rounded-full bg-gurudeviBlue/10" />

        <VStack className="flex-1">
          <VStack className="px-6 pt-5 pb-2 gap-2">
            <HStack className="gap-2 flex-wrap">
              {JOURNEY_PILLARS.map((pillar) => (
                <Box
                  key={pillar}
                  className="px-3 py-1 rounded-full bg-phase-secondary/80 border border-phase-border"
                >
                  <Text className="text-xs text-phase-text-secondary font-bold">{pillar}</Text>
                </Box>
              ))}
            </HStack>
            <Text className="text-xs text-phase-accent font-bold tracking-widest uppercase">
              SANCTUARY JOURNEY
            </Text>
          </VStack>

          {isCompleting ? (
            <Center className="flex-1">
              <Text className="text-phase-text-primary">Finalizing your sanctuary...</Text>
            </Center>
          ) : (
            <>
              {currentStep === 0 && (
                <NameStep 
                  t={t} 
                  name={name} 
                  onNameChange={handleNameChange} 
                  onNext={handleNext} 
                  canProceed={canProceed} 
                  onBackToWelcome={handleBackToWelcome} 
                />
              )}
              {currentStep === 1 && (
                <RoleStep 
                  t={t} 
                  role={role} 
                  onRoleSelect={handleRoleSelect} 
                  onBack={handleBack} 
                  onNext={handleNext} 
                />
              )}
              {currentStep >= 2 && currentStep <= 6 && (
                <TourStep 
                  t={t} 
                  index={currentStep} 
                  screen={currentTourScreen} 
                  onBack={handleBack} 
                  onNext={handleNext} 
                  onSkip={handleSkipTour} 
                />
              )}
            </>
          )}
        </VStack>
      </Box>
    </ScreenWrapper>
  );
});
