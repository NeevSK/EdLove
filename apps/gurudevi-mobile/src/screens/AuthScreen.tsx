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
import { Theme, BreathAnimation, GlassCard, LivingGlow } from '@repo/ui';
import { useStore, supabase, UserRole, handleAPIError, GuestDataSync, identityAPI, authAPI } from '@repo/core';
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
    onSuccess?: () => void;
    onBack?: () => void;
    /** Start the auth screen in login mode (vs default sign-up) */
    initialMode?: 'login' | 'signup';
}

export default function AuthScreen({ onSuccess, onBack, initialMode }: AuthScreenProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showEmailAuth, setShowEmailAuth] = useState(initialMode === 'login');
    // Issue 3.1 fix: visitors landing on 'Auth' route from Welcome 'Login' should see Login form.
    const [isSignUp, setIsSignUp] = useState(initialMode !== 'login');
    const [showScanner, setShowScanner] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [showSyncModal, setShowSyncModal] = useState(false);
    const [newUserId, setNewUserId] = useState<string>('');
    const toast = useToast();
    const passwordRef = useRef<TextInput>(null);

    // Load current user from public.users via the internal identity (new architecture pattern).
    // This gives us email + is_anonymous from our own DB, not raw Supabase auth.
    React.useEffect(() => {
        identityAPI.getMyInternalId().then(async (internalId) => {
            if (!internalId) { setCurrentUser(null); return; }
            const { data } = await supabase
                .from('users')
                .select('id, email, is_anonymous, full_name')
                .eq('id', internalId)
                .maybeSingle();
            setCurrentUser(data ?? null);
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

    const isRealUser = currentUser && currentUser.email && !currentUser.is_anonymous;
    const shouldHideGeneralAuth = isRealUser;

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
        const session = await authAPI.getSession().catch(() => null);
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
                console.warn('⚠️ Auth: Missing tokens in callback URL. Params:', Array.from(hashParams.keys()));
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
                // Proactively check for pending invitations
                const userId = await identityAPI.getMyInternalId();
                if (userId) {
                    const internalId = userId;
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
                const currentSession = await authAPI.getSession().catch(() => null);
                const isAnon = currentSession?.user?.is_anonymous || !currentSession?.user?.email;

                if (isAnon && currentSession?.user) {
                    const { error } = await supabase.auth.updateUser({
                        email,
                        password,
                        data: {
                            is_anonymous: false,
                        }
                    });
                    if (error) throw error;

                    const internalId = await identityAPI.getMyInternalId();
                    if (internalId) {
                        await supabase.from('users').update({
                            email,
                            is_anonymous: false,
                        }).eq('id', internalId);
                    }

                    hapticSuccess();
                    showToast(t('auth.signupSuccess'), "success");

                    // Check for guest data to sync
                    const hasGuestData = await GuestDataSync.hasGuestData();
                    if (hasGuestData && internalId) {
                        setNewUserId(internalId);
                        setShowSyncModal(true);
                    } else {
                        if (onSuccess) onSuccess();
                    }
                } else {
                    const { data, error } = await supabase.auth.signUp({
                        email,
                        password,
                    });
                    if (error) {
                        if (error.message.includes('already registered') || error.message.includes('Email already in use') || (error as any).status === 422) {
                            showToast(t('auth.alreadyRegistered') || "You already have a sanctuary soul! Switching to login...", "success");
                            setIsSignUp(false);
                            setLoading(false);
                            return;
                        }
                        throw error;
                    }
                    hapticSuccess();
                    showToast(t('auth.checkEmail'), "success");
                }
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;

                hapticSuccess();
                const internalId = await identityAPI.getMyInternalId();
                if (internalId) {
                    // Proactively check for pending invitations
                    const pendingInvite = await AsyncStorage.getItem('pending_invite');
                    if (pendingInvite) {
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

                    {/* Back button row */}
                    {onBack && (
                        <Box sx={{ alignSelf: 'flex-start' }}>
                            <Button variant="link" onPress={onBack} sx={{ pl: 0 }}>
                                <HStack space="xs" alignItems="center">
                                    <Text color={colors.textSecondary} size="lg">←</Text>
                                    <ButtonText color={colors.textSecondary} size="sm">Back</ButtonText>
                                </HStack>
                            </Button>
                        </Box>
                    )}

                    <VStack space="md" alignItems="center">
                        <BreathAnimation delay={100}>
                            <LivingGlow active size={120} glowColor={colors.glow} style={{ alignItems: 'center', justifyContent: 'center' }}>
                                <Heading size="3xl" color={colors.action} textAlign="center" sx={{ fontFamily: '$english', fontWeight: '$bold' }}>
                                    Gurudevi
                                </Heading>
                            </LivingGlow>
                        </BreathAnimation>
                        <BreathAnimation delay={200}>
                            <Text color={colors.textSecondary} size="md" textAlign="center">
                                {t('auth.tagline') || 'Enter the Sanctuary of Learning'}
                            </Text>
                        </BreathAnimation>
                    </VStack>

                    {/* Pill toggle: Sign Up | Log In */}
                    {!shouldHideGeneralAuth && (
                        <Box sx={{
                            backgroundColor: colors.secondary,
                            borderRadius: 50,
                            padding: 4,
                            flexDirection: 'row',
                            alignSelf: 'center',
                            borderWidth: 1,
                            borderColor: colors.border,
                        }}>
                            <Pressable
                                onPress={() => { hapticLight(); setIsSignUp(true); setShowEmailAuth(false); setErrors({}); }}
                                sx={{
                                    paddingHorizontal: 24,
                                    paddingVertical: 10,
                                    borderRadius: 50,
                                    backgroundColor: isSignUp ? colors.action : 'transparent',
                                }}
                                accessibilityRole="button"
                                accessibilityState={{ selected: isSignUp }}
                            >
                                <Text
                                    size="sm"
                                    fontWeight={isSignUp ? '$bold' : '$medium'}
                                    color={isSignUp ? Theme.colors.sacredWhite : colors.textSecondary}
                                >
                                    {t('auth.signup') || 'Sign Up'}
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={() => { hapticLight(); setIsSignUp(false); setShowEmailAuth(false); setErrors({}); }}
                                sx={{
                                    paddingHorizontal: 24,
                                    paddingVertical: 10,
                                    borderRadius: 50,
                                    backgroundColor: !isSignUp ? colors.action : 'transparent',
                                }}
                                accessibilityRole="button"
                                accessibilityState={{ selected: !isSignUp }}
                            >
                                <Text
                                    size="sm"
                                    fontWeight={!isSignUp ? '$bold' : '$medium'}
                                    color={!isSignUp ? Theme.colors.sacredWhite : colors.textSecondary}
                                >
                                    {t('auth.login') || 'Log In'}
                                </Text>
                            </Pressable>
                        </Box>
                    )}

                    {!showEmailAuth && !shouldHideGeneralAuth && (
                        <BreathAnimation delay={400}>
                            <VStack space="md">
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

                                {/* Email auth entry point */}
                                <Button
                                    size="lg"
                                    variant="outline"
                                    onPress={() => { hapticLight(); setShowEmailAuth(true); }}
                                    isDisabled={loading}
                                    sx={{ borderColor: colors.border, borderRadius: Theme.corners.comfortable, height: 52 }}
                                >
                                    <HStack space="sm" alignItems="center">
                                        <Mail size={18} color={colors.text} />
                                        <ButtonText color={colors.text} fontWeight="$medium">
                                            {isSignUp ? t('auth.signUpWithEmail') || 'Sign up with email' : t('auth.signInWithEmail') || 'Sign in with email'}
                                        </ButtonText>
                                    </HStack>
                                </Button>
                            </VStack>
                        </BreathAnimation>
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

                                    <Button variant="link" onPress={() => { setShowEmailAuth(false); setErrors({}); }}>
                                        <ButtonText color={colors.textTertiary}>{t('auth.backToGoogle')}</ButtonText>
                                    </Button>
                                </VStack>
                            </GlassCard>
                        </BreathAnimation>
                    )}

                    {/* divider if needed */}
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
