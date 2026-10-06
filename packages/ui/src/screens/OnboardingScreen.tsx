import { identityAPI, onboardingAPI } from '@repo/core/api/client';
import { resolveStoredInvite } from '@repo/core/lib/inviteCodes';
import { storage } from '@repo/core/lib/storage';
import { useStore } from '@repo/core/store';
import type { Capacity } from '@repo/core/types';
import { FireflyFeedbackScene } from '@repo/ui/components/FireflyFeedbackScene';
import IdentityCard from '@repo/ui/components/IdentityCard';
import type { MascotArtworkSource } from '@repo/ui/components/Mascot';
import { ProgressIndicator } from '@repo/ui/components/ProgressIndicator';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { BookOpen, Compass, Flower2, GraduationCap, Lock, School, Sprout } from '@repo/ui/icons';
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
} from '@repo/ui/primitives';
import {
  getDevOnboardingTemplateLabel,
  resolveOnboardingDevIntent,
} from '@repo/ui/screens/onboardingDevFlow';
import {
  getOnboardingProgressKey,
  parseOnboardingDraft,
  serializeOnboardingDraft,
} from '@repo/ui/screens/onboardingDraft';
import {
  canProceedOnboardingStep,
  getOnboardingPhase,
  getOnboardingStepLabel,
} from '@repo/ui/screens/onboardingFlow';
import {
  initialOnboardingJourneyState,
  onboardingJourneyReducer,
} from '@repo/ui/screens/onboardingJourney';
import { hapticError, hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';
import { safeBack } from '@repo/ui/utils/navigation';
import type React from 'react';
import { memo, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, TextInput } from 'react-native';

const JOURNEY_PILLARS = ['Self', 'Classroom', 'Community', 'Library'];
const TOTAL_STEPS = 7;
const CAPACITY_OPTIONS = [
  { value: 'teacher' as Capacity, Icon: GraduationCap, descKey: 'onboarding.roleDesc.teacher' },
  { value: 'student' as Capacity, Icon: BookOpen, descKey: 'onboarding.roleDesc.student' },
  {
    value: 'principal' as Capacity,
    Icon: School,
    descKey: 'onboarding.roleDesc.principal',
  },
] as const;

const StepShell = memo(
  ({
    currentStep,
    step,
    title,
    subtitle,
    artwork,
    children,
  }: {
    currentStep: number;
    step: string;
    title: string;
    subtitle: string;
    artwork?: MascotArtworkSource;
    children: React.ReactNode;
  }) => (
    <VStack className="flex-1 px-5 pt-2 pb-6">
      <Box
        className="rounded-3xl border border-phase-border/80 bg-phase-surface overflow-hidden elevation-3"
        style={{
          boxShadow: '0px 12px 24px rgba(107, 100, 128, 0.08)',
        }}
      >
        <Box className="px-6 pt-6 pb-2">
          <VStack className="gap-3 items-center">
            <ProgressIndicator
              currentStep={currentStep}
              totalSteps={TOTAL_STEPS}
              showStepCount={false}
            />
            <VStack className="gap-1 items-center">
              <Text className="text-xs text-phase-accent font-bold tracking-widest uppercase text-center">
                {step}
              </Text>
              <Heading size="xl" className="text-phase-text-primary text-center">
                {title}
              </Heading>
              <Text className="text-phase-text-secondary text-sm text-center">{subtitle}</Text>
            </VStack>
            {artwork ? <FireflyFeedbackScene artwork={artwork} size={112} state="loading" /> : null}
          </VStack>
        </Box>
        <Box className="px-6 pb-6 pt-2">{children}</Box>
      </Box>
    </VStack>
  ),
);
StepShell.displayName = 'StepShell';

const ErrorBanner = memo(({ error }: { error: string | null }) => {
  if (!error) return null;
  return (
    <Box className="bg-phase-danger/10 border border-phase-danger/20 p-3 rounded-comfortable mb-4">
      <Text className="text-phase-danger text-sm text-center">{error}</Text>
    </Box>
  );
});
ErrorBanner.displayName = 'ErrorBanner';

const NameStep = memo(
  ({
    t,
    name,
    suggestedName,
    onNameChange,
    onNext,
    canProceed,
    isLoading,
    onBackToWelcome,
    artwork,
    userId,
    capacity,
    schoolName,
  }: {
    t: (key: string, options?: any) => string;
    name: string;
    suggestedName?: string;
    onNameChange: (text: string) => void;
    onNext: () => void;
    canProceed: boolean;
    isLoading?: boolean;
    onBackToWelcome: () => void;
    artwork?: MascotArtworkSource;
    userId?: string | null;
    capacity: Capacity;
    schoolName?: string;
  }) => {
    const inputRef = useRef<React.ComponentRef<typeof TextInput> | null>(null);

    useEffect(() => {
      // Focus name input on mount imperatively
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }, []);

    const backLabel = t('onboarding.backToWelcome', { defaultValue: 'Back to Welcome' });
    const resolvedBackLabel =
      !backLabel || backLabel === 'onboarding.backToWelcome' ? 'Back to Welcome' : backLabel;

    const isSuggested = suggestedName && name.trim() === suggestedName.trim();

    return (
      <StepShell
        currentStep={0}
        step={getOnboardingStepLabel(0)}
        title={t('onboarding.nameTitle', { defaultValue: 'What should we call you?' })}
        subtitle={t('onboarding.nameSubtitle', {
          defaultValue: 'Enter your preferred name or friendly nickname for the sanctuary.',
        })}
        artwork={artwork}
      >
        <VStack className="gap-4">
          <Center className="my-1">
            <IdentityCard
              data={{
                id: userId || 'preview',
                display_name: name.trim() || 'Your Sanctuary Persona',
                capacity,
                school_name: schoolName,
              }}
              previewMode
            />
          </Center>

          <Input className="rounded-xl border-phase-border bg-phase-secondary/50 px-3 py-1">
            <InputField
              ref={inputRef}
              placeholder={t('onboarding.namePlaceholder', {
                defaultValue: 'e.g. Maya, Alex, Coach David',
              })}
              value={name}
              onChangeText={onNameChange}
              className="text-phase-text-primary text-base"
              editable={!isLoading}
              autoComplete="name"
              returnKeyType="next"
              onSubmitEditing={() => {
                if (canProceed) onNext();
              }}
            />
          </Input>

          {isSuggested ? (
            <HStack className="items-center gap-1.5 px-1">
              <Text className="text-phase-accent text-xs font-medium">
                ✨ Suggested from your account — feel free to customize.
              </Text>
            </HStack>
          ) : (
            <Text className="text-phase-text-secondary text-xs">
              {name.trim().length > 0 && name.trim().length < 2
                ? 'Your name is a bit short. Try adding another character.'
                : name === 'Guest User'
                  ? "Please choose a friendly name other than 'Guest User'."
                  : t('onboarding.nameHint', {
                      defaultValue:
                        'This is the friendly name other members and teachers will see.',
                    })}
            </Text>
          )}

          <Button
            size="lg"
            onPress={onNext}
            isDisabled={!canProceed}
            isLoading={isLoading}
            className="bg-phase-accent mt-2 rounded-xl"
          >
            <ButtonText className="text-phase-text-on-accent font-bold">
              {t('onboarding.continue', { defaultValue: 'Continue' })}
            </ButtonText>
          </Button>
          <Button variant="ghost" onPress={onBackToWelcome} className="mt-1">
            <ButtonText className="text-phase-text-tertiary">{resolvedBackLabel}</ButtonText>
          </Button>
        </VStack>
      </StepShell>
    );
  },
);
NameStep.displayName = 'NameStep';

const IdentityStep = memo(
  ({
    t,
    capacity,
    name,
    userId,
    schoolName,
    onCapacitySelect,
    onBack,
    onNext,
    isLoading,
    isAnonymous,
  }: {
    t: (key: string, options?: any) => string;
    capacity: Capacity;
    name: string;
    userId?: string | null;
    schoolName?: string;
    onCapacitySelect: (capacity: Capacity) => void;
    onBack: () => void;
    onNext: () => void;
    isLoading?: boolean;
    isAnonymous?: boolean;
  }) => (
    <StepShell
      currentStep={1}
      step={getOnboardingStepLabel(1)}
      title={t('onboarding.roleTitle', { defaultValue: 'Choose Your Capacity' })}
      subtitle={t('onboarding.roleSubtitle', {
        defaultValue: 'Select the role that best describes your presence in the sanctuary.',
      })}
    >
      <VStack className="gap-3">
        <Center className="mb-2">
          <IdentityCard
            data={{
              id: userId || 'preview',
              display_name: name.trim() || 'Your Sanctuary Persona',
              capacity,
              school_name: schoolName,
            }}
            previewMode
          />
        </Center>
        {isAnonymous && (
          <Text className="text-xs text-phase-text-tertiary text-center mb-1">
            (Anonymous Guest Session)
          </Text>
        )}
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
              border rounded-xl p-3.5 flex-row items-center gap-3.5
              ${selected ? 'border-phase-accent bg-phase-accent/10' : 'border-phase-border bg-phase-secondary/50'}
              ${isLoading ? 'opacity-50' : ''}
            `}
            >
              <r.Icon
                size={26}
                className={selected ? 'text-phase-accent' : 'text-phase-text-secondary'}
              />
              <VStack className="flex-1">
                <Text
                  className={`text-sm font-bold ${selected ? 'text-phase-accent' : 'text-phase-text-primary'}`}
                >
                  {t(`identity.${r.value}`, { defaultValue: r.value.toUpperCase() })}
                </Text>
                <Text className="text-xs text-phase-text-secondary">
                  {t(r.descKey, { defaultValue: '' })}
                </Text>
              </VStack>
              {selected && (
                <Box className="w-5 h-5 rounded-full bg-phase-accent items-center justify-center">
                  <Text className="text-xs text-phase-text-on-accent font-bold">✓</Text>
                </Box>
              )}
            </Pressable>
          );
        })}

        <HStack className="gap-3 mt-4">
          <Button
            variant="outline"
            onPress={onBack}
            isDisabled={isLoading}
            className="flex-1 border-phase-border rounded-xl"
          >
            <ButtonText className="text-phase-text-primary">
              {t('onboarding.back', { defaultValue: 'Back' })}
            </ButtonText>
          </Button>
          <Button
            onPress={onNext}
            isLoading={isLoading}
            isDisabled={isLoading}
            className="bg-phase-accent flex-[2] rounded-xl"
          >
            <ButtonText className="text-phase-text-on-accent font-bold">
              {t('onboarding.continue', { defaultValue: 'Continue' })}
            </ButtonText>
          </Button>
        </HStack>
      </VStack>
    </StepShell>
  ),
);
IdentityStep.displayName = 'IdentityStep';

interface TourScreen {
  Icon: typeof Flower2;
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
  }: {
    t: (key: string) => string;
    index: number;
    screen: TourScreen;
    onBack: () => void;
    onNext: () => void;
    onSkip: () => void;
    isLoading?: boolean;
  }) => (
    <VStack className="gap-6 mt-8 px-6 flex-1">
      <ProgressIndicator currentStep={index} totalSteps={TOTAL_STEPS} />
      <VStack className="gap-4 items-center">
        <screen.Icon size={72} className="text-phase-accent" accessibilityElementsHidden />
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

const DevSandboxConsoleInner = memo(
  ({
    onClose,
    onSave,
  }: {
    onClose: () => void;
    onSave: (
      name: string,
      role: Capacity,
      pricing: string,
      citizenship: string,
      schoolId: string | null,
    ) => void;
  }) => {
    const [name, setName] = useReducer((_: string, val: string) => val, 'Dev User');
    const [role, setRole] = useReducer((_: Capacity, val: Capacity) => val, 'teacher');
    const [pricing, setPricing] = useReducer((_: string, val: string) => val, 'FREE');
    const [citizenship, setCitizenship] = useReducer((_: string, val: string) => val, 'WANDERER');
    const [schoolId, setSchoolId] = useReducer((_: string, val: string) => val, '');

    return (
      <VStack className="flex-1 px-5 pt-5 pb-6">
        <Box
          className="rounded-generous border border-phase-border bg-phase-secondary overflow-hidden elevation-4"
          style={{
            boxShadow: '0px 14px 24px rgba(107, 100, 128, 0.1)',
          }}
        >
          <Box className="px-6 py-6 bg-phase-surface border-b border-phase-border">
            <VStack className="gap-2">
              <Text className="text-xs text-phase-accent font-bold tracking-widest uppercase">
                DEVELOPER TOOLKIT
              </Text>
              <Heading size="xl" className="text-phase-text-primary">
                ⚙️ Sandbox Console
              </Heading>
              <Text className="text-phase-text-secondary text-sm">
                Simulate identity roles, pricing tiers, and citizenship levels directly into
                local/staging environments.
              </Text>
            </VStack>
          </Box>
          <Box className="px-6 py-6 gap-5">
            {/* Display Name Input */}
            <VStack className="gap-2">
              <Text className="text-sm font-bold text-phase-text-primary">Display Name</Text>
              <Input className="rounded-comfortable border-phase-text-tertiary">
                <InputField
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. John Doe"
                  className="text-phase-text-primary"
                />
              </Input>
            </VStack>

            {/* Role / Capacity selection */}
            <VStack className="gap-2">
              <Text className="text-sm font-bold text-phase-text-primary">Capacity / Role</Text>
              <HStack className="gap-2 flex-wrap">
                {(['teacher', 'student', 'principal', 'admin'] as Capacity[]).map((r) => (
                  <Pressable
                    key={r}
                    onPress={() => setRole(r)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: role === r }}
                    accessibilityLabel={r}
                    accessibilityHint={`Select role capacity as ${r}`}
                    className={`px-4 py-2 border rounded-full ${role === r ? 'border-phase-accent bg-phase-accent/10' : 'border-phase-border bg-phase-canvas'}`}
                  >
                    <Text
                      className={`text-xs font-bold ${role === r ? 'text-phase-accent' : 'text-phase-text-secondary'}`}
                    >
                      {r.toUpperCase()}
                    </Text>
                  </Pressable>
                ))}
              </HStack>
            </VStack>

            {/* Pricing Tier selection */}
            <VStack className="gap-2">
              <Text className="text-sm font-bold text-phase-text-primary">Pricing Tier</Text>
              <HStack className="gap-2 flex-wrap">
                {['FREE', 'PRO', 'INSTITUTIONAL'].map((p) => (
                  <Pressable
                    key={p}
                    onPress={() => setPricing(p)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: pricing === p }}
                    accessibilityLabel={p}
                    accessibilityHint={`Select pricing tier as ${p}`}
                    className={`px-4 py-2 border rounded-full ${pricing === p ? 'border-phase-accent bg-phase-accent/10' : 'border-phase-border bg-phase-canvas'}`}
                  >
                    <Text
                      className={`text-xs font-bold ${pricing === p ? 'text-phase-accent' : 'text-phase-text-secondary'}`}
                    >
                      {p}
                    </Text>
                  </Pressable>
                ))}
              </HStack>
            </VStack>

            {/* Citizenship selection */}
            <VStack className="gap-2">
              <Text className="text-sm font-bold text-phase-text-primary">Citizenship</Text>
              <HStack className="gap-2 flex-wrap">
                {['WANDERER', 'SECOND_CLASS', 'FIRST_CLASS'].map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => setCitizenship(c)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: citizenship === c }}
                    accessibilityLabel={c}
                    accessibilityHint={`Select citizenship level as ${c}`}
                    className={`px-4 py-2 border rounded-full ${citizenship === c ? 'border-phase-accent bg-phase-accent/10' : 'border-phase-border bg-phase-canvas'}`}
                  >
                    <Text
                      className={`text-xs font-bold ${citizenship === c ? 'text-phase-accent' : 'text-phase-text-secondary'}`}
                    >
                      {c.replace('_', ' ')}
                    </Text>
                  </Pressable>
                ))}
              </HStack>
            </VStack>

            {/* School ID selection */}
            <VStack className="gap-2">
              <Text className="text-sm font-bold text-phase-text-primary">
                School ID (Optional)
              </Text>
              <Input className="rounded-comfortable border-phase-text-tertiary">
                <InputField
                  value={schoolId}
                  onChangeText={setSchoolId}
                  placeholder="e.g. school-uuid"
                  className="text-phase-text-primary"
                />
              </Input>
            </VStack>

            {/* Actions */}
            <HStack className="gap-4 mt-4">
              <Button variant="outline" onPress={onClose} className="flex-1 border-phase-border">
                <ButtonText className="text-phase-text-primary">Cancel</ButtonText>
              </Button>
              <Button
                onPress={() => onSave(name, role, pricing, citizenship, schoolId || null)}
                className="bg-phase-accent flex-[2]"
              >
                <ButtonText className="text-phase-text-on-accent font-bold">
                  Fast-Track Profile
                </ButtonText>
              </Button>
            </HStack>
          </Box>
        </Box>
      </VStack>
    );
  },
);
DevSandboxConsoleInner.displayName = 'DevSandboxConsole';

const DevSandboxConsole =
  (typeof __DEV__ !== 'undefined' && __DEV__) ||
  process.env.EXPO_PUBLIC_ENABLE_DEV_SANDBOX === 'true'
    ? DevSandboxConsoleInner
    : () => null;

interface OnboardingScreenProps {
  onComplete: (name: string, capacity: Capacity, isAnonymous?: boolean) => void;
  isAnonymous?: boolean;
  userId?: string | null;
  suggestedName?: string;
  onboardingArtwork?: MascotArtworkSource;
}

const OnboardingScreen = memo(function OnboardingScreen({
  onComplete,
  isAnonymous = false,
  userId = null,
  suggestedName,
  onboardingArtwork,
}: OnboardingScreenProps) {
  const { t } = useTranslation();

  const [state, dispatch] = useReducer(onboardingJourneyReducer, initialOnboardingJourneyState);
  const [resolvedSchoolName, setResolvedSchoolName] = useState<string | undefined>(undefined);

  const { currentStep, name, selectedCapacity, isProcessing, error, showDevSandbox } = state;
  const currentPhase = getOnboardingPhase(currentStep);
  const isOnline = useStore((s) => s.isOnline);
  const showToast = useStore((s) => s.showToast);
  const resolvedInternalIdRef = useRef<string | null>(null);
  const resolvedCitizenRef = useRef<Awaited<
    ReturnType<typeof identityAPI.identifyActiveCitizen>
  > | null>(null);
  const anonymousBootstrapRequestedRef = useRef(false);

  const resolveOnboardingSubject = useCallback(async () => {
    if (isAnonymous) {
      if (!userId) throw new Error('Guest session is not ready. Please try again.');
      return { internalId: userId, isAnonymous: true };
    }

    const citizen = resolvedCitizenRef.current ?? (await identityAPI.identifyActiveCitizen());
    resolvedCitizenRef.current = citizen;
    if (!citizen?.id) throw new Error('Identity not resolved. Please try again.');
    return { internalId: citizen.id, isAnonymous: false };
  }, [isAnonymous, userId]);

  // ── Restore saved progress or pre-fill from existing auth & invites ──
  useEffect(() => {
    const initOnboarding = async () => {
      if (!userId) {
        console.log('⏳ OnboardingScreen: Waiting for userId prop to resolve...');
        return;
      }
      const internalId = userId;
      resolvedInternalIdRef.current = internalId;

      if (!isAnonymous) {
        try {
          const citizen = await identityAPI.identifyActiveCitizen().catch(() => null);
          resolvedCitizenRef.current = citizen;
        } catch (err) {
          console.warn('[Onboarding] Failed to pre-identify active citizen:', err);
        }

        // Stored invitations are account-scoped. A guest must create an account
        // before joining a shared institution, so never resolve one during guest onboarding.
        try {
          const pendingInvite = await storage.getStringAsync('pending_invite');
          if (pendingInvite) {
            const res = await resolveStoredInvite(pendingInvite);
            if (res.valid && res.data) {
              console.log(
                '🎟️ [Onboarding] Resolved stored invite:',
                res.data.code,
                res.data.school_name,
              );
              dispatch({ type: 'SET_SCHOOL_ID', schoolId: res.data.school_id });
              dispatch({ type: 'SET_CAPACITY', capacity: res.data.capacity });
              dispatch({ type: 'SET_PRICING', pricing: 'INSTITUTIONAL' });
              dispatch({ type: 'SET_CITIZENSHIP', citizenship: 'INSTITUTIONAL' });
              if (res.data.school_name) {
                setResolvedSchoolName(res.data.school_name);
              }
            }
          }
        } catch (err) {
          console.warn('[Onboarding] Failed to resolve stored invite:', err);
        }
      }

      try {
        // Saved progress recovery logic
        const savedProgress = await storage.getStringAsync(getOnboardingProgressKey(internalId));
        if (savedProgress) {
          const progress = parseOnboardingDraft(savedProgress, internalId);
          if (progress) {
            console.log('📦 OnboardingScreen: Restoring progress for:', internalId);
            dispatch({
              type: 'RESTORE_PROGRESS',
              progress: {
                name: progress.name || suggestedName || '',
                selectedCapacity: progress.selectedCapacity,
                currentStep: progress.step,
                schoolId: progress.schoolId,
              },
            });
            return;
          }
        }
      } catch (err) {
        console.warn('[Onboarding] Failed to restore progress:', err);
      }

      if (isAnonymous) {
        if (suggestedName) {
          dispatch({ type: 'SET_NAME', name: suggestedName });
        }
        dispatch({ type: 'SET_STEP', step: 0 });
        return;
      }

      try {
        // USE NEW DOMAIN STATE API
        let capacitySummary: any = null;
        try {
          capacitySummary = await identityAPI.resolveWorkspaceContext(internalId);
        } catch (e) {
          console.warn('[Onboarding] Could not resolve workspace context from server:', e);
        }

        const initialDomainState = capacitySummary?.onboarding_state ?? 'ARRIVAL';
        const profile = capacitySummary?.profile as {
          display_name?: string;
          full_name?: string;
          school_id?: string | null;
        } | null;

        let activePerspective: any = null;
        try {
          activePerspective = await onboardingAPI.getActivePerspective();
        } catch {
          activePerspective = null;
        }

        if (!profile || !profile.full_name) {
          // Uninitialized or uncreated user account -> wipe draft cache and start cleanly at Welcome Step 0
          try {
            storage.delete(getOnboardingProgressKey(internalId));
          } catch {
            // Ignore failure when clearing progress key
          }
          if (suggestedName) {
            dispatch({ type: 'SET_NAME', name: suggestedName });
          }
          dispatch({ type: 'SET_STEP', step: 0 });
          return;
        }

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
      }
    };
    void initOnboarding();
  }, [onComplete, showToast, isAnonymous, userId]);

  const tourScreens = useMemo(
    () => [
      {
        Icon: Flower2,
        title: t('onboarding.philosophyTitle'),
        subtitle: t('onboarding.philosophySubtitle'),
        content: t('onboarding.philosophyContent'),
      },
      {
        Icon: School,
        title: t('onboarding.sectionsTitle'),
        subtitle: t('onboarding.sectionsSubtitle'),
        content: t('onboarding.sectionsContent'),
      },
      {
        Icon: Sprout,
        title: t('onboarding.ecologyTitle'),
        subtitle: t('onboarding.ecologySubtitle'),
        content: t('onboarding.ecologyContent'),
      },
      {
        Icon: Lock,
        title: t('onboarding.privacyTitle'),
        subtitle: t('onboarding.privacySubtitle'),
        content: t('onboarding.privacyContent'),
      },
      {
        Icon: Compass,
        title: t('onboarding.navigationTitle'),
        subtitle: t('onboarding.navigationSubtitle'),
        content: t('onboarding.navigationContent'),
      },
    ],
    [t],
  );

  const canProceed = useMemo(() => {
    if (isProcessing) return false;
    return canProceedOnboardingStep({
      phase: currentPhase,
      name,
      selectedCapacity,
      schoolId: state.schoolId,
    });
  }, [currentPhase, name, isProcessing, selectedCapacity, state.schoolId]);

  // Save progress whenever step/name/role/seeds change (so app-close resumes correctly)
  useEffect(() => {
    if (currentStep === 0 && !name) return;
    const userId = resolvedInternalIdRef.current;
    if (!userId) return;

    try {
      storage.set(
        getOnboardingProgressKey(userId),
        serializeOnboardingDraft({ userId, state }),
      );
    } catch (err: unknown) {
      console.warn('[Onboarding] Failed to save progress:', err);
    }
  }, [currentStep, name, selectedCapacity, state.schoolId]);

  const clearSavedProgress = useCallback(async () => {
    const progressUserId = resolvedInternalIdRef.current;
    if (!progressUserId) return;

    storage.delete(getOnboardingProgressKey(progressUserId));
  }, []);

  const handleCompleteOnboarding = useCallback(async () => {
    if (isProcessing) return;
    dispatch({ type: 'BEGIN_COMPLETION' });
    showToast('Finalizing your sanctuary journey...', 'info', 2000);
    try {
      const { internalId } = await resolveOnboardingSubject();

      // 1. Mark journey as completed in DB
      await onboardingAPI.completeOnboarding(internalId);

      // 2. Finalize persistence
      await clearSavedProgress();
      dispatch({ type: 'COMPLETE' });
      hapticSuccess();
      showToast('Sanctuary entry granted! Welcome home.', 'success', 3000);
      onComplete(name, selectedCapacity, isAnonymous);
    } catch (err) {
      console.error('Error completing onboarding:', err);
      hapticError();
      const baseMsg = err instanceof Error ? err.message : 'Failed to finalize onboarding.';
      const guidedMsg = `${baseMsg} Please check your connection and try again to enter the sanctuary.`;
      dispatch({ type: 'FAIL_COMPLETION', error: guidedMsg });
      showToast(guidedMsg, 'error', 5000);
    }
  }, [
    name,
    selectedCapacity,
    onComplete,
    showToast,
    isAnonymous,
    isProcessing,
    clearSavedProgress,
    resolveOnboardingSubject,
  ]);

  const handleDevFastTrack = useCallback(
    async (
      devName: string,
      devRole: Capacity,
      devPricing: string,
      devCitizenship: string,
      devSchoolId: string | null,
    ) => {
      dispatch({ type: 'SET_PROCESSING', isProcessing: true });
      showToast('Applying sandbox settings...', 'info', 2000);
      try {
        const { internalId, isAnonymous: isAnonymousSubject } = await resolveOnboardingSubject();

        await onboardingAPI.createInitialBond(devRole, {
          userId: internalId,
          displayName: devName,
          fullName: devName,
          schoolId: devSchoolId || null,
        });

        if (!isAnonymousSubject) {
          await identityAPI.modifyUserProfile(internalId, {
            display_name: devName,
            pricing_tier: devPricing,
            citizenship: devCitizenship,
            school_id: devSchoolId || null,
            profile_completed: true,
          });
        }

        await onboardingAPI.completeOnboarding(internalId);
        await clearSavedProgress();

        hapticSuccess();
        showToast(`Sandbox Profile Ready (${devRole})!`, 'success', 3000);
        onComplete(devName, devRole, isAnonymous);
      } catch (err) {
        console.error('[Onboarding] Sandbox setup failed:', err);
        hapticError();
        const msg = err instanceof Error ? err.message : 'Sandbox setup failed.';
        dispatch({ type: 'SET_ERROR', error: msg });
        showToast(msg, 'error', 4000);
      } finally {
        dispatch({ type: 'SET_PROCESSING', isProcessing: false });
      }
    },
    [onComplete, showToast, isAnonymous, clearSavedProgress, resolveOnboardingSubject],
  );

  const handleNext = useCallback(async () => {
    if (!canProceed || isProcessing) return;
    hapticLight();

    // 🛡️ OFFLINE CHECK
    if (!isOnline && !isAnonymous) {
      hapticError();
      dispatch({
        type: 'SET_ERROR',
        error: 'No internet connection detected. Please try again when you are online.',
      });
      return;
    }

    dispatch({ type: 'SET_PROCESSING', isProcessing: true });

    try {
      const { internalId, isAnonymous: isAnonymousSubject } = await resolveOnboardingSubject();

      if (currentPhase === 'arrival') {
        const devIntent = resolveOnboardingDevIntent({
          isDevMode: typeof __DEV__ !== 'undefined' && __DEV__,
          input: name,
        });
        if (devIntent.kind === 'menu') {
          dispatch({ type: 'SET_PROCESSING', isProcessing: false });
          dispatch({ type: 'SHOW_DEV_SANDBOX', visible: true });
          return;
        }
        if (devIntent.kind === 'template') {
          const template = devIntent.intent.template;

          showToast('Fast-tracking developer setup...', 'info', 2000);

          await onboardingAPI.createInitialBond(template.role, {
            userId: internalId,
            displayName: template.name,
            fullName: template.name,
            schoolId: template.schoolId,
          });

          if (!isAnonymousSubject) {
            await identityAPI.modifyUserProfile(internalId, {
              display_name: template.name,
              pricing_tier: template.pricing,
              citizenship: template.citizenship,
              school_id: template.schoolId,
              profile_completed: true,
            });
          }

          await onboardingAPI.completeOnboarding(internalId);
          await clearSavedProgress();

          hapticSuccess();
          showToast(getDevOnboardingTemplateLabel(template), 'success', 3000);
          onComplete(template.name, template.role, isAnonymous);
          return;
        }

        const isAnonymousIdentity = isAnonymousSubject;
        if (isAnonymousIdentity) {
          showToast('Name saved locally. Choose your capacity next.', 'info', 1000);
          console.log('📝 [Onboarding] Anonymous name kept local until capacity step.');
        } else {
          showToast('Syncing your identity...', 'info', 1000);
          await identityAPI.modifyUserProfile(internalId, { display_name: name });
          console.log('✅ [Onboarding] Name synced.');
        }
      } else if (currentPhase === 'identity') {
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
      } else if (currentPhase === 'complete') {
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
    currentPhase,
    currentStep,
    name,
    selectedCapacity,
    handleCompleteOnboarding,
    showToast,
    state.schoolId,
    onComplete,
    isAnonymous,
    clearSavedProgress,
    resolveOnboardingSubject,
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
    safeBack('/welcome');
  }, []);

  const currentTourScreen = useMemo(() => {
    if (currentPhase === 'arrival' || currentPhase === 'identity') return null;
    return tourScreens[Math.max(0, currentStep - 2)];
  }, [currentPhase, currentStep, tourScreens]);

  // On Android, resizing the viewport alone does not reliably scroll a focused
  // field above the keyboard. Keep a single scroll owner and move its end into
  // view once the keyboard has finished opening.
  const scrollViewRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  useEffect(() => {
    const eventName = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const subscription = Keyboard.addListener(eventName, () => {
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      });
    });

    return () => subscription.remove();
  }, []);

  return (
    <ScreenWrapper scroll={false}>
      <Box className="flex-1 bg-phase-world">
        {/* Decorative Elements */}
        <Box className="absolute -top-12 -right-10 w-44 h-44 rounded-full bg-phase-accent/10" />
        <Box className="absolute -left-5 bottom-24 w-40 h-40 rounded-full bg-gurudeviBlue/10" />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <VStack className="flex-1">
              {/* Minimalist Sanctuary Header */}
              <HStack className="px-6 pt-3 pb-1 items-center justify-between">
                <Text className="text-xs text-phase-accent font-bold tracking-widest uppercase">
                  SANCTUARY JOURNEY
                </Text>
                <Box className="px-2.5 py-0.5 rounded-full bg-phase-secondary/80 border border-phase-border">
                  <Text className="text-[11px] text-phase-text-secondary font-medium">
                    {currentPhase === 'arrival'
                      ? 'Step 1 of 7'
                      : currentPhase === 'identity'
                        ? 'Step 2 of 7'
                        : `Step ${currentStep + 1} of 7`}
                  </Text>
                </Box>
              </HStack>

              <Box className="px-6">
                <ErrorBanner error={error} />
              </Box>

              {isProcessing ? (
                <Center className="flex-1">
                  <Text className="text-phase-text-primary">Finalizing your sanctuary...</Text>
                </Center>
              ) : showDevSandbox ? (
                <DevSandboxConsole
                  onClose={() => dispatch({ type: 'SHOW_DEV_SANDBOX', visible: false })}
                  onSave={(devName, devRole, devPricing, devCitizenship, devSchoolId) => {
                    void handleDevFastTrack(
                      devName,
                      devRole,
                      devPricing,
                      devCitizenship,
                      devSchoolId,
                    );
                  }}
                />
              ) : (
                <>
                  {currentPhase === 'arrival' && (
                    <NameStep
                      t={t}
                      name={name}
                      suggestedName={suggestedName}
                      onNameChange={handleNameChange}
                      onNext={() => {
                        void handleNext();
                      }}
                      canProceed={canProceed}
                      isLoading={isProcessing}
                      onBackToWelcome={handleBackToWelcome}
                      artwork={onboardingArtwork}
                      userId={userId}
                      capacity={selectedCapacity}
                      schoolName={resolvedSchoolName}
                    />
                  )}
                  {currentPhase === 'identity' && (
                    <IdentityStep
                      t={t}
                      capacity={selectedCapacity}
                      name={name}
                      userId={userId}
                      schoolName={resolvedSchoolName}
                      onCapacitySelect={handleCapacitySelect}
                      onBack={handleBack}
                      onNext={() => {
                        void handleNext();
                      }}
                      isLoading={isProcessing}
                      isAnonymous={isAnonymous}
                    />
                  )}
                  {(currentPhase === 'mandatory' ||
                    currentPhase === 'optional' ||
                    currentPhase === 'complete') &&
                    currentTourScreen && (
                      <TourStep
                        t={t}
                        index={currentStep}
                        screen={currentTourScreen}
                        onBack={handleBack}
                        onNext={() => {
                          void handleNext();
                        }}
                        onSkip={handleSkipTour}
                        isLoading={isProcessing}
                      />
                    )}
                </>
              )}
            </VStack>
          </ScrollView>
        </KeyboardAvoidingView>
      </Box>
    </ScreenWrapper>
  );
});

OnboardingScreen.displayName = 'OnboardingScreen';

export default OnboardingScreen;
