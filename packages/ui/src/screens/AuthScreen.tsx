import { authAPI, identityAPI } from '@repo/core/api/client';
import { handleAPIError } from '@repo/core/api/interceptor';
import { useDeviceAccounts } from '@repo/core/hooks';
import { accountPin, deepLink, getSessionIdentityMode } from '@repo/core/logic';
import { FlowResolver, GuestDataSync } from '@repo/core/native';
import {
  authorizeExistingAccountTransfer,
  beginGuestConversion,
  beginLocalGuestConversion,
  bindGuestConversionTarget,
  clearExistingAccountTransferAuthorization,
  clearGuestConversionRecord,
  discardGuestConversion,
} from '@repo/core/native/guestConversionLedger';
import { restoreLocalGuestSession } from '@repo/core/native/localGuestSession';
import { storage } from '@repo/core/storage';
import { validators } from '@repo/core/utils';
import AccountPinModal, { type AccountPinModalSubmit } from '@repo/ui/components/AccountPinModal';
import { BreathAnimation } from '@repo/ui/components/BreathAnimation';
import { default as GuestDataSyncModal } from '@repo/ui/components/GuestDataSyncModal';
import { LivingGlow } from '@repo/ui/components/LivingGlow';
import { SanctuaryBackground } from '@repo/ui/components/SanctuaryBackground';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { useTheme } from '@repo/ui/hooks/useTheme';
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
import { useActorSnapshot } from '@repo/core/hooks/useActorSnapshot';
import { createAuthOrchestrationActor } from '@repo/ui/machines/authOrchestrationMachine';
import { memo, useCallback, useMemo } from 'react';
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
const centeredGlowStyle = { alignItems: 'center', justifyContent: 'center' } as const;
const primaryActionTextStyle = { color: '#000' } as const;

interface AuthScreenProps {
  onSuccess?: () => void;
  onBack?: () => void;
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

const AuthScreen = memo(({ onSuccess, onBack, onGoogleNative, Scanner }: AuthScreenProps) => {
  const { t } = useTranslation();
  const { accent, text } = useTheme();
  const { showToast } = useSanctuaryToast();
  const renderStyles = useMemo(
    () => ({
      accentBadge: {
        backgroundColor: `${accent.action}12`,
        borderColor: `${accent.action}28`,
      },
      accentText: { color: accent.action },
      primaryText: { color: text.primary },
      accentTopBorder: { borderTopColor: accent.action },
      primaryAction: { backgroundColor: accent.action },
      formError: {
        backgroundColor: `${accent.danger}12`,
        borderColor: `${accent.danger}24`,
      },
      dangerText: { color: accent.danger },
    }),
    [accent.action, accent.danger, text.primary],
  );

  const actor = useMemo(() => createAuthOrchestrationActor(), []);
  const snapshot = useActorSnapshot(actor);
  const context = snapshot.context;
  const loading = snapshot.value === 'authenticating';
  const {
    email,
    password,
    errors,
    showScanner,
    showSyncModal,
    newUserId,
    pendingPinAccountId,
    pinError,
    usePassword,
  } = context;

  const setPendingPinAccountId = useCallback(
    (id: string | null) => {
      if (id) actor.send({ type: 'OPEN_PIN_MODAL', accountId: id });
      else actor.send({ type: 'CLOSE_PIN_MODAL' });
    },
    [actor],
  );

  const setPinError = useCallback(
    (err: string | null) => {
      actor.send({ type: 'SET_PIN_ERROR', error: err });
    },
    [actor],
  );

  const setUsePassword = useCallback(
    (_fnOrVal: boolean | ((prev: boolean) => boolean)) => {
      actor.send({ type: 'TOGGLE_PASSWORD_MODE' });
    },
    [actor],
  );

  const dispatch = useCallback(
    (action: any) => {
      switch (action.type) {
        case 'SET_FIELD':
          actor.send({ type: 'SET_FIELD', field: action.field, value: action.value });
          break;
        case 'SET_ERRORS':
          actor.send({ type: 'SET_ERRORS', errors: action.errors });
          break;
        case 'RESET_ERRORS':
          actor.send({ type: 'RESET_ERRORS' });
          break;
        case 'SET_SCANNER':
          if (action.visible) actor.send({ type: 'OPEN_SCANNER' });
          else actor.send({ type: 'CLOSE_SCANNER' });
          break;
        case 'SET_SYNC_MODAL':
          if (action.isOpen) actor.send({ type: 'OPEN_SYNC_MODAL', newUserId: context.newUserId });
          else actor.send({ type: 'CLOSE_SYNC_MODAL' });
          break;
        case 'SET_LOADING':
          if (action.loading) actor.send({ type: 'START_AUTHENTICATING' });
          else if (snapshot.value === 'authenticating')
            actor.send({ type: 'AUTH_FAILURE', error: '' });
          break;
      }
    },
    [actor, context.newUserId, snapshot.value],
  );

  const { accounts, busyAccountId, loading: accountsLoading, switchAccount } = useDeviceAccounts();

  const getRedirectUrl = useCallback(() => {
    // Mobile always uses deep link scheme
    return AuthSession.makeRedirectUri({
      scheme: 'gurudevi',
      path: 'auth/callback',
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

  const prepareGuestConversion = useCallback(
    async (session: Awaited<ReturnType<typeof authAPI.getAuthSession>>): Promise<string | null> => {
      if (getSessionIdentityMode(session) === 'anonymous' && session?.user) {
        await beginGuestConversion({ id: session.user.id, is_anonymous: true });
        return session.user.id;
      }

      const localGuest = await restoreLocalGuestSession();
      if (localGuest) {
        await beginLocalGuestConversion(localGuest.id);
        return localGuest.id;
      }
      return null;
    },
    [],
  );

  const finishSignIn = useCallback(
    async ({ guestSourceId }: { guestSourceId?: string | null }) => {
      if (guestSourceId) {
        const currentSession = await authAPI.getAuthSession();
        const targetUser = currentSession?.user;
        if (!targetUser || targetUser.is_anonymous === true) {
          throw new Error('Account conversion did not produce a durable authenticated identity.');
        }
        await bindGuestConversionTarget(guestSourceId, {
          id: targetUser.id,
          is_anonymous: false,
        });
      }
      const internalId = await identityAPI.getMyInternalId();
      if (internalId) {
        await notifyPendingInvite();
      }

      const hasGuestData = guestSourceId ? await GuestDataSync.hasGuestData(guestSourceId) : false;
      if (guestSourceId && hasGuestData && internalId) {
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
      guestSourceId: string | null,
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
          await authorizeExistingAccountTransfer(session.user.id);
          nativeResult = await authAPI.signInWithGoogleIdToken(idToken, accessToken);
        }
      } else {
        if (guestSourceId) {
          await authorizeExistingAccountTransfer(guestSourceId);
        }
        nativeResult = await authAPI.signInWithGoogleIdToken(idToken, accessToken);
      }

      if (!nativeResult?.session || !nativeResult?.user) {
        throw new Error('Native Google sign-in returned no session');
      }
      hapticSuccess();
      // The conversion source is established before sign-in. Passing it
      // keeps the guest-data scope intact so finishSignIn can
      // migrate any locally-cached guest work into the new permanent account.
      await finishSignIn({ guestSourceId });
    },
    [finishSignIn],
  );

  const signInWithBrowserOAuth = useCallback(
    async (
      provider: 'google',
      session: Awaited<ReturnType<typeof authAPI.getAuthSession>>,
      isAnon: boolean,
      guestSourceId: string | null,
    ) => {
      const redirectUrl = getRedirectUrl();
      const oauthOptions =
        isAnon && session?.user
          ? await authAPI.linkOAuthIdentity(provider, redirectUrl, true)
          : await (async () => {
              if (guestSourceId) {
                await authorizeExistingAccountTransfer(guestSourceId);
              }
              return authAPI.signInWithOAuth(provider, redirectUrl, true);
            })();

      const oauthUrl = (oauthOptions as { url?: string })?.url;
      if (!oauthUrl) {
        if (guestSourceId) {
          await clearExistingAccountTransferAuthorization(guestSourceId);
        }
        showToast({
          message: 'Could not reach Google sign-in. Please check your connection.',
          type: 'error',
        });
        return;
      }

      const authResponse = await WebBrowser.openAuthSessionAsync(oauthUrl, redirectUrl);
      if (authResponse.type === 'success' && (authResponse as any).url) {
        const result = await deepLink.handleURL((authResponse as { url: string }).url);
        if (!result.isHandled) {
          if (guestSourceId) {
            await clearExistingAccountTransferAuthorization(guestSourceId);
          }
          showToast({
            message: 'Authentication could not be completed. Please start sign-in again.',
            type: 'error',
          });
          return;
        }
        hapticSuccess();
        await finishSignIn({ guestSourceId });
      } else if (guestSourceId) {
        await clearExistingAccountTransferAuthorization(guestSourceId);
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
      const guestSourceId = await prepareGuestConversion(session);

      try {
        if (onGoogleNative) {
          await signInWithNativeGoogle(session, isAnon, guestSourceId, onGoogleNative);
        } else {
          await signInWithBrowserOAuth(provider, session, isAnon, guestSourceId);
        }
      } catch (error: any) {
        if (guestSourceId) {
          await clearExistingAccountTransferAuthorization(guestSourceId);
        }
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
    [
      showToast,
      t,
      onGoogleNative,
      prepareGuestConversion,
      signInWithNativeGoogle,
      signInWithBrowserOAuth,
    ],
  );

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
    let guestSourceId: string | null = null;
    let isAnonymousGuest = false;
    try {
      const session = await authAPI.getAuthSession().catch(() => null);
      isAnonymousGuest = getSessionIdentityMode(session) === 'anonymous';
      guestSourceId = await prepareGuestConversion(session);
      if (isAnonymousGuest && session?.user) {
        // Persist the guest scope before the email-confirmation callback so
        // the shell can recover local work after a cold process restart.
        await beginGuestConversion({ id: session.user.id, is_anonymous: true });
        await authAPI.linkAnonymousEmail(email, getRedirectUrl());
      } else {
        if (guestSourceId) {
          await authorizeExistingAccountTransfer(guestSourceId);
        }
        await authAPI.signInWithMagicLink(email);
      }
      hapticSuccess();
      showToast({
        message: isAnonymousGuest
          ? 'Check your email to secure this guest sanctuary.'
          : 'Check your email to continue. We will bring you straight into Gurudevi.',
        type: 'success',
        duration: 5000,
      });
    } catch (error: any) {
      if (guestSourceId) {
        await clearExistingAccountTransferAuthorization(guestSourceId);
      }
      hapticError();
      const apiError = handleAPIError(error);
      showToast({
        message: isAnonymousGuest
          ? 'We could not secure this email address. Try another address or sign in to an existing account.'
          : (apiError as any)?.message || 'Could not send the email. Please try again.',
        type: 'error',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  }, [email, getRedirectUrl, prepareGuestConversion, showToast, t]);

  const handlePasswordSignIn = useCallback(async () => {
    if (!email || !validators.email(email)) {
      dispatch({
        type: 'SET_ERRORS',
        errors: { email: t('auth.invalidEmail') || 'Enter a valid email' },
      });
      return;
    }
    if (!password) {
      dispatch({ type: 'SET_ERRORS', errors: { form: 'Enter your password.' } });
      return;
    }

    dispatch({ type: 'SET_LOADING', loading: true });
    hapticLight();
    let guestSourceId: string | null = null;

    try {
      const priorSession = await authAPI.getAuthSession().catch(() => null);
      guestSourceId = await prepareGuestConversion(priorSession);
      if (guestSourceId) {
        await authorizeExistingAccountTransfer(guestSourceId);
      }
      const result = await authAPI.signIn(email, password);
      if (!result.session || !result.user) {
        throw new Error('Password sign-in returned no session.');
      }
      hapticSuccess();
      await finishSignIn({ guestSourceId });
    } catch (error: any) {
      if (guestSourceId) {
        await clearExistingAccountTransferAuthorization(guestSourceId);
      }
      hapticError();
      const apiError = handleAPIError(error);
      dispatch({
        type: 'SET_ERRORS',
        errors: {
          form:
            (apiError as any)?.message ||
            'We could not sign you in with that email and password. Please try again.',
        },
      });
    } finally {
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  }, [email, finishSignIn, password, prepareGuestConversion, t]);

  const handlePasswordRecovery = useCallback(async () => {
    if (!email || !validators.email(email)) {
      dispatch({
        type: 'SET_ERRORS',
        errors: { email: t('auth.invalidEmail') || 'Enter a valid email' },
      });
      return;
    }

    dispatch({ type: 'SET_LOADING', loading: true });
    try {
      await authAPI.requestPasswordRecovery(email, getRedirectUrl());
      showToast({
        message: 'If this address has a Gurudevi account, a recovery link is on its way.',
        type: 'success',
        duration: 5000,
      });
    } catch (error: unknown) {
      const apiError = handleAPIError(error);
      showToast({
        message: (apiError as { message?: string }).message || 'Could not send the recovery email.',
        type: 'error',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  }, [email, getRedirectUrl, showToast, t]);

  const handleAccountSwitch = useCallback(
    async (accountId: string) => {
      try {
        await switchAccount(accountId);
        hapticSuccess();
      } catch (error) {
        hapticError();
        showToast({
          message: error instanceof Error ? error.message : 'Could not restore this account.',
          type: 'error',
        });
      }
    },
    [showToast, switchAccount],
  );

  const handleRememberedAccountPress = useCallback(
    async (accountId: string) => {
      try {
        if (await accountPin.hasPin(accountId)) {
          setPinError(null);
          setPendingPinAccountId(accountId);
          return;
        }
        await handleAccountSwitch(accountId);
      } catch (error) {
        showToast({
          message: error instanceof Error ? error.message : 'Could not open this account.',
          type: 'error',
        });
      }
    },
    [handleAccountSwitch, showToast],
  );

  const handlePinSubmit = useCallback(
    async (values: AccountPinModalSubmit) => {
      if (!pendingPinAccountId || !('pin' in values)) return;
      if (!(await accountPin.verifyPin(pendingPinAccountId, values.pin))) {
        setPinError('That PIN does not match this account.');
        return;
      }
      const accountId = pendingPinAccountId;
      setPendingPinAccountId(null);
      setPinError(null);
      await handleAccountSwitch(accountId);
    },
    [handleAccountSwitch, pendingPinAccountId],
  );

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

  return (
    <ScreenWrapper fullWidth scroll>
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
              <LivingGlow active size={132} style={centeredGlowStyle}>
                <VStack className="gap-2 items-center">
                  <Box className="px-4 py-1 rounded-full border" style={renderStyles.accentBadge}>
                    <Text
                      className="text-[10px] font-bold tracking-[0.5px]"
                      style={renderStyles.accentText}
                    >
                      ENTER THE SANCTUARY
                    </Text>
                  </Box>
                  <Heading
                    size="3xl"
                    className="text-center font-bold tracking-[-1.2px]"
                    style={renderStyles.primaryText}
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
            style={renderStyles.accentTopBorder}
          >
            <VStack className="gap-6 p-6">
              <Box className="p-5 rounded-2xl bg-phase-surface/40 border border-phase-border">
                <VStack className="gap-2">
                  <Text className="text-[10px] text-phase-muted font-bold tracking-widest uppercase">
                    SANCTUARY ENTRY
                  </Text>
                  <Heading size="sm" className="text-phase-primary">
                    Continue to your learning sanctuary
                  </Heading>
                  <Text className="text-phase-secondary text-sm">
                    New here? We will create your account. Returning? We will take you back to where
                    you left off.
                  </Text>
                </VStack>
              </Box>

              <BreathAnimation delay={400}>
                <VStack className="gap-5">
                  {!accountsLoading && accounts.length > 0 ? (
                    <VStack className="gap-2">
                      <Text className="text-[10px] text-phase-muted font-bold tracking-widest uppercase">
                        CONTINUE AS
                      </Text>
                      {accounts.map((account) => (
                        <Button
                          key={account.accountId}
                          variant="outline"
                          onPress={() => {
                            handleRememberedAccountPress(account.accountId).catch(() => {});
                          }}
                          isDisabled={loading || busyAccountId === account.accountId}
                          className="h-[54px] rounded-2xl border-phase-border bg-transparent"
                        >
                          <VStack className="items-start">
                            <ButtonText className="text-phase-primary font-medium">
                              {account.displayName || account.email || 'Saved account'}
                            </ButtonText>
                            {account.email ? (
                              <Text className="text-xs text-phase-secondary">{account.email}</Text>
                            ) : null}
                          </VStack>
                        </Button>
                      ))}
                    </VStack>
                  ) : null}
                  <VStack className="gap-1">
                    <Text className="text-[10px] text-phase-muted font-bold tracking-widest uppercase">
                      {accounts.length > 0 ? 'USE ANOTHER ACCOUNT' : 'ONE ACCOUNT, ONE WAY IN'}
                    </Text>
                    <Text className="text-phase-secondary">
                      Use the same email, password, or Google account every time. We handle the
                      rest.
                    </Text>
                  </VStack>
                  <Input className="rounded-xl border-phase-border bg-phase-surface">
                    <InputField
                      accessibilityLabel={t('auth.email') || 'Email address'}
                      placeholder={t('auth.email')}
                      value={email}
                      onChangeText={handleEmailChange}
                      keyboardType="email-address"
                      autoComplete="email"
                      className="text-phase-primary"
                      placeholderTextColor={text.muted}
                      returnKeyType={usePassword ? 'next' : 'go'}
                      onSubmitEditing={() => {
                        if (!usePassword) {
                          handleMagicLink().catch(() => {});
                        }
                      }}
                    />
                  </Input>
                  {usePassword ? (
                    <VStack className="gap-2">
                      <Input className="rounded-xl border-phase-border bg-phase-surface">
                        <InputField
                          accessibilityLabel="Password"
                          placeholder="Password"
                          value={password}
                          onChangeText={handlePasswordChange}
                          autoComplete="current-password"
                          secureTextEntry
                          className="text-phase-primary"
                          placeholderTextColor={text.muted}
                          returnKeyType="go"
                          onSubmitEditing={() => {
                            handlePasswordSignIn().catch(() => {});
                          }}
                        />
                      </Input>
                      <Button
                        variant="ghost"
                        size="sm"
                        onPress={() => {
                          handlePasswordRecovery().catch(() => {});
                        }}
                        isDisabled={loading}
                        className="self-start"
                      >
                        <ButtonText className="text-phase-secondary text-sm underline">
                          Forgot password?
                        </ButtonText>
                      </Button>
                    </VStack>
                  ) : null}
                  <Button
                    size="lg"
                    onPress={() => {
                      if (usePassword) {
                        handlePasswordSignIn().catch(() => {});
                      } else {
                        handleMagicLink().catch(() => {});
                      }
                    }}
                    isDisabled={loading}
                    className="h-[56px] rounded-2xl w-full"
                    style={renderStyles.primaryAction}
                  >
                    {loading ? (
                      <ButtonSpinner color="#000" />
                    ) : (
                      <ButtonText className="text-lg font-bold" style={primaryActionTextStyle}>
                        {usePassword ? 'Continue with password' : 'Continue with email'}
                      </ButtonText>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-auto self-center"
                    onPress={() => {
                      setUsePassword((current) => !current);
                      dispatch({ type: 'RESET_ERRORS' });
                    }}
                    isDisabled={loading}
                  >
                    <ButtonText className="text-phase-secondary text-sm underline">
                      {usePassword ? 'Use email verification instead' : 'Use a password instead'}
                    </ButtonText>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onPress={() => {
                      handleGoogleSignIn().catch(() => {});
                    }}
                    isDisabled={loading}
                    className="h-[54px] rounded-2xl border-phase-border bg-transparent"
                  >
                    <HStack className="gap-3 items-center">
                      <GoogleIcon size={20} />
                      <ButtonText className="text-phase-primary font-medium">
                        Continue with Google
                      </ButtonText>
                    </HStack>
                  </Button>
                </VStack>
              </BreathAnimation>

              {errors.form ? (
                <Box className="px-4 py-3 rounded-xl border" style={renderStyles.formError}>
                  <Text className="text-sm" style={renderStyles.dangerText}>
                    {errors.form as string}
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
        onSkipEmpty={clearGuestConversionRecord}
        onDiscard={discardGuestConversion}
      />
      <AccountPinModal
        isOpen={pendingPinAccountId !== null}
        mode="verify"
        accountLabel={
          accounts.find((account) => account.accountId === pendingPinAccountId)?.displayName ?? null
        }
        error={pinError}
        isLoading={pendingPinAccountId !== null && busyAccountId === pendingPinAccountId}
        onClose={() => {
          setPendingPinAccountId(null);
          setPinError(null);
        }}
        onSubmit={handlePinSubmit}
      />
    </ScreenWrapper>
  );
});

AuthScreen.displayName = 'AuthScreen';

export { AuthScreen };
export default AuthScreen;
