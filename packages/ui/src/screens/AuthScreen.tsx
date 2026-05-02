import { authAPI, identityAPI } from '@repo/core/api';
import { useIdentity } from '@repo/core/hooks';
import { coreRuntime, handleAPIError, type Role, validateForm, validators } from '@repo/core/logic';
import { FlowResolver, GuestDataSync } from '@repo/core/native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Mail } from 'lucide-react-native';
import type React from 'react';
import { useCallback, useEffect, useReducer, useRef, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BreathAnimation } from '../components/BreathAnimation';
import { default as GuestDataSyncModal } from '../components/GuestDataSyncModal';
import { LivingGlow } from '../components/LivingGlow';
import { SanctuaryBackground } from '../components/SanctuaryBackground';
import ScreenWrapper from '../components/ScreenWrapper';
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
} from '../gluestack';
import { useTheme } from '../hooks/useTheme';
import { useSanctuaryToast } from '../providers/ToastProvider';
import { hapticError, hapticLight, hapticSuccess } from '../utils/haptics';

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

const ENTRY_PILLARS = ['Self', 'Classroom', 'Community', 'Library'] as const;

interface AuthScreenProps {
  onSuccess?: () => void;
  onBack?: () => void;
  /** Start the auth screen in login mode (vs default sign-up) */
  initialMode?: 'login' | 'signup';
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
  currentUser: any;
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
  | { type: 'SET_USER'; user: any }
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
      return { ...state, currentUser: action.user };
    case 'SET_SYNC_MODAL':
      return { ...state, showSyncModal: action.isOpen };
    case 'RESET_ERRORS':
      return { ...state, errors: {} };
    default:
      return state;
  }
}

const AuthScreen = memo(({ onSuccess, onBack, initialMode, Scanner }: AuthScreenProps) => {
  const { t } = useTranslation();
  const { accent, text } = useTheme();
  const { showToast } = useSanctuaryToast();

  const initialState: AuthState = useMemo(() => ({
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
  }), [initialMode]);

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
    dispatch({ type: 'SET_USER', user: myProfile || null });
  }, [myProfile]);

  // ─── Browser callback handling ─────────────────────────────────────────────
  useEffect(() => {
    // Only run on web to avoid conflicts with deep linking handlers in Expo go
    if (coreRuntime.device.getMetadata().platform !== 'web') return;

    const getUrlParam = (name: string) => {
      const search = new URLSearchParams(window.location.search);
      if (search.has(name)) return search.get(name);
      const hashSearch = new URLSearchParams(window.location.hash.substring(1));
      return hashSearch.get(name);
    };
    const errorCode = getUrlParam('error_code');
    const errorDesc = getUrlParam('error_description');
    if (!errorCode) return;

    if (errorCode === 'identity_already_exists') {
      dispatch({ type: 'SET_MODE', isSignUp: false, showEmailAuth: true });
      setTimeout(() => {
        showToast({
          message:
            t('auth.identityAlreadyExists') ||
            'This account already exists. Please sign in instead.',
          type: 'error',
        });
      }, 300);
      try {
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState(null, '', cleanUrl);
      } catch (_) { /* ignore */ }
    } else if (errorCode) {
      setTimeout(() => {
        showToast({
          message: decodeURIComponent(errorDesc ?? errorCode).replace(/\+/g, ' '),
          type: 'error',
        });
      }, 300);
      try {
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState(null, '', cleanUrl);
      } catch (_) { /* ignore */ }
    }
  }, [t, showToast]);

  const isRealUser = currentUser?.email && !currentUser.is_anonymous;
  const shouldHideGeneralAuth = isRealUser;

  // ─── Native redirect URI (used by expo-auth-session) ───────────────────────
  const getRedirectUrl = useCallback(() => {
    if (coreRuntime.device.getMetadata().platform === 'web') {
      return window.location.origin;
    }
    return AuthSession.makeRedirectUri({
      scheme: 'gurudevi',
      path: 'auth-callback',
    });
  }, []);

  const handleOAuthSignIn = useCallback(
    async (provider: 'google') => {
      dispatch({ type: 'SET_LOADING', loading: true });
      hapticLight();

      const redirectUrl = getRedirectUrl();
      const session = await authAPI.getAuthSession().catch(() => null);
      const isAnon = session?.user?.is_anonymous || !session?.user?.email;

      // ── Web platform: classic browser-redirect flow ───────────
      if (coreRuntime.device.getMetadata().platform === 'web') {
        if (isAnon && session?.user) {
          try {
            await authAPI.linkOAuthIdentity(provider, redirectUrl);
          } catch (error: any) {
            if (error.message.includes('already linked')) {
              showToast({
                message:
                  t('auth.alreadyLinked') ||
                  'This Google account is already linked to another sanctuary soul. Please login instead.',
                type: 'error',
              });
            } else {
              handleAPIError(error);
            }
          }
          dispatch({ type: 'SET_LOADING', loading: false });
          return;
        }

        try {
          await authAPI.signInWithOAuth(provider, redirectUrl);
        } catch (error: any) {
          handleAPIError(error);
          dispatch({ type: 'SET_LOADING', loading: false });
        }
        return;
      }

      // ── Native platform: use expo-auth-session ───
      try {
        const oauthOptions =
          isAnon && session?.user
            ? await authAPI.linkOAuthIdentity(provider, redirectUrl, true)
            : await authAPI.signInWithOAuth(provider, redirectUrl, true);

        const oauthUrl = (oauthOptions as any)?.url as string | null | undefined;

        if (!oauthUrl) {
          showToast({
            message: 'Could not reach Google sign-in. Please try again.',
            type: 'error',
          });
          dispatch({ type: 'SET_LOADING', loading: false });
          return;
        }

        const authResponse = await WebBrowser.openAuthSessionAsync(oauthUrl, redirectUrl);

        if (authResponse.type === 'success' && (authResponse as any).url) {
          const url = new URL((authResponse as any).url);
          const params = Object.fromEntries(url.searchParams.entries());
          const access_token = params['access_token'] || url.hash.match(/access_token=([^&]+)/)?.[1];
          const refresh_token =
            params['refresh_token'] || url.hash.match(/refresh_token=([^&]+)/)?.[1];
          if (!access_token || !refresh_token) {
            dispatch({ type: 'SET_LOADING', loading: false });
            return;
          }

          await authAPI.setSession(access_token, refresh_token);

          hapticSuccess();
          const internalId = await identityAPI.getMyInternalId();
          if (internalId) {
            const pendingInvite = await coreRuntime.storage.getItem('pending_invite');
            if (pendingInvite) {
              try {
                const invite = JSON.parse(pendingInvite);
                if (invite.school_id) {
                  await identityAPI.updateProfile(internalId, {
                    school_id: invite.school_id,
                    role: (invite.role as Role) || 'teacher',
                  });
                  await coreRuntime.storage.removeItem('pending_invite');
                  showToast({
                    message: 'Welcome to your new school sanctuary!',
                    type: 'success',
                  });
                }
              } catch (e) {
                console.error('Failed to apply pending invite', e);
              }
            }
          }
          const hasGuestData = await GuestDataSync.hasGuestData();
          if (isAnon && hasGuestData && internalId) {
            dispatch({
              type: 'SET_FIELD',
              field: 'newUserId',
              value: internalId,
            });
            dispatch({ type: 'SET_SYNC_MODAL', isOpen: true });
          } else {
            if (onSuccess) onSuccess();
          }
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
          handleAPIError(error);
        }
      }
      dispatch({ type: 'SET_LOADING', loading: false });
    },
    [onSuccess, showToast, t, getRedirectUrl],
  );

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
        const currentSession = await authAPI.getAuthSession().catch(() => null);
        const isAnon = currentSession?.user?.is_anonymous || !currentSession?.user?.email;

        if (isAnon && currentSession?.user) {
          const existingName =
            (currentUser?.full_name && String(currentUser.full_name).trim()) || 'Sanctuary User';
          await authAPI.linkAnonymousToEmail(email, password, existingName, 'teacher' as Role);

          const internalId = await identityAPI.getMyInternalId();

          hapticSuccess();
          showToast({ message: t('auth.signupSuccess'), type: 'success' });

          // Check for guest data to sync
          const hasGuestData = await GuestDataSync.hasGuestData();
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
          showToast({ message: t('auth.checkEmail'), type: 'success' });
        }
      } else {
        await authAPI.signIn(email, password);

        hapticSuccess();
        const internalId = await identityAPI.getMyInternalId();
        if (internalId) {
          const pendingInvite = await coreRuntime.storage.getItem('pending_invite');
          if (pendingInvite) {
            try {
              const invite = JSON.parse(pendingInvite);
              if (invite.school_id) {
                await identityAPI.updateProfile(internalId, {
                  school_id: invite.school_id,
                  role: (invite.role as Role) || 'teacher',
                });
                await coreRuntime.storage.removeItem('pending_invite');
                showToast({
                  message: 'Reconnected to your school sanctuary!',
                  type: 'success',
                });
              }
            } catch (e) {
              console.error('Failed to apply pending invite', e);
            }
          }
        }
        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
      hapticError();
      const apiError = handleAPIError(error);
      showToast({
        message:
          typeof apiError === 'string'
            ? apiError
            : (apiError as any).message || 'An authentication error occurred',
        type: 'error',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  }, [email, password, isSignUp, currentUser, showToast, t, onSuccess]);

  const handleModeChange = useCallback((signUp: boolean) => {
    hapticLight();
    dispatch({ type: 'SET_MODE', isSignUp: signUp, showEmailAuth: false });
  }, []);

  const handleSignUpMode = useCallback(() => handleModeChange(true), [handleModeChange]);
  const handleLoginMode = useCallback(() => handleModeChange(false), [handleModeChange]);
  const handleGoogleSignIn = useCallback(() => handleOAuthSignIn('google'), [handleOAuthSignIn]);
  
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

  const handleScan = useCallback(async (data: string) => {
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
    const result = await FlowResolver.resolveQR(JSON.parse(data), userId);
    if (result.outcome === 'error') {
      showToast({
        message: result.message || 'Unrecognized QR',
        type: 'error',
      });
      return;
    }
    showToast({ message: result.message, type: 'success' });
  }, [showToast]);

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
                    {isSignUp ? 'Begin with a held identity' : 'Return to your learning sanctuary'}
                  </Heading>
                  <Text className="text-phase-secondary text-sm">
                    {isSignUp
                      ? 'Choose the path that feels easiest now. You can start with Google or move more slowly with email.'
                      : 'Reconnect with your profile, invitations, and saved learning flow without losing where you were.'}
                  </Text>
                </VStack>
              </Box>

              {!shouldHideGeneralAuth && (
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
              )}

              {!showEmailAuth && !shouldHideGeneralAuth && (
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
                      onPress={handleGoogleSignIn}
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
                            onSubmitEditing={handleAuth}
                          />
                        </Input>

                        <Button
                          size="lg"
                          onPress={handleAuth}
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
                      </VStack>
                    </VStack>
                  </Box>
                </BreathAnimation>
              )}

              {!shouldHideGeneralAuth && !showEmailAuth && !isSignUp && (
                <Box
                  className="px-4 py-3 rounded-xl border"
                  style={{
                    backgroundColor: `${text.secondary}12`,
                    borderColor: `${text.secondary}28`,
                  }}
                >
                  <Text className="text-phase-secondary text-sm">
                    You can still continue gently as a guest and create an account later when you
                    want your sanctuary identity to persist.
                  </Text>
                </Box>
              )}

              {errors['_form'] ? (
                <Box
                  className="px-4 py-3 rounded-xl border"
                  style={{
                    backgroundColor: `${accent.danger}12`,
                    borderColor: `${accent.danger}24`,
                  }}
                >
                  <Text className="text-sm" style={{ color: accent.danger }}>
                    {errors['_form'] as string}
                  </Text>
                </Box>
              ) : null}
            </VStack>
          </Box>

          <VStack className="gap-2 items-center mt-4">
            <Button variant="ghost" className="h-auto">
              <ButtonText className="text-phase-muted text-xs underline">
                {t('auth.privacyTerms') || 'Your progress is protected by our sanctuary protocols.'}
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
});

export { AuthScreen };
export default AuthScreen;
