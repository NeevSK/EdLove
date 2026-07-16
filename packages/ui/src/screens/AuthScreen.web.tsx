import { authAPI, identityAPI } from '@repo/core/api';
import { handleAPIError } from '@repo/core/api/interceptor';
import { useIdentity } from '@repo/core/hooks';
import { getSessionIdentityMode, isAnonymousIdentity } from '@repo/core/logic';
import { storage } from '@repo/core/storage';
import type { Capacity, User } from '@repo/core/types';
import { validateForm, validators } from '@repo/core/utils';
import { Key } from '@repo/ui/icons';
import { memo, useCallback, useEffect, useMemo, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { BreathAnimation } from '../components/BreathAnimation';
import { GatewayFooter } from '../components/GatewayFooter.web';
import { GatewayHeader } from '../components/GatewayHeader.web';
import { LivingGlow } from '../components/LivingGlow';
import { SanctuaryBackground } from '../components/SanctuaryBackground';
import { Box } from '../components/ui/box';
import { Button, ButtonSpinner, ButtonText } from '../components/ui/button';
import { HStack } from '../components/ui/hstack';
import { Input, InputField } from '../components/ui/input';
import { Heading, Text } from '../components/ui/text';
import { VStack } from '../components/ui/vstack';
import { useTheme } from '../hooks/useTheme';
import { useSanctuaryToast } from '../providers/ToastProvider';

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
      return { ...state, currentUser: action.user };
    default:
      return state;
  }
}

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
    }, [myProfile]);

    const applyPendingInvite = useCallback(
      async (successMessage: string) => {
        const internalId = await identityAPI.getMyInternalId();
        if (!internalId) return;

        const pendingInvite = await storage.getStringAsync('pending_invite');
        if (!pendingInvite) return;

        try {
          const invite = JSON.parse(pendingInvite) as { school_id?: string };
          if (!invite.school_id) return;

          await identityAPI.updateProfile(internalId, {
            school_id: invite.school_id,
          });
          storage.delete('pending_invite');
          showToast({
            message: successMessage,
            type: 'success',
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
        const isAnonymousSession = getSessionIdentityMode(session) === 'guest';

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
        const isAnonymousSession = getSessionIdentityMode(session) === 'guest';

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
          <Box
            key={pillar}
            className="px-4 py-2 rounded-full border border-phase-border bg-phase-surface/60"
          >
            <Text className="text-[12px] font-bold tracking-wider text-phase-secondary">
              {pillar}
            </Text>
          </Box>
        )),
      [],
    );

    return (
      <Box className="flex flex-col min-h-screen justify-between relative overflow-y-auto bg-phase-world">
        <GatewayHeader />
        <SanctuaryBackground />

        <Box className="flex-1 z-10 w-full max-w-[1180px] mx-auto p-8 lg:p-12">
          <Box className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-7 items-stretch min-h-[calc(100vh-120px)]">
            {/* Story Section */}
            <Box className="rounded-[40px] border border-phase-border bg-phase-surface/40 overflow-hidden relative">
              <VStack className="h-full p-8 lg:p-12 justify-between gap-8">
                <VStack className="gap-8">
                  <Box className="px-4 py-2 rounded-full border border-phase-border bg-phase-surface/60 w-fit">
                    <Text className="text-[12px] font-bold tracking-[0.08em] uppercase text-phase-secondary">
                      Gurudevi Sanctuary
                    </Text>
                  </Box>

                  <VStack className="gap-6">
                    <LivingGlow active size={132} className="items-center justify-center p-0">
                      <Box className="w-[76px] h-[76px] rounded-[24px] bg-phase-surface items-center justify-center shadow-lg border border-phase-border">
                        <Text className="text-3xl text-phase-primary">✦</Text>
                      </Box>
                    </LivingGlow>

                    <VStack className="gap-4">
                      <Text className="text-[12px] font-extrabold tracking-[0.12em] uppercase text-phase-secondary">
                        {modeCopy.eyebrow}
                      </Text>
                      <Heading className="text-5xl lg:text-7xl font-bold tracking-[-0.07em] text-phase-primary leading-[0.95]">
                        {modeCopy.title}
                      </Heading>
                      <Text className="text-lg text-phase-secondary max-w-md leading-relaxed">
                        {modeCopy.subtitle}
                      </Text>
                    </VStack>
                  </VStack>

                  <HStack className="gap-2 flex-wrap">{renderedPillars}</HStack>
                </VStack>

                <Box className="rounded-3xl border border-phase-border bg-phase-surface/80 p-8">
                  <VStack className="gap-6">
                    <VStack className="gap-2">
                      <Text className="text-[11px] font-extrabold tracking-[0.12em] uppercase text-phase-muted">
                        Why this step matters
                      </Text>
                      <Text className="text-phase-primary leading-relaxed text-base">
                        Your account keeps learning, invitations, and profile presence gathered into
                        one living place without changing how you use the app.
                      </Text>
                    </VStack>
                    <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <VStack className="p-4 rounded-2xl bg-phase-surface/50 border border-phase-border gap-1">
                        <Text className="font-bold text-phase-primary">Gentle entry</Text>
                        <Text className="text-sm text-phase-secondary">
                          Start with Google or email.
                        </Text>
                        <Text className="text-xs text-phase-secondary/75 leading-5">
                          Shared devices can keep separate accounts. Use account switching plus a
                          local PIN or biometric lock for protected identities.
                        </Text>
                      </VStack>
                      <VStack className="p-4 rounded-2xl bg-phase-surface/50 border border-phase-border gap-1">
                        <Text className="font-bold text-phase-primary">Guest-safe</Text>
                        <Text className="text-sm text-phase-secondary">
                          Browse first when logging in later feels better.
                        </Text>
                      </VStack>
                    </Box>
                  </VStack>
                </Box>
              </VStack>
            </Box>

            {/* Panel Section */}
            <Box className="rounded-[40px] border border-phase-border bg-phase-surface/80 shadow-2xl overflow-hidden relative">
              <VStack className="h-full p-8 lg:p-12 justify-center gap-8">
                {onBack && (
                  <Button variant="ghost" onPress={onBack} className="self-start pl-0">
                    <HStack className="gap-2 items-center">
                      <Text className="text-phase-secondary text-lg">←</Text>
                      <ButtonText className="text-phase-secondary">Back</ButtonText>
                    </HStack>
                  </Button>
                )}

                <VStack className="gap-6">
                  <VStack className="gap-2">
                    <Text className="text-[11px] font-extrabold tracking-[0.12em] uppercase text-phase-secondary">
                      {mode === 'signup' ? 'Identity' : 'Return'}
                    </Text>

                    <HStack className="p-1 rounded-full bg-phase-surface/50 border border-phase-border w-fit">
                      <Button
                        variant="ghost"
                        className={`px-6 py-2 rounded-full h-auto ${mode === 'signup' ? 'bg-phase-world' : ''}`}
                        onPress={switchToSignup}
                      >
                        <ButtonText
                          className={`text-sm font-bold ${mode === 'signup' ? 'text-phase-primary' : 'text-phase-secondary'}`}
                        >
                          Sign Up
                        </ButtonText>
                      </Button>
                      <Button
                        variant="ghost"
                        className={`px-6 py-2 rounded-full h-auto ${mode === 'login' ? 'bg-phase-world' : ''}`}
                        onPress={switchToLogin}
                      >
                        <ButtonText
                          className={`text-sm font-bold ${mode === 'login' ? 'text-phase-primary' : 'text-phase-secondary'}`}
                        >
                          Log In
                        </ButtonText>
                      </Button>
                    </HStack>
                  </VStack>

                  <VStack className="gap-3">
                    <Heading className="text-3xl lg:text-4xl font-bold tracking-tight text-phase-primary">
                      {mode === 'signup' ? 'Choose your path in' : 'Reconnect with'} Gurudevi
                    </Heading>
                    <Text className="text-phase-secondary leading-relaxed">
                      {mode === 'signup'
                        ? 'Create a held, cross-device identity when you are ready.'
                        : 'Use the path that already belongs to you.'}
                    </Text>
                  </VStack>
                </VStack>

                <VStack className="gap-4 w-full">
                  <Button
                    size="lg"
                    onPress={handleGooglePress}
                    isDisabled={loading}
                    className="h-[60px] rounded-2xl bg-phase-primary shadow-xl hover:translate-y-[-1px] transition-transform"
                  >
                    <HStack className="gap-3 items-center">
                      <Box className="w-7 h-7 rounded-full bg-white items-center justify-center">
                        <Text className="text-[#4285F4] font-black">G</Text>
                      </Box>
                      <ButtonText className="text-phase-world font-bold">
                        {modeCopy.google}
                      </ButtonText>
                    </HStack>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onPress={handlePasskeyPress}
                    isDisabled={loading}
                    className="h-[60px] rounded-2xl border-phase-border bg-phase-surface/50"
                  >
                    <HStack className="gap-3 items-center">
                      <Box className="w-7 h-7 rounded-full bg-phase-primary/10 items-center justify-center">
                        <Key size={16} color={accent.action} />
                      </Box>
                      <ButtonText className="text-phase-primary font-bold">Use Passkey</ButtonText>
                    </HStack>
                  </Button>

                  <Text className="text-center text-xs text-phase-secondary/75 leading-5">
                    Social login stays the main path. Passkeys are available as a faster,
                    phishing-resistant option.
                  </Text>

                  {!showEmailForm && (
                    <Button
                      size="lg"
                      variant="outline"
                      onPress={toggleEmailForm}
                      className="h-[60px] rounded-2xl border-phase-border bg-phase-surface/50"
                    >
                      <ButtonText className="text-phase-primary">{modeCopy.email}</ButtonText>
                    </Button>
                  )}

                  {showEmailForm && (
                    <BreathAnimation delay={100}>
                      <VStack className="p-6 rounded-3xl bg-phase-surface/50 border border-phase-border gap-6">
                        <HStack className="justify-between items-baseline">
                          <Text className="font-bold text-phase-primary">Email path</Text>
                          <Text className="text-sm text-phase-muted">
                            {mode === 'signup' ? 'Create calmly' : 'Enter directly'}
                          </Text>
                        </HStack>

                        <VStack className="gap-4">
                          <VStack className="gap-2">
                            <Text className="text-sm font-semibold text-phase-primary ml-1">
                              Email
                            </Text>
                            <Input className="rounded-2xl border-phase-border bg-phase-surface/80 h-[52px]">
                              <InputField
                                placeholder="you@example.com"
                                value={email}
                                onChangeText={handleEmailChange}
                                className="text-phase-primary"
                                autoComplete="email"
                              />
                            </Input>
                            {errors.email && (
                              <Text className="text-xs text-phase-error ml-1">{errors.email}</Text>
                            )}
                          </VStack>

                          <VStack className="gap-2">
                            <Text className="text-sm font-semibold text-phase-primary ml-1">
                              Password
                            </Text>
                            <Input className="rounded-2xl border-phase-border bg-phase-surface/80 h-[52px]">
                              <InputField
                                placeholder="Your password"
                                value={password}
                                onChangeText={handlePasswordChange}
                                secureTextEntry
                                className="text-phase-primary"
                              />
                            </Input>
                            {errors.password && (
                              <Text className="text-xs text-phase-error ml-1">
                                {errors.password}
                              </Text>
                            )}
                          </VStack>

                          <Button
                            size="lg"
                            onPress={handleEmailPress}
                            isDisabled={loading}
                            className="h-[56px] rounded-2xl bg-phase-primary mt-2"
                          >
                            {loading ? (
                              <ButtonSpinner className="text-phase-world" />
                            ) : (
                              <ButtonText className="text-phase-world font-bold">
                                {modeCopy.primary}
                              </ButtonText>
                            )}
                          </Button>

                          <Button variant="ghost" onPress={backToGoogle} className="self-center">
                            <ButtonText className="text-phase-secondary text-sm underline">
                              Back to Google
                            </ButtonText>
                          </Button>
                        </VStack>
                      </VStack>
                    </BreathAnimation>
                  )}

                  {mode === 'login' && !showEmailForm && (
                    <Button variant="ghost" onPress={handleGuestPress} className="h-auto py-2">
                      <ButtonText className="text-phase-secondary font-medium">
                        Continue as Guest
                      </ButtonText>
                    </Button>
                  )}
                </VStack>

                {errors._form && (
                  <Box className="p-4 rounded-xl border border-phase-error/20 bg-phase-error/5">
                    <Text className="text-phase-error text-center text-sm">{errors._form}</Text>
                  </Box>
                )}
              </VStack>
            </Box>
          </Box>
        </Box>
        <GatewayFooter />
      </Box>
    );
  },
);

AuthScreenWeb.displayName = 'AuthScreenWeb';

export default AuthScreenWeb;
