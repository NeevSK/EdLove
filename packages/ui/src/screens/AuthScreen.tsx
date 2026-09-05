import { authAPI, identityAPI } from '@repo/core/api/client';
import { handleAPIError } from '@repo/core/api/interceptor';
import { useIdentity } from '@repo/core/hooks';
import { getSessionIdentityMode } from '@repo/core/logic';
import { FlowResolver, GuestDataSync } from '@repo/core/native';
import { storage } from '@repo/core/storage';
import type { Capacity, User } from '@repo/core/types';
import { validateForm, validators } from '@repo/core/utils';
import { BreathAnimation } from '@repo/ui/components/BreathAnimation';
import { default as GuestDataSyncModal } from '@repo/ui/components/GuestDataSyncModal';
import { LivingGlow } from '@repo/ui/components/LivingGlow';
import { SanctuaryBackground } from '@repo/ui/components/SanctuaryBackground';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { useTheme } from '@repo/ui/hooks/useTheme';
import { Mail, Shield } from '@repo/ui/icons';
import {
  Box,
  Button,
  ButtonSpinner,
  ButtonText,
  Heading,
  HStack,
  Input,
  InputField,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { useSanctuaryToast } from '@repo/ui/providers/ToastProvider';
import { hapticError, hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import type React from 'react';
import { memo, useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { useTranslation } from 'react-i18next';

// Required for expo-auth-session to complete the auth session on Android
WebBrowser.maybeCompleteAuthSession();

// Google 'G' icon rendered with plain RN — no react-native-svg needed
const GoogleIcon = memo(({ size = 20 }: { size?: number }) => (
  <Box
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Text
      style={{
        fontSize: size * 0.65,
        fontWeight: '700',
        color: '#4285F4',
        lineHeight: size * 0.75,
      }}
    >
      G
    </Text>
  </Box>
));
GoogleIcon.displayName = 'GoogleIcon';

const ENTRY_PILLARS = ['Self', 'Classroom', 'Community', 'Library'] as const;

interface AuthScreenProps {
  onSuccess?: () => void;
  onBack?: () => void;
  /** Start the auth screen in login mode (vs default sign-up) */
  initialMode?: 'login' | 'signup';
  /**
   * Injected native Google credential provider (One-Tap / Credential Manager on
   * Android, Google Sign-In SDK on iOS). When provided, Google sign-in uses the
   * native flow (no browser tab). When omitted, falls back to the browser OAuth
   * flow. The mobile app wrapper supplies this on native platforms only.
   */
  onGoogleNative?: () => Promise<{ idToken: string; accessToken: string | null }>;
  /** Injected Scanner component to avoid circular dependencies with @repo/scanner-kit */
  Scanner?: React.ComponentType<{
    visible: boolean;
    onClose: () => void;
    onScan: (data: string) => Promise<void>;
    title?: string;
  }>;
}

// --- 1. STATE MACHINE (Mechanism) ---
interface AuthState {
  email: string;
  password: string;
  loading: boolean;
  showEmailAuth: boolean;
  isSignUp: boolean;
  showScanner: boolean;
  errors: Record<string, string>;
  currentUser: User | null;
  showSyncModal: boolean;
  newUserId: string;
}

type AuthAction =
  | {
      type: 'SET_FIELD';
      field: 'email' | 'password' | 'newUserId';
      value: string;
    }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_MODE'; isSignUp: boolean; showEmailAuth?: boolean }
  | { type: 'SET_SCANNER'; visible: boolean }
  | { type: 'SET_ERRORS'; errors: Record<string, string> }
  | { type: 'SET_USER'; user: User | null }
  | { type: 'SET_SYNC_MODAL'; isOpen: boolean }
  | { type: 'RESET_ERRORS' };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'SET_MODE':
      return {
        ...state,
        isSignUp: action.isSignUp,
        showEmailAuth: action.showEmailAuth ?? state.showEmailAuth,
        errors: {},
      };
    case 'SET_SCANNER':
      return { ...state, showScanner: action.visible };
    case 'SET_ERRORS':
      return { ...state, errors: action.errors };
    case 'SET_USER':
      if (
        state.currentUser === action.user ||
        (state.currentUser?.id && state.currentUser.id === action.user?.id)
      ) {
        return state;
      }
      return { ...state, currentUser: action.user };
    case 'SET_SYNC_MODAL':
      return { ...state, showSyncModal: action.isOpen };
    case 'RESET_ERRORS':
      return { ...state, errors: {} };
    default:
      return state;
  }
}

const AuthScreen = memo(
  ({ onSuccess, onBack, initialMode, onGoogleNative, Scanner }: AuthScreenProps) => {
    const { t } = useTranslation();
    const { accent, text } = useTheme();
    const { showToast } = useSanctuaryToast();

    const initialState: AuthState = useMemo(
      () => ({
        email: '',
        password: '',
        loading: false,
        showEmailAuth: initialMode === 'login',
        isSignUp: initialMode !== 'login',
        showScanner: false,
        errors: {},
        currentUser: null,
        showSyncModal: false,
        newUserId: '',
      }),
      [initialMode],
    );

    const [state, dispatch] = useReducer(authReducer, initialState);
    const {
      email,
      password,
      loading,
      showEmailAuth,
      isSignUp,
      showScanner,
      errors,
      currentUser,
      showSyncModal,
      newUserId,
    } = state;

    const passwordRef = useRef<any>(null);

    const { profile: myProfile } = useIdentity();

    // Sync internal profile to reducer state
    useEffect(() => {
      dispatch({ type: 'SET_USER', user: (myProfile as unknown as User) || null });
    }, [myProfile?.id]);

    const getRedirectUrl = useCallback(() => {
      // Mobile always uses deep link scheme
      return AuthSession.makeRedirectUri({
        scheme: 'gurudevi',
        path: 'auth-callback',
      });
    }, []);

    const notifyPendingInvite = useCallback(async () => {
      try {
        const pendingInvite = await storage.getStringAsync('pending_invite');
        if (!pendingInvite) return;
        const invite = JSON.parse(pendingInvite);
        if (invite.school_id) {
          showToast({
            message: 'Your official school invitation is ready to claim.',
            type: 'info',
          });
        }
      } catch (e) {
        console.error('Failed to apply pending invite', e);
      }
    }, [showToast]);

    const finishSignIn = useCallback(
      async ({ isAnon, guestUserId }: { isAnon: boolean; guestUserId?: string | null }) => {
        const internalId = await identityAPI.getMyInternalId();
        if (internalId) {
          await notifyPendingInvite();
        }

        const hasGuestData =
          isAnon && guestUserId ? await GuestDataSync.hasGuestData(guestUserId) : false;
        if (isAnon && hasGuestData && internalId) {
          dispatch({
            type: 'SET_FIELD',
            field: 'newUserId',
            value: internalId,
          });
          dispatch({ type: 'SET_SYNC_MODAL', isOpen: true });
        } else {
          showToast({ message: 'Success! Welcome back to the sanctuary.', type: 'success' });
          if (onSuccess) onSuccess();
        }
      },
      [showToast, onSuccess, notifyPendingInvite],
    );

    const signInWithNativeGoogle = useCallback(
      async (
        session: Awaited<ReturnType<typeof authAPI.getAuthSession>>,
        isAnon: boolean,
        signIn: NonNullable<typeof onGoogleNative>,
      ) => {
        const { idToken, accessToken } = await signIn();
        let nativeResult;

        if (isAnon && session?.user) {
          // Promote the anonymous guest by linking the Google identity. If that
          // Google account already belongs to a permanent account, fall back to
          // signing in to the existing account instead of surfacing an error.
          try {
            nativeResult = await authAPI.linkGoogleIdentity(idToken, accessToken);
          } catch (linkError: any) {
            const msg = `${linkError?.message ?? ''} ${linkError?.code ?? ''}`.toLowerCase();
            const alreadyLinked =
              msg.includes('already') ||
              linkError?.code === 'link_identity_failed' ||
              linkError?.code === 'same_identity';
            if (!alreadyLinked) throw linkError;
            nativeResult = await authAPI.signInWithGoogleIdToken(idToken, accessToken);
          }
        } else {
          nativeResult = await authAPI.signInWithGoogleIdToken(idToken, accessToken);
        }

        if (!nativeResult?.session || !nativeResult?.user) {
          throw new Error('Native Google sign-in returned no session');
        }
        hapticSuccess();
        // `session` is the pre-sign-in identity (anonymous guest id). Passing it
        // as guestUserId keeps the guest-data scope intact so finishSignIn can
        // migrate any locally-cached guest work into the new permanent account.
        await finishSignIn({ isAnon, guestUserId: session?.user?.id });
      },
      [finishSignIn],
    );

    const signInWithBrowserOAuth = useCallback(
      async (
        provider: 'google',
        session: Awaited<ReturnType<typeof authAPI.getAuthSession>>,
        isAnon: boolean,
      ) => {
        const redirectUrl = getRedirectUrl();
        const oauthOptions =
          isAnon && session?.user
            ? await authAPI.linkOAuthIdentity(provider, redirectUrl, true)
            : await authAPI.signInWithOAuth(provider, redirectUrl, true);

        const oauthUrl = (oauthOptions as { url?: string })?.url;
        if (!oauthUrl) {
          showToast({
            message: 'Could not reach Google sign-in. Please check your connection.',
            type: 'error',
          });
          return;
        }

        const authResponse = await WebBrowser.openAuthSessionAsync(oauthUrl, redirectUrl);
        if (authResponse.type === 'success' && (authResponse as any).url) {
          const url = new URL((authResponse as any).url);
          const params = Object.fromEntries(url.searchParams.entries());
          const access_token = params.access_token || url.hash.match(/access_token=([^&]+)/)?.[1];
          const refresh_token =
            params.refresh_token || url.hash.match(/refresh_token=([^&]+)/)?.[1];

          if (!access_token || !refresh_token) {
            console.error('Missing tokens in auth response');
            showToast({
              message: 'Authentication failed: Could not retrieve secure tokens. Please try again.',
              type: 'error',
            });
            return;
          }

          await authAPI.setSession(access_token, refresh_token);
          hapticSuccess();
          await finishSignIn({ isAnon, guestUserId: session?.user?.id });
        }
      },
      [getRedirectUrl, finishSignIn, showToast],
    );

    const handleOAuthSignIn = useCallback(
      async (provider: 'google') => {
        dispatch({ type: 'SET_LOADING', loading: true });
        hapticLight();
        showToast({ message: 'Opening Google sign-in...', type: 'info', duration: 2000 });

        const session = await authAPI.getAuthSession().catch(() => null);
        const isAnon = getSessionIdentityMode(session) === 'anonymous';
        if (isAnon && session?.user) {
          GuestDataSync.rememberGuestSession(session.user.id);
        }

        try {
          if (onGoogleNative) {
            await signInWithNativeGoogle(session, isAnon, onGoogleNative);
          } else {
            await signInWithBrowserOAuth(provider, session, isAnon);
          }
        } catch (error: any) {
          if (error.message?.includes('already linked')) {
            showToast({
              message:
                t('auth.alreadyLinked') ||
                'This Google account is already linked to another sanctuary soul. Please login instead.',
              type: 'error',
            });
          } else {
            const apiError = handleAPIError(error);
            showToast({
              message: (apiError as any)?.message || 'Google sign-in failed. Please try again.',
              type: 'error',
            });
          }
        }
        dispatch({ type: 'SET_LOADING', loading: false });
      },
      [showToast, t, onGoogleNative, signInWithNativeGoogle, signInWithBrowserOAuth],
    );

    const completeSignUp = useCallback(
      async (currentSession: Awaited<ReturnType<typeof authAPI.getAuthSession>>) => {
        const isAnon = getSessionIdentityMode(currentSession) === 'anonymous';

        if (isAnon && currentSession?.user) {
          GuestDataSync.rememberGuestSession(currentSession.user.id);
          const existingName =
            (currentUser?.display_name && String(currentUser.display_name).trim()) ||
            'Sanctuary User';
          await authAPI.linkAnonymousToEmail(email, password, existingName, 'teacher' as Capacity);

          const internalId = await identityAPI.getMyInternalId();
          hapticSuccess();
          showToast({
            message: t('auth.signupSuccess') || 'Welcome! Your identity is now secured.',
            type: 'success',
          });

          const hasGuestData = await GuestDataSync.hasGuestData(currentSession.user.id);
          if (hasGuestData && internalId) {
            dispatch({
              type: 'SET_FIELD',
              field: 'newUserId',
              value: internalId,
            });
            dispatch({ type: 'SET_SYNC_MODAL', isOpen: true });
          } else {
            if (onSuccess) onSuccess();
          }
        } else {
          await authAPI.signUp(email, password);
          hapticSuccess();
          showToast({
            message:
              t('auth.checkEmail') || 'Identity initiated. Please check your email to confirm.',
            type: 'success',
          });
        }
      },
      [currentUser, email, password, showToast, t, onSuccess],
    );

    const completeLogin = useCallback(async () => {
      showToast({ message: 'Welcome back! Reconnecting...', type: 'info', duration: 2000 });
      await authAPI.signIn(email, password);

      hapticSuccess();
      const internalId = await identityAPI.getMyInternalId();
      if (internalId) {
        await notifyPendingInvite();
      }
      showToast({
        message: 'Access granted to your sanctuary.',
        type: 'success',
        duration: 2000,
      });
      if (onSuccess) onSuccess();
    }, [email, password, showToast, notifyPendingInvite, onSuccess]);

    const handleAuth = useCallback(async () => {
      const { isValid, errors: valErrors } = validateForm(
        { email, password },
        {
          email: validators.email,
          password: (val: string) => validators.nonEmpty(val, 'Password'),
        },
      );

      if (!isValid) {
        dispatch({ type: 'SET_ERRORS', errors: valErrors });
        return;
      }

      dispatch({ type: 'SET_LOADING', loading: true });
      try {
        if (isSignUp) {
          showToast({ message: 'Creating your identity...', type: 'info', duration: 2000 });
          const currentSession = await authAPI.getAuthSession().catch(() => null);
          await completeSignUp(currentSession);
        } else {
          await completeLogin();
        }
      } catch (error: any) {
        hapticError();
        const apiError = handleAPIError(error);
        const baseMsg =
          typeof apiError === 'string'
            ? apiError
            : (apiError as any).message || 'An authentication error occurred';

        const guidedMsg = isSignUp
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
    }, [email, password, isSignUp, showToast, completeSignUp, completeLogin]);

    const handleModeChange = useCallback((signUp: boolean) => {
      hapticLight();
      dispatch({ type: 'SET_MODE', isSignUp: signUp, showEmailAuth: false });
    }, []);

    const handleSignUpMode = useCallback(() => handleModeChange(true), [handleModeChange]);
    const handleLoginMode = useCallback(() => handleModeChange(false), [handleModeChange]);
    const handleGoogleSignIn = useCallback(() => handleOAuthSignIn('google'), [handleOAuthSignIn]);

    const handleMagicLink = useCallback(async () => {
      if (!email || !validators.email(email)) {
        dispatch({
          type: 'SET_ERRORS',
          errors: { email: t('auth.invalidEmail') || 'Enter a valid email' },
        });
        return;
      }
      dispatch({ type: 'SET_LOADING', loading: true });
      hapticLight();
      try {
        await authAPI.signInWithMagicLink(email);
        hapticSuccess();
        showToast({
          message: 'Magic link sent — check your email to finish signing in.',
          type: 'success',
          duration: 5000,
        });
        // Email entry form hides; the deep link will complete sign-in.
        dispatch({ type: 'SET_MODE', isSignUp: false, showEmailAuth: false });
      } catch (error: any) {
        hapticError();
        const apiError = handleAPIError(error);
        showToast({
          message: (apiError as any)?.message || 'Could not send magic link. Please try again.',
          type: 'error',
        });
      } finally {
        dispatch({ type: 'SET_LOADING', loading: false });
      }
    }, [email, showToast, t]);

    const handlePasskeySignIn = useCallback(async () => {
      dispatch({ type: 'SET_LOADING', loading: true });
      hapticLight();
      showToast({ message: 'Opening passkey sign-in...', type: 'info', duration: 2000 });
      try {
        const redirectUrl = getRedirectUrl();
        const passkeyOptions = await authAPI.signInWithPasskey(redirectUrl, true);
        const passkeyUrl = (passkeyOptions as { url?: string })?.url;

        if (!passkeyUrl) {
          showToast({
            message: 'Passkey sign-in is not available on this device yet.',
            type: 'error',
          });
          return;
        }

        const authResponse = await WebBrowser.openAuthSessionAsync(passkeyUrl, redirectUrl);
        if (authResponse.type === 'success' && (authResponse as any).url) {
          const url = new URL((authResponse as any).url);
          const params = Object.fromEntries(url.searchParams.entries());
          const access_token = params.access_token || url.hash.match(/access_token=([^&]+)/)?.[1];
          const refresh_token =
            params.refresh_token || url.hash.match(/refresh_token=([^&]+)/)?.[1];

          if (!access_token || !refresh_token) {
            showToast({
              message: 'Passkey sign-in finished but no session was returned.',
              type: 'error',
            });
            return;
          }

          await authAPI.setSession(access_token, refresh_token);
          hapticSuccess();
          onSuccess?.();
        }
      } catch (err) {
        handleAPIError(err);
        showToast({
          message: 'Passkey sign-in failed. Try Google sign-in or email instead.',
          type: 'error',
        });
      } finally {
        dispatch({ type: 'SET_LOADING', loading: false });
      }
    }, [getRedirectUrl, onSuccess, showToast]);

    const handlePasskeyRegister = useCallback(async () => {
      dispatch({ type: 'SET_LOADING', loading: true });
      hapticLight();
      showToast({ message: 'Creating a passkey...', type: 'info', duration: 2000 });
      try {
        const redirectUrl = getRedirectUrl();
        const passkeyOptions = await authAPI.registerPasskey(redirectUrl, true);
        const passkeyUrl = (passkeyOptions as { url?: string })?.url;

        if (!passkeyUrl) {
          showToast({
            message: 'Passkey setup is not available on this device yet.',
            type: 'error',
          });
          return;
        }

        const authResponse = await WebBrowser.openAuthSessionAsync(passkeyUrl, redirectUrl);
        if (authResponse.type === 'success' && (authResponse as any).url) {
          const url = new URL((authResponse as any).url);
          const params = Object.fromEntries(url.searchParams.entries());
          const access_token = params.access_token || url.hash.match(/access_token=([^&]+)/)?.[1];
          const refresh_token =
            params.refresh_token || url.hash.match(/refresh_token=([^&]+)/)?.[1];

          if (access_token && refresh_token) {
            await authAPI.setSession(access_token, refresh_token);
            hapticSuccess();
            onSuccess?.();
            return;
          }
        }

        showToast({
          message: 'Passkey was created, but no session tokens were returned.',
          type: 'info',
        });
      } catch (err) {
        handleAPIError(err);
        showToast({
          message: 'Passkey creation failed. You can continue with Google or email.',
          type: 'error',
        });
      } finally {
        dispatch({ type: 'SET_LOADING', loading: false });
      }
    }, [getRedirectUrl, onSuccess, showToast]);

    const handleShowEmailAuth = useCallback(() => {
      hapticLight();
      dispatch({
        type: 'SET_MODE',
        isSignUp,
        showEmailAuth: true,
      });
    }, [isSignUp]);

    const handleHideEmailAuth = useCallback(() => {
      dispatch({
        type: 'SET_MODE',
        isSignUp,
        showEmailAuth: false,
      });
    }, [isSignUp]);

    const handleCloseScanner = useCallback(() => {
      dispatch({ type: 'SET_SCANNER', visible: false });
    }, []);

    const handleScan = useCallback(
      async (data: string) => {
        hapticSuccess();
        dispatch({ type: 'SET_SCANNER', visible: false });
        const userId = await identityAPI.getMyInternalId();
        if (!userId) {
          showToast({
            message: 'Please sign in first to use QR codes',
            type: 'error',
          });
          return;
        }
        try {
          const result = await FlowResolver.resolveQR(JSON.parse(data), userId);
          if (result.outcome === 'error') {
            showToast({
              message: result.message || 'Unrecognized QR',
              type: 'error',
            });
            return;
          }
          showToast({ message: result.message, type: 'success' });
        } catch (_e) {
          showToast({ message: 'Invalid QR code format', type: 'error' });
        }
      },
      [showToast],
    );

    const handleSyncComplete = useCallback(() => {
      dispatch({ type: 'SET_SYNC_MODAL', isOpen: false });
      if (onSuccess) onSuccess();
    }, [onSuccess]);

    const handleSyncClose = useCallback(() => {
      dispatch({ type: 'SET_SYNC_MODAL', isOpen: false });
    }, []);

    const handleEmailChange = useCallback((text: string) => {
      dispatch({ type: 'SET_FIELD', field: 'email', value: text });
    }, []);

    const handlePasswordChange = useCallback((text: string) => {
      dispatch({ type: 'SET_FIELD', field: 'password', value: text });
    }, []);

    const handleEmailSubmit = useCallback(() => {
      passwordRef.current?.focus();
    }, []);

    return (
      <ScreenWrapper scroll>
        <Box className="flex-1 px-6 py-8">
          <SanctuaryBackground />
          <VStack className="w-full max-w-[460px] self-center gap-6">
            {onBack && (
              <Box className="self-start">
                <Button variant="ghost" onPress={onBack} className="pl-0">
                  <HStack className="gap-1 items-center">
                    <Text className="text-phase-secondary text-lg">←</Text>
                    <ButtonText className="text-phase-secondary text-sm">Back</ButtonText>
                  </HStack>
                </Button>
              </Box>
            )}

            <VStack className="gap-5 items-center pt-4">
              <BreathAnimation delay={100}>
                <LivingGlow
                  active
                  size={132}
                  style={{ alignItems: 'center', justifyContent: 'center' }}
                >
                  <VStack className="gap-2 items-center">
                    <Box
                      className="px-4 py-1 rounded-full border"
                      style={{
                        backgroundColor: `${accent.action}12`,
                        borderColor: `${accent.action}28`,
                      }}
                    >
                      <Text
                        className="text-[10px] font-bold tracking-[0.5px]"
                        style={{ color: accent.action }}
                      >
                        ENTER THE SANCTUARY
                      </Text>
                    </Box>
                    <Heading
                      size="3xl"
                      className="text-center font-bold tracking-[-1.2px]"
                      style={{ color: text.primary }}
                    >
                      Gurudevi
                    </Heading>
                  </VStack>
                </LivingGlow>
              </BreathAnimation>
              <BreathAnimation delay={200}>
                <Text className="text-phase-secondary text-center max-w-[320px]">
                  {t('auth.tagline') || 'Enter the Sanctuary of Learning'}
                </Text>
              </BreathAnimation>
              <HStack className="gap-2 flex-wrap justify-center">
                {ENTRY_PILLARS.map((pillar) => (
                  <Box
                    key={pillar}
                    className="px-2 py-1 rounded-full border bg-phase-surface border-phase-border"
                  >
                    <Text className="text-[10px] text-phase-secondary font-bold">{pillar}</Text>
                  </Box>
                ))}
              </HStack>
            </VStack>

            <Box
              className="p-0 overflow-hidden border-t-4 bg-phase-surface border-phase-border rounded-3xl"
              style={{ borderTopColor: accent.action }}
            >
              <VStack className="gap-6 p-6">
                <Box className="p-5 rounded-2xl bg-phase-surface/40 border border-phase-border">
                  <VStack className="gap-2">
                    <Text className="text-[10px] text-phase-muted font-bold tracking-widest uppercase">
                      SANCTUARY ENTRY
                    </Text>
                    <Heading size="sm" className="text-phase-primary">
                      {isSignUp
                        ? 'Begin with a held identity'
                        : 'Return to your learning sanctuary'}
                    </Heading>
                    <Text className="text-phase-secondary text-sm">
                      {isSignUp
                        ? 'Choose the path that feels easiest now. You can start with Google or move more slowly with email.'
                        : 'Reconnect with your profile, invitations, and saved learning flow without losing where you were.'}
                    </Text>
                  </VStack>
                </Box>

                <HStack
                  className="p-1 rounded-full items-center self-center border border-phase-border"
                  style={{ backgroundColor: `${accent.muted}20` }}
                >
                  <Button
                    variant="ghost"
                    className="px-6 py-2 rounded-full h-auto"
                    style={{
                      backgroundColor: isSignUp ? accent.action : 'transparent',
                    }}
                    onPress={handleSignUpMode}
                  >
                    <ButtonText
                      className="text-sm font-bold"
                      style={{ color: isSignUp ? '#000' : text.secondary }}
                    >
                      {t('auth.signup') || 'Sign Up'}
                    </ButtonText>
                  </Button>
                  <Button
                    variant="ghost"
                    className="px-6 py-2 rounded-full h-auto"
                    style={{
                      backgroundColor: !isSignUp ? accent.action : 'transparent',
                    }}
                    onPress={handleLoginMode}
                  >
                    <ButtonText
                      className="text-sm font-bold"
                      style={{ color: !isSignUp ? '#000' : text.secondary }}
                    >
                      {t('auth.login') || 'Log In'}
                    </ButtonText>
                  </Button>
                </HStack>

                {!showEmailAuth && (
                  <BreathAnimation delay={400}>
                    <VStack className="gap-5">
                      <VStack className="gap-1">
                        <Text className="text-[10px] text-phase-muted font-bold tracking-widest uppercase">
                          CHOOSE YOUR PATH
                        </Text>
                        <Text className="text-phase-secondary">
                          Keep moving with Google, or enter with an email and password.
                        </Text>
                      </VStack>
                      <Button
                        size="lg"
                        onPress={() => {
                          void handleGoogleSignIn();
                        }}
                        isDisabled={loading}
                        className="h-16 rounded-2xl w-full"
                        style={{ backgroundColor: accent.action }}
                      >
                        <HStack className="gap-3 items-center">
                          <Box className="p-2 rounded-full bg-white">
                            <GoogleIcon size={24} />
                          </Box>
                          <ButtonText className="text-lg font-bold" style={{ color: '#000' }}>
                            {isSignUp ? 'Sign up with Google' : t('auth.signInWithGoogle')}
                          </ButtonText>
                        </HStack>
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        onPress={() => {
                          void (isSignUp ? handlePasskeyRegister() : handlePasskeySignIn());
                        }}
                        isDisabled={loading}
                        className="h-[54px] rounded-2xl border-phase-border bg-transparent"
                      >
                        <HStack className="gap-2 items-center">
                          <Shield size={18} color={text.primary} />
                          <ButtonText className="text-phase-primary font-medium">
                            {isSignUp ? 'Create passkey' : 'Use passkey'}
                          </ButtonText>
                        </HStack>
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        onPress={handleShowEmailAuth}
                        isDisabled={loading}
                        className="h-[54px] rounded-2xl border-phase-border bg-transparent"
                      >
                        <HStack className="gap-2 items-center">
                          <Mail size={18} color={text.primary} />
                          <ButtonText className="text-phase-primary font-medium">
                            {isSignUp
                              ? t('auth.signUpWithEmail') || 'Sign up with email'
                              : t('auth.signInWithEmail') || 'Sign in with email'}
                          </ButtonText>
                        </HStack>
                      </Button>
                    </VStack>
                  </BreathAnimation>
                )}

                {showEmailAuth && (
                  <BreathAnimation delay={400}>
                    <Box className="p-6 rounded-2xl bg-phase-surface border border-phase-border">
                      <VStack className="gap-6 w-full">
                        <VStack className="gap-1">
                          <Text className="text-[10px] text-phase-muted font-bold tracking-widest uppercase">
                            EMAIL PATH
                          </Text>
                          <Heading size="md" className="text-phase-primary">
                            {isSignUp ? t('auth.createAccount') : t('auth.signInEmail')}
                          </Heading>
                        </VStack>

                        <VStack className="gap-4">
                          <Input className="rounded-xl border-phase-border bg-phase-surface">
                            <InputField
                              placeholder={t('auth.email')}
                              value={email}
                              onChangeText={handleEmailChange}
                              keyboardType="email-address"
                              autoComplete="email"
                              className="text-phase-primary"
                              placeholderTextColor={text.muted}
                              returnKeyType="next"
                              onSubmitEditing={handleEmailSubmit}
                              blurOnSubmit={false}
                            />
                          </Input>
                          <Input className="rounded-xl border-phase-border bg-phase-surface">
                            <InputField
                              ref={passwordRef}
                              placeholder={t('auth.password')}
                              value={password}
                              onChangeText={handlePasswordChange}
                              secureTextEntry
                              autoComplete={isSignUp ? 'new-password' : 'current-password'}
                              className="text-phase-primary"
                              placeholderTextColor={text.muted}
                              returnKeyType="go"
                              onSubmitEditing={() => {
                                void handleAuth();
                              }}
                            />
                          </Input>

                          <Button
                            size="lg"
                            onPress={() => {
                              void handleAuth();
                            }}
                            isDisabled={loading}
                            className="h-[56px] rounded-xl mt-2"
                            style={{ backgroundColor: accent.action }}
                          >
                            {loading ? (
                              <ButtonSpinner color="#000" />
                            ) : (
                              <ButtonText className="font-bold" style={{ color: '#000' }}>
                                {isSignUp ? t('auth.signUp') : t('auth.signIn')}
                              </ButtonText>
                            )}
                          </Button>

                          <Button
                            variant="ghost"
                            onPress={handleHideEmailAuth}
                            className="self-center"
                          >
                            <ButtonText className="text-phase-secondary text-sm">
                              {t('auth.useDifferentMethod') || 'Use a different method'}
                            </ButtonText>
                          </Button>
                          <Button
                            variant="ghost"
                            onPress={() => {
                              void handleMagicLink();
                            }}
                            isDisabled={loading}
                            className="self-center"
                          >
                            <ButtonText className="text-phase-secondary text-sm underline">
                              {t('auth.sendMagicLink') || 'Send magic link to this email'}
                            </ButtonText>
                          </Button>
                        </VStack>
                      </VStack>
                    </Box>
                  </BreathAnimation>
                )}

                {!showEmailAuth && !isSignUp && (
                  <Box
                    className="px-4 py-3 rounded-xl border"
                    style={{
                      backgroundColor: `${text.secondary}12`,
                      borderColor: `${text.secondary}28`,
                    }}
                  >
                    <Text className="text-phase-secondary text-sm">
                      You can continue as an anonymous explorer and create an account later when you
                      want your sanctuary identity to persist.
                    </Text>
                  </Box>
                )}

                {errors._form ? (
                  <Box
                    className="px-4 py-3 rounded-xl border"
                    style={{
                      backgroundColor: `${accent.danger}12`,
                      borderColor: `${accent.danger}24`,
                    }}
                  >
                    <Text className="text-sm" style={{ color: accent.danger }}>
                      {errors._form as string}
                    </Text>
                  </Box>
                ) : null}
              </VStack>
            </Box>

            <VStack className="gap-2 items-center mt-4">
              <Button variant="ghost" className="h-auto">
                <ButtonText className="text-phase-muted text-xs underline">
                  {t('auth.privacyTerms') ||
                    'Your progress is protected by our sanctuary protocols.'}
                </ButtonText>
              </Button>
            </VStack>
          </VStack>
        </Box>

        {Scanner && (
          <Scanner
            visible={showScanner}
            onClose={handleCloseScanner}
            onScan={handleScan}
            title="Scan Invite Code"
          />
        )}
        <GuestDataSyncModal
          isOpen={showSyncModal}
          userId={newUserId}
          onSyncComplete={handleSyncComplete}
          onClose={handleSyncClose}
        />
      </ScreenWrapper>
    );
  },
);

AuthScreen.displayName = 'AuthScreen';

export { AuthScreen };
export default AuthScreen;
