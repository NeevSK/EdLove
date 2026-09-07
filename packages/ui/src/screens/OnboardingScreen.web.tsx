/**
 * ONBOARDING SCREEN - Web Edition
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { identityAPI, onboardingAPI } from '@repo/core/api/client';
import { resolveStoredInvite } from '@repo/core/lib/inviteCodes';
import { storage } from '@repo/core/lib/storage';
import { isAnonymousIdentity } from '@repo/core/logic';
import { useStore } from '@repo/core/store';
import type { Capacity } from '@repo/core/types';
import { GatewayFooter } from '@repo/ui/components/GatewayFooter.web';
import { GatewayHeader } from '@repo/ui/components/GatewayHeader.web';
import { useGatewayLayout } from '@repo/ui/hooks/useGatewayLayout';
import { useTheme } from '@repo/ui/hooks/useTheme';
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
  initialOnboardingJourneyState,
  onboardingJourneyReducer,
} from '@repo/ui/screens/onboardingJourney';
import { hapticError, hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';
import { memo, useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const PILLARS = [
  { name: 'Self', glyph: 'self' },
  { name: 'Classroom', glyph: 'school' },
  { name: 'Community', glyph: 'community' },
  { name: 'Library', glyph: 'book' },
  { name: 'Profile', glyph: 'profile' },
];

const CAPACITY_OPTIONS = [
  { value: 'teacher', glyph: 'teacher', descKey: 'onboarding.roleDesc.teacher' },
  { value: 'student', glyph: 'student', descKey: 'onboarding.roleDesc.student' },
  { value: 'principal', glyph: 'school', descKey: 'onboarding.roleDesc.principal' },
];

function WebGlyph({ glyph, size = 32 }: { glyph: string; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {glyph === 'school' || glyph === 'teacher' || glyph === 'student' ? (
        <>
          <path d="m3 9 9-5 9 5-9 5-9-5Z" />
          <path d="M7 11v5c2.8 2 7.2 2 10 0v-5" />
          <path d="M21 10v6" />
        </>
      ) : glyph === 'book' ? (
        <>
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        </>
      ) : glyph === 'community' ? (
        <>
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
          <path d="M14 16a5 5 0 0 1 6.5 4" />
        </>
      ) : glyph === 'profile' ? (
        <>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </>
      ) : glyph === 'lock' ? (
        <>
          <rect x="5" y="10" width="14" height="10" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </>
      ) : glyph === 'sprout' ? (
        <>
          <path d="M12 21V10" />
          <path d="M12 13c-4 0-6-2.5-6-6 3.5 0 6 2 6 6Z" />
          <path d="M12 16c4 0 6-2.5 6-6-3.5 0-6 2-6 6Z" />
        </>
      ) : glyph === 'compass' ? (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
        </>
      ) : glyph === 'flower' ? (
        <>
          <circle cx="12" cy="12" r="2" />
          <path d="M12 10c-3-1-4-3-2-5 2-1 3 1 2 5Z" />
          <path d="M14 12c1-3 3-4 5-2 1 2-1 3-5 2Z" />
          <path d="M12 14c3 1 4 3 2 5-2 1-3-1-2-5Z" />
          <path d="M10 12c-1 3-3 4-5 2-1-2 1-3 5-2Z" />
        </>
      ) : (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l3 2" />
        </>
      )}
    </svg>
  );
}

const TOTAL_STEPS = 7; // 0: Name, 1: Role, 2-6: Tour
const TRACKED_STEPS = [
  { idx: 0, label: 'Name' },
  { idx: 1, label: 'Role' },
  { idx: 2, label: 'Tour' },
] as const;

const ErrorBanner = memo(({ error }: { error: string | null }) => {
  if (!error) return null;
  return (
    <div className="ob-error-banner">
      <span className="ob-error-icon" aria-hidden="true">
        !
      </span>
      <span className="ob-error-text">{error}</span>
    </div>
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
  }: {
    t: (key: string) => string;
    name: string;
    suggestedName?: string;
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

    const isSuggested = suggestedName && name.trim() === suggestedName.trim();

    return (
      <div className="ob-step">
        <div className="ob-step-shell">
          <div className="ob-step-meta">Step 1 · Arrival</div>
          <div className="ob-step-icon">
            <WebGlyph glyph="self" size={48} />
          </div>
        </div>
        <h2 className="ob-step-title">{t('onboarding.nameTitle')}</h2>
        <p className="ob-step-subtitle">
          {t('onboarding.nameSubtitle') || 'Enter your preferred name or friendly nickname for the sanctuary.'}
        </p>
        <input
          className="ob-input"
          type="text"
          placeholder={t('onboarding.namePlaceholder') || 'e.g. Maya, Alex, Coach David'}
          value={name}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          autoComplete="name"
        />
        {isSuggested ? (
          <p className="ob-input-hint" style={{ color: 'var(--color-phase-accent, #6366f1)' }}>
            ✨ Suggested from your account — feel free to customize.
          </p>
        ) : (
          <p className="ob-input-hint">
            {name.trim().length > 0 && name.trim().length < 2
              ? 'Your name is a bit short. Try adding another character.'
              : name === 'Guest User'
                ? "Please choose a friendly name other than 'Guest User'."
                : 'This is the friendly name other members and teachers will see.'}
          </p>
        )}
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
          <div className="ob-step-icon">
            <WebGlyph glyph="goal" size={48} />
          </div>
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
              aria-pressed={capacity === r.value}
              aria-label={t(`identity.${r.value}`)}
            >
              <span className="ob-role-emoji">
                <WebGlyph glyph={r.glyph} size={34} />
              </span>
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
    screen: { glyph: string; title: string; subtitle: string; content: string };
    isCompleting: boolean;
    onBack: () => void;
    onNext: () => void;
    onSkip: () => void;
  }) => (
    <div className="ob-step">
      <div className="ob-step-shell">
        <div className="ob-step-meta">Sanctuary Tour</div>
        <div className="ob-step-icon">
          <WebGlyph glyph={screen.glyph} size={64} />
        </div>
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
          <div className="ob-step-icon">
            <WebGlyph glyph="settings" size={48} />
          </div>
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
                aria-pressed={role === r}
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
                aria-pressed={pricing === p}
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
                aria-pressed={citizenship === c}
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

interface OnboardingScreenProps {
  onComplete: (name: string, capacity: Capacity, isAnonymous?: boolean) => void;
  isAnonymous?: boolean;
  userId?: string | null;
  suggestedName?: string;
}

export default memo(function OnboardingScreenWeb({
  onComplete,
  isAnonymous = false,
  userId = null,
  suggestedName,
}: OnboardingScreenProps) {
  const { t } = useTranslation();
  const { isSplit } = useGatewayLayout();
  const { isDark } = useTheme();
  const isNarrow = !isSplit;

  const [state, dispatch] = useReducer(onboardingJourneyReducer, initialOnboardingJourneyState);

  const { currentStep, name, selectedCapacity, isProcessing, error, showDevSandbox } = state;
  const isOnline = useStore((s) => s.isOnline);
  const showToast = useStore((s) => s.showToast);
  const resolvedInternalIdRef = useRef<string | null>(null);
  const resolvedCitizenRef = useRef<Awaited<
    ReturnType<typeof identityAPI.identifyActiveCitizen>
  > | null>(null);

  // ── Restore saved progress or pre-fill from existing auth & invites ──────────
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

      // Check for pending invite code (e.g. from QR scan or invite link)
      try {
        const pendingInvite = await storage.getStringAsync('pending_invite');
        if (pendingInvite) {
          const res = await resolveStoredInvite(pendingInvite);
          if (res.valid && res.data) {
            console.log('🎟️ [Onboarding.web] Resolved stored invite:', res.data.code, res.data.school_name);
            dispatch({ type: 'SET_SCHOOL_ID', schoolId: res.data.school_id });
            dispatch({ type: 'SET_CAPACITY', capacity: res.data.capacity });
            dispatch({ type: 'SET_PRICING', pricing: 'INSTITUTIONAL' });
            dispatch({ type: 'SET_CITIZENSHIP', citizenship: 'INSTITUTIONAL' });
          }
        }
      } catch (err) {
        console.warn('[Onboarding] Failed to resolve stored invite:', err);
      }

      try {
        try {
          const saved = await AsyncStorage.getItem(getOnboardingProgressKey(internalId));
          if (saved) {
            const progress = parseOnboardingDraft(saved, internalId);
            if (progress) {
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
        } catch (e) {
          console.warn('[Onboarding] Failed to restore progress from storage:', e);
        }

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
            await AsyncStorage.removeItem(getOnboardingProgressKey(internalId));
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
      } catch (error) {
        console.error('[Onboarding] Initialization error:', error);
      }
    };
    void initOnboarding();
  }, [isAnonymous, onComplete, showToast, userId]);

  // ── Tour content ────────────────────
  const tourScreens = useMemo(
    () => [
      {
        glyph: 'flower',
        title: t('onboarding.philosophyTitle'),
        subtitle: t('onboarding.philosophySubtitle'),
        content: t('onboarding.philosophyContent'),
      },
      {
        glyph: 'school',
        title: t('onboarding.sectionsTitle'),
        subtitle: t('onboarding.sectionsSubtitle'),
        content: t('onboarding.sectionsContent'),
      },
      {
        glyph: 'sprout',
        title: t('onboarding.ecologyTitle'),
        subtitle: t('onboarding.ecologySubtitle'),
        content: t('onboarding.ecologyContent'),
      },
      {
        glyph: 'lock',
        title: t('onboarding.privacyTitle'),
        subtitle: t('onboarding.privacySubtitle'),
        content: t('onboarding.privacyContent'),
      },
      {
        glyph: 'compass',
        title: t('onboarding.navigationTitle'),
        subtitle: t('onboarding.navigationSubtitle'),
        content: t('onboarding.navigationContent'),
      },
    ],
    [t],
  );

  const handleCompleteOnboarding = useCallback(async () => {
    if (state.isProcessing) return;
    dispatch({ type: 'BEGIN_COMPLETION' });
    showToast('Finalizing your sanctuary journey...', 'info', 2000);
    let completed = false;
    try {
      const citizen = resolvedCitizenRef.current ?? (await identityAPI.identifyActiveCitizen());
      resolvedCitizenRef.current = citizen;
      const internalId = citizen?.id;
      if (internalId) {
        await onboardingAPI.completeOnboarding(internalId);
        resolvedInternalIdRef.current = internalId;
      }
      if (internalId) {
        await AsyncStorage.removeItem(getOnboardingProgressKey(internalId));
      }
      dispatch({ type: 'COMPLETE' });
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
      dispatch({ type: 'FAIL_COMPLETION', error: guidedMsg });
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
        await AsyncStorage.removeItem(getOnboardingProgressKey(internalId));

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
          await AsyncStorage.removeItem(getOnboardingProgressKey(internalId));

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
      getOnboardingProgressKey(userId),
      serializeOnboardingDraft({ userId, state }),
    ).catch((storageError: unknown) => {
      console.warn('[Onboarding] Failed to persist progress locally:', storageError);
    });
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
        <NameStep
          t={t}
          name={name}
          suggestedName={suggestedName}
          onNameChange={handleNameChange}
          onNext={handleNextPress}
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
    <div className={`ob-root ${isDark ? 'ob-dark' : 'ob-light'}`}>
      <GatewayHeader />
      <div className="ob-atmosphere ob-atmosphere-one" />
      <div className="ob-atmosphere ob-atmosphere-two" />

      {isNarrow ? (
        <div className="ob-narrow">
          <div
            className="ob-progress-track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={TOTAL_STEPS - 1}
            aria-valuenow={currentStep}
            aria-label="Onboarding progress"
          >
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
                    <span>
                      <WebGlyph glyph={p.glyph} size={18} />
                    </span>
                    <span>{p.name}</span>
                  </div>
                ))}
              </div>
              <Tracker currentStep={currentStep} />
            </div>
          </div>
          <div className="ob-right">
            <div className="ob-right-inner">
              <div
                className="ob-dots"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={TOTAL_STEPS - 1}
                aria-valuenow={currentStep}
                aria-label="Onboarding progress"
              >
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

const ONBOARDING_STYLES = `
    .ob-root {
        container-type: inline-size;
        container-name: onboarding;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: 100vh;
        overflow-y: auto;
        font-family: var(--font-body, 'DM Sans', sans-serif);
        transition: background 0.4s ease, color 0.4s ease;
    }
    .ob-root.ob-light {
        background:
            radial-gradient(circle at 18% 14%, rgba(125, 212, 192, 0.16), transparent 28%),
            radial-gradient(circle at 88% 22%, rgba(var(--action-rgb), 0.12), transparent 26%),
            linear-gradient(160deg, var(--background, #F5EDD6) 0%, var(--background-alt, #FAF7ED) 60%, rgba(252, 249, 242, 0.96) 100%);
        color: #1F2D3D;
    }
    .ob-root.ob-dark {
        background:
            radial-gradient(circle at 18% 14%, rgba(56, 189, 248, 0.12), transparent 32%),
            radial-gradient(circle at 88% 22%, rgba(var(--action-rgb), 0.16), transparent 30%),
            linear-gradient(160deg, #0B0F19 0%, #151D2A 60%, #080C14 100%);
        color: #F8FAFC;
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
        background: radial-gradient(circle, rgba(var(--action-rgb), 0.18), transparent 70%);
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
        width: clamp(280px, 30vw, 360px);
        flex-shrink: 0;
        overflow-y: auto;
        padding: clamp(24px, 3.5vw, 44px) clamp(20px, 2.5vw, 36px);
        transition: background 0.4s ease, border-color 0.4s ease;
    }
    .ob-root.ob-light .ob-left {
        background: linear-gradient(160deg, rgba(255, 255, 255, 0.85) 0%, rgba(245, 237, 214, 0.65) 100%);
        border-right: 1px solid rgba(42, 35, 24, 0.1);
        backdrop-filter: blur(16px);
    }
    .ob-root.ob-dark .ob-left {
        background: linear-gradient(160deg, rgba(21, 29, 42, 0.8) 0%, rgba(11, 15, 25, 0.9) 100%);
        border-right: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
    }

    .ob-left-inner {
        display: flex;
        flex-direction: column;
        gap: clamp(20px, 2.5vw, 32px);
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
        letter-spacing: -0.3px;
    }
    .ob-root.ob-light .ob-brand-name { color: #1F2D3D; }
    .ob-root.ob-dark .ob-brand-name { color: #F8FAFC; }

    .ob-left-headline {
        font-size: clamp(28px, 3.2vw, 40px);
        font-weight: 800;
        line-height: 1.1;
        letter-spacing: -1.5px;
        margin: 0 0 12px;
        transition: color 0.3s ease;
    }
    .ob-root.ob-light .ob-left-headline { color: #1F2D3D; }
    .ob-root.ob-dark .ob-left-headline { color: #F8FAFC; text-shadow: 0 2px 10px rgba(0,0,0,0.3); }

    .ob-left-tagline {
        font-size: 14px;
        line-height: 1.6;
        margin: 0;
        max-width: 240px;
        transition: color 0.3s ease;
    }
    .ob-root.ob-light .ob-left-tagline { color: #57606A; }
    .ob-root.ob-dark .ob-left-tagline { color: #94A3B8; }

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
        padding: 6px 12px;
        border-radius: 50px;
        font-size: 12px;
        font-weight: 700;
        transition: all 0.3s ease;
    }
    .ob-root.ob-light .ob-pillar {
        background: var(--action-soft);
        border: 1px solid var(--action-border);
        color: var(--action);
    }
    .ob-root.ob-dark .ob-pillar {
        background: var(--action-medium);
        border: 1px solid var(--action-border);
        color: var(--action);
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
        opacity: 0.4;
        transition: opacity 0.3s;
    }
    .ob-tracker-row.done { opacity: 0.65; }
    .ob-tracker-row.current { opacity: 1; }
    .ob-tracker-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
        transition: background 0.3s, transform 0.3s, box-shadow 0.3s;
    }
    .ob-root.ob-light .ob-tracker-dot { background: rgba(42,35,24,0.2); }
    .ob-root.ob-dark .ob-tracker-dot { background: rgba(255,255,255,0.25); }

    .ob-tracker-row.current .ob-tracker-dot {
        background: var(--action, #D4843A) !important;
        transform: scale(1.4);
        box-shadow: 0 0 0 4px rgba(var(--action-rgb), 0.2);
    }
    .ob-tracker-row.done .ob-tracker-dot {
        background: var(--action, #D4843A) !important;
    }
    .ob-tracker-label {
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        transition: color 0.3s ease;
    }
    .ob-root.ob-light .ob-tracker-label { color: #1F2D3D; }
    .ob-root.ob-dark .ob-tracker-label { color: #E2E8F0; }

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
        padding: clamp(28px, 4vw, 60px) clamp(16px, 3vw, 40px);
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
        transition: all 0.3s ease;
    }
    .ob-root.ob-light .ob-dot { background: rgba(42, 35, 24, 0.18); }
    .ob-root.ob-dark .ob-dot { background: rgba(255, 255, 255, 0.22); }

    .ob-dot.active {
        width: 24px;
        border-radius: 4px;
        background: var(--action, #D4843A) !important;
        box-shadow: 0 0 10px rgba(var(--action-rgb), 0.4);
    }
    .ob-dot.done {
        background: var(--action, #D4843A) !important;
        opacity: 0.65;
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
        display: inline-flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
    }
    .ob-step-meta {
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        padding: 6px 14px;
        border-radius: 999px;
        transition: all 0.3s ease;
    }
    .ob-root.ob-light .ob-step-meta {
        background: var(--action-soft);
        border: 1px solid var(--action-border);
        color: var(--action);
    }
    .ob-root.ob-dark .ob-step-meta {
        background: var(--action-medium);
        border: 1px solid var(--action-border);
        color: var(--action);
        box-shadow: 0 0 12px rgba(var(--action-rgb), 0.2);
    }
    .ob-step-icon {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        transition: all 0.3s ease;
    }
    .ob-root.ob-light .ob-step-icon {
        background: var(--action-soft);
        color: var(--action);
        border: 1px solid var(--action-border);
    }
    .ob-root.ob-dark .ob-step-icon {
        background: var(--action-medium);
        color: var(--action);
        border: 1px solid var(--action-border);
        box-shadow: 0 0 16px rgba(var(--action-rgb), 0.25);
    }
    .ob-step-icon svg, .ob-role-emoji svg, .ob-pillar svg { display: block; }

    .ob-step-title {
        font-size: clamp(28px, 3.5vw, 38px);
        font-weight: 800;
        line-height: 1.15;
        letter-spacing: -0.8px;
        margin: 0 0 12px;
        transition: color 0.3s ease;
    }
    .ob-root.ob-light .ob-step-title { color: #1F2D3D; }
    .ob-root.ob-dark .ob-step-title { color: #F8FAFC; text-shadow: 0 2px 12px rgba(0,0,0,0.4); }

    .ob-step-subtitle {
        font-size: 15px;
        line-height: 1.6;
        margin: 0 0 32px;
        transition: color 0.3s ease;
    }
    .ob-root.ob-light .ob-step-subtitle { color: #57606A; }
    .ob-root.ob-dark .ob-step-subtitle { color: #94A3B8; }

    /* Inputs & Buttons */
    .ob-input {
        width: 100%;
        padding: 16px 20px;
        border-radius: 14px;
        font-size: 18px;
        font-weight: 500;
        outline: none;
        transition: all 0.25s ease;
        margin-bottom: 8px;
    }
    .ob-root.ob-light .ob-input {
        border: 2px solid rgba(42, 35, 24, 0.14);
        background: rgba(255, 255, 255, 0.85);
        color: #1F2D3D;
    }
    .ob-root.ob-light .ob-input:focus {
        border-color: var(--action);
        background: #FFFFFF;
        box-shadow: 0 0 0 4px rgba(var(--action-rgb), 0.15);
    }
    .ob-root.ob-dark .ob-input {
        border: 2px solid rgba(255, 255, 255, 0.16);
        background: rgba(21, 29, 42, 0.7);
        color: #F8FAFC;
    }
    .ob-root.ob-dark .ob-input:focus {
        border-color: var(--action);
        background: rgba(30, 41, 59, 0.9);
        box-shadow: 0 0 0 4px rgba(var(--action-rgb), 0.25);
    }

    .ob-actions {
        display: flex;
        gap: 16px;
    }
    .ob-btn-primary {
        flex: 2;
        padding: 16px 24px;
        border-radius: 14px;
        border: none;
        background: var(--action);
        color: #FFFFFF;
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.25s ease;
        box-shadow: 0 6px 20px rgba(var(--action-rgb), 0.3);
    }
    .ob-btn-primary:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(var(--action-rgb), 0.45);
        filter: brightness(1.08);
    }
    .ob-btn-primary:active:not(:disabled) { transform: translateY(0); }
    .ob-btn-primary:disabled {
        opacity: 0.45;
        cursor: not-allowed;
        box-shadow: none;
    }

    .ob-btn-secondary {
        flex: 1;
        padding: 16px 24px;
        border-radius: 14px;
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.25s ease;
    }
    .ob-root.ob-light .ob-btn-secondary {
        border: 2px solid rgba(42, 35, 24, 0.15);
        background: rgba(255, 255, 255, 0.6);
        color: #1F2D3D;
    }
    .ob-root.ob-light .ob-btn-secondary:hover {
        background: rgba(255, 255, 255, 0.9);
        border-color: rgba(42, 35, 24, 0.25);
    }
    .ob-root.ob-dark .ob-btn-secondary {
        border: 2px solid rgba(255, 255, 255, 0.16);
        background: rgba(21, 29, 42, 0.6);
        color: #F8FAFC;
    }
    .ob-root.ob-dark .ob-btn-secondary:hover {
        background: rgba(30, 41, 59, 0.85);
        border-color: rgba(255, 255, 255, 0.3);
    }

    .ob-btn-link {
        display: block;
        margin: 24px auto 0;
        padding: 8px 16px;
        background: none;
        border: none;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        opacity: 0.75;
        transition: opacity 0.2s, color 0.2s;
    }
    .ob-root.ob-light .ob-btn-link { color: #57606A; }
    .ob-root.ob-dark .ob-btn-link { color: #94A3B8; }
    .ob-btn-link:hover { opacity: 1; text-decoration: underline; }

    /* Role Grid & Cards */
    .ob-role-grid {
        display: flex;
        flex-direction: column;
        gap: 14px;
        margin-bottom: 36px;
    }
    .ob-role-card {
        display: grid;
        grid-template-columns: 48px 1fr;
        grid-template-areas: "emoji name" "emoji desc";
        align-items: center;
        gap: 2px 16px;
        padding: 18px 22px;
        border-radius: 16px;
        text-align: left;
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        position: relative;
    }

    /* Light mode role card states */
    .ob-root.ob-light .ob-role-card {
        background: rgba(255, 255, 255, 0.75);
        border: 1.5px solid rgba(42, 35, 24, 0.12);
        box-shadow: 0 4px 12px rgba(42, 35, 24, 0.03);
    }
    .ob-root.ob-light .ob-role-card:hover {
        background: #FFFFFF;
        border-color: rgba(var(--action-rgb), 0.4);
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(var(--action-rgb), 0.12);
    }
    .ob-root.ob-light .ob-role-card.selected {
        background: #FFFFFF;
        border: 2px solid var(--action, #D4843A);
        box-shadow: 0 8px 28px rgba(var(--action-rgb), 0.22);
    }

    /* Dark mode role card states */
    .ob-root.ob-dark .ob-role-card {
        background: rgba(21, 29, 42, 0.65);
        border: 1.5px solid rgba(255, 255, 255, 0.12);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    }
    .ob-root.ob-dark .ob-role-card:hover {
        background: rgba(30, 41, 59, 0.85);
        border-color: rgba(var(--action-rgb), 0.5);
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(var(--action-rgb), 0.2);
    }
    .ob-root.ob-dark .ob-role-card.selected {
        background: linear-gradient(135deg, rgba(var(--action-rgb), 0.25) 0%, rgba(21, 29, 42, 0.95) 100%);
        border: 2px solid var(--action);
        box-shadow: 0 0 25px rgba(var(--action-rgb), 0.35);
    }

    .ob-role-emoji {
        grid-area: emoji;
        color: var(--action);
        display: grid;
        place-items: center;
    }
    .ob-root.ob-dark .ob-role-emoji { color: var(--action); }

    .ob-role-name {
        grid-area: name;
        font-size: 17px;
        font-weight: 800;
        line-height: 1.3;
        transition: color 0.3s ease;
    }
    .ob-root.ob-light .ob-role-name { color: #1F2D3D; }
    .ob-root.ob-dark .ob-role-name { color: #F8FAFC; }

    .ob-role-desc {
        grid-area: desc;
        font-size: 13px;
        line-height: 1.4;
        transition: color 0.3s ease;
    }
    .ob-root.ob-light .ob-role-desc { color: #57606A; }
    .ob-root.ob-dark .ob-role-desc { color: #CBD5E1; }

    /* Tour Content */
    .ob-tour-content {
        padding: 24px;
        border-radius: 16px;
        font-size: 15px;
        line-height: 1.7;
        margin-bottom: 36px;
        min-height: 140px;
        transition: all 0.3s ease;
    }
    .ob-root.ob-light .ob-tour-content {
        background: rgba(255, 255, 255, 0.7);
        border: 1px solid rgba(42, 35, 24, 0.08);
        color: #1F2D3D;
        box-shadow: 0 4px 16px rgba(42, 35, 24, 0.03);
    }
    .ob-root.ob-dark .ob-tour-content {
        background: rgba(21, 29, 42, 0.65);
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: #E2E8F0;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
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
        margin-top: 8px;
        margin-bottom: 20px;
        min-height: 20px;
        transition: color 0.3s ease;
    }
    .ob-root.ob-light .ob-input-hint { color: #57606A; }
    .ob-root.ob-dark .ob-input-hint { color: #94A3B8; }

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
        text-transform: uppercase;
        letter-spacing: 0.05em;
        transition: color 0.3s ease;
    }
    .ob-root.ob-light .ob-label { color: #1F2D3D; }
    .ob-root.ob-dark .ob-label { color: #F8FAFC; }

    .ob-pill-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }
    .ob-pill-btn {
        padding: 6px 14px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    .ob-root.ob-light .ob-pill-btn {
        background: rgba(255, 255, 255, 0.6);
        border: 1px solid rgba(42,35,24,0.12);
        color: #57606A;
    }
    .ob-root.ob-light .ob-pill-btn:hover { background: rgba(255, 255, 255, 0.9); }
    .ob-root.ob-dark .ob-pill-btn {
        background: rgba(21, 29, 42, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: #94A3B8;
    }
    .ob-root.ob-dark .ob-pill-btn:hover { background: rgba(30, 41, 59, 0.85); }

    .ob-pill-btn.active {
        background: rgba(var(--action-rgb), 0.18) !important;
        border-color: var(--action, #D4843A) !important;
        color: var(--action, #D4843A) !important;
    }

    @container onboarding (max-width: 767px) {
      .ob-split {
        flex-direction: column;
      }
      .ob-left {
        width: 100%;
        border-right: none;
        border-bottom: 1px solid var(--border, rgba(42,35,24,0.08));
        padding: 24px 20px;
      }
      .ob-right {
        padding: 28px 16px 40px;
      }
    }
`;
