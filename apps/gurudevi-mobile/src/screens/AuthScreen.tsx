import { useState, useCallback, useMemo } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  Text as RNText,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { authAPI } from '@repo/core/auth';
import { handleAPIError } from '@repo/core';
import { validators } from '@repo/core/utils';
import { useDeviceAccounts } from '@repo/core/hooks';
import { accountPin, getSessionIdentityMode } from '@repo/core/logic';
import { handleDeepLink } from '@repo/core/logic/deeplink/handleDeepLink';
import {
  authorizeExistingAccountTransfer,
  beginGuestConversion,
  beginLocalGuestConversion,
  bindGuestConversionTarget,
  clearExistingAccountTransferAuthorization,
} from '@repo/core/native/guestConversionLedger';
import { restoreLocalGuestSession } from '@repo/core/native/localGuestSession';
import { showToast } from '@repo/core/lib/feedback';
import {
  Avatar,
  Button,
  Group,
  IconButton,
  Link,
  Row,
  Surface,
  Text,
  TextField,
  useScreenGround,
} from '@repo/ui/components/native';
import { WorldEnter } from '@repo/ui/theme/native';
import { ArrowLeft } from '@repo/ui/icons/native';
import { useWorld } from '@repo/ui/theme/native';
import { EXTERNAL_URLS } from '@repo/ui/utils';
import { hapticError, hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';
import type { AccountPinModalSubmit } from '@repo/ui/components/AccountPinModal';
import { AccountPinDialog } from '@/components/pin/AccountPinDialog';
import { signInWithGoogleNative } from '@/lib/googleSignIn';

// Android requirement for deep-link completion in standalone browser
WebBrowser.maybeCompleteAuthSession();

export interface AuthScreenProps {
  onSuccess?: () => void;
  onBack?: () => void;
  onNavigateRecovery?: () => void;
}

function GoogleGlyph({ size = 18 }: { size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <RNText
        style={{
          fontSize: size * 0.7,
          fontWeight: '700',
          color: '#4285F4',
          lineHeight: size * 0.82,
        }}
      >
        G
      </RNText>
    </View>
  );
}

export default function AuthScreen({ onSuccess, onBack, onNavigateRecovery }: AuthScreenProps) {
  const { t } = useTranslation();
  const world = useWorld();
  const wt = world.tokens;
  useScreenGround('room');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [usePassword, setUsePassword] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'email' | null>(null);
  const [errorField, setErrorField] = useState<'email' | 'password' | 'form' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [pendingPinAccountId, setPendingPinAccountId] = useState<string | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);

  const { accounts, busyAccountId, loading: accountsLoading, switchAccount } = useDeviceAccounts();

  const getRedirectUrl = useCallback(() => {
    return AuthSession.makeRedirectUri({
      scheme: 'gurudevi',
      path: 'auth/callback',
    });
  }, []);

  const prepareGuestConversion = useCallback(
    async (session: Awaited<ReturnType<typeof authAPI.getAuthSession>>) => {
      if (session?.user && session.user.is_anonymous === true) {
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
      showToast('Welcome back to Gurudevi!', 'success');
      if (onSuccess) onSuccess();
    },
    [onSuccess],
  );

  // --- Google Sign-In Handler ---
  const handleGoogleSignIn = useCallback(async () => {
    setLoadingProvider('google');
    hapticLight();
    let guestSourceId: string | null = null;

    try {
      const session = await authAPI.getAuthSession().catch(() => null);
      const isAnon = getSessionIdentityMode(session) === 'anonymous';
      guestSourceId = await prepareGuestConversion(session);

      if (Platform.OS !== 'web') {
        const { idToken, accessToken } = await signInWithGoogleNative();
        let nativeResult;

        if (isAnon && session?.user) {
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
          throw new Error('Native Google sign-in returned no active session.');
        }

        hapticSuccess();
        await finishSignIn({ guestSourceId });
      } else {
        // Fallback for Web OAuth
        const redirectUrl = getRedirectUrl();
        const oauthOptions =
          isAnon && session?.user
            ? await authAPI.linkOAuthIdentity('google', redirectUrl, true)
            : await (async () => {
                if (guestSourceId) await authorizeExistingAccountTransfer(guestSourceId);
                return authAPI.signInWithOAuth('google', redirectUrl, true);
              })();

        const oauthUrl = (oauthOptions as { url?: string })?.url;
        if (!oauthUrl) throw new Error('Could not establish Google OAuth URL.');

        const authResponse = await WebBrowser.openAuthSessionAsync(oauthUrl, redirectUrl);
        if (authResponse.type === 'success' && (authResponse as any).url) {
          const result = await handleDeepLink((authResponse as { url: string }).url);
          if (!result.isHandled) throw new Error('Google OAuth deep-link could not be handled.');
          hapticSuccess();
          await finishSignIn({ guestSourceId });
        }
      }
    } catch (error: any) {
      if (guestSourceId) {
        await clearExistingAccountTransferAuthorization(guestSourceId);
      }
      hapticError();
      const apiError = handleAPIError(error);
      const msg = (apiError as any)?.message || 'Google sign-in could not be completed.';
      showToast(msg, 'error');
      setErrorMessage(msg);
      setErrorField('form');
    } finally {
      setLoadingProvider(null);
    }
  }, [finishSignIn, getRedirectUrl, prepareGuestConversion]);

  // --- Email Magic Link Handler ---
  const handleMagicLink = useCallback(async () => {
    if (!email || !validators.email(email)) {
      setErrorField('email');
      setErrorMessage(t('auth.invalidEmail') || 'Please enter a valid email address.');
      return;
    }

    setLoadingProvider('email');
    setErrorField(null);
    setErrorMessage(null);
    hapticLight();
    let guestSourceId: string | null = null;

    try {
      const session = await authAPI.getAuthSession().catch(() => null);
      const isAnon = getSessionIdentityMode(session) === 'anonymous';
      guestSourceId = await prepareGuestConversion(session);

      if (isAnon && session?.user) {
        await beginGuestConversion({ id: session.user.id, is_anonymous: true });
        await authAPI.linkAnonymousEmail(email, getRedirectUrl());
      } else {
        if (guestSourceId) {
          await authorizeExistingAccountTransfer(guestSourceId);
        }
        await authAPI.signInWithMagicLink(email);
      }

      hapticSuccess();
      showToast('Check your email! A secure login link is on its way.', 'success');
    } catch (error: any) {
      if (guestSourceId) {
        await clearExistingAccountTransferAuthorization(guestSourceId);
      }
      hapticError();
      const apiError = handleAPIError(error);
      const msg = (apiError as any)?.message || 'Could not send login link. Please try again.';
      showToast(msg, 'error');
      setErrorField('email');
      setErrorMessage(msg);
    } finally {
      setLoadingProvider(null);
    }
  }, [email, getRedirectUrl, prepareGuestConversion, t]);

  // --- Email Password Handler ---
  const handlePasswordSignIn = useCallback(async () => {
    if (!email || !validators.email(email)) {
      setErrorField('email');
      setErrorMessage(t('auth.invalidEmail') || 'Please enter a valid email address.');
      return;
    }
    if (!password) {
      setErrorField('password');
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoadingProvider('email');
    setErrorField(null);
    setErrorMessage(null);
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
        throw new Error('Sign in did not return an active session.');
      }

      hapticSuccess();
      await finishSignIn({ guestSourceId });
    } catch (error: any) {
      if (guestSourceId) {
        await clearExistingAccountTransferAuthorization(guestSourceId);
      }
      hapticError();
      const apiError = handleAPIError(error);
      const msg = (apiError as any)?.message || 'Invalid email or password.';
      showToast(msg, 'error');
      setErrorField('form');
      setErrorMessage(msg);
    } finally {
      setLoadingProvider(null);
    }
  }, [email, finishSignIn, password, prepareGuestConversion, t]);

  // --- Multi-Account Switch ---
  const handleAccountSwitch = useCallback(
    async (accountId: string) => {
      try {
        await switchAccount(accountId);
        hapticSuccess();
        if (onSuccess) onSuccess();
      } catch (err: any) {
        hapticError();
        showToast(err.message || 'Could not restore this account.', 'error');
      }
    },
    [onSuccess, switchAccount],
  );

  const handleRememberedAccountPress = useCallback(
    async (accountId: string) => {
      if (await accountPin.hasPin(accountId)) {
        setPinError(null);
        setPendingPinAccountId(accountId);
        return;
      }
      await handleAccountSwitch(accountId);
    },
    [handleAccountSwitch],
  );

  const handlePinSubmit = useCallback(
    async (values: AccountPinModalSubmit) => {
      if (!pendingPinAccountId) return;
      const pin = 'pin' in values ? values.pin : values.currentPin;
      const ok = await accountPin.verifyPin(pendingPinAccountId, pin);
      if (!ok) {
        setPinError('Incorrect PIN. Please try again.');
        return;
      }
      const accId = pendingPinAccountId;
      setPendingPinAccountId(null);
      await handleAccountSwitch(accId);
    },
    [handleAccountSwitch, pendingPinAccountId],
  );

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoid}
        >
          {/* Top Bar with Back Button */}
          <View style={styles.topBar}>
            {onBack ? (
              <IconButton
                icon={ArrowLeft}
                label="Go back"
                variant="quiet"
                size="md"
                onPress={onBack}
              />
            ) : (
              <View style={{ width: 44, height: 44 }} />
            )}

            <View style={[styles.brandBadge, { backgroundColor: wt.raised, borderColor: wt.line }]}>
              <View style={[styles.brandDot, { backgroundColor: wt.lamp }]} />
              <Text kind="caption" tone="soft" style={styles.brandBadgeText}>
                Gurudevi
              </Text>
            </View>

            <View style={{ width: 44, height: 44 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header copy */}
            <View style={styles.headerStack}>
              <Text kind="display" align="center" tone="ink">
                Sign in to Gurudevi
              </Text>
              <Text kind="body" align="center" tone="soft" style={styles.subtitle}>
                One account unlocks your learning sanctuary across all your devices.
              </Text>
            </View>

            {/* Remembered Device Accounts */}
            {!accountsLoading && accounts.length > 0 ? (
              <WorldEnter index={0}>
                <Group label="Continue as">
                  {accounts.map((account) => {
                    const name = account.displayName || account.email || 'Saved account';
                    return (
                      <Row
                        key={account.accountId}
                        label={name}
                        detail={account.displayName ? (account.email ?? undefined) : undefined}
                        accessory={<Avatar name={name} size="sm" />}
                        chevron
                        onPress={
                          busyAccountId
                            ? undefined
                            : () => handleRememberedAccountPress(account.accountId)
                        }
                      />
                    );
                  })}
                </Group>
              </WorldEnter>
            ) : null}

            {/* Primary Sign-In Card */}
            <WorldEnter index={1}>
              <Surface tone="raised" style={styles.authCard}>
                {/* Google Native Action */}
                <Button
                  label="Continue with Google"
                  icon={GoogleGlyph}
                  variant="secondary"
                  size="lg"
                  fullWidth
                  loading={loadingProvider === 'google'}
                  onPress={handleGoogleSignIn}
                />

                {/* Or Divider */}
                <View style={styles.dividerRow}>
                  <View style={[styles.dividerLine, { backgroundColor: wt.line }]} />
                  <Text kind="caption" tone="faint" style={styles.dividerText}>
                    or with email
                  </Text>
                  <View style={[styles.dividerLine, { backgroundColor: wt.line }]} />
                </View>

                {/* Email & Password Form */}
                <View style={styles.formFields}>
                  <TextField
                    label="Email address"
                    value={email}
                    onChangeText={(val) => {
                      setEmail(val);
                      if (errorField === 'email') setErrorField(null);
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    error={errorField === 'email' ? (errorMessage ?? undefined) : undefined}
                    placeholder="you@school.lk or personal"
                  />

                  {usePassword ? (
                    <View style={{ gap: 8 }}>
                      <TextField
                        label="Password"
                        value={password}
                        onChangeText={(val) => {
                          setPassword(val);
                          if (errorField === 'password') setErrorField(null);
                        }}
                        secureTextEntry
                        autoComplete="current-password"
                        error={errorField === 'password' ? (errorMessage ?? undefined) : undefined}
                        placeholder="Enter your password"
                      />

                      {onNavigateRecovery ? (
                        <View style={{ alignSelf: 'flex-end', paddingTop: 2 }}>
                          <Link label="Forgot password?" onPress={onNavigateRecovery} />
                        </View>
                      ) : null}
                    </View>
                  ) : null}

                  {errorField === 'form' && errorMessage ? (
                    <Text kind="caption" tone="danger" align="center">
                      {errorMessage}
                    </Text>
                  ) : null}

                  {/* Primary Submit */}
                  <Button
                    label={usePassword ? 'Sign In with Password' : 'Send Magic Link'}
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={loadingProvider === 'email'}
                    onPress={usePassword ? handlePasswordSignIn : handleMagicLink}
                  />

                  {/* Password / Magic Link Mode Toggle */}
                  <Button
                    label={
                      usePassword
                        ? 'Email me a magic link instead'
                        : 'Sign in with password instead'
                    }
                    variant="quiet"
                    size="sm"
                    fullWidth
                    onPress={() => {
                      setUsePassword(!usePassword);
                      setErrorField(null);
                      setErrorMessage(null);
                    }}
                  />
                </View>
              </Surface>
            </WorldEnter>

            {/* Privacy & Terms Footnote */}
            <View style={styles.footer}>
              <Text kind="caption" tone="faint" align="center">
                Your keys remain on your device. Powered by PowerSync & Supabase Auth.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Account PIN verification modal */}
      <AccountPinDialog
        isOpen={Boolean(pendingPinAccountId)}
        mode="verify"
        accountLabel={
          accounts.find((a) => a.accountId === pendingPinAccountId)?.displayName ?? null
        }
        error={pinError}
        onClose={() => setPendingPinAccountId(null)}
        onSubmit={handlePinSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 9999,
    borderWidth: 1,
  },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  brandBadgeText: {
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 20,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  headerStack: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
  },
  subtitle: {
    maxWidth: 340,
  },
  accountsCard: {
    padding: 16,
    gap: 12,
  },
  accountsList: {
    gap: 8,
  },
  accountRow: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  authCard: {
    padding: 20,
    gap: 16,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  formFields: {
    gap: 14,
  },
  underlined: {
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  footer: {
    paddingTop: 8,
    alignItems: 'center',
  },
});
