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
} from "@/ui";
import { QrCode, Mail } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { Theme } from '../constants/Theme';
import { UserRole } from '../types/User';
import { hapticLight, hapticSuccess, hapticError } from '../utils/haptics';
import { useStore } from '../store/useStore';
import { SchoolType } from '../constants/SriLankanSchools';
import { validators, validateForm } from '../utils/validators';
import ScannerModal from '../components/shared/ScannerModal';
import ScreenWrapper from '../components/shared/ScreenWrapper';
import useThemedColors from '../hooks/useThemedColors';

const GoogleIcon = ({ color = "#FFF", size = 20 }: { color?: string; size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
        <Path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4" />
        <Path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853" />
        <Path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z" fill="#FBBC05" />
        <Path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z" fill="#EA4335" />
    </Svg>
);

export default function AuthScreen() {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showEmailAuth, setShowEmailAuth] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const toast = useToast();

    // ... handleScan, handleAuth, handleOAuthSignIn, handleForgotPassword ...
    // (Consolidating logic for the Google-first redesign)

    async function handleOAuthSignIn(provider: 'google') {
        setLoading(true);
        hapticLight();
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: 'gurudevi://auth/callback',
            }
        });

        if (error) {
            hapticError();
            showToast(t('auth.googleSignInError') || 'Failed to sign in with Google', "error");
            setLoading(false);
        }
    }

    async function handleAuth() {
        // Validation logic
        const { isValid, errors: valErrors } = validateForm({ email, password }, {
            email: validators.email,
            password: (val: string) => validators.nonEmpty(val, 'Password')
        });

        if (!isValid) {
            setErrors(valErrors);
            return;
        }

        setLoading(true);
        const { error } = isSignUp
            ? await supabase.auth.signUp({ email, password })
            : await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            hapticError();
            showToast(error.message, "error");
        } else {
            hapticSuccess();
        }
        setLoading(false);
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
            <Center sx={{ flex: 1, paddingVertical: 60, paddingHorizontal: 24 }}>
                <VStack space="4xl" sx={{ width: '100%', maxWidth: 400 }}>
                    {/* Brand Heading */}
                    <VStack space="md" alignItems="center">
                        <Heading size="4xl" color={colors.action} textAlign="center">
                            Gurudevi
                        </Heading>
                        <Text color={colors.textSecondary} size="lg" textAlign="center" px="$4">
                            {t('auth.tagline') || 'Enter the Sanctuary of Learning'}
                        </Text>
                    </VStack>

                    {/* Primary Path: Google Auth */}
                    {!showEmailAuth && (
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
                                    shadowColor: colors.action,
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 8,
                                }}
                            >
                                <HStack space="md" alignItems="center">
                                    <Box sx={{ p: '$2', backgroundColor: Theme.colors.white, borderRadius: Theme.corners.full }}>
                                        <GoogleIcon size={24} />
                                    </Box>
                                    <ButtonText color={Theme.colors.white} fontWeight="$bold" size="lg">
                                        {t('auth.continueWithGoogle') || 'Continue with Google'}
                                    </ButtonText>
                                </HStack>
                            </Button>

                            <Text color={colors.textTertiary} size="sm" textAlign="center">
                                {t('auth.googleNudge') || 'Recommended for the best experience'}
                            </Text>
                        </VStack>
                    )}

                    {/* Secondary Path: Email Auth */}
                    {showEmailAuth ? (
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
                                <ButtonText color={Theme.colors.white} fontWeight="$bold">
                                    {loading ? t('auth.processing') : (isSignUp ? t('auth.signup') : t('auth.login'))}
                                </ButtonText>
                            </Button>

                            <Button variant="link" onPress={() => setShowEmailAuth(false)}>
                                <ButtonText color={colors.textTertiary}>{t('auth.backToGoogle') || 'Back to Google Sign In'}</ButtonText>
                            </Button>
                        </VStack>
                    ) : (
                        <VStack space="md" alignItems="center" mt="$4">
                            <Divider sx={{ width: '60%', backgroundColor: colors.border, mb: '$4' }} />

                            <Button
                                variant="link"
                                onPress={() => {
                                    hapticLight();
                                    setShowEmailAuth(true);
                                }}
                            >
                                <HStack space="xs" alignItems="center">
                                    <Mail size={16} color={colors.textSecondary} />
                                    <ButtonText color={colors.textSecondary}>
                                        {t('auth.useEmailInstead') || 'Or use email address'}
                                    </ButtonText>
                                </HStack>
                            </Button>

                            <Button
                                variant="link"
                                onPress={() => setShowScanner(true)}
                                mt="$2"
                            >
                                <HStack space="xs" alignItems="center">
                                    <QrCode size={16} color={colors.textSecondary} />
                                    <ButtonText color={colors.textSecondary}>
                                        {t('auth.scanInvite') || 'Scan Invite Code'}
                                    </ButtonText>
                                </HStack>
                            </Button>
                        </VStack>
                    )}
                </VStack>
            </Center>

            <ScannerModal
                visible={showScanner}
                onClose={() => setShowScanner(false)}
                onScan={(data) => {
                    hapticSuccess();
                    showToast("Code Scanned!", "success");
                    setShowScanner(false);
                }}
                title="Scan Invite Code"
            />
        </ScreenWrapper>
    );
}
