import React, { useState, useRef } from 'react';
import {
    Box,
    VStack,
    Input,
    InputField,
    Button,
    ButtonText,
    Text,
    Heading,
    useToast,
    Toast,
    ToastTitle,
    Center,
    HStack,
    Pressable,
    Divider,
    Spinner,
    useThemedColors,
    hapticLight,
    hapticSuccess,
    hapticError,
    ScreenWrapper,
    GuestDataSyncModal,
} from '@repo/ui';
import { Mail } from 'lucide-react-native';
import { Platform, type TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { supabase, UserRole, handleAPIError, GuestDataSync, identityAPI } from '@repo/core';
import { Theme, BreathAnimation, GlassCard, LivingGlow } from '@repo/ui';
import { validators, validateForm } from '../utils/validators';
import { ScannerModal, resolveQR } from '@repo/scanner-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

// Required for expo-auth-session to complete the auth session on Android
// (handles the Chrome Custom Tab callback redirect)
WebBrowser.maybeCompleteAuthSession();

// Google 'G' icon rendered with plain RN — no react-native-svg needed
const GoogleIcon = ({ size = 20 }: { size?: number }) => (
    <Box style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    }}>
        <Text style={{
            fontSize: size * 0.65,
            fontWeight: '700',
            color: '#4285F4',
            lineHeight: size * 0.75,
        }}>G</Text>
    </Box>
);

interface AuthScreenProps {
    onboardingData?: { name: string; role: UserRole };
    isAnonymous?: boolean;
    onContinueAsGuest?: () => void;
    onSuccess?: () => void;
    /** Start the auth screen in login mode (vs default sign-up) */
    initialMode?: 'login' | 'signup';
}

export default function AuthScreen({ onboardingData, isAnonymous = false, onContinueAsGuest, onSuccess, initialMode }: AuthScreenProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showEmailAuth, setShowEmailAuth] = useState(false);
    // Issue 3.1 fix: new unauthenticated visitors should land on Sign Up, not Login.
    // But if initialMode='login' is passed (e.g. from identity_already_exists redirect), start on Login.
    const [isSignUp, setIsSignUp] = useState(initialMode !== 'login');
    const [showScanner, setShowScanner] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [showSyncModal, setShowSyncModal] = useState(false);
    const [newUserId, setNewUserId] = useState<string>('');
    const toast = useToast();
    const passwordRef = useRef<TextInput>(null);

    React.useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setCurrentUser(user);
        });
    }, []);

    // ── Web: detect Supabase OAuth error params in URL hash/query ────────────
    // e.g. ?error=server_error&error_code=identity_already_exists&...
    // Supabase redirects back with these params when an identity is already linked.
    React.useEffect(() => {
        if (Platform.OS !== 'web') return;
        const fullUrl = window.location.href;
        const getUrlParam = (name: string) => {
            // Search both the query string and the hash fragment
            const fromQuery = new URLSearchParams(window.location.search).get(name);
            if (fromQuery) return fromQuery;
            const hashSearch = new URLSearchParams(window.location.hash.replace(/^#/, ''));
            return hashSearch.get(name);
        };
        const errorCode = getUrlParam('error_code');
        const errorDesc = getUrlParam('error_description');
        if (!errorCode) return;

        if (errorCode === 'identity_already_exists') {
            // Switch to login tab and show a helpful message
            setIsSignUp(false);
            setShowEmailAuth(true);
            // Decode and surface the message after a short delay so AuthScreen has mounted
            setTimeout(() => {
                showToast(
                    t('auth.identityAlreadyExists') ||
                    'This account already exists. Please sign in instead.',
                    'error'
                );
            }, 300);
            // Clean the error params from the URL without triggering a reload
            try {
                const cleanUrl = window.location.origin + window.location.pathname;
                window.history.replaceState(null, '', cleanUrl);
            } catch (_) { /* ignore */ }
        } else if (errorCode) {
            setTimeout(() => {
                showToast(
                    decodeURIComponent(errorDesc ?? errorCode).replace(/\+/g, ' '),
                    'error'
                );
            }, 300);
            try {
                const cleanUrl = window.location.origin + window.location.pathname;
                window.history.replaceState(null, '', cleanUrl);
            } catch (_) { /* ignore */ }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [t]);

    const isRealUser = currentUser && currentUser.email && !currentUser.email.includes('anonymous');
    const shouldHideGeneralAuth = onboardingData && isRealUser;

    // ─── Native redirect URI (used by expo-auth-session) ───────────────────────
    // On web we keep the existing browser-redirect approach.
    // On native (iOS/Android) we use makeRedirectUri so the OS routes the callback
    // back into the app without leaving to an external browser.
    const getRedirectUrl = () => {
        if (Platform.OS === 'web') {
            return window.location.origin;
        }
        return AuthSession.makeRedirectUri({
            scheme: 'gurudevi',
            path: 'auth/callback',
        });
    };

    async function handleOAuthSignIn(provider: 'google') {
        setLoading(true);
        hapticLight();

        const redirectUrl = getRedirectUrl();
        const { data: { session } } = await supabase.auth.getSession();
        const isAnon = session?.user?.is_anonymous || !session?.user?.email;

        console.log('🚀 Auth: handleOAuthSignIn', { provider, isAnon, redirectUrl });

        // ── Web platform: fall back to classic browser-redirect flow ───────────
        if (Platform.OS === 'web') {
            if (isAnon && session?.user) {
                const { error } = await supabase.auth.linkIdentity({
                    provider,
                    options: { redirectTo: redirectUrl },
                });
                if (error) {
                    if (error.message.includes('already linked')) {
                        showToast(t('auth.alreadyLinked') || 'This Google account is already linked to another sanctuary soul. Please login instead.', 'error');
                    } else {
                        handleAPIError(error);
                    }
                    setLoading(false);
                }
                return;
            }
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: redirectUrl,
                    queryParams: { prompt: 'select_account' }
                },
            });
            if (error) { handleAPIError(error); setLoading(false); }
            return;
        }

        // ── Native platform: use expo-auth-session for native account picker ───
        // Step 1: Ask Supabase for the OAuth URL without opening the browser
        const oauthOptions = isAnon && session?.user
            ? await supabase.auth.linkIdentity({
                provider,
                options: {
                    redirectTo: redirectUrl,
                    skipBrowserRedirect: true,
                    queryParams: { prompt: 'select_account' }
                },
            })
            : await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: redirectUrl,
                    skipBrowserRedirect: true,
                    queryParams: { prompt: 'select_account' }
                },
            });

        const oauthError = oauthOptions.error;
        const oauthUrl = (oauthOptions.data as any)?.url as string | null | undefined;

        if (oauthError) {
            if (oauthError.message.includes('already linked')) {
                showToast(t('auth.alreadyLinked') || 'This Google account is already linked to another sanctuary soul. Please login instead.', 'error');
            } else {
                handleAPIError(oauthError);
            }
            setLoading(false);
            return;
        }

        if (!oauthUrl) {
            showToast('Could not reach Google sign-in. Please try again.', 'error');
            setLoading(false);
            return;
        }

        // Step 2: Open the OAuth URL in a WebBrowser session — this triggers
        //         the native Google Account Picker (ASWebAuthenticationSession
        //         on iOS, Chrome Custom Tabs on Android).
        const result = await WebBrowser.openAuthSessionAsync(oauthUrl, redirectUrl);
        console.log('🔁 Auth: WebBrowser result', result.type);

        if (result.type !== 'success') {
            // User cancelled or browser was dismissed
            setLoading(false);
            return;
        }

        // Step 3: Extract tokens from the callback URL fragment and set session
        try {
            const callbackUrl = result.url;
            // Tokens are in the URL hash: #access_token=...&refresh_token=...
            const hashParams = new URLSearchParams(
                callbackUrl.includes('#') ? callbackUrl.split('#')[1] : callbackUrl.split('?')[1]
            );
            const access_token = hashParams.get('access_token');
            const refresh_token = hashParams.get('refresh_token');

            if (!access_token || !refresh_token) {
                throw new Error('Missing tokens in callback URL');
            }

            const { error: sessErr } = await supabase.auth.setSession({
                access_token,
                refresh_token,
            });

            if (sessErr) {
                handleAPIError(sessErr);
            } else {
                hapticSuccess();
                // Proactively check for pending invitations or onboarding data
                const user = (await supabase.auth.getUser()).data.user;
                if (user) {
                    const internalId = await identityAPI.getMyInternalId();
                    const pendingInvite = await AsyncStorage.getItem('pending_invite');
                    if (pendingInvite && internalId) {
                        try {
                            const invite = JSON.parse(pendingInvite);
                            if (invite.school_id) {
                                await supabase.from('users').update({ school_id: invite.school_id, role: invite.role || 'teacher' }).eq('id', internalId);
                                await AsyncStorage.removeItem('pending_invite');
                                showToast('Welcome to your new school sanctuary!', 'success');
                            }
                        } catch (e) {
                            console.error('Failed to apply pending invite', e);
                        }
                    }

                    if (onboardingData && internalId) {
                        try {
                            await supabase.from('users').update({
                                full_name: onboardingData.name,
                                role: onboardingData.role,
                                profile_completed: true
                            }).eq('id', internalId);
                        } catch (e) {
                            console.error('Failed to apply onboarding data', e);
                        }
                    }
                }
                if (onSuccess) onSuccess();
            }
        } catch (err: any) {
            console.error('❌ Auth: Session completion error', err);
            showToast('Sign-in failed — please try again.', 'error');
        } finally {
            setLoading(false);
        }
    }

    async function handleAuth() {
        const { isValid, errors: valErrors } = validateForm({ email, password }, {
            email: validators.email,
            password: (val: string) => validators.nonEmpty(val, 'Password')
        });

        if (!isValid) {
            setErrors(valErrors);
            return;
        }

        setLoading(true);
        try {
            if (isSignUp) {
                const { data: { session: currentSession } } = await supabase.auth.getSession();
                const isAnon = currentSession?.user?.is_anonymous || !currentSession?.user?.email;

                if (isAnon && currentSession?.user) {
                    const { error } = await supabase.auth.updateUser({
                        email,
                        password,
                        data: {
                            full_name: onboardingData?.name || 'Gurudevi User',
                            role: onboardingData?.role || 'teacher',
                        }
                    });
                    if (error) throw error;
                    hapticSuccess();
                    showToast(t('auth.signupSuccess'), "success");

                    // Check for guest data to sync
                    const hasGuestData = await GuestDataSync.hasGuestData();
                    if (hasGuestData) {
                        const internalId = await identityAPI.getMyInternalId();
                        if (internalId) {
                            setNewUserId(internalId);
                            setShowSyncModal(true);
                        } else {
                            if (onSuccess) onSuccess();
                        }
                    } else {
                        if (onSuccess) onSuccess();
                    }
                } else {
                    const { data, error } = await supabase.auth.signUp({
                        email,
                        password,
                        options: {
                            data: {
                                full_name: onboardingData?.name || 'Gurudevi User',
                                role: onboardingData?.role || 'teacher',
                            }
                        }
                    });
                    if (error) {
                        if (error.message.includes('already registered')) {
                            showToast(t('auth.alreadyRegistered') || "You already have a sanctuary soul! Switching to login...", "success");
                            setIsSignUp(false);
                            setLoading(false);
                            return;
                        }
                        throw error;
                    }
                    hapticSuccess();
                    showToast(t('auth.checkEmail'), "success");

                    // Note: For new signups, sync will happen after email confirmation
                    // You may want to trigger sync in the email confirmation callback
                }
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;

                // Proactively check for pending invitations
                const user = data.user;
                if (user) {
                    const internalId = await identityAPI.getMyInternalId();
                    const pendingInvite = await AsyncStorage.getItem('pending_invite');
                    if (pendingInvite && internalId) {
                        try {
                            const invite = JSON.parse(pendingInvite);
                            if (invite.school_id) {
                                await supabase.from('users').update({ school_id: invite.school_id, role: invite.role || 'teacher' }).eq('id', internalId);
                                await AsyncStorage.removeItem('pending_invite');
                                showToast('Reconnected to your school sanctuary!', 'success');
                            }
                        } catch (e) {
                            console.error('Failed to apply pending invite', e);
                        }
                    }
                }

                hapticSuccess();
                if (onSuccess) onSuccess();
            }
        } catch (error: any) {
            handleAPIError(error);
        } finally {
            setLoading(false);
        }
    }

    function showToast(message: string, action: "error" | "success") {
        toast.show({
            placement: "bottom",
            render: ({ id }: { id: string }) => (
                <Toast nativeID={id} action={action} variant="solid">
                    <ToastTitle>{message}</ToastTitle>
                </Toast>
            ),
        });
    }

    return (
        <ScreenWrapper scroll>
            <Center sx={{ flex: 1, paddingVertical: 40, paddingHorizontal: 24, backgroundColor: colors.primary }}>
                <VStack space="4xl" sx={{ width: '100%', maxWidth: 400 }}>
                    <VStack space="md" alignItems="center">
                        <BreathAnimation delay={100}>
                            <LivingGlow active size={120} glowColor={colors.glow} style={{ alignItems: 'center', justifyContent: 'center' }}>
                                <Heading size="3xl" color={colors.action} textAlign="center" sx={{ fontFamily: '$english', fontWeight: '$bold' }}>
                                    {onboardingData ? t('auth.saveSanctuary') : "Gurudevi"}
                                </Heading>
                            </LivingGlow>
                        </BreathAnimation>
                        <BreathAnimation delay={200}>
                            <Text color={colors.textSecondary} size="md" textAlign="center">
                                {onboardingData
                                    ? t('auth.upgradePrompt')
                                    : t('auth.tagline') || 'Enter the Sanctuary of Learning'}
                            </Text>
                        </BreathAnimation>
                    </VStack>


                    {!showEmailAuth && !shouldHideGeneralAuth && (
                        <BreathAnimation delay={400}>
                            <VStack space="xl">
                                <Button
                                    size="xl"
                                    onPress={() => handleOAuthSignIn('google')}
                                    isDisabled={loading}
                                    sx={{
                                        backgroundColor: colors.action,
                                        borderRadius: Theme.corners.comfortable,
                                        height: 64,
                                        elevation: 4,
                                        width: '100%'
                                    }}
                                >
                                    <HStack space="md" alignItems="center">
                                        <Box sx={{ p: '$2', backgroundColor: Theme.colors.sacredWhite, borderRadius: Theme.corners.full }}>
                                            <GoogleIcon size={24} />
                                        </Box>
                                        <ButtonText color={Theme.colors.sacredWhite} fontWeight="$bold" size="lg">
                                            {isSignUp ? "Sign up with Google" : t('auth.signInWithGoogle')}
                                        </ButtonText>
                                    </HStack>
                                </Button>
                            </VStack>
                        </BreathAnimation>
                    )}

                    {isRealUser && onboardingData && onContinueAsGuest && (
                        <VStack space="xl">
                            <Button
                                size="xl"
                                onPress={onContinueAsGuest}
                                isDisabled={loading}
                                sx={{
                                    backgroundColor: colors.action,
                                    borderRadius: Theme.corners.comfortable,
                                    height: 64,
                                }}
                            >
                                <ButtonText color={Theme.colors.sacredWhite} fontWeight="$bold" size="lg">
                                    Finish Setup
                                </ButtonText>
                            </Button>
                            <Text color={colors.textSecondary} textAlign="center" size="sm">
                                You are signed in as {currentUser?.email}.
                            </Text>
                        </VStack>
                    )}

                    {showEmailAuth && (
                        <BreathAnimation delay={400}>
                            <GlassCard style={{ padding: 24, borderRadius: Theme.corners.generous }}>
                                <VStack space="lg" sx={{ width: '100%' }}>
                                    <Heading size="md" color={colors.text} mb="$2">
                                        {isSignUp ? t('auth.createAccount') : t('auth.signInEmail')}
                                    </Heading>

                                    <Input variant="outline" size="lg" sx={{ borderRadius: Theme.corners.comfortable, backgroundColor: colors.secondary }}>
                                        <InputField
                                            placeholder={t('auth.email')}
                                            value={email}
                                            onChangeText={setEmail}
                                            keyboardType="email-address"
                                            autoComplete="email"
                                            textContentType="emailAddress"
                                            returnKeyType="next"
                                            onSubmitEditing={() => passwordRef.current?.focus()}
                                            blurOnSubmit={false}
                                        />
                                    </Input>

                                    <Input variant="outline" size="lg" sx={{ borderRadius: Theme.corners.comfortable, backgroundColor: colors.secondary }}>
                                        <InputField
                                            ref={passwordRef}
                                            placeholder={t('auth.password')}
                                            value={password}
                                            onChangeText={setPassword}
                                            secureTextEntry
                                            autoComplete={isSignUp ? 'new-password' : 'current-password'}
                                            textContentType={isSignUp ? 'newPassword' : 'password'}
                                            returnKeyType="go"
                                            onSubmitEditing={handleAuth}
                                        />
                                    </Input>

                                    <Button
                                        size="lg"
                                        onPress={handleAuth}
                                        isDisabled={loading}
                                        sx={{ backgroundColor: colors.action, borderRadius: Theme.corners.comfortable, mt: '$2' }}
                                    >
                                        <ButtonText color={Theme.colors.sacredWhite} fontWeight="$bold">
                                            {loading ? t('auth.processing') : (isSignUp ? t('auth.signup') : t('auth.login'))}
                                        </ButtonText>
                                    </Button>

                                    <Button variant="link" onPress={() => setShowEmailAuth(false)}>
                                        <ButtonText color={colors.textTertiary}>{t('auth.backToGoogle')}</ButtonText>
                                    </Button>
                                </VStack>
                            </GlassCard>
                        </BreathAnimation>
                    )}

                    {(!currentUser || currentUser?.is_anonymous) && isAnonymous && onContinueAsGuest && (
                        <VStack space="md" alignItems="center" mt="$4">
                            <Divider sx={{ width: '60%', backgroundColor: colors.border, mb: '$4' }} />
                            <Button
                                variant="solid"
                                onPress={() => {
                                    hapticLight();
                                    if (onContinueAsGuest) onContinueAsGuest();
                                }}
                                sx={{
                                    backgroundColor: 'transparent',
                                    borderWidth: 1,
                                    borderColor: colors.action,
                                    borderRadius: Theme.corners.comfortable,
                                    width: '100%',
                                    height: 50
                                }}
                            >
                                <ButtonText color={colors.action} fontWeight="$bold">{t('auth.continueAsGuest')}</ButtonText>
                            </Button>
                        </VStack>
                    )}
                </VStack>
            </Center>

            <ScannerModal
                visible={showScanner}
                onClose={() => setShowScanner(false)}
                onScan={async (data) => {
                    hapticSuccess();
                    setShowScanner(false);
                    const result = resolveQR(data);
                    if (!result.ok) {
                        showToast('Unrecognized QR — try a Gurudevi invite code', 'error');
                        return;
                    }
                    const { payload } = result;
                    switch (payload.action) {
                        case 'user_invite':
                            await AsyncStorage.setItem(
                                'pending_invite',
                                JSON.stringify({ inviter_id: payload.inviter_id, inviter_role: payload.inviter_role }),
                            );
                            showToast('Invited by a Gurudevi member — sign up to connect!', 'success');
                            break;
                        case 'claim_invite':
                            await AsyncStorage.setItem(
                                'pending_invite',
                                JSON.stringify({ invite_code: payload.invite_code, school_id: payload.school_id, role: payload.role }),
                            );
                            showToast(`School invite scanned — sign up to join as ${payload.role}!`, 'success');
                            break;
                        case 'thuthimal_gift':
                            await AsyncStorage.setItem(
                                'pending_thuthimal_claim',
                                JSON.stringify({ gift_token: payload.gift_token, gifter_name: payload.gifter_name }),
                            );
                            showToast('Gift QR scanned — sign in to claim your Thuthimal!', 'success');
                            break;
                        case 'join_school':
                        case 'join_class':
                        case 'join_group':
                            await AsyncStorage.setItem('pending_qr_action', JSON.stringify(payload));
                            showToast('QR scanned — sign in to join!', 'success');
                            break;
                        default:
                            showToast('Sign in first, then scan this QR inside the app.', 'success');
                    }
                }}
                title="Scan Invite Code"
            />
            <GuestDataSyncModal
                isOpen={showSyncModal}
                userId={newUserId}
                onSyncComplete={() => {
                    setShowSyncModal(false);
                    if (onSuccess) onSuccess();
                }}
                onClose={() => {
                    setShowSyncModal(false);
                }}
            />
        </ScreenWrapper>
    );
}
