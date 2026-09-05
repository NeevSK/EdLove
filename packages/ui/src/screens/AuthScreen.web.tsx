import { authAPI, identityAPI } from '@repo/core/api/client';
import { handleAPIError } from '@repo/core/api/interceptor';
import { useIdentity } from '@repo/core/hooks';
import { getSessionIdentityMode, isAnonymousIdentity } from '@repo/core/logic';
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
  };
  renderedPillars: React.ReactNode;
}

const HeroPanel = memo(({ modeCopy, renderedPillars }: HeroPanelProps) => (
  <div className="flex flex-col justify-between p-6 sm:p-8 md:p-10 rounded-[32px] md:rounded-[40px] border border-phase-border/80 bg-phase-surface/40 backdrop-blur-xl shadow-xl relative overflow-hidden w-full">
    <div className="flex flex-col gap-5 md:gap-7">
      <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full border border-phase-border bg-phase-surface/80 shadow-sm backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-phase-secondary">
          Gurudevi Sanctuary · Sovereign Education
        </span>
      </div>

      <div className="flex flex-col gap-4 sm:gap-6">
        <LivingGlow active size={88} className="items-start justify-start p-0">
          <div className="w-[64px] h-[64px] rounded-[20px] bg-phase-surface/90 flex items-center justify-center shadow-lg border border-phase-border/80 backdrop-blur-md">
            <span className="text-2xl text-phase-primary">🪷</span>
          </div>
        </LivingGlow>

        <div className="flex flex-col gap-2.5">
          <span className="text-[11px] font-extrabold tracking-[0.14em] uppercase text-phase-secondary">
            {modeCopy.eyebrow}
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-phase-primary leading-[1.08]">
            {modeCopy.title}
          </h1>
          <p
            className="text-sm sm:text-base text-phase-secondary max-w-lg leading-relaxed mt-0.5 font-normal"
            style={{ maxWidth: 512 }}
          >
            {modeCopy.subtitle}
          </p>
        </div>
      </div>

      {/* Pillars / Domains */}
      <div className="flex flex-wrap gap-2 pt-1">{renderedPillars}</div>
    </div>

    {/* Educational Highlight Card */}
    <div className="mt-6 rounded-2xl md:rounded-3xl border border-phase-border/60 bg-phase-surface/70 p-4 sm:p-5 backdrop-blur-md">
      <div className="flex flex-col gap-3">
        <div>
          <span className="text-[10px] font-extrabold tracking-[0.14em] uppercase text-phase-muted">
            Why this step matters
          </span>
          <p className="text-phase-primary leading-relaxed text-xs sm:text-sm mt-1">
            Your account keeps lessons, achievements, and invitations synchronized across all
            devices in a quiet, distraction-free environment.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <div className="p-3 rounded-xl bg-phase-surface/60 border border-phase-border/60 flex flex-col gap-0.5">
            <span className="text-xs font-bold text-phase-primary">Gentle entry</span>
            <span className="text-[11px] text-phase-secondary leading-snug">
              Use Google, Passkey, or email. Switch roles smoothly anytime.
            </span>
          </div>
          <div className="p-3 rounded-xl bg-phase-surface/60 border border-phase-border/60 flex flex-col gap-0.5">
            <span className="text-xs font-bold text-phase-primary">Guest safe</span>
            <span className="text-[11px] text-phase-secondary leading-snug">
              Sync progress automatically whenever you decide to sign in.
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
));
HeroPanel.displayName = 'HeroPanel';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const AuthScreenWeb = memo(
  ({ onContinueAsGuest, onSuccess, onBack, initialMode }: AuthScreenProps) => {
    const { t } = useTranslation();
    const { accent } = useTheme();
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
            }
          : {
              eyebrow: 'Return to your sanctuary',
              title: 'Welcome back to Gurudevi',
              subtitle:
                'Pick up your journey where you left it across self, classroom, community, and library.',
              primary: 'Log In',
              google: 'Sign in with Google',
              email: 'Sign in with Email',
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
            const existingName =
              (currentUser?.display_name && String(currentUser.display_name).trim()) ||
              'Sanctuary User';
            await authAPI.linkAnonymousToEmail(
              email,
              password,
              existingName,
              'teacher' as Capacity,
            );
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

        const guidedMsg =
          mode === 'signup'
            ? `${baseMsg}. If you already have an account, try logging in instead.`
            : `${baseMsg}. Please check your credentials and connection.`;

        showToast({
          message: guidedMsg,
          type: 'error',
          duration: 5000,
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
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide border border-phase-border/70 bg-phase-surface/80 text-phase-secondary backdrop-blur-sm"
          >
            {pillar}
          </span>
        )),
      [],
    );

    const backgroundOrbs = (
      <>
        <SanctuaryBackground />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 w-[380px] h-[380px] rounded-full blur-3xl opacity-30 bg-amber-500/20"
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
            className="flex flex-col justify-center p-6 sm:p-8 md:p-10 rounded-[32px] md:rounded-[40px] border border-phase-border/90 bg-phase-surface/85 backdrop-blur-2xl shadow-2xl relative overflow-hidden w-full max-w-md"
            style={{ maxWidth: 448, boxSizing: 'border-box' }}
          >
            <div className="flex flex-col gap-5 w-full">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="self-start flex items-center gap-2 text-sm font-medium text-phase-secondary hover:text-phase-primary transition-colors cursor-pointer -ml-1 py-1"
                >
                  <span>←</span>
                  <span>Back to Welcome</span>
                </button>
              )}

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold tracking-[0.14em] uppercase text-phase-secondary">
                    {mode === 'signup' ? 'Create Account' : 'Returning User'}
                  </span>

                  {/* Mode Toggle Switch */}
                  <div className="flex p-1 rounded-full bg-phase-surface/80 border border-phase-border shadow-inner">
                    <button
                      type="button"
                      aria-pressed={mode === 'signup'}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        mode === 'signup'
                          ? 'bg-phase-primary text-phase-world shadow-sm'
                          : 'text-phase-secondary hover:text-phase-primary'
                      }`}
                      onClick={switchToSignup}
                    >
                      Sign Up
                    </button>
                    <button
                      type="button"
                      aria-pressed={mode === 'login'}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        mode === 'login'
                          ? 'bg-phase-primary text-phase-world shadow-sm'
                          : 'text-phase-secondary hover:text-phase-primary'
                      }`}
                      onClick={switchToLogin}
                    >
                      Log In
                    </button>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-phase-primary">
                    {mode === 'signup' ? 'Choose your path in' : 'Reconnect with'} Gurudevi
                  </h2>
                  <p className="text-sm text-phase-secondary leading-relaxed mt-1.5">
                    {mode === 'signup'
                      ? 'Create a held, cross-device identity when you are ready.'
                      : 'Use the credentials that belong to your sanctuary profile.'}
                  </p>
                </div>
              </div>

              {/* Primary Action Buttons */}
              <div className="flex flex-col gap-3.5 w-full pt-1">
                <button
                  type="button"
                  onClick={handleGooglePress}
                  disabled={loading}
                  className="w-full h-[54px] px-5 rounded-2xl bg-phase-primary text-phase-world font-bold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:translate-y-[-1px] active:translate-y-[0px] transition-all cursor-pointer disabled:opacity-50"
                >
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <span className="text-[#4285F4] font-black text-sm">G</span>
                  </div>
                  <span>{modeCopy.google}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePasskeyPress}
                  disabled={loading}
                  className="w-full h-[52px] px-5 rounded-2xl border border-phase-border bg-phase-surface/60 hover:bg-phase-surface text-phase-primary font-bold flex items-center justify-center gap-3 shadow-sm hover:border-phase-border/80 transition-all cursor-pointer disabled:opacity-50"
                >
                  <div className="w-7 h-7 rounded-full bg-phase-primary/10 flex items-center justify-center">
                    <Key size={15} color={accent.action} />
                  </div>
                  <span>Use Passkey (Fast & Phishing-resistant)</span>
                </button>

                {!showEmailForm && (
                  <button
                    type="button"
                    onClick={toggleEmailForm}
                    className="w-full h-[52px] px-5 rounded-2xl border border-phase-border/80 bg-phase-surface/40 hover:bg-phase-surface/80 text-phase-primary font-medium flex items-center justify-center shadow-sm transition-all cursor-pointer"
                  >
                    <span>{modeCopy.email}</span>
                  </button>
                )}

                {/* Email & Password Input Section */}
                {showEmailForm && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-200 mt-2 p-5 sm:p-6 rounded-3xl bg-phase-surface/70 border border-phase-border flex flex-col gap-4 shadow-sm">
                    <div className="flex justify-between items-center pb-1 border-b border-phase-border/40">
                      <span className="font-bold text-sm text-phase-primary">
                        Email Authentication
                      </span>
                      <span className="text-xs text-phase-muted">
                        {mode === 'signup' ? 'New Account' : 'Direct Login'}
                      </span>
                    </div>

                    <div className="flex flex-col gap-3.5">
                      <div className="flex flex-col gap-1.5">
                        <label
                          className="text-xs font-semibold text-phase-secondary ml-1"
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
                          className="w-full h-[48px] px-4 rounded-xl border border-phase-border bg-phase-surface text-phase-primary text-sm focus:outline-none focus:ring-2 focus:ring-phase-accent transition-all"
                        />
                        {errors.email && (
                          <span className="text-xs text-rose-500 font-medium ml-1">
                            {errors.email}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label
                          className="text-xs font-semibold text-phase-secondary ml-1"
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
                          className="w-full h-[48px] px-4 rounded-xl border border-phase-border bg-phase-surface text-phase-primary text-sm focus:outline-none focus:ring-2 focus:ring-phase-accent transition-all"
                        />
                        {errors.password && (
                          <span className="text-xs text-rose-500 font-medium ml-1">
                            {errors.password}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleEmailPress}
                        disabled={loading}
                        className="w-full h-[50px] mt-2 rounded-xl bg-phase-primary text-phase-world font-bold flex items-center justify-center shadow-md hover:bg-phase-primary/90 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {loading ? 'Processing...' : modeCopy.primary}
                      </button>

                      <button
                        type="button"
                        onClick={backToGoogle}
                        className="text-xs text-phase-secondary hover:text-phase-primary text-center underline cursor-pointer py-1"
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
                    className="text-sm font-medium text-phase-secondary hover:text-phase-primary text-center py-2 transition-colors cursor-pointer"
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
