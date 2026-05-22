import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { authAPI, identityAPI, onboardingAPI } from '@repo/core/api';
import { useStore } from '@repo/core/store';
import { type Capacity } from '@repo/core/types';

import type React from 'react';
import { memo, useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
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
import { hapticError, hapticLight, hapticSuccess } from '../utils/haptics';

// ──────────────────────────────────────────────────────────
// CONSTANTS
// ──────────────────────────────────────────────────────────

const JOURNEY_PILLARS = ['Self', 'Classroom', 'Community', 'Library'];
const TOTAL_STEPS = 7;
const CAPACITY_OPTIONS: Array<{ value: Capacity; emoji: string; descKey: string }> = [
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

interface OnboardingUIState {
  currentStep: number;
  name: string;
  selectedCapacity: Capacity;
  schoolId: string | null;
  isProcessing: boolean;
  error: string | null;
}

type OnboardingAction =
  | { type: 'SET_STEP'; step: number }
  | { type: 'SET_NAME'; name: string }
  | { type: 'SET_CAPACITY'; capacity: Capacity }
  | { type: 'SET_SCHOOL_ID'; schoolId: string | null }
  | { type: 'SET_PROCESSING'; isProcessing: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'RESTORE_PROGRESS'; progress: Partial<OnboardingUIState> };

function onboardingReducer(state: OnboardingUIState, action: OnboardingAction): OnboardingUIState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.step };
    case 'SET_NAME':
      return { ...state, name: action.name, error: null };
    case 'SET_CAPACITY':
      return { ...state, selectedCapacity: action.capacity, error: null };
    case 'SET_SCHOOL_ID':
      return { ...state, schoolId: action.schoolId };
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.isProcessing };
    case 'SET_ERROR':
      return { ...state, error: action.error, isProcessing: false };
    case 'NEXT_STEP':
      return { ...state, currentStep: Math.min(6, state.currentStep + 1), error: null };
    case 'PREV_STEP':
      return { ...state, currentStep: Math.max(0, state.currentStep - 1), error: null };
    case 'RESTORE_PROGRESS':
      return { ...state, ...action.progress };
    default:
      return state;
  }
}

// ──────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ──────────────────────────────────────────────────────────

const StepShell = memo(
  ({
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
  ),
);
StepShell.displayName = 'StepShell';

const ErrorBanner = memo(({ error }: { error: string | null }) => {
  if (!error) return null;
  return (
    <Box className="bg-phase-danger/10 border border-phase-danger/20 p-3 rounded-comfortable mb-4">
      <Text className="text-phase-danger text-sm text-center">⚠️ {error}</Text>
    </Box>
  );
});
ErrorBanner.displayName = 'ErrorBanner';

const NameStep = memo(
  ({
    t,
    name,
    onNameChange,
    onNext,
    canProceed,
    isLoading,
    error,
    onBackToWelcome,
  }: {
    t: (key: string) => string;
    name: string;
    onNameChange: (text: string) => void;
    onNext: () => void;
    canProceed: boolean;
    isLoading?: boolean;
    error: string | null;
    onBackToWelcome: () => void;
  }) => (
    <StepShell
      currentStep={0}
      step="STEP 1 · ARRIVAL"
      title={t('onboarding.nameTitle') || 'Welcome! What should we call you in Gurudevi?'}
      subtitle={t('onboarding.nameSubtitle') || "Let's start your journey with a name."}
    >
      <VStack className="gap-6">
        <ErrorBanner error={error} />
        <Input className="rounded-comfortable border-phase-text-tertiary">
          <InputField
            placeholder={t('onboarding.namePlaceholder')}
            value={name}
            onChangeText={onNameChange}
            className="text-phase-text-primary"
            editable={!isLoading}
            autoFocus
            autoComplete="name"
            returnKeyType="next"
            onSubmitEditing={() => {
              if (canProceed) onNext();
            }}
          />
        </Input>
        <Text className="text-phase-text-secondary text-sm">
          {name.trim().length > 0 && name.trim().length < 2
            ? 'Your name is a bit short. Try adding another character.'
            : name === 'Guest User'
              ? "Please choose a name other than 'Guest User'."
              : t('onboarding.nameHint') ||
                'Use the display name you want people to see inside the app.'}
        </Text>
        <Button
          size="lg"
          onPress={onNext}
          isDisabled={!canProceed}
          isLoading={isLoading}
          className="bg-phase-accent mt-2"
        >
          <ButtonText className="text-phase-text-on-accent font-bold">
            {t('onboarding.continue')}
          </ButtonText>
        </Button>
        <Button variant="ghost" onPress={onBackToWelcome} className="mt-1">
          <ButtonText className="text-phase-text-tertiary">
            {t('onboarding.backToWelcome') || 'Back to Welcome'}
          </ButtonText>
        </Button>
      </VStack>
    </StepShell>
  ),
);
NameStep.displayName = 'NameStep';

const IdentityStep = memo(
  ({
    t,
    capacity,
    onCapacitySelect,
    onBack,
    onNext,
    isLoading,
    isAnonymous,
    error,
  }: {
    t: (key: string) => string;
    capacity: Capacity;
    onCapacitySelect: (capacity: Capacity) => void;
    onBack: () => void;
    onNext: () => void;
    isLoading?: boolean;
    isAnonymous?: boolean;
    error: string | null;
  }) => (
    <VStack className="gap-6 mt-8 px-6">
      <ProgressIndicator currentStep={1} totalSteps={TOTAL_STEPS} />
      <Heading size="2xl" className="text-phase-accent text-center">
        {t('onboarding.roleTitle')}
      </Heading>
      <Text className="text-md text-phase-text-secondary text-center">
        {t('onboarding.roleSubtitle')}
      </Text>
      <ErrorBanner error={error} />
      {isAnonymous && (
        <Text className="text-xs text-phase-text-tertiary text-center mb-2">
          (Anonymous Session)
        </Text>
      )}
      <VStack className="gap-4">
        {CAPACITY_OPTIONS.map((r) => {
          const selected = capacity === r.value;
          return (
            <Pressable
              key={r.value}
              onPress={() => !isLoading && onCapacitySelect(r.value as Capacity)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              disabled={isLoading}
              className={`
              border-2 rounded-comfortable p-4 flex-row items-center
              ${selected ? 'border-phase-accent bg-phase-accent/10' : 'border-phase-border bg-phase-secondary'}
              ${isLoading ? 'opacity-50' : ''}
            `}
            >
              <Text className="text-2xl mr-3">{r.emoji}</Text>
              <VStack className="flex-1">
                <Text
                  className={`text-md font-bold ${selected ? 'text-phase-accent' : 'text-phase-text-primary'}`}
                >
                  {t(`identity.${r.value}`)}
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
        <Button
          variant="outline"
          onPress={onBack}
          isDisabled={isLoading}
          className="flex-1 border-phase-border"
        >
          <ButtonText className="text-phase-text-primary">{t('onboarding.back')}</ButtonText>
        </Button>
        <Button
          onPress={onNext}
          isLoading={isLoading}
          isDisabled={isLoading}
          className="bg-phase-accent flex-[2]"
        >
          <ButtonText className="text-phase-text-on-accent font-bold">
            {t('onboarding.continue')}
          </ButtonText>
        </Button>
      </HStack>
    </VStack>
  ),
);
IdentityStep.displayName = 'IdentityStep';

interface TourScreen {
  emoji: string;
  title: string;
  subtitle: string;
  content: string;
}

const TourStep = memo(
  ({
    t,
    index,
    screen,
    onBack,
    onNext,
    onSkip,
    isLoading,
    error,
  }: {
    t: (key: string) => string;
    index: number;
    screen: TourScreen;
    onBack: () => void;
    onNext: () => void;
    onSkip: () => void;
    isLoading?: boolean;
    error: string | null;
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
        <ErrorBanner error={error} />
        <Box className="flex-1 justify-center py-4">
          <Text className="text-center text-phase-text-primary text-md leading-relaxed">
            {screen.content}
          </Text>
        </Box>
      </VStack>
      <VStack className="gap-4 mt-auto pb-6">
        <HStack className="gap-4">
          <Button
            variant="outline"
            onPress={onBack}
            isDisabled={isLoading}
            className="flex-1 border-phase-border"
          >
            <ButtonText className="text-phase-text-primary">{t('onboarding.back')}</ButtonText>
          </Button>
          <Button
            onPress={onNext}
            isLoading={isLoading}
            isDisabled={isLoading}
            className="bg-phase-accent flex-[2]"
          >
            <ButtonText className="text-phase-text-on-accent font-bold">
              {index === 6 ? t('onboarding.finish') : t('onboarding.next')}
            </ButtonText>
          </Button>
        </HStack>
        <Button variant="ghost" onPress={onSkip} isDisabled={isLoading}>
          <ButtonText className="text-phase-text-tertiary">{t('onboarding.skip')}</ButtonText>
        </Button>
      </VStack>
    </VStack>
  ),
);
TourStep.displayName = 'TourStep';

// ──────────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────────

interface OnboardingScreenProps {
  onComplete: (name: string, capacity: Capacity, isAnonymous?: boolean) => void;
  isAnonymous?: boolean;
}

const OnboardingScreen = memo(function OnboardingScreen({
  onComplete,
  isAnonymous = false,
}: OnboardingScreenProps) {
  const { t } = useTranslation();
  const navigation = useNavigation<any>(); // eslint-disable-line @typescript-eslint/no-explicit-any

  const [state, dispatch] = useReducer(onboardingReducer, {
    currentStep: 0,
    name: '',
    selectedCapacity: 'teacher' as Capacity,
    schoolId: null,
    isProcessing: false,
    error: null,
  });

  const { currentStep, name, selectedCapacity, isProcessing, error } = state;
  const isOnline = useStore((s) => s.isOnline);
  const showToast = useStore((s) => s.showToast);
  const resolvedInternalIdRef = useRef<string | null>(null);
  const resolvedCitizenRef = useRef<Awaited<ReturnType<typeof identityAPI.identifyActiveCitizen>> | null>(
    null,
  );
  const anonymousBootstrapRequestedRef = useRef(false);

  // ── Restore saved progress or pre-fill from existing auth ──────────
  useEffect(() => {
    const initOnboarding = async () => {
      let internalId: string | null = null;
      try {
        const citizen = await identityAPI.identifyActiveCitizen().catch(() => null);
        resolvedCitizenRef.current = citizen;
        internalId = citizen?.id || null;
        resolvedInternalIdRef.current = internalId;
      } catch (err) {
        console.warn('[Onboarding] Failed to identify active citizen:', err);
      }

      try {
        // Saved progress recovery logic
        const savedProgress = await AsyncStorage.getItem('onboarding_progress');
        if (savedProgress) {
          const progress = JSON.parse(savedProgress);
          if (progress.user_id === internalId || !progress.user_id || isAnonymous) {
            console.log('📦 OnboardingScreen: Restoring progress for:', internalId);
            dispatch({
              type: 'RESTORE_PROGRESS',
              progress: {
                name: progress.name || '',
                selectedCapacity: (progress.capacity as Capacity) || 'teacher',
                currentStep:
                  typeof progress.step === 'number' && progress.step >= 0 && progress.step < 7
                    ? progress.step
                    : 0,
                schoolId: progress.schoolId || null,
              },
            });
            return;
          }
        }
      } catch (err) {
        console.warn('[Onboarding] Failed to restore progress:', err);
      }

      try {
        // No saved progress — pre-fill for verified (non-anonymous) users with a real name
        if (!internalId) {
          if (anonymousBootstrapRequestedRef.current) {
            return;
          }
          anonymousBootstrapRequestedRef.current = true;
          console.log('🧭 OnboardingScreen: No internalId found, initiating anonymous session...');
          await authAPI.signInAnonymously();
          return initOnboarding();
        }

        // USE NEW DOMAIN STATE API
        const capacitySummary = await identityAPI.resolveWorkspaceContext(internalId);
        const initialDomainState = capacitySummary.onboarding_state;
        const profile = capacitySummary.profile as {
          display_name?: string;
          full_name?: string;
          school_id?: string | null;
        } | null;
        const activePerspective = await onboardingAPI.getActivePerspective();

        if (!profile) return;

        // If already onboarded in DB, just finish locally
        if (initialDomainState === 'COMPLETED') {
          console.log('✅ Onboarding: Profile already marked as completed in DB, finalizing...');
          const capacity = (activePerspective?.activeBond?.capacity as Capacity) || 'teacher';
          const resolvedName = profile.display_name || profile.full_name || '';
          dispatch({ type: 'SET_NAME', name: resolvedName });
          onComplete(resolvedName, capacity, isAnonymous);
          return;
        }

        const resolvedName = profile.display_name || profile.full_name;
        if (resolvedName && resolvedName !== 'Guest User') {
          dispatch({ type: 'SET_NAME', name: resolvedName });
          if (profile.school_id) {
            dispatch({ type: 'SET_SCHOOL_ID', schoolId: profile.school_id });
          }
          if (initialDomainState === 'IDENTITY_SELECTION') {
            dispatch({ type: 'SET_STEP', step: 1 });
          } else if (initialDomainState === 'SANCTUARY_INIT') {
            dispatch({ type: 'SET_STEP', step: 2 });
          }
        }
      } catch (err) {
        console.error('[Onboarding] Initialization failure:', err);
        showToast(
          `Initialization Error: ${(err as Error)?.message || 'Something went wrong'}. Please check your connection or sign out and try again.`,
          'error',
        );
      }
    };
    void initOnboarding();
  }, [onComplete, showToast, isAnonymous]);

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

  const canProceed = useMemo(() => {
    if (isProcessing) return false;
    if (currentStep === 0) return name.trim().length >= 2 && name !== 'Guest User';
    return true;
  }, [currentStep, name, isProcessing]);

  // Save progress whenever step/name/role/seeds change (so app-close resumes correctly)
  useEffect(() => {
    if (currentStep === 0 && !name) return; // Nothing to save yet
    const userId = resolvedInternalIdRef.current;
    if (!userId) return;

    void AsyncStorage.setItem(
      'onboarding_progress',
      JSON.stringify({
        user_id: userId,
        step: currentStep,
        name,
        capacity: selectedCapacity,
        schoolId: state.schoolId,
      }),
    ).catch((err) => {
      console.warn('[Onboarding] Failed to save progress:', err);
    });
  }, [currentStep, name, selectedCapacity, state.schoolId]);

  const handleCompleteOnboarding = useCallback(async () => {
    dispatch({ type: 'SET_PROCESSING', isProcessing: true });
    showToast('Finalizing your sanctuary journey...', 'info', 2000);
    try {
      const citizen = resolvedCitizenRef.current ?? (await identityAPI.identifyActiveCitizen());
      resolvedCitizenRef.current = citizen;
      const internalId = citizen?.id;
      if (!internalId) throw new Error('Identity not resolved. Please try again.');

      // 1. Mark journey as completed in DB
      await onboardingAPI.completeOnboarding(internalId);

      // 2. Finalize persistence
      await AsyncStorage.removeItem('onboarding_progress');
      hapticSuccess();
      showToast('Sanctuary entry granted! Welcome home.', 'success', 3000);
      onComplete(name, selectedCapacity, isAnonymous);
    } catch (err) {
      console.error('Error completing onboarding:', err);
      hapticError();
      const baseMsg = err instanceof Error ? err.message : 'Failed to finalize onboarding.';
      const guidedMsg = `${baseMsg} Please check your connection and try again to enter the sanctuary.`;
      dispatch({ type: 'SET_ERROR', error: guidedMsg });
      showToast(guidedMsg, 'error', 5000);
    }
  }, [name, selectedCapacity, onComplete, showToast, isAnonymous]);

  const handleNext = useCallback(async () => {
    if (!canProceed || isProcessing) return;
    hapticLight();

    // 🛡️ OFFLINE CHECK
    if (!isOnline) {
      hapticError();
      dispatch({
        type: 'SET_ERROR',
        error: 'No internet connection detected. Please try again when you are online.',
      });
      return;
    }

    dispatch({ type: 'SET_PROCESSING', isProcessing: true });

    try {
      const citizen = resolvedCitizenRef.current ?? (await identityAPI.identifyActiveCitizen());
      resolvedCitizenRef.current = citizen;
      const internalId = citizen?.id;
      if (!internalId) throw new Error('Identity not resolved. Please try again.');

      if (currentStep === 0) {
        const isAnonymousIdentity = !citizen?.email;
        if (isAnonymousIdentity) {
          showToast('Name saved locally. Choose your capacity next.', 'info', 1000);
          console.log('📝 [Onboarding] Anonymous name kept local until capacity step.');
        } else {
          showToast('Syncing your identity...', 'info', 1000);
          await identityAPI.modifyUserProfile(internalId, { display_name: name });
          console.log('✅ [Onboarding] Name synced.');
        }
      } else if (currentStep === 1) {
        // STEP 1 -> 2: Identity Selection & Initial Bond Creation
        console.log('🏗️ [Onboarding] Initializing Bond for capacity:', selectedCapacity);

        // 2. Create the Bond
        showToast(`Establishing your bond as ${selectedCapacity}...`, 'info', 1500);
        await onboardingAPI.createInitialBond(selectedCapacity, {
          userId: internalId,
          displayName: name || 'Gurudevi User',
          fullName: name || 'Gurudevi User',
          schoolId: state.schoolId,
        });
        console.log('🔗 [Onboarding] Initial Bond created.');
        showToast('Identity bond secured.', 'success', 1000);
      } else if (currentStep === 6) {
        // Final Step
        await handleCompleteOnboarding();
        return;
      }

      dispatch({ type: 'NEXT_STEP' });
    } catch (err) {
      console.error('[Onboarding] Step transition failed:', err);
      hapticError();
      const baseMsg = err instanceof Error ? err.message : 'Something went wrong.';
      const guidedMsg = `${baseMsg} Please check your connection and try again.`;

      dispatch({
        type: 'SET_ERROR',
        error: guidedMsg,
      });
      showToast(guidedMsg, 'error', 4000);
    } finally {
      dispatch({ type: 'SET_PROCESSING', isProcessing: false });
    }
  }, [
    canProceed,
    isProcessing,
    isOnline,
    currentStep,
    name,
    selectedCapacity,
    handleCompleteOnboarding,
    showToast,
    state.schoolId,
  ]);

  const handleBack = useCallback(() => {
    hapticLight();
    dispatch({ type: 'PREV_STEP' });
  }, []);

  const handleSkipTour = useCallback(() => {
    hapticLight();
    void handleCompleteOnboarding();
  }, [handleCompleteOnboarding]);

  const handleNameChange = useCallback(
    (text: string) => dispatch({ type: 'SET_NAME', name: text }),
    [],
  );
  const handleCapacitySelect = useCallback((r: Capacity) => {
    dispatch({ type: 'SET_CAPACITY', capacity: r });
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

          {isProcessing ? (
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
                  isLoading={isProcessing}
                  error={error}
                  onBackToWelcome={handleBackToWelcome}
                />
              )}
              {currentStep === 1 && (
                <IdentityStep
                  t={t}
                  capacity={selectedCapacity}
                  onCapacitySelect={handleCapacitySelect}
                  onBack={handleBack}
                  onNext={handleNext}
                  isLoading={isProcessing}
                  isAnonymous={isAnonymous}
                  error={error}
                />
              )}
              {currentStep >= 2 && currentStep <= 6 && currentTourScreen && (
                <TourStep
                  t={t}
                  index={currentStep}
                  screen={currentTourScreen}
                  onBack={handleBack}
                  onNext={handleNext}
                  onSkip={handleSkipTour}
                  isLoading={isProcessing}
                  error={error}
                />
              )}
            </>
          )}
        </VStack>
      </Box>
    </ScreenWrapper>
  );
});

OnboardingScreen.displayName = 'OnboardingScreen';

export default OnboardingScreen;
