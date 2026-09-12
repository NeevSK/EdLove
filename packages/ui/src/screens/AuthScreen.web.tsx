import { authAPI, identityAPI } from '@repo/core/api/client';
import { handleAPIError } from '@repo/core/api/interceptor';
import { useIdentity } from '@repo/core/hooks';
import { getSessionIdentityMode, isAnonymousIdentity } from '@repo/core/logic';
import { GuestDataSync } from '@repo/core/native';
import { storage } from '@repo/core/storage';
import type { Capacity, User } from '@repo/core/types';
import { validateForm, validators } from '@repo/core/utils';
import { GatewayScreenShell } from '@repo/ui/components/GatewayScreenShell.web';
import { LivingGlow } from '@repo/ui/components/LivingGlow';
import { SanctuaryBackground } from '@repo/ui/components/SanctuaryBackground';
import { useTheme } from '@repo/ui/hooks/useTheme';
import { Key } from '@repo/ui/icons';
import { useSanctuaryToast } from '@repo/ui/providers/ToastProvider';
import { memo, useCallback, useEffect, useMemo, useReducer } from 'react';
import { useTranslation } from 'react-i18next';

interface AuthScreenProps {
  onContinueAsGuest?: () => void;
  onSuccess?: () => void;
  onBack?: () => void;
  initialMode?: 'login' | 'signup';
}

const ENTRY_PILLARS = ['Self', 'Classroom', 'Community', 'Library'] as const;

// ============================================================================
// TYPES & REDUCER
// ============================================================================

interface AuthState {
  mode: 'signup' | 'login';
  showEmailForm: boolean;
  email: string;
  password: string;
  loading: boolean;
  errors: Record<string, string>;
  currentUser: User | null;
}

type AuthAction =
  | { type: 'SET_MODE'; mode: 'signup' | 'login' }
  | { type: 'SET_EMAIL'; email: string }
  | { type: 'SET_PASSWORD'; password: string }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERRORS'; errors: Record<string, string> }
  | { type: 'TOGGLE_EMAIL_FORM'; show: boolean }
  | { type: 'SET_USER'; user: User | null };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.mode, showEmailForm: action.mode === 'login', errors: {} };
    case 'SET_EMAIL':
      return { ...state, email: action.email };
    case 'SET_PASSWORD':
      return { ...state, password: action.password };
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'SET_ERRORS':
      return { ...state, errors: action.errors };
    case 'TOGGLE_EMAIL_FORM':
      return { ...state, showEmailForm: action.show, errors: {} };
    case 'SET_USER':
      if (
        state.currentUser === action.user ||
        (state.currentUser?.id && state.currentUser.id === action.user?.id)
      ) {
        return state;
      }
      return { ...state, currentUser: action.user };
    default:
      return state;
  }
}

// ============================================================================
// HERO PANEL SUB-COMPONENT
// ============================================================================

interface HeroPanelProps {
  modeCopy: {
    eyebrow: string;
    title: string;
    subtitle: string;
    emoji: string;
  };
  renderedPillars: React.ReactNode;
}

const HeroPanel = memo(({ modeCopy, renderedPillars }: HeroPanelProps) => {
  const { isDark, accent, accentRgb, textOnAccent } = useTheme();
  return (
    <div
      className={`flex flex-col justify-between p-5 sm:p-7 md:p-8 rounded-[32px] md:rounded-[40px] border backdrop-blur-2xl shadow-2xl relative overflow-hidden w-full transition-all duration-300 ${
        isDark
          ? 'border-white/12 bg-slate-900/80 text-white'
          : 'border-slate-900/10 bg-white/80 text-slate-900'
      }`}
    >
      <div className="flex flex-col gap-4 md:gap-5">
        {/* Sanctuary badge */}
        <div
          className={`inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full border shadow-sm backdrop-blur-md ${
            isDark
              ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
              : 'border-emerald-600/25 bg-emerald-50 text-emerald-800'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-extrabold tracking-[0.08em] uppercase">
            Gurudevi Sanctuary · Sovereign Education
          </span>
        </div>

        {/* Icon + headline side-by-side */}
        <div className="flex items-start gap-4 sm:gap-5">
          <LivingGlow active size={72} className="items-start justify-start p-0 flex-shrink-0">
            <div
              className={`w-[56px] h-[56px] rounded-[18px] flex items-center justify-center shadow-lg border backdrop-blur-md flex-shrink-0 ${
                isDark
                  ? 'bg-slate-800/90 border-white/16 shadow-black/40'
                  : 'bg-white/90 border-slate-900/12 shadow-slate-900/5'
              }`}
            >
              <span className="text-2xl">{modeCopy.emoji}</span>
            </div>
          </LivingGlow>

          <div className="flex flex-col gap-1.5 min-w-0">
            <span
              className="text-[11px] font-extrabold tracking-[0.14em] uppercase"
              style={{ color: accent.action }}
            >
              {modeCopy.eyebrow}
            </span>
            <h1
              className={`text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-[1.1] ${
                isDark ? 'text-white drop-shadow-sm' : 'text-slate-900'
              }`}
            >
              {modeCopy.title}
            </h1>
            <p
              className={`text-sm leading-relaxed font-normal ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              {modeCopy.subtitle}
            </p>
          </div>
        </div>

        {/* Pillars / Domains */}
        <div className="flex flex-wrap gap-2">{renderedPillars}</div>
      </div>

      {/* Educational Highlight Card */}
      <div
        className={`mt-4 rounded-2xl border p-4 sm:p-5 backdrop-blur-md ${
          isDark
            ? 'border-white/12 bg-slate-800/70 text-white'
            : 'border-slate-900/10 bg-white/70 text-slate-900'
        }`}
      >
        <div className="flex flex-col gap-3">
          <div>
            <span
              className={`text-[10px] font-extrabold tracking-[0.14em] uppercase ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Why this step matters
            </span>
            <p
              className={`leading-relaxed text-xs sm:text-sm mt-1 font-medium ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}
            >
              Your account keeps lessons, achievements, and invitations synchronized across all
              devices in a quiet, distraction-free environment.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div
              className={`p-3 rounded-xl border flex flex-col gap-0.5 ${
                isDark ? 'bg-slate-900/60 border-white/10' : 'bg-white/80 border-slate-900/10'
              }`}
            >
              <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Gentle entry
              </span>
              <span
                className={`text-[11px] leading-snug ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
              >
                Google, Passkey, or email. Switch roles anytime.
              </span>
            </div>
            <div
              className={`p-3 rounded-xl border flex flex-col gap-0.5 ${
                isDark ? 'bg-slate-900/60 border-white/10' : 'bg-white/80 border-slate-900/10'
              }`}
            >
              <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Guest safe
              </span>
              <span
                className={`text-[11px] leading-snug ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
              >
                Sync progress automatically when you sign in.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
HeroPanel.displayName = 'HeroPanel';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const AuthScreenWeb = memo(
  ({ onContinueAsGuest, onSuccess, onBack, initialMode }: AuthScreenProps) => {
    const { t } = useTranslation();
    const { accent, accentRgb, isDark, textOnAccent } = useTheme();
    const { showToast } = useSanctuaryToast();
    const { profile: myProfile } = useIdentity();

    const [state, dispatch] = useReducer(authReducer, {
      mode: initialMode === 'login' ? 'login' : 'signup',
      showEmailForm: initialMode === 'login',
      email: '',
      password: '',
      loading: false,
      errors: {},
      currentUser: null,
    });

    const { mode, showEmailForm, email, password, loading, errors, currentUser } = state;

    useEffect(() => {
      dispatch({ type: 'SET_USER', user: (myProfile as unknown as User) || null });
    }, [myProfile?.id]);

    const applyPendingInvite = useCallback(
      async (successMessage: string) => {
        const internalId = await identityAPI.getMyInternalId();
        if (!internalId) return;

        const pendingInvite = await storage.getStringAsync('pending_invite');
        if (!pendingInvite) return;

        try {
          const invite = JSON.parse(pendingInvite) as { school_id?: string };
          if (!invite.school_id) return;

          showToast({
            message: `${successMessage} Claim the official invitation to activate school access.`,
            type: 'info',
          });
        } catch (error) {
          console.error('Failed to apply pending invite on web auth:', error);
        }
      },
      [showToast],
    );

    const modeCopy = useMemo(
      () =>
        mode === 'signup'
          ? {
              eyebrow: 'Create your sanctuary identity',
              title: 'Begin inside Gurudevi',
              subtitle:
                'Keep your first step calm, luminous, and connected to your learning sanctuary.',
              primary: 'Create Account',
              google: 'Continue with Google',
              email: 'Continue with Email',
              emoji: '🌱',
            }
          : {
              eyebrow: 'Return to your sanctuary',
              title: 'Welcome back to Gurudevi',
              subtitle:
                'Pick up your journey where you left it across self, classroom, community, and library.',
              primary: 'Sign In',
              google: 'Sign in with Google',
              email: 'Sign in with Email',
              emoji: '🗝️',
            },
      [mode],
    );

    const handleGoogleAuth = useCallback(async () => {
      dispatch({ type: 'SET_LOADING', loading: true });
      dispatch({ type: 'SET_ERRORS', errors: {} });
      showToast({ message: 'Opening Google sign-in...', type: 'info', duration: 2000 });
      try {
        const redirectUrl = window.location.origin;
        const session = await authAPI.getAuthSession().catch(() => null);
        const isAnonymousSession = getSessionIdentityMode(session) === 'anonymous';

        if (isAnonymousSession && session?.user) {
          await authAPI.linkOAuthIdentity('google', redirectUrl);
        } else {
          await authAPI.signInWithOAuth('google', redirectUrl);
        }
      } catch (err: unknown) {
        const apiError = handleAPIError(err);
        showToast({
          message: (apiError as any)?.message || 'Google sign-in failed. Please try again.',
          type: 'error',
        });
      } finally {
        dispatch({ type: 'SET_LOADING', loading: false });
      }
    }, [showToast]);

    const handlePasskeyAuth = useCallback(async () => {
      dispatch({ type: 'SET_LOADING', loading: true });
      dispatch({ type: 'SET_ERRORS', errors: {} });
      showToast({ message: 'Opening passkey sign-in...', type: 'info', duration: 2000 });
      try {
        const redirectUrl = window.location.origin;
        const session = await authAPI.getAuthSession().catch(() => null);
        const isAnonymousSession = getSessionIdentityMode(session) === 'anonymous';

        if (isAnonymousSession && session?.user) {
          await authAPI.registerPasskey(redirectUrl, true);
        } else {
          await authAPI.signInWithPasskey(redirectUrl, true);
        }
      } catch (err: unknown) {
        const apiError = handleAPIError(err);
        showToast({
          message: (apiError as any)?.message || 'Passkey sign-in failed. Please try again.',
          type: 'error',
        });
      } finally {
        dispatch({ type: 'SET_LOADING', loading: false });
      }
    }, [showToast]);

    const handleEmailAuth = useCallback(async () => {
      dispatch({ type: 'SET_LOADING', loading: true });
      dispatch({ type: 'SET_ERRORS', errors: {} });

      const validation = validateForm(
        { email, password },
        {
          email: validators.email,
          password: (val) => validators.nonEmpty(val, 'Password'),
        },
      );

      if (!validation.isValid) {
        dispatch({ type: 'SET_ERRORS', errors: validation.errors });
        dispatch({ type: 'SET_LOADING', loading: false });
        return;
      }

      try {
        if (mode === 'signup') {
          showToast({ message: 'Creating your identity...', type: 'info', duration: 2000 });
          const isAnonymousUser = isAnonymousIdentity(currentUser);

          if (isAnonymousUser) {
            if (currentUser) GuestDataSync.rememberGuestSession(currentUser.id);
            const existingName =
              (currentUser?.display_name && String(currentUser.display_name).trim()) ||
              'Sanctuary User';
            await authAPI.linkAnonymousToEmail(
              email,
              password,
              existingName,
              'teacher' as Capacity,
            );
            if (currentUser) {
              const migration = await GuestDataSync.syncAllData(currentUser.id);
              if (!migration.success) {
                showToast({
                  message: 'Your work remains on this device and will be retried after sign-in.',
                  type: 'info',
                });
              }
            }
            await applyPendingInvite('Welcome to your new school sanctuary!');
            showToast({ message: 'Welcome! Your identity is now secured.', type: 'success' });
            onSuccess?.();
          } else {
            await authAPI.signUp(email, password);
            showToast({
              message:
                t('auth.checkEmail') || 'Identity initiated. Please check your email to confirm.',
              type: 'success',
            });
          }
        } else {
          showToast({ message: 'Welcome back! Reconnecting...', type: 'info', duration: 2000 });
          await authAPI.signIn(email, password);
          await applyPendingInvite('Reconnected to your school sanctuary!');
          showToast({
            message: 'Access granted to your sanctuary.',
            type: 'success',
            duration: 2000,
          });
          onSuccess?.();
        }
      } catch (err: unknown) {
        const apiError = handleAPIError(err);
        const baseMsg =
          typeof apiError === 'string'
            ? apiError
            : (apiError as any).message || 'An authentication error occurred';

        const existingAccountError =
          mode === 'signup' &&
          /already registered|already exists|user already|duplicate/i.test(baseMsg);
        const guidedMsg = existingAccountError
          ? 'You already have an account. Switching to login…'
          : mode === 'signup'
            ? `${baseMsg}. If you already have an account, try logging in instead.`
            : `${baseMsg}. Please check your credentials and connection.`;

        if (existingAccountError) {
          dispatch({ type: 'SET_MODE', mode: 'login' });
        }

        showToast({
          message: guidedMsg,
          type: 'error',
          duration: existingAccountError ? 3500 : 5000,
        });
      } finally {
        dispatch({ type: 'SET_LOADING', loading: false });
      }
    }, [email, password, mode, t, showToast, onSuccess, currentUser, applyPendingInvite]);

    const handleGuest = useCallback(async () => {
      dispatch({ type: 'SET_LOADING', loading: true });
      try {
        onContinueAsGuest?.();
      } catch (err: unknown) {
        showToast({
          message: err instanceof Error ? err.message : 'Guest mode failed',
          type: 'error',
        });
      } finally {
        dispatch({ type: 'SET_LOADING', loading: false });
      }
    }, [onContinueAsGuest, showToast]);

    const handleGooglePress = useCallback(() => {
      void handleGoogleAuth();
    }, [handleGoogleAuth]);

    const handlePasskeyPress = useCallback(() => {
      void handlePasskeyAuth();
    }, [handlePasskeyAuth]);

    const handleEmailPress = useCallback(() => {
      void handleEmailAuth();
    }, [handleEmailAuth]);

    const handleGuestPress = useCallback(() => {
      void handleGuest();
    }, [handleGuest]);

    const switchToSignup = useCallback(() => {
      dispatch({ type: 'SET_MODE', mode: 'signup' });
    }, []);

    const switchToLogin = useCallback(() => {
      dispatch({ type: 'SET_MODE', mode: 'login' });
    }, []);

    const toggleEmailForm = useCallback(() => {
      dispatch({ type: 'TOGGLE_EMAIL_FORM', show: true });
    }, []);

    const backToGoogle = useCallback(() => {
      dispatch({ type: 'TOGGLE_EMAIL_FORM', show: false });
    }, []);

    const handleEmailChange = useCallback((val: string) => {
      dispatch({ type: 'SET_EMAIL', email: val });
    }, []);

    const handlePasswordChange = useCallback((val: string) => {
      dispatch({ type: 'SET_PASSWORD', password: val });
    }, []);

    const renderedPillars = useMemo(
      () =>
        ENTRY_PILLARS.map((pillar) => (
          <span
            key={pillar}
            className="px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide border backdrop-blur-sm transition-colors"
            style={{
              borderColor: `rgba(${accentRgb}, 0.35)`,
              background: `rgba(${accentRgb}, ${isDark ? 0.15 : 0.08})`,
              color: accent.action,
            }}
          >
            {pillar}
          </span>
        )),
      [isDark, accent.action, accentRgb],
    );

    const backgroundOrbs = (
      <>
        <SanctuaryBackground />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 w-[380px] h-[380px] rounded-full blur-3xl opacity-30"
          style={{ background: `rgba(${accentRgb}, 0.20)` }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/3 -right-28 w-[420px] h-[420px] rounded-full blur-3xl opacity-20 bg-blue-500/20"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 left-1/4 w-[360px] h-[360px] rounded-full blur-3xl opacity-25 bg-violet-500/20"
        />
      </>
    );

    return (
      <GatewayScreenShell
        backgroundElements={backgroundOrbs}
        left={<HeroPanel modeCopy={modeCopy} renderedPillars={renderedPillars} />}
        right={
          <div
            className={`flex flex-col justify-center p-5 sm:p-6 md:p-7 rounded-[32px] md:rounded-[40px] border backdrop-blur-2xl shadow-2xl relative overflow-hidden w-full transition-all duration-300 ${
              isDark
                ? 'border-white/14 bg-slate-900/85 text-white'
                : 'border-slate-900/12 bg-white/90 text-slate-900'
            }`}
          >
            <div className="flex flex-col gap-5 w-full">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className={`self-start flex items-center gap-2 text-sm font-semibold transition-colors cursor-pointer -ml-1 py-1 ${
                    isDark
                      ? 'text-slate-300 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>←</span>
                  <span>Back to Welcome</span>
                </button>
              )}

              <div className="flex flex-col gap-3 w-full">
                {/* Header row: title label + mode toggle */}
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h2
                      className={`text-xl sm:text-2xl font-extrabold tracking-tight leading-tight ${
                        isDark ? 'text-white drop-shadow-sm' : 'text-slate-900'
                      }`}
                    >
                      {mode === 'signup' ? 'Join Gurudevi' : 'Welcome back'}
                    </h2>
                    <p
                      className={`text-xs leading-relaxed mt-0.5 ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {mode === 'signup'
                        ? 'Cross-device identity, held quietly.'
                        : 'Use credentials from your sanctuary profile.'}
                    </p>
                  </div>

                  {/* Mode Toggle Switch */}
                  <div
                    className={`flex p-1 rounded-full border shadow-inner flex-shrink-0 ${
                      isDark
                        ? 'bg-slate-800/80 border-white/10'
                        : 'bg-slate-100 border-slate-900/10'
                    }`}
                  >
                    <button
                      type="button"
                      aria-pressed={mode === 'signup'}
                      className="px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer font-extrabold"
                      style={
                        mode === 'signup'
                          ? {
                              background: accent.action,
                              color: textOnAccent,
                              boxShadow: `0 4px 12px rgba(${accentRgb}, 0.35)`,
                            }
                          : {
                              color: isDark ? '#94A3B8' : '#57606A',
                            }
                      }
                      onClick={switchToSignup}
                    >
                      Sign Up
                    </button>
                    <button
                      type="button"
                      aria-pressed={mode === 'login'}
                      className="px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer font-extrabold"
                      style={
                        mode === 'login'
                          ? {
                              background: accent.action,
                              color: textOnAccent,
                              boxShadow: `0 4px 12px rgba(${accentRgb}, 0.35)`,
                            }
                          : {
                              color: isDark ? '#94A3B8' : '#57606A',
                            }
                      }
                      onClick={switchToLogin}
                    >
                      Log In
                    </button>
                  </div>
                </div>
              </div>

              {/* Primary Action Buttons — 2-col grid for Google + Passkey */}
              <div className="flex flex-col gap-2.5 w-full">
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Google */}
                  <button
                    type="button"
                    onClick={handleGooglePress}
                    disabled={loading}
                    className="h-[46px] px-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:translate-y-[-1px] active:translate-y-[0px] transition-all cursor-pointer disabled:opacity-50 text-sm"
                    style={{
                      background: accent.action,
                      color: textOnAccent,
                      boxShadow: `0 4px 16px rgba(${accentRgb}, 0.35)`,
                    }}
                  >
                    <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                      <span className="text-[#4285F4] font-black text-[11px]">G</span>
                    </div>
                    <span className="truncate">Continue with Google</span>
                  </button>

                  {/* Passkey */}
                  <button
                    type="button"
                    onClick={handlePasskeyPress}
                    disabled={loading}
                    className={`h-[46px] px-3 rounded-2xl border font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50 text-sm ${
                      isDark
                        ? 'border-white/16 bg-slate-800/70 hover:bg-slate-800 text-white'
                        : 'border-slate-900/14 bg-white/80 hover:bg-white text-slate-900'
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: `rgba(${accentRgb}, ${isDark ? 0.2 : 0.1})` }}
                    >
                      <Key size={12} color={accent.action} />
                    </div>
                    <span className="truncate">Use Passkey</span>
                  </button>
                </div>

                {!showEmailForm && (
                  <button
                    type="button"
                    onClick={toggleEmailForm}
                    className={`w-full h-[44px] px-5 rounded-2xl border font-bold flex items-center justify-center text-sm shadow-sm transition-all cursor-pointer ${
                      isDark
                        ? 'border-white/14 bg-slate-800/50 hover:bg-slate-800/80 text-white'
                        : 'border-slate-900/12 bg-white/60 hover:bg-white text-slate-900'
                    }`}
                  >
                    <span>{modeCopy.email}</span>
                  </button>
                )}

                {/* Email & Password Input Section */}
                {showEmailForm && (
                  <div
                    className={`animate-in fade-in slide-in-from-top-2 duration-200 mt-2 p-5 sm:p-6 rounded-3xl border flex flex-col gap-4 shadow-sm ${
                      isDark
                        ? 'bg-slate-950/80 border-white/14 text-white'
                        : 'bg-white/90 border-slate-900/12 text-slate-900'
                    }`}
                  >
                    <div
                      className={`flex justify-between items-center pb-2 border-b ${
                        isDark ? 'border-white/10' : 'border-slate-900/10'
                      }`}
                    >
                      <span
                        className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}
                      >
                        Email Authentication
                      </span>
                      <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {mode === 'signup' ? 'New Account' : 'Direct Login'}
                      </span>
                    </div>

                    <div className="flex flex-col gap-3.5">
                      <div className="flex flex-col gap-1.5">
                        <label
                          className={`text-xs font-bold ml-1 ${
                            isDark ? 'text-slate-200' : 'text-slate-700'
                          }`}
                          htmlFor="web-auth-email"
                        >
                          Email Address
                        </label>
                        <input
                          id="web-auth-email"
                          type="email"
                          placeholder="you@school.edu.lk"
                          value={email}
                          onChange={(e) => handleEmailChange(e.target.value)}
                          autoComplete="email"
                          className={`w-full h-[48px] px-4 rounded-xl border text-sm focus:outline-none transition-all ob-phase-input ${
                            isDark
                              ? 'border-white/18 bg-slate-900 text-white placeholder:text-slate-500'
                              : 'border-slate-900/16 bg-white text-slate-900 placeholder:text-slate-400'
                          }`}
                          style={
                            {
                              '--focus-ring-color': accent.action,
                              '--focus-ring-rgb': accentRgb,
                            } as React.CSSProperties
                          }
                        />
                        {errors.email && (
                          <span className="text-xs text-rose-500 font-medium ml-1">
                            {errors.email}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label
                          className={`text-xs font-bold ml-1 ${
                            isDark ? 'text-slate-200' : 'text-slate-700'
                          }`}
                          htmlFor="web-auth-password"
                        >
                          Password
                        </label>
                        <input
                          id="web-auth-password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => handlePasswordChange(e.target.value)}
                          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                          className={`w-full h-[48px] px-4 rounded-xl border text-sm focus:outline-none transition-all ob-phase-input ${
                            isDark
                              ? 'border-white/18 bg-slate-900 text-white placeholder:text-slate-500'
                              : 'border-slate-900/16 bg-white text-slate-900 placeholder:text-slate-400'
                          }`}
                          style={
                            {
                              '--focus-ring-color': accent.action,
                              '--focus-ring-rgb': accentRgb,
                            } as React.CSSProperties
                          }
                        />
                        {errors.password && (
                          <span className="text-xs text-rose-500 font-medium ml-1">
                            {errors.password}
                          </span>
                        )}
                        {mode === 'signup' && !errors.password && (
                          <span className="text-xs text-phase-secondary ml-1">
                            Use at least 8 characters.
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleEmailPress}
                        disabled={loading}
                        className="w-full h-[50px] mt-2 rounded-xl font-extrabold flex items-center justify-center hover:brightness-105 transition-all cursor-pointer disabled:opacity-50"
                        style={{
                          background: accent.action,
                          color: textOnAccent,
                          boxShadow: `0 4px 14px rgba(${accentRgb}, 0.35)`,
                        }}
                      >
                        {loading ? 'Processing...' : modeCopy.primary}
                      </button>

                      <button
                        type="button"
                        onClick={backToGoogle}
                        className={`text-xs text-center underline cursor-pointer py-1 font-medium ${
                          isDark
                            ? 'text-slate-300 hover:text-white'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Cancel email form & return
                      </button>
                    </div>
                  </div>
                )}

                {mode === 'login' && !showEmailForm && (
                  <button
                    type="button"
                    onClick={handleGuestPress}
                    className={`text-sm font-semibold text-center py-2 transition-colors cursor-pointer ${
                      isDark
                        ? 'text-slate-300 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Continue as Guest Explorer
                  </button>
                )}
              </div>

              {errors._form && (
                <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-center text-xs font-medium">
                  {errors._form}
                </div>
              )}
            </div>
          </div>
        }
      />
    );
  },
);

AuthScreenWeb.displayName = 'AuthScreenWeb';

export default AuthScreenWeb;
