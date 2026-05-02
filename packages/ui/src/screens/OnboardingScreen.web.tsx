/**
 * ONBOARDING SCREEN - Web Edition
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '@repo/core/auth';
import { identityAPI } from '@repo/core/identity';
import type { AuthorityTier } from '@repo/core/logic';
import { supabase } from '@repo/core/supabase';
import React, { useCallback, useEffect, useMemo, useReducer, memo } from 'react';
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

const ROLES = [
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

interface OnboardingState {
  currentStep: number;
  name: string;
  authority: AuthorityTier;
  isCompleting: boolean;
  completionError: string | null;
}

type OnboardingAction =
  | { type: 'SET_STEP'; step: number }
  | { type: 'SET_NAME'; name: string }
  | { type: 'SET_AUTHORITY'; authority: AuthorityTier }
  | { type: 'SET_COMPLETING'; isCompleting: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'RESTORE_PROGRESS'; progress: Partial<OnboardingState> };

function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.step };
    case 'SET_NAME':
      return { ...state, name: action.name };
    case 'SET_AUTHORITY':
      return { ...state, authority: action.authority };
    case 'SET_COMPLETING':
      return { ...state, isCompleting: action.isCompleting };
    case 'SET_ERROR':
      return { ...state, completionError: action.error };
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

const LanguagePillRow = memo(({ 
  currentLang, 
  onLanguageChange 
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
));

const ErrorBanner = memo(({ error }: { error: string | null }) => {
  if (!error) return null;
  return (
    <div className="ob-error-banner">
      <span className="ob-error-icon">⚠️ </span>
      <span className="ob-error-text">{error}</span>
    </div>
  );
});

const NameStep = memo(({
  t,
  name,
  onNameChange,
  onNext,
  error
}: {
  t: any;
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
      autoComplete="given-name"
    />
    <div className="ob-actions">
      <button className="ob-btn-primary" onClick={onNext} disabled={!name.trim()}>
        {t('onboarding.continue')} →
      </button>
    </div>
  </div>
));

const RoleStep = memo(({
  t,
  authority,
  isCompleting,
  isAnonymous,
  onAuthoritySelect,
  onBack,
  onNext,
  error
}: {
  t: any;
  authority: AuthorityTier;
  isCompleting: boolean;
  isAnonymous: boolean;
  onAuthoritySelect: (val: AuthorityTier) => void;
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
    <div className="ob-role-grid">
      {ROLES.map((r) => (
        <button
          key={r.value}
          className={`ob-role-card ${authority === r.value ? 'selected' : ''}`}
          onClick={() => onAuthoritySelect(r.value as AuthorityTier)}
        >
          <span className="ob-role-emoji">{r.emoji}</span>
          <span className="ob-role-name">{t(`authority.${r.value}`)}</span>
          <span className="ob-role-desc">{t(r.descKey)}</span>
        </button>
      ))}
    </div>
    <div className="ob-actions">
      <button className="ob-btn-secondary" onClick={onBack}>
        ← {t('onboarding.back')}
      </button>
      <button
        className="ob-btn-primary"
        onClick={onNext}
        disabled={isCompleting}
      >
        {isCompleting
          ? t('onboarding.saving')
          : !isAnonymous && authority
            ? t('onboarding.complete')
            : t('onboarding.continue')}{' '}
        →
      </button>
    </div>
  </div>
));

const TourStep = memo(({
  t,
  currentStep,
  screen,
  isCompleting,
  onBack,
  onNext,
  onSkip,
  error
}: {
  t: any;
  currentStep: number;
  screen: any;
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
));

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

// ──────────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────────

interface OnboardingScreenProps {
  onComplete: (name: string, authority: AuthorityTier, wantsAccount?: boolean) => void;
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
    authority: 'teacher',
    isCompleting: false,
    completionError: null,
  });

  const { currentStep, name, authority, isCompleting, completionError } = state;
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
            if (progress.userId === internalId || !progress.userId || isAnonymous) {
              dispatch({
                type: 'RESTORE_PROGRESS',
                progress: {
                  name: progress.name || '',
                  authority: (progress.role as AuthorityTier) || 'teacher',
                  currentStep:
                    typeof progress.step === 'number' && progress.step >= 0 && progress.step < 7
                      ? progress.step
                      : 0,
                },
              });
              return;
            }
          }
        } catch (e) {
          console.warn('[Onboarding] Failed to restore progress from storage:', e);
        }

        if (!internalId) {
          console.log('🗝️ OnboardingScreen.web: No internalId found, initiating anonymous session...');
          await authAPI.signInAnonymously();
          return initOnboarding();
        }
        const { data: profile } = await supabase
          .from('users')
          .select('full_name, is_anonymous, authority:role')
          .eq('id', internalId)
          .maybeSingle();

        if (!profile) return;

        const PLACEHOLDER_NAMES = ['Guest User', 'Gurudevi User', 'Sanctuary User'];
        if (
          !profile.is_anonymous &&
          profile.full_name &&
          !PLACEHOLDER_NAMES.includes(profile.full_name)
        ) {
          dispatch({ type: 'SET_NAME', name: profile.full_name });
          if (profile.authority) {
            dispatch({ type: 'SET_AUTHORITY', authority: profile.authority as AuthorityTier });
          }
          dispatch({ type: 'SET_STEP', step: 1 });
        }
      } catch (error) {
        console.error('[Onboarding] Initialization error:', error);
      }
    };
    initOnboarding();
  }, [isAnonymous]);

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

  const handleCompleteOnboarding = useCallback(async () => {
    dispatch({ type: 'SET_COMPLETING', isCompleting: true });
    try {
      const internalId = await identityAPI.getMyInternalId();
      if (!internalId) throw new Error('Failed to resolve internal user ID');

      const { data: existingProfile } = await supabase
        .from('users')
        .select('school_id, onboarding_completed')
        .eq('id', internalId)
        .maybeSingle();

      let schoolId = existingProfile?.school_id;
      if (!schoolId) {
        const schoolName = `${name || 'My'}'s Workspace`;
        const { data: schoolData, error: schoolError } = await supabase
          .from('schools')
          .insert({
            name: schoolName,
            type: 'personal_workspace',
            created_by: internalId,
          })
          .select()
          .single();

        if (schoolError) {
          console.warn('⚠️ [Onboarding] Workspace creation failed:', schoolError.message);
        } else {
          schoolId = schoolData?.id;
        }
      }

      const { error: profileError } = await supabase.from('users').upsert({
        id: internalId,
        full_name: name || 'Gurudevi User',
        role: authority,
        school_id: schoolId,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        is_anonymous: isAnonymous,
      });

      if (profileError) throw profileError;

      await AsyncStorage.removeItem('onboarding_progress');
      hapticSuccess();
      onComplete(name, authority, false);
    } catch (error: any) {
      console.error('❌ Error completing onboarding:', error);
      hapticError();
      dispatch({ type: 'SET_COMPLETING', isCompleting: false });
      dispatch({
        type: 'SET_ERROR',
        error: error?.message || 'Failed to save your profile. Please try again.',
      });
    }
  }, [name, authority, isAnonymous, onComplete]);

  const handleNext = useCallback(() => {
    if (currentStep === 6) {
      handleCompleteOnboarding();
    } else {
      dispatch({ type: 'NEXT_STEP' });
      hapticLight();
    }
  }, [currentStep, handleCompleteOnboarding]);

  const handleBack = useCallback(() => {
    hapticLight();
    dispatch({ type: 'PREV_STEP' });
  }, []);

  const handleSkipTour = useCallback(() => {
    hapticLight();
    handleCompleteOnboarding();
  }, [handleCompleteOnboarding]);

  const handleNameChange = useCallback((val: string) => dispatch({ type: 'SET_NAME', name: val }), []);
  const handleAuthoritySelect = useCallback((val: AuthorityTier) => {
    dispatch({ type: 'SET_AUTHORITY', authority: val });
    hapticLight();
  }, []);
  const handleLanguageChange = useCallback((code: string) => {
    hapticLight();
    i18n.changeLanguage(code);
  }, [i18n]);

  // Save progress whenever step/name/role changes
  useEffect(() => {
    if (currentStep === 0 && !name) return;
    identityAPI.getMyInternalId().then((userId) => {
      AsyncStorage.setItem(
        'onboarding_progress',
        JSON.stringify({
          userId,
          step: currentStep,
          name,
          authority,
        }),
      ).catch(() => {});
    });
  }, [currentStep, name, authority]);

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
          error={completionError} 
        />
      );
    }
    if (currentStep === 1) {
      return (
        <RoleStep 
          t={t} 
          authority={authority} 
          isCompleting={isCompleting} 
          isAnonymous={isAnonymous} 
          onAuthoritySelect={handleAuthoritySelect} 
          onBack={handleBack} 
          onNext={handleNext === handleNext ? (async () => {
            if (!isAnonymous && authority) {
              handleCompleteOnboarding();
            } else {
              handleNext();
            }
          }) : handleNext} 
          error={completionError} 
        />
      );
    }
    if (currentStep >= 2 && currentStep <= 6 && currentTourScreen) {
      return (
        <TourStep 
          t={t} 
          currentStep={currentStep} 
          screen={currentTourScreen} 
          isCompleting={isCompleting} 
          onBack={handleBack} 
          onNext={handleNext} 
          onSkip={handleSkipTour} 
          error={completionError} 
        />
      );
    }
    return null;
  }, [currentStep, t, name, handleNameChange, handleNext, completionError, authority, isCompleting, isAnonymous, handleAuthoritySelect, handleBack, handleCompleteOnboarding, currentTourScreen, handleSkipTour]);

  return (
    <div className="ob-root">
      <div className="ob-atmosphere ob-atmosphere-one" />
      <div className="ob-atmosphere ob-atmosphere-two" />
      
      {isNarrow ? (
        <div className="ob-narrow">
          <div className="ob-narrow-header">
            <span className="ob-brand-name">🪷 Gurudevi</span>
            <LanguagePillRow 
              currentLang={i18n.language} 
              onLanguageChange={handleLanguageChange} 
            />
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
                <h1 className="ob-left-headline">Your Sacred<br />Sanctuary</h1>
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
`;
