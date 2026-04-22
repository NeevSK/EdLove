import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
    Box,
    VStack,
    Input,
    InputField,
    Button,
    ButtonText,
    Text,
    Heading,
    Center,
    HStack,
    Pressable,
    Divider,
    Spinner,
    InputSlot,
    InputIcon,
    ButtonSpinner,
} from '../gluestack';
import { useTheme } from '../hooks/useTheme';
import { useSanctuaryToast } from '../providers/ToastProvider';
import { hapticLight, hapticSuccess, hapticError } from '../utils/haptics';
import ScreenWrapper from '../components/ScreenWrapper';
import { default as GuestDataSyncModal } from '../components/GuestDataSyncModal';
import { Mail, Eye, EyeOff, Chrome } from 'lucide-react-native';
import { Platform, type TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Theme } from '../theme/Theme';
import { BreathAnimation } from '../components/BreathAnimation';
import { LivingGlow } from '../components/LivingGlow';
import { SanctuaryBackground } from '../components/SanctuaryBackground';
import { Role, handleAPIError, validators, validateForm } from '@repo/core/logic';
import { supabase, GuestDataSync, identityAPI, authAPI, FlowResolver } from '@repo/core/native';
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

const ENTRY_PILLARS = ['Self', 'Classroom', 'Community', 'Library'];

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

export default function AuthScreen({ onSuccess, onBack, initialMode, Scanner }: AuthScreenProps) {
    const { t } = useTranslation();
    const { accent, text, glow } = useTheme();
    const { showToast } = useSanctuaryToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showEmailAuth, setShowEmailAuth] = useState(initialMode === 'login');
    const [isSignUp, setIsSignUp] = useState(initialMode !== 'login');
    const [showScanner, setShowScanner] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [showSyncModal, setShowSyncModal] = useState(false);
    const [newUserId, setNewUserId] = useState<string>('');
    const syncCheckDoneRef = useRef(false);
    const passwordRef = useRef<TextInput>(null);

    // Load current user from public.users via the internal identity (new architecture pattern).
    // This gives us email + is_anonymous from our own DB, not raw Supabase auth.
    useEffect(() => {
        identityAPI.getMyInternalId().then(async (internalId) => {
            if (!internalId) { setCurrentUser(null); return; }
            const { data } = await supabase
                .from('users')
                .select('id, email, is_anonymous, full_name')
                .eq('id', internalId)
                .maybeSingle();
            if (data) setCurrentUser(data);
        });
    }, []);

    // ─── Browser callback handling ─────────────────────────────────────────────
    // For web and mobile (via redirected app protocols), we check the URL for tokens
    // which signifies a successful OAuth return.
    useEffect(() => {
        // Only run on web to avoid conflicts with deep linking handlers in Expo go
        if (Platform.OS !== 'web') return;

        const hashParams = new URL(window.location.href.replace('#', '?')).searchParams;
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
            // Switch to login tab and show a helpful message
            setIsSignUp(false);
            setShowEmailAuth(true);
            // Decode and surface the message after a short delay so AuthScreen has mounted
            setTimeout(() => {
                showToast({
                    message: t('auth.identityAlreadyExists') || 'This account already exists. Please sign in instead.',
                    type: 'error'
                });
            }, 300);
            // Clean the error params from the URL without triggering a reload
            try {
                const cleanUrl = window.location.origin + window.location.pathname;
                window.history.replaceState(null, '', cleanUrl);
            } catch (_) { /* ignore */ }
        } else if (errorCode) {
            setTimeout(() => {
                showToast({
                    message: decodeURIComponent(errorDesc ?? errorCode).replace(/\+/g, ' '),
                    type: 'error'
                });
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

        // ── Web platform: classic browser-redirect flow ───────────
        if (Platform.OS === 'web') {
            if (isAnon && session?.user) {
                const { error } = await supabase.auth.linkIdentity({
                    provider,
                    options: { redirectTo: redirectUrl },
                });
                if (error) {
                    if (error.message.includes('already linked')) {
                        showToast({
                            message: t('auth.alreadyLinked') || 'This Google account is already linked to another sanctuary soul. Please login instead.',
                            type: 'error'
                        });
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

        // ── Native platform: use expo-auth-session ───
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
                showToast({
                    message: t('auth.alreadyLinked') || 'This Google account is already linked to another sanctuary soul. Please login instead.',
                    type: 'error'
                });
            } else {
                handleAPIError(oauthError);
            }
            setLoading(false);
            return;
        }

        if (!oauthUrl) {
            showToast({
                message: 'Could not reach Google sign-in. Please try again.',
                type: 'error'
            });
            setLoading(false);
            return;
        }

        const authResponse = await WebBrowser.openAuthSessionAsync(oauthUrl, redirectUrl);

        if (authResponse.type === 'success' && (authResponse as any).url) {
            const url = new URL((authResponse as any).url);
            const params = Object.fromEntries(url.searchParams.entries());
            const access_token = params.access_token || url.hash.match(/access_token=([^&]+)/)?.[1];
            const refresh_token = params.refresh_token || url.hash.match(/refresh_token=([^&]+)/)?.[1];
            if (!access_token || !refresh_token) {
                setLoading(false);
                return;
            }

            const { error: sessErr } = await supabase.auth.setSession({
                access_token,
                refresh_token,
            });

            if (sessErr) {
                handleAPIError(sessErr);
            } else {
                hapticSuccess();
                const userId = await identityAPI.getMyInternalId();
                if (userId) {
                    const internalId = userId;
                    const pendingInvite = await AsyncStorage.getItem('pending_invite');
                    if (pendingInvite && internalId) {
                        try {
                            const invite = JSON.parse(pendingInvite);
                            if (invite.school_id) {
                                await supabase.from('users').update({ school_id: invite.school_id, role: (invite.role as Role) || 'teacher' }).eq('id', internalId);
                                await AsyncStorage.removeItem('pending_invite');
                                showToast({
                                    message: 'Welcome to your new school sanctuary!',
                                    type: 'success'
                                });
                            }
                        } catch (e) {
                            console.error('Failed to apply pending invite', e);
                        }
                    }
                }
                const hasGuestData = await GuestDataSync.hasGuestData();
                if (isAnon && hasGuestData && userId) {
                    setNewUserId(userId);
                    setShowSyncModal(true);
                } else {
                    if (onSuccess) onSuccess();
                }
            }
        }
        setLoading(false);
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
                    const existingName =
                        (currentUser?.full_name && String(currentUser.full_name).trim()) ||
                        'Sanctuary User';
                    await authAPI.linkAnonymousToEmail(email, password, existingName, 'teacher' as Role);

                    const internalId = await identityAPI.getMyInternalId();

                    hapticSuccess();
                    showToast({ message: t('auth.signupSuccess'), type: "success" });

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
                            showToast({ message: t('auth.alreadyRegistered') || "You already have a sanctuary soul! Switching to login...", type: "success" });
                            setIsSignUp(false);
                            setLoading(false);
                            return;
                        }
                        throw error;
                    }
                    hapticSuccess();
                    showToast({ message: t('auth.checkEmail'), type: "success" });
                }
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;

                hapticSuccess();
                const internalId = await identityAPI.getMyInternalId();
                if (internalId) {
                    const pendingInvite = await AsyncStorage.getItem('pending_invite');
                    if (pendingInvite) {
                        try {
                            const invite = JSON.parse(pendingInvite);
                            if (invite.school_id) {
                                await supabase.from('users').update({ school_id: invite.school_id, role: (invite.role as Role) || 'teacher' }).eq('id', internalId);
                                await AsyncStorage.removeItem('pending_invite');
                                showToast({ message: 'Reconnected to your school sanctuary!', type: 'success' });
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
                message: typeof apiError === 'string' ? apiError : (apiError as any).message || 'An authentication error occurred',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    }

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
                            <LivingGlow active size={132} style={{ alignItems: 'center', justifyContent: 'center' }}>
                                <VStack className="gap-2 items-center">
                                    <Box
                                        className="px-4 py-1 rounded-full border"
                                        style={{
                                            backgroundColor: `${accent.action}12`,
                                            borderColor: `${accent.action}28`,
                                        }}
                                    >
                                        <Text className="text-[10px] font-bold tracking-[0.5px]" style={{ color: accent.action }}>
                                            ENTER THE SANCTUARY
                                        </Text>
                                    </Box>
                                    <Heading size="3xl" className="text-center font-bold tracking-[-1.2px]" style={{ color: text.primary }}>
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
                                    <Text className="text-[10px] text-phase-secondary font-bold">
                                        {pillar}
                                    </Text>
                                </Box>
                            ))}
                        </HStack>
                    </VStack>

                    <Box className="p-0 overflow-hidden border-t-4 bg-phase-surface border-phase-border rounded-3xl" style={{ borderTopColor: accent.action }}>
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
                                        onPress={() => {
                                            hapticLight();
                                            setIsSignUp(true);
                                            setShowEmailAuth(false);
                                            setErrors({});
                                        }}
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
                                        onPress={() => {
                                            hapticLight();
                                            setIsSignUp(false);
                                            setShowEmailAuth(false);
                                            setErrors({});
                                        }}
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
                                            onPress={() => handleOAuthSignIn('google')}
                                            isDisabled={loading}
                                            className="h-16 rounded-2xl w-full"
                                            style={{ backgroundColor: accent.action }}
                                        >
                                            <HStack className="gap-3 items-center">
                                                <Box className="p-2 rounded-full bg-white">
                                                    <GoogleIcon size={24} />
                                                </Box>
                                                <ButtonText className="text-lg font-bold" style={{ color: '#000' }}>
                                                    {isSignUp ? "Sign up with Google" : t('auth.signInWithGoogle')}
                                                </ButtonText>
                                            </HStack>
                                        </Button>
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            onPress={() => {
                                                hapticLight();
                                                setShowEmailAuth(true);
                                            }}
                                            isDisabled={loading}
                                            className="h-[54px] rounded-2xl border-phase-border bg-transparent"
                                        >
                                            <HStack className="gap-2 items-center">
                                                <Mail size={18} color={text.primary} />
                                                <ButtonText className="text-phase-primary font-medium">
                                                    {isSignUp ? t('auth.signUpWithEmail') || 'Sign up with email' : t('auth.signInWithEmail') || 'Sign in with email'}
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
                                                <Input
                                                    className="rounded-xl border-phase-border bg-phase-surface"
                                                >
                                                    <InputField
                                                        placeholder={t('auth.email')}
                                                        value={email}
                                                        onChangeText={setEmail}
                                                        keyboardType="email-address"
                                                        autoComplete="email"
                                                        className="text-phase-primary"
                                                        placeholderTextColor={text.muted}
                                                        returnKeyType="next"
                                                        onSubmitEditing={() => passwordRef.current?.focus()}
                                                        blurOnSubmit={false}
                                                    />
                                                </Input>
                                                <Input
                                                    className="rounded-xl border-phase-border bg-phase-surface"
                                                >
                                                    <InputField
                                                        ref={passwordRef}
                                                        placeholder={t('auth.password')}
                                                        value={password}
                                                        onChangeText={setPassword}
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
                                                    onPress={() => {
                                                        setShowEmailAuth(false);
                                                        setErrors({});
                                                    }}
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
                                <Box className="px-4 py-3 rounded-xl border" style={{ backgroundColor: `${text.secondary}12`, borderColor: `${text.secondary}28` }}>
                                    <Text className="text-phase-secondary text-sm">
                                        You can still continue gently as a guest and create an account later when you want your sanctuary identity to persist.
                                    </Text>
                                </Box>
                            )}

                            {errors._form ? (
                                <Box className="px-4 py-3 rounded-xl border" style={{ backgroundColor: `${accent.danger}12`, borderColor: `${accent.danger}24` }}>
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
                                {t('auth.privacyTerms') || 'Your progress is protected by our sanctuary protocols.'}
                            </ButtonText>
                        </Button>
                    </VStack>
                </VStack>
            </Box>

            {Scanner && (
                <Scanner
                    visible={showScanner}
                    onClose={() => setShowScanner(false)}
                    onScan={async (data) => {
                        hapticSuccess();
                        setShowScanner(false);
                        const userId = await identityAPI.getMyInternalId();
                        if (!userId) {
                            showToast({ message: 'Please sign in first to use QR codes', type: 'error' });
                            return;
                        }
                        const result = await FlowResolver.resolveQR(JSON.parse(data), userId);
                        if (result.outcome === 'error') {
                            showToast({ message: result.message || 'Unrecognized QR', type: 'error' });
                            return;
                        }
                        showToast({ message: result.message, type: 'success' });
                    }}
                    title="Scan Invite Code"
                />
            )}
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
