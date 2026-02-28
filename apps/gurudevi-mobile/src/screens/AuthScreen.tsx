import React, { useState } from 'react';
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
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';
import { supabase, UserRole, handleAPIError, GuestDataSync } from '@repo/core';
import { Theme } from '@repo/ui';
import { validators, validateForm } from '../utils/validators';
import { ScannerModal, resolveQR } from '@repo/scanner-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
}

export default function AuthScreen({ onboardingData, isAnonymous = false, onContinueAsGuest, onSuccess }: AuthScreenProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showEmailAuth, setShowEmailAuth] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [showSyncModal, setShowSyncModal] = useState(false);
    const [newUserId, setNewUserId] = useState<string>('');
    const toast = useToast();

    React.useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setCurrentUser(user);
        });
    }, []);

    const isRealUser = currentUser && currentUser.email && !currentUser.email.includes('anonymous');
    const shouldHideGeneralAuth = onboardingData && isRealUser;

    async function handleOAuthSignIn(provider: 'google') {
        setLoading(true);
        hapticLight();
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: Platform.OS === 'web'
                    ? window.location.href
                    : 'gurudevi://auth/callback',
                queryParams: onboardingData ? {
                    full_name: onboardingData.name,
                    role: onboardingData.role,
                } : undefined
            }
        });

        if (error) {
            handleAPIError(error);
            setLoading(false);
        }
    }

    async function handleAuth() {
        console.log('🚀 Auth: handleAuth triggered', { isSignUp, email });
        const { isValid, errors: valErrors } = validateForm({ email, password }, {
            email: validators.email,
            password: (val: string) => validators.nonEmpty(val, 'Password')
        });

        if (!isValid) {
            setErrors(valErrors);
            return;
        }

        setLoading(true);
        console.log('🚀 Auth: Starting handleAuth...', { isSignUp, email });
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
                        setNewUserId(currentSession.user.id);
                        setShowSyncModal(true);
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
                    if (error) throw error;
                    hapticSuccess();
                    showToast(t('auth.checkEmail'), "success");

                    // Note: For new signups, sync will happen after email confirmation
                    // You may want to trigger sync in the email confirmation callback
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                hapticSuccess();
                console.log('✅ Auth: Login success, calling onSuccess');
                if (onSuccess) onSuccess();
            }
        } catch (error: any) {
            handleAPIError(error);
        } finally {
            console.log('🏁 Auth: handleAuth completed');
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
            <Center sx={{ flex: 1, paddingVertical: 40, paddingHorizontal: 24 }}>
                <VStack space="4xl" sx={{ width: '100%', maxWidth: 400 }}>
                    <VStack space="md" alignItems="center">
                        <Heading size="3xl" color={colors.action} textAlign="center">
                            {onboardingData ? t('auth.saveSanctuary') : "Gurudevi"}
                        </Heading>
                        <Text color={colors.textSecondary} size="md" textAlign="center">
                            {onboardingData
                                ? t('auth.upgradePrompt')
                                : t('auth.tagline') || 'Enter the Sanctuary of Learning'}
                        </Text>
                    </VStack>

                    {!shouldHideGeneralAuth && (
                        <Box sx={{
                            backgroundColor: colors.secondary,
                            borderRadius: Theme.corners.full,
                            p: '$1',
                            flexDirection: 'row',
                            alignItems: 'center',
                            alignSelf: 'center',
                            width: 280,
                            mb: '$4'
                        }}>
                            <Pressable
                                onPress={() => { hapticLight(); setIsSignUp(false); }}
                                sx={{
                                    flex: 1,
                                    py: '$3',
                                    borderRadius: Theme.corners.full,
                                    backgroundColor: !isSignUp ? colors.action : 'transparent',
                                    alignItems: 'center'
                                }}
                            >
                                <Text
                                    fontWeight="$bold"
                                    color={!isSignUp ? Theme.colors.sacredWhite : colors.textSecondary}
                                >
                                    {t('auth.login')}
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={() => { hapticLight(); setIsSignUp(true); }}
                                sx={{
                                    flex: 1,
                                    py: '$3',
                                    borderRadius: Theme.corners.full,
                                    backgroundColor: isSignUp ? colors.action : 'transparent',
                                    alignItems: 'center'
                                }}
                            >
                                <Text
                                    fontWeight="$bold"
                                    color={isSignUp ? Theme.colors.sacredWhite : colors.textSecondary}
                                >
                                    {t('auth.signup')}
                                </Text>
                            </Pressable>
                        </Box>
                    )}

                    {!showEmailAuth && !shouldHideGeneralAuth && (
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

                            <Button
                                size="lg"
                                variant="outline"
                                onPress={() => { hapticLight(); setShowEmailAuth(true); }}
                                sx={{
                                    borderColor: colors.border,
                                    borderRadius: Theme.corners.comfortable,
                                    height: 50
                                }}
                            >
                                <HStack space="xs" alignItems="center">
                                    <Mail size={18} color={colors.textSecondary} />
                                    <ButtonText color={colors.textSecondary}>
                                        {isSignUp ? t('auth.createAccount') : t('auth.signInEmail')}
                                    </ButtonText>
                                </HStack>
                            </Button>
                        </VStack>
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
                                />
                            </Input>

                            <Input variant="outline" size="lg" sx={{ borderRadius: Theme.corners.comfortable, backgroundColor: colors.secondary }}>
                                <InputField
                                    placeholder={t('auth.password')}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
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
                    )}

                    {(!currentUser || currentUser?.is_anonymous) && isAnonymous && onContinueAsGuest && (
                        <VStack space="md" alignItems="center" mt="$4">
                            <Divider sx={{ width: '60%', backgroundColor: colors.border, mb: '$4' }} />
                            <Button
                                variant="solid"
                                onPress={() => {
                                    console.log('👋 Auth: Continuing as guest...');
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
