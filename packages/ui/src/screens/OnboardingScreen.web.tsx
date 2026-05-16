/**
 * ONBOARDING SCREEN - Web Edition
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, identityAPI, schoolAPI } from '@repo/core/api';
import { type Capacity, identity, useStore } from '@repo/core/logic';
import React, { memo, useCallback, useEffect, useMemo, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { useWindowDimensions } from 'react-native';

import { hapticError, hapticLight, hapticSuccess } from '../utils/haptics';

// ──────────────────────────────────────────────────────────
// CONSTANTS
// ──────────────────────────────────────────────────────────

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'si', label: 'සිං' },
  { code: 'ta', label: 'தமிழ்' },
];

const PILLARS = [
  { name: 'Self', emoji: '🧘' },
  { name: 'Classroom', emoji: '🏫' },
  { name: 'Community', emoji: '🤝' },
  { name: 'Library', emoji: '📚' },
  { name: 'Profile', emoji: '👤' },
];

const CAPACITY_OPTIONS = [
  { value: 'teacher', emoji: '🧑‍🏫', descKey: 'onboarding.roleDesc.teacher' },
  { value: 'student', emoji: '🎓', descKey: 'onboarding.roleDesc.student' },
  { value: 'principal', emoji: '🏫', descKey: 'onboarding.roleDesc.principal' },
];

const TOTAL_STEPS = 7; // 0: Name, 1: Role, 2-6: Tour

const TRACKED_STEPS = [
  { idx: 0, label: 'Name' },
  { idx: 1, label: 'Role' },
  { idx: 2, label: 'Tour' },
] as const;

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

const LanguagePillRow = memo(
  ({
    currentLang,
    onLanguageChange,
  }: {
    currentLang: string;
    onLanguageChange: (code: string) => void;
  }) => (
    <div className="ob-lang-row">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          className={`ob-lang-pill ${currentLang?.startsWith(lang.code) ? 'active' : ''}`}
          onClick={() => onLanguageChange(lang.code)}
        >
          {lang.label}
        </button>
      ))}
    </div>
  ),
);
LanguagePillRow.displayName = 'LanguagePillRow';

const ErrorBanner = memo(({ error }: { error: string | null }) => {
  if (!error) return null;
  return (
    <div className="ob-error-banner">
      <span className="ob-error-icon">⚠️ </span>
      <span className="ob-error-text">{error}</span>
    </div>
  );
});
ErrorBanner.displayName = 'ErrorBanner';

const NameStep = memo(
  ({
    t,
    name,
    onNameChange,
    onNext,
    error,
  }: {
    t: (key: string) => string;
    name: string;
    onNameChange: (val: string) => void;
    onNext: () => void;
    error: string | null;
  }) => (
    <div className="ob-step">
      <div className="ob-step-shell">
        <div className="ob-step-meta">Step 1 · Arrival</div>
        <div className="ob-step-icon">👋🏻</div>
      </div>
      <h2 className="ob-step-title">{t('onboarding.nameTitle')}</h2>
      <p className="ob-step-subtitle">{t('onboarding.nameSubtitle')}</p>
      <ErrorBanner error={error} />
        <input
        className="ob-input"
        type="text"
        placeholder={t('onboarding.namePlaceholder')}
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && name.trim()) onNext();
        }}
        autoFocus
        autoComplete="name"
      />
      <p className="ob-input-hint">
        {name.trim().length > 0 && name.trim().length < 2
          ? "Your name is a bit short. Try adding another character."
          : name === 'Guest User'
          ? "Please choose a name other than 'Guest User'."
          : "Use the display name you want people to see inside the app."}
      </p>
      <div className="ob-actions">
        <button className="ob-btn-primary" onClick={onNext} disabled={name.trim().length < 2 || name === 'Guest User'}>
          {t('onboarding.continue')} →
        </button>
      </div>
    </div>
  ),
);
NameStep.displayName = 'NameStep';

const IdentityStep = memo(
  ({
    t,
    capacity,
    isCompleting,
    isAnonymous,
    onCapacitySelect,
    onBack,
    onNext,
    error,
  }: {
    t: (key: string) => string;
    capacity: Capacity;
    isCompleting: boolean;
    isAnonymous: boolean;
    onCapacitySelect: (val: Capacity) => void;
    onBack: () => void;
    onNext: () => void;
    error: string | null;
  }) => (
    <div className="ob-step">
      <div className="ob-step-shell">
        <div className="ob-step-meta">Step 2 · Belonging</div>
        <div className="ob-step-icon">🎯</div>
      </div>
      <h2 className="ob-step-title">{t('onboarding.roleTitle')}</h2>
      <p className="ob-step-subtitle">{t('onboarding.roleSubtitle')}</p>
      <ErrorBanner error={error} />
      {isAnonymous && <div className="ob-anonymous-tag">(Anonymous Session)</div>}
      <div className="ob-role-grid">
        {CAPACITY_OPTIONS.map((r) => (
          <button
            key={r.value}
            className={`ob-role-card ${capacity === r.value ? 'selected' : ''}`}
            onClick={() => onCapacitySelect(r.value as Capacity)}
          >
            <span className="ob-role-emoji">{r.emoji}</span>
            <span className="ob-role-name">{t(`identity.${r.value}`)}</span>
            <span className="ob-role-desc">{t(r.descKey)}</span>
          </button>
        ))}
      </div>
      <div className="ob-actions">
        <button className="ob-btn-secondary" onClick={onBack}>
          ← {t('onboarding.back')}
        </button>
        <button className="ob-btn-primary" onClick={onNext} disabled={isCompleting}>
          {isCompleting ? t('onboarding.saving') : t('onboarding.continue')} →
        </button>
      </div>
    </div>
  ),
);
IdentityStep.displayName = 'IdentityStep';

const TourStep = memo(
  ({
    t,
    currentStep,
    screen,
    isCompleting,
    onBack,
    onNext,
    onSkip,
    error,
  }: {
    t: (key: string) => string;
    currentStep: number;
    screen: { emoji: string; title: string; subtitle: string; content: string };
    isCompleting: boolean;
    onBack: () => void;
    onNext: () => void;
    onSkip: () => void;
    error: string | null;
  }) => (
    <div className="ob-step">
      <div className="ob-step-shell">
        <div className="ob-step-meta">Sanctuary Tour</div>
        <div className="ob-step-icon">{screen.emoji}</div>
      </div>
      <h2 className="ob-step-title">{screen.title}</h2>
      <p className="ob-step-subtitle">{screen.subtitle}</p>
      <ErrorBanner error={error} />
      <div className="ob-tour-content">{screen.content}</div>
      <div className="ob-actions">
        <button className="ob-btn-secondary" onClick={onBack}>
          ← {t('onboarding.back')}
        </button>
        <button className="ob-btn-primary" onClick={onNext} disabled={isCompleting}>
          {isCompleting
            ? t('onboarding.saving')
            : currentStep === 6
              ? t('onboarding.complete')
              : t('onboarding.next')}{' '}
          →
        </button>
      </div>
      <button className="ob-btn-link" onClick={onSkip}>
        {t('onboarding.skip')}
      </button>
    </div>
  ),
);
TourStep.displayName = 'TourStep';

const Tracker = memo(({ currentStep }: { currentStep: number }) => (
  <div className="ob-tracker">
    {TRACKED_STEPS.map((s) => (
      <div
        key={s.idx}
        className={`ob-tracker-row ${currentStep > s.idx ? 'done' : ''} ${currentStep === s.idx ? 'current' : ''}`}
      >
        <div className="ob-tracker-dot" />
        <span className="ob-tracker-label">{s.label}</span>
      </div>
    ))}
  </div>
));
Tracker.displayName = 'Tracker';

// ──────────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────────

interface OnboardingScreenProps {
  onComplete: (name: string, capacity: Capacity, isAnonymous?: boolean) => void;
  isAnonymous?: boolean;
}

export default memo(function OnboardingScreenWeb({
  onComplete,
  isAnonymous = false,
}: OnboardingScreenProps) {
  const { t, i18n } = useTranslation();
  const { width } = useWindowDimensions();

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
  const isNarrow = width < 900;

  // ── Restore saved progress or pre-fill from existing auth ────────────────────
  useEffect(() => {
    const initOnboarding = async () => {
      try {
        const internalId = await identityAPI.getMyInternalId();
        try {
          const saved = await AsyncStorage.getItem('onboarding_progress');
          if (saved) {
            const progress = JSON.parse(saved);
            if (progress.user_id === internalId || !progress.user_id || isAnonymous) {
              dispatch({
                type: 'RESTORE_PROGRESS',
                progress: {
                  name: progress.name || '',
                  selectedCapacity: (progress.selectedCapacity as Capacity) || 'teacher',
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
        } catch (e) {
          console.warn('[Onboarding] Failed to restore progress from storage:', e);
        }

        if (!internalId) {
          console.log(
            '🗝️ OnboardingScreen.web: No internalId found, initiating anonymous session...',
          );
          await authAPI.signInAnonymously();
          return initOnboarding();
        }

        // USE NEW DOMAIN STATE API
        const { state: initialDomainState, profile } =
          await identityAPI.getOnboardingStatus(internalId);
        const activePerspective = await identity.getActivePerspective();

        if (!profile) return;

        // If already onboarded in DB, just finish locally
        if (initialDomainState === 'COMPLETED') {
          console.log('✅ Onboarding: Profile already marked as completed in DB, finalizing...');
          const capacity = (activePerspective?.active_bond.capacity as Capacity) || 'teacher';
          const resolvedName = profile.display_name || '';
          dispatch({ type: 'SET_NAME', name: resolvedName });
          onComplete(resolvedName, capacity, isAnonymous);
          return;
        }

        const resolvedName = profile.display_name;
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
      } catch (error) {
        console.error('[Onboarding] Initialization error:', error);
        showToast(
          `Initialization Error: ${(error as Error)?.message || 'Something went wrong'}. Please check your connection or refresh the page.`,
          'error',
        );
      }
    };
    void initOnboarding();
  }, [isAnonymous, onComplete]);

  // ── Tour content ────────────────────
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

  const showToast = useStore((s) => s.showToast);

  const handleCompleteOnboarding = useCallback(async () => {
    dispatch({ type: 'SET_PROCESSING', isProcessing: true });
    showToast('Finalizing your sanctuary journey...', 'info', 2000);
    try {
      const internalId = await identity.getMyInternalId();
      if (internalId) {
        await identityAPI.completeOnboarding(internalId);
      }
      await AsyncStorage.removeItem('onboarding_progress');
      hapticSuccess();
      showToast('Sanctuary entry granted! Welcome home.', 'success', 3000);
      onComplete(name, selectedCapacity, isAnonymous);
    } catch (err: unknown) {
      console.error('❌ Error completing onboarding:', err);
      hapticError();
      const baseMsg = err instanceof Error ? err.message : 'Failed to finalize onboarding.';
      const guidedMsg = `${baseMsg} Please check your connection and try again to enter the sanctuary.`;
      dispatch({ type: 'SET_ERROR', error: guidedMsg });
      showToast(guidedMsg, 'error', 5000);
    }
  }, [name, selectedCapacity, onComplete, showToast, isAnonymous]);

  const handleNext = useCallback(async () => {
    if (isProcessing) return;
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
      const internalId = await identityAPI.getMyInternalId();
      if (!internalId) throw new Error('Identity not resolved. Please try again.');

      if (currentStep === 0) {
        // Sync Name
        showToast('Syncing your identity...', 'info', 1000);
        await identityAPI.updateProfile(internalId, { display_name: name });
      } else if (currentStep === 1) {
        // 1. Ensure user has a profile and potentially a school
        const existingProfile = await identityAPI.getProfile(internalId);
        let schoolId = state.schoolId || existingProfile?.school_id;

        // Wanderers (Anonymous) don't get a workspace yet.
        // Second class citizens (Authenticated) get a personal workspace.
        if (!schoolId && !isAnonymous) {
          showToast('Building your personal sanctuary...', 'info', 2000);
          schoolId = await schoolAPI.initializePersonalWorkspace(internalId, name || 'My');
          dispatch({ type: 'SET_SCHOOL_ID', schoolId });
        }

        showToast(`Establishing your bond as ${selectedCapacity}...`, 'info', 1500);
        await identity.createInitialBond(selectedCapacity, {
          displayName: name || 'Gurudevi User',
          schoolId,
        });
        showToast('Identity bond secured.', 'success', 1000);
      } else if (currentStep === 6) {
        await handleCompleteOnboarding();
        return;
      }

      dispatch({ type: 'NEXT_STEP' });
    } catch (err: unknown) {
      console.error('[Onboarding] Step failed:', err);
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
    currentStep,
    name,
    selectedCapacity,
    isProcessing,
    isOnline,
    handleCompleteOnboarding,
    isAnonymous,
    showToast,
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
    (val: string) => dispatch({ type: 'SET_NAME', name: val }),
    [],
  );
  const handleCapacitySelect = useCallback((val: Capacity) => {
    dispatch({ type: 'SET_CAPACITY', capacity: val });
    hapticLight();
  }, []);
  const handleLanguageChange = useCallback(
    (code: string) => {
      hapticLight();
      void i18n.changeLanguage(code);
    },
    [i18n],
  );

  // Save progress whenever step/name/role changes
  useEffect(() => {
    if (currentStep === 0 && !name) return;
    void identity.getMyInternalId().then((userId) => {
      void AsyncStorage.setItem(
        'onboarding_progress',
        JSON.stringify({
          user_id: userId,
          step: currentStep,
          name,
          capacity: selectedCapacity,
          schoolId: state.schoolId,
        }),
      ).catch(() => {});
    });
  }, [currentStep, name, selectedCapacity]);

  const currentTourScreen = useMemo(() => {
    if (currentStep < 2 || currentStep > 6) return null;
    return tourScreens[currentStep - 2];
  }, [currentStep, tourScreens]);

  const renderCurrentStep = useCallback(() => {
    if (currentStep === 0) {
      return (
        <NameStep
          t={t}
          name={name}
          onNameChange={handleNameChange}
          onNext={handleNext}
          error={error}
        />
      );
    }
    if (currentStep === 1) {
      return (
        <IdentityStep
          t={t}
          capacity={selectedCapacity}
          isCompleting={isProcessing}
          isAnonymous={isAnonymous}
          onCapacitySelect={handleCapacitySelect}
          onBack={handleBack}
          onNext={handleNext}
          error={error}
        />
      );
    }
    if (currentStep >= 2 && currentStep <= 6 && currentTourScreen) {
      return (
        <TourStep
          t={t}
          currentStep={currentStep}
          screen={currentTourScreen}
          isCompleting={isProcessing}
          onBack={handleBack}
          onNext={handleNext}
          onSkip={handleSkipTour}
          error={error}
        />
      );
    }
    return null;
  }, [
    currentStep,
    t,
    name,
    handleNameChange,
    handleNext,
    error,
    selectedCapacity,
    isProcessing,
    isAnonymous,
    handleCapacitySelect,
    handleBack,
    currentTourScreen,
    handleSkipTour,
  ]);

  return (
    <div className="ob-root">
      <div className="ob-atmosphere ob-atmosphere-one" />
      <div className="ob-atmosphere ob-atmosphere-two" />

      {isNarrow ? (
        <div className="ob-narrow">
          <div className="ob-narrow-header">
            <span className="ob-brand-name">🪷 Gurudevi</span>
            <LanguagePillRow currentLang={i18n.language} onLanguageChange={handleLanguageChange} />
          </div>
          <div className="ob-progress-track" role="progressbar">
            <div
              className="ob-progress-fill"
              style={{ width: `${(currentStep / (TOTAL_STEPS - 1)) * 100}%` }}
            />
          </div>
          <div className="ob-narrow-content">{renderCurrentStep()}</div>
        </div>
      ) : (
        <div className="ob-split">
          <div className="ob-left">
            <div className="ob-left-inner">
              <div className="ob-brand">
                <span className="ob-brand-icon">🪷</span>
                <span className="ob-brand-name">Gurudevi</span>
              </div>
              <div>
                <h1 className="ob-left-headline">
                  Your Sacred
                  <br />
                  Sanctuary
                </h1>
                <p className="ob-left-tagline">
                  A healing ecosystem for educators — built in Sri Lanka, breathing worldwide.
                </p>
              </div>
              <div className="ob-pillars">
                {PILLARS.map((p) => (
                  <div key={p.name} className="ob-pillar">
                    <span>{p.emoji}</span>
                    <span>{p.name}</span>
                  </div>
                ))}
              </div>
              <Tracker currentStep={currentStep} />
              <div className="ob-lang-row ob-lang-bottom">
                <LanguagePillRow
                  currentLang={i18n.language}
                  onLanguageChange={handleLanguageChange}
                />
              </div>
            </div>
          </div>
          <div className="ob-right">
            <div className="ob-right-inner">
              <div className="ob-dots" role="progressbar">
                {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                  <div
                    key={i}
                    className={`ob-dot ${i === currentStep ? 'active' : i < currentStep ? 'done' : ''}`}
                  />
                ))}
              </div>
              {renderCurrentStep()}
            </div>
          </div>
        </div>
      )}

      <style>{ONBOARDING_STYLES}</style>
    </div>
  );
});

// ──────────────────────────────────────────────────────────
// STYLES
// ──────────────────────────────────────────────────────────

const ONBOARDING_STYLES = `
    .ob-root {
        position: fixed;
        inset: 0;
        background:
            radial-gradient(circle at 18% 14%, rgba(125, 212, 192, 0.14), transparent 24%),
            radial-gradient(circle at 88% 22%, rgba(184, 169, 224, 0.14), transparent 22%),
            linear-gradient(160deg, var(--background, #F5EDD6) 0%, var(--background-alt, #FAF7ED) 60%, rgba(252, 249, 242, 0.96) 100%);
        font-family: var(--font-body, 'DM Sans', sans-serif);
        overflow: hidden;
    }
    .ob-atmosphere {
        position: absolute;
        border-radius: 999px;
        pointer-events: none;
        filter: blur(14px);
        opacity: 0.55;
    }
    .ob-atmosphere-one {
        top: -80px;
        right: 18%;
        width: 220px;
        height: 220px;
        background: radial-gradient(circle, rgba(212,132,58,0.18), transparent 70%);
    }
    .ob-atmosphere-two {
        bottom: -70px;
        left: 8%;
        width: 260px;
        height: 260px;
        background: radial-gradient(circle, rgba(125,212,192,0.2), transparent 70%);
    }

    /* ── NARROW (single-column) ──────────────────── */
    .ob-narrow {
        display: flex;
        flex-direction: column;
        height: 100%;
        position: relative;
        z-index: 1;
    }
    .ob-narrow-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 20px;
        border-bottom: 1px solid var(--border, rgba(42,35,24,0.1));
        flex-shrink: 0;
    }
    .ob-progress-track {
        height: 3px;
        background: var(--border, rgba(42,35,24,0.1));
        flex-shrink: 0;
    }
    .ob-progress-fill {
        height: 100%;
        background: var(--action, #D4843A);
        transition: width 0.4s ease;
        border-radius: 0 2px 2px 0;
    }
    .ob-narrow-content {
        flex: 1;
        padding: 28px 20px;
        overflow-y: auto;
    }

    /* ── SPLIT (two-column) ──────────────────── */
    .ob-split {
        display: flex;
        height: 100%;
        position: relative;
        z-index: 1;
    }

    /* Left Panel */
    .ob-left {
        width: 340px;
        flex-shrink: 0;
        background: linear-gradient(160deg, rgba(252,249,242,0.72) 0%, rgba(252,249,242,0.5) 100%);
        border-right: 1px solid var(--border, rgba(42,35,24,0.08));
        overflow-y: auto;
        padding: 44px 36px;
        backdrop-filter: blur(18px);
    }
    .ob-left-inner {
        display: flex;
        flex-direction: column;
        gap: 32px;
        min-height: 100%;
    }
    .ob-brand {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .ob-brand-icon { font-size: 22px; }
    .ob-brand-name {
        font-size: 18px;
        font-weight: 800;
        color: var(--ink, #2A2318);
        letter-spacing: -0.3px;
    }
    .ob-left-headline {
        font-size: 40px;
        font-weight: 800;
        color: var(--ink, #2A2318);
        line-height: 1.1;
        letter-spacing: -1.5px;
        margin: 0 0 12px;
    }
    .ob-left-tagline {
        font-size: 14px;
        line-height: 1.6;
        color: var(--ink-ghost, #7A6E5F);
        margin: 0;
        max-width: 240px;
    }

    /* Pillars */
    .ob-pillars {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }
    .ob-pillar {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 5px 11px;
        border-radius: 50px;
        background: rgba(212,132,58,0.08);
        border: 1px solid rgba(212,132,58,0.2);
        font-size: 12px;
        font-weight: 600;
        color: var(--action, #D4843A);
    }

    /* Step tracker */
    .ob-tracker {
        display: flex;
        flex-direction: column;
        gap: 14px;
    }
    .ob-tracker-row {
        display: flex;
        align-items: center;
        gap: 12px;
        opacity: 0.35;
        transition: opacity 0.3s;
    }
    .ob-tracker-row.done { opacity: 0.55; }
    .ob-tracker-row.current { opacity: 1; }
    .ob-tracker-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--border, rgba(42,35,24,0.2));
        flex-shrink: 0;
        transition: background 0.3s, transform 0.3s;
    }
    .ob-tracker-row.current .ob-tracker-dot {
        background: var(--action, #D4843A);
        transform: scale(1.4);
        box-shadow: 0 0 0 4px rgba(212,132,58,0.15);
    }
    .ob-tracker-row.done .ob-tracker-dot {
        background: var(--action, #D4843A);
    }
    .ob-tracker-label {
        font-size: 13px;
        font-weight: 700;
        color: var(--ink, #2A2318);
        letter-spacing: 0.5px;
        text-transform: uppercase;
    }

    /* Language pills */
    .ob-lang-row {
        display: flex;
        gap: 8px;
    }
    .ob-lang-pill {
        padding: 4px 10px;
        border-radius: 4px;
        border: 1px solid var(--border, rgba(42,35,24,0.12));
        background: transparent;
        font-size: 11px;
        font-weight: 700;
        color: var(--ink-ghost, #7A6E5F);
        cursor: pointer;
        transition: all 0.2s;
    }
    .ob-lang-pill:hover { background: rgba(42,35,24,0.04); }
    .ob-lang-pill.active {
        background: var(--ink, #2A2318);
        color: #fff;
        border-color: var(--ink, #2A2318);
    }
    .ob-lang-bottom { margin-top: auto; }

    /* Right Panel */
    .ob-right {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow-y: auto;
        padding: 60px 40px;
    }
    .ob-right-inner {
        width: 100%;
        max-width: 520px;
    }

    /* Step Dots */
    .ob-dots {
        display: flex;
        gap: 6px;
        margin-bottom: 44px;
    }
    .ob-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--border, rgba(42,35,24,0.1));
        transition: all 0.3s;
    }
    .ob-dot.active {
        width: 24px;
        border-radius: 4px;
        background: var(--action, #D4843A);
    }
    .ob-dot.done {
        background: var(--action, #D4843A);
        opacity: 0.4;
    }

    /* STEP CONTENT */
    .ob-step {
        animation: obFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes obFadeIn {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .ob-step-shell {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
    }
    .ob-step-meta {
        font-size: 12px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        color: var(--action, #D4843A);
    }
    .ob-step-icon { font-size: 24px; }
    .ob-step-title {
        font-size: 36px;
        font-weight: 800;
        color: var(--ink, #2A2318);
        line-height: 1.1;
        letter-spacing: -1px;
        margin: 0 0 12px;
    }
    .ob-step-subtitle {
        font-size: 16px;
        line-height: 1.6;
        color: var(--ink-ghost, #7A6E5F);
        margin: 0 0 36px;
    }

    /* Inputs & Buttons */
    .ob-input {
        width: 100%;
        padding: 16px 20px;
        border-radius: 12px;
        border: 2px solid var(--border, rgba(42,35,24,0.1));
        background: rgba(255,255,255,0.6);
        font-size: 18px;
        font-weight: 500;
        color: var(--ink, #2A2318);
        outline: none;
        transition: all 0.2s;
        margin-bottom: 32px;
    }
    .ob-input:focus {
        border-color: var(--action, #D4843A);
        background: #fff;
        box-shadow: 0 0 0 4px rgba(212,132,58,0.1);
    }
    .ob-actions {
        display: flex;
        gap: 16px;
    }
    .ob-btn-primary {
        flex: 2;
        padding: 16px 24px;
        border-radius: 12px;
        border: none;
        background: var(--action, #D4843A);
        color: #fff;
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 4px 12px rgba(212,132,58,0.25);
    }
    .ob-btn-primary:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(212,132,58,0.35);
        filter: brightness(1.1);
    }
    .ob-btn-primary:active:not(:disabled) { transform: translateY(0); }
    .ob-btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .ob-btn-secondary {
        flex: 1;
        padding: 16px 24px;
        border-radius: 12px;
        border: 2px solid var(--border, rgba(42,35,24,0.1));
        background: transparent;
        color: var(--ink, #2A2318);
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
    }
    .ob-btn-secondary:hover { background: rgba(42,35,24,0.04); }

    .ob-btn-link {
        display: block;
        margin: 24px auto 0;
        padding: 8px 16px;
        background: none;
        border: none;
        color: var(--ink-ghost, #7A6E5F);
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        opacity: 0.7;
        transition: opacity 0.2s;
    }
    .ob-btn-link:hover { opacity: 1; text-decoration: underline; }

    /* Role Grid */
    .ob-role-grid {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 36px;
    }
    .ob-role-card {
        display: grid;
        grid-template-columns: 48px 1fr;
        grid-template-areas: "emoji name" "emoji desc";
        align-items: center;
        gap: 0 16px;
        padding: 16px 20px;
        border-radius: 16px;
        border: 2px solid var(--border, rgba(42,35,24,0.08));
        background: rgba(255,255,255,0.4);
        text-align: left;
        cursor: pointer;
        transition: all 0.2s;
    }
    .ob-role-card:hover {
        background: rgba(255,255,255,0.8);
        border-color: rgba(212,132,58,0.2);
    }
    .ob-role-card.selected {
        background: #fff;
        border-color: var(--action, #D4843A);
        box-shadow: 0 8px 24px rgba(42,35,24,0.08);
    }
    .ob-role-emoji {
        grid-area: emoji;
        font-size: 32px;
    }
    .ob-role-name {
        grid-area: name;
        font-size: 16px;
        font-weight: 800;
        color: var(--ink, #2A2318);
    }
    .ob-role-desc {
        grid-area: desc;
        font-size: 13px;
        color: var(--ink-ghost, #7A6E5F);
        line-height: 1.4;
    }

    /* Tour Content */
    .ob-tour-content {
        background: rgba(255,255,255,0.5);
        padding: 24px;
        border-radius: 16px;
        border: 1px solid var(--border, rgba(42,35,24,0.06));
        font-size: 15px;
        line-height: 1.7;
        color: var(--ink, #2A2318);
        margin-bottom: 36px;
        min-height: 140px;
    }

    /* Error Banner */
    .ob-error-banner {
        background: #FEF2F2;
        border: 1px solid #FCA5A5;
        padding: 12px 16px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 24px;
        animation: obShake 0.4s ease-in-out;
    }
    @keyframes obShake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-4px); }
        75% { transform: translateX(4px); }
    }
    .ob-error-icon { font-size: 16px; }
    .ob-error-text {
        font-size: 13px;
        font-weight: 600;
        color: #991B1B;
    }
    .ob-input-hint {
        font-size: 13px;
        color: var(--ink-secondary, #6B6480);
        margin-top: 8px;
        margin-bottom: 0;
        min-height: 20px;
    }
`;
