/**
 * ONBOARDING SCREEN - Web Edition
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, identityAPI, onboardingAPI } from '@repo/core/api';
import { useStore } from '@repo/core/store';
import type { Capacity } from '@repo/core/types';
import { memo, useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useWindowDimensions } from 'react-native';
import { GatewayFooter } from '../components/GatewayFooter.web';
import { GatewayHeader } from '../components/GatewayHeader.web';
import { hapticError, hapticLight, hapticSuccess } from '../utils/haptics';
import { isAnonymousIdentity } from '@repo/core/logic';
import { getDevOnboardingTemplateLabel, resolveOnboardingDevIntent } from './onboardingDevFlow';

// ──────────────────────────────────────────────────────────
// CONSTANTS
// ──────────────────────────────────────────────────────────

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
  showDevSandbox: boolean;
  pricingTier: string;
  citizenship: string;
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
  | { type: 'RESTORE_PROGRESS'; progress: Partial<OnboardingUIState> }
  | { type: 'SHOW_DEV_SANDBOX'; visible: boolean }
  | { type: 'SET_PRICING'; pricing: string }
  | { type: 'SET_CITIZENSHIP'; citizenship: string };

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
    case 'SHOW_DEV_SANDBOX':
      return { ...state, showDevSandbox: action.visible };
    case 'SET_PRICING':
      return { ...state, pricingTier: action.pricing };
    case 'SET_CITIZENSHIP':
      return { ...state, citizenship: action.citizenship };
    default:
      return state;
  }
}

// ──────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ──────────────────────────────────────────────────────────

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
  }: {
    t: (key: string) => string;
    name: string;
    onNameChange: (val: string) => void;
    onNext: () => void;
  }) => {
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onNameChange(e.target.value);
      },
      [onNameChange],
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && name.trim()) onNext();
      },
      [name, onNext],
    );

    return (
      <div className="ob-step">
        <div className="ob-step-shell">
          <div className="ob-step-meta">Step 1 · Arrival</div>
          <div className="ob-step-icon">👋🏻</div>
        </div>
        <h2 className="ob-step-title">{t('onboarding.nameTitle')}</h2>
        <p className="ob-step-subtitle">{t('onboarding.nameSubtitle')}</p>
        <input
          className="ob-input"
          type="text"
          placeholder={t('onboarding.namePlaceholder')}
          value={name}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          autoComplete="name"
        />
        <p className="ob-input-hint">
          {name.trim().length > 0 && name.trim().length < 2
            ? 'Your name is a bit short. Try adding another character.'
            : name === 'Guest User'
              ? "Please choose a name other than 'Guest User'."
              : 'Use the display name you want people to see inside the app.'}
        </p>
        <div className="ob-actions">
          <button
            type="button"
            className="ob-btn-primary"
            onClick={onNext}
            disabled={name.trim().length < 2 || name === 'Guest User'}
          >
            {t('onboarding.continue')} →
          </button>
        </div>
      </div>
    );
  },
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
  }: {
    t: (key: string) => string;
    capacity: Capacity;
    isCompleting: boolean;
    isAnonymous: boolean;
    onCapacitySelect: (val: Capacity) => void;
    onBack: () => void;
    onNext: () => void;
  }) => {
    const handleCapacityClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        const selectedCap = e.currentTarget.getAttribute('data-capacity');
        if (selectedCap) {
          onCapacitySelect(selectedCap as Capacity);
        }
      },
      [onCapacitySelect],
    );

    return (
      <div className="ob-step">
        <div className="ob-step-shell">
          <div className="ob-step-meta">Step 2 · Belonging</div>
          <div className="ob-step-icon">🎯</div>
        </div>
        <h2 className="ob-step-title">{t('onboarding.roleTitle')}</h2>
        <p className="ob-step-subtitle">{t('onboarding.roleSubtitle')}</p>
        {isAnonymous && <div className="ob-anonymous-tag">(Anonymous Session)</div>}
        <div className="ob-role-grid">
          {CAPACITY_OPTIONS.map((r) => (
            <button
              type="button"
              key={r.value}
              data-capacity={r.value}
              className={`ob-role-card ${capacity === r.value ? 'selected' : ''}`}
              onClick={handleCapacityClick}
            >
              <span className="ob-role-emoji">{r.emoji}</span>
              <span className="ob-role-name">{t(`identity.${r.value}`)}</span>
              <span className="ob-role-desc">{t(r.descKey)}</span>
            </button>
          ))}
        </div>
        <div className="ob-actions">
          <button type="button" className="ob-btn-secondary" onClick={onBack}>
            ← {t('onboarding.back')}
          </button>
          <button type="button" className="ob-btn-primary" onClick={onNext} disabled={isCompleting}>
            {isCompleting ? t('onboarding.saving') : t('onboarding.continue')} →
          </button>
        </div>
      </div>
    );
  },
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
  }: {
    t: (key: string) => string;
    currentStep: number;
    screen: { emoji: string; title: string; subtitle: string; content: string };
    isCompleting: boolean;
    onBack: () => void;
    onNext: () => void;
    onSkip: () => void;
  }) => (
    <div className="ob-step">
      <div className="ob-step-shell">
        <div className="ob-step-meta">Sanctuary Tour</div>
        <div className="ob-step-icon">{screen.emoji}</div>
      </div>
      <h2 className="ob-step-title">{screen.title}</h2>
      <p className="ob-step-subtitle">{screen.subtitle}</p>
      <div className="ob-tour-content">{screen.content}</div>
      <div className="ob-actions">
        <button type="button" className="ob-btn-secondary" onClick={onBack}>
          ← {t('onboarding.back')}
        </button>
        <button type="button" className="ob-btn-primary" onClick={onNext} disabled={isCompleting}>
          {isCompleting
            ? t('onboarding.saving')
            : currentStep === 6
              ? t('onboarding.complete')
              : t('onboarding.next')}{' '}
          →
        </button>
      </div>
      <button type="button" className="ob-btn-link" onClick={onSkip} disabled={isCompleting}>
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
      <div className="ob-step ob-dev-sandbox">
        <div className="ob-step-shell">
          <div className="ob-step-meta">DEVELOPER TOOLKIT</div>
          <div className="ob-step-icon">⚙️</div>
        </div>
        <h2 className="ob-step-title">Sandbox Console</h2>
        <p className="ob-step-subtitle">
          Simulate identity roles, pricing tiers, and citizenship levels directly into local/staging
          environments.
        </p>

        <div className="ob-form-group">
          <label htmlFor="dev-display-name" className="ob-label">
            Display Name
          </label>
          <input
            id="dev-display-name"
            type="text"
            className="ob-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. John Doe"
          />
        </div>

        <div className="ob-form-group">
          <span className="ob-label">Capacity / Role</span>
          <div className="ob-pill-grid">
            {(['teacher', 'student', 'principal', 'admin'] as Capacity[]).map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setRole(r)}
                className={`ob-pill-btn ${role === r ? 'active' : ''}`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="ob-form-group">
          <span className="ob-label">Pricing Tier</span>
          <div className="ob-pill-grid">
            {['FREE', 'PRO', 'INSTITUTIONAL'].map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => setPricing(p)}
                className={`ob-pill-btn ${pricing === p ? 'active' : ''}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="ob-form-group">
          <span className="ob-label">Citizenship</span>
          <div className="ob-pill-grid">
            {['WANDERER', 'SECOND_CLASS', 'FIRST_CLASS'].map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setCitizenship(c)}
                className={`ob-pill-btn ${citizenship === c ? 'active' : ''}`}
              >
                {c.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="ob-form-group">
          <label htmlFor="dev-school-id" className="ob-label">
            School ID (Optional)
          </label>
          <input
            id="dev-school-id"
            type="text"
            className="ob-input"
            value={schoolId}
            onChange={(e) => setSchoolId(e.target.value)}
            placeholder="e.g. school-uuid"
          />
        </div>

        <div className="ob-actions">
          <button type="button" className="ob-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ob-btn-primary"
            onClick={() => onSave(name, role, pricing, citizenship, schoolId || null)}
          >
            Fast-Track Profile
          </button>
        </div>
      </div>
    );
  },
);
DevSandboxConsoleInner.displayName = 'DevSandboxConsole';

const DevSandboxConsole =
  (typeof __DEV__ !== 'undefined' && __DEV__) ||
  process.env.EXPO_PUBLIC_ENABLE_DEV_SANDBOX === 'true'
    ? DevSandboxConsoleInner
    : () => null;

// ──────────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────────

interface OnboardingScreenProps {
  onComplete: (name: string, capacity: Capacity, isAnonymous?: boolean) => void;
  isAnonymous?: boolean;
  userId?: string | null;
}

export default memo(function OnboardingScreenWeb({
  onComplete,
  isAnonymous = false,
  userId = null,
}: OnboardingScreenProps) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();

  const [state, dispatch] = useReducer(onboardingReducer, {
    currentStep: 0,
    name: '',
    selectedCapacity: 'teacher' as Capacity,
    schoolId: null,
    isProcessing: false,
    error: null,
    showDevSandbox: false,
    pricingTier: 'FREE',
    citizenship: 'WANDERER',
  });

  const { currentStep, name, selectedCapacity, isProcessing, error, showDevSandbox } = state;
  const isOnline = useStore((s) => s.isOnline);
  const showToast = useStore((s) => s.showToast);
  const isNarrow = width < 900;
  const resolvedInternalIdRef = useRef<string | null>(null);
  const resolvedCitizenRef = useRef<Awaited<
    ReturnType<typeof identityAPI.identifyActiveCitizen>
  > | null>(null);

  // ── Restore saved progress or pre-fill from existing auth ────────────────────
  useEffect(() => {
    const initOnboarding = async () => {
      if (!userId) {
        console.log('⏳ OnboardingScreen.web: Waiting for userId prop to resolve...');
        return;
      }
      const internalId = userId;
      resolvedInternalIdRef.current = internalId;

      try {
        const citizen = await identityAPI.identifyActiveCitizen().catch(() => null);
        resolvedCitizenRef.current = citizen;
      } catch (err) {
        console.warn('[Onboarding] Failed to pre-identify active citizen:', err);
      }

      try {
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
      } catch (error) {
        console.error('[Onboarding] Initialization error:', error);
        showToast(
          `Initialization Error: ${(error as Error)?.message || 'Something went wrong'}. Please check your connection or refresh the page.`,
          'error',
        );
      }
    };
    void initOnboarding();
  }, [isAnonymous, onComplete, showToast]);

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
    if (state.isProcessing) return;
    dispatch({ type: 'SET_PROCESSING', isProcessing: true });
    showToast('Finalizing your sanctuary journey...', 'info', 2000);
    let completed = false;
    try {
      const citizen = resolvedCitizenRef.current ?? (await identityAPI.identifyActiveCitizen());
      resolvedCitizenRef.current = citizen;
      const internalId = citizen?.id;
      if (internalId) {
        await onboardingAPI.completeOnboarding(internalId);
      }
      await AsyncStorage.removeItem('onboarding_progress');
      hapticSuccess();
      showToast('Sanctuary entry granted! Welcome home.', 'success', 3000);
      completed = true;
      onComplete(name, selectedCapacity, isAnonymous);
    } catch (err: unknown) {
      console.error('❌ Error completing onboarding:', err);
      hapticError();
      // Detect lock-steal / abort errors from Supabase Web Locks and show a friendly retry message
      const isAbortLike =
        err instanceof Error &&
        (err.name === 'AbortError' ||
          err.message?.includes('AbortError') ||
          err.message?.includes('Lock broken') ||
          err.message?.includes('lock'));
      const baseMsg = isAbortLike
        ? 'A temporary conflict occurred. Please tap Complete again.'
        : err instanceof Error
          ? err.message
          : 'Failed to finalize onboarding.';
      const guidedMsg = isAbortLike
        ? baseMsg
        : `${baseMsg} Please check your connection and try again.`;
      dispatch({ type: 'SET_ERROR', error: guidedMsg });
      showToast(guidedMsg, 'error', 5000);
    } finally {
      // Always clear the processing state unless we successfully navigated away
      if (!completed) {
        dispatch({ type: 'SET_PROCESSING', isProcessing: false });
      }
    }
  }, [name, selectedCapacity, onComplete, showToast, isAnonymous, state.isProcessing]);

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
        const citizen = resolvedCitizenRef.current ?? (await identityAPI.identifyActiveCitizen());
        resolvedCitizenRef.current = citizen;
        const internalId = citizen?.id;
        if (!internalId) throw new Error('Identity not resolved. Please try again.');

        await onboardingAPI.createInitialBond(devRole, {
          userId: internalId,
          displayName: devName,
          fullName: devName,
          schoolId: devSchoolId || null,
        });

        await identityAPI.modifyUserProfile(internalId, {
          display_name: devName,
          pricing_tier: devPricing,
          citizenship: devCitizenship,
          school_id: devSchoolId || null,
          profile_completed: true,
        });

        await onboardingAPI.completeOnboarding(internalId);
        await AsyncStorage.removeItem('onboarding_progress');

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
    [onComplete, showToast, isAnonymous],
  );

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
      const citizen = resolvedCitizenRef.current ?? (await identityAPI.identifyActiveCitizen());
      resolvedCitizenRef.current = citizen;
      const internalId = citizen?.id;
      if (!internalId) throw new Error('Identity not resolved. Please try again.');

      if (currentStep === 0) {
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

          await identityAPI.modifyUserProfile(internalId, {
            display_name: template.name,
            pricing_tier: template.pricing,
            citizenship: template.citizenship,
            school_id: template.schoolId,
            profile_completed: true,
          });

          await onboardingAPI.completeOnboarding(internalId);
          await AsyncStorage.removeItem('onboarding_progress');

          hapticSuccess();
          showToast(getDevOnboardingTemplateLabel(template), 'success', 3000);
          onComplete(template.name, template.role, isAnonymous);
          return;
        }

        if (isAnonymousIdentity(citizen)) {
          showToast('Name saved locally. Choose your capacity next.', 'info', 1000);
        } else {
          showToast('Syncing your identity...', 'info', 1000);
          try {
            await identityAPI.modifyUserProfile(internalId, { display_name: name });
          } catch {
            console.warn('[Onboarding] Failed to sync name to server, will retry later.');
          }
        }
      } else if (currentStep === 1) {
        showToast(`Establishing your bond as ${selectedCapacity}...`, 'info', 1500);
        await onboardingAPI.createInitialBond(selectedCapacity, {
          userId: internalId,
          displayName: name || 'Gurudevi User',
          schoolId: state.schoolId,
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
    showToast,
    state.schoolId,
    onComplete,
    isAnonymous,
  ]);

  const handleNextPress = useCallback(() => {
    void handleNext();
  }, [handleNext]);

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

  // Save progress whenever step/name/role changes
  useEffect(() => {
    if (currentStep === 0 && !name) return;
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
    ).catch(() => {});
  }, [currentStep, name, selectedCapacity, state.schoolId]);

  const currentTourScreen = useMemo(() => {
    if (currentStep < 2 || currentStep > 6) return null;
    return tourScreens[currentStep - 2];
  }, [currentStep, tourScreens]);

  const renderCurrentStep = useCallback(() => {
    if (showDevSandbox) {
      return (
        <DevSandboxConsole
          onClose={() => dispatch({ type: 'SHOW_DEV_SANDBOX', visible: false })}
          onSave={(devName, devRole, devPricing, devCitizenship, devSchoolId) => {
            void handleDevFastTrack(devName, devRole, devPricing, devCitizenship, devSchoolId);
          }}
        />
      );
    }
    if (currentStep === 0) {
      return (
        <NameStep t={t} name={name} onNameChange={handleNameChange} onNext={handleNextPress} />
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
          onNext={handleNextPress}
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
          onNext={handleNextPress}
          onSkip={handleSkipTour}
        />
      );
    }
    return null;
  }, [
    showDevSandbox,
    handleDevFastTrack,
    currentStep,
    t,
    name,
    handleNameChange,
    handleNextPress,
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
      <GatewayHeader />
      <div className="ob-atmosphere ob-atmosphere-one" />
      <div className="ob-atmosphere ob-atmosphere-two" />

      {isNarrow ? (
        <div className="ob-narrow">
          <div className="ob-progress-track" role="progressbar">
            <div
              className="ob-progress-fill"
              style={{ width: `${(currentStep / (TOTAL_STEPS - 1)) * 100}%` }}
            />
          </div>
          <div className="ob-narrow-content">
            <ErrorBanner error={error} />
            {renderCurrentStep()}
          </div>
        </div>
      ) : (
        <div className="ob-split">
          <div className="ob-left">
            <div className="ob-left-inner">
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
            </div>
          </div>
          <div className="ob-right">
            <div className="ob-right-inner">
              <div className="ob-dots" role="progressbar">
                {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: stable progress dots
                    key={i}
                    className={`ob-dot ${i === currentStep ? 'active' : i < currentStep ? 'done' : ''}`}
                  />
                ))}
              </div>
              <ErrorBanner error={error} />
              {renderCurrentStep()}
            </div>
          </div>
        </div>
      )}

      <GatewayFooter />

      <style>{ONBOARDING_STYLES}</style>
    </div>
  );
});

// ──────────────────────────────────────────────────────────
// STYLES
// ──────────────────────────────────────────────────────────

const ONBOARDING_STYLES = `
    .ob-root {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: 100vh;
        overflow-y: auto;
        background:
            radial-gradient(circle at 18% 14%, rgba(125, 212, 192, 0.14), transparent 24%),
            radial-gradient(circle at 88% 22%, rgba(184, 169, 224, 0.14), transparent 22%),
            linear-gradient(160deg, var(--background, #F5EDD6) 0%, var(--background-alt, #FAF7ED) 60%, rgba(252, 249, 242, 0.96) 100%);
        font-family: var(--font-body, 'DM Sans', sans-serif);
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
        flex: 1;
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
        flex: 1;
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

    /* Dev Sandbox Console CSS */
    .ob-dev-sandbox {
        max-width: 480px;
        width: 100%;
        margin: 0 auto;
    }
    .ob-form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 16px;
        text-align: left;
    }
    .ob-label {
        font-size: 11px;
        font-weight: 800;
        color: var(--ink, #2A2318);
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    .ob-pill-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }
    .ob-pill-btn {
        background: rgba(255, 255, 255, 0.4);
        border: 1px solid var(--border, rgba(42,35,24,0.1));
        padding: 6px 14px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        color: var(--ink-secondary, #7A6E5F);
        transition: all 0.2s ease;
    }
    .ob-pill-btn:hover {
        background: rgba(255, 255, 255, 0.8);
    }
    .ob-pill-btn.active {
        background: rgba(212, 132, 58, 0.1);
        border-color: var(--action, #D4843A);
        color: var(--action, #D4843A);
    }
`;
