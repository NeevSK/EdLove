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
import { ChevronDown, QrCode } from 'lucide-react-native';
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

// Google icon using react-native-svg
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
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState<UserRole>('teacher'); // Default to teacher
    const [inviteCode, setInviteCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const toast = useToast();

    // ... handleScan, handleAuth, handleOAuthSignIn, handleForgotPassword functions remain the same ...
    // Note: I'm only showing the render part for brevity in the replacement piece, 
    // but in a real tool call I'd include the whole file if I'm replacing it all.
    // I will include the full logic to ensure it works.

    const handleScan = (data: string) => {
        setInviteCode(data);
        showToast('Invite Code Scanned!', 'success');
        hapticSuccess();
        if (!isSignUp) setIsSignUp(true);
    };

    async function handleAuth() {
        const validationRules: Record<string, (value: any) => any> = {
            email: validators.email,
            password: isSignUp
                ? validators.password
                : (value: string) => validators.nonEmpty(value, 'Password'),
        };

        const { isValid, errors: validationErrors } = validateForm(
            { email, password },
            validationRules
        );

        if (!isValid) {
            setErrors(validationErrors);
            hapticError();
            const errorFieldOrder: (keyof typeof validationErrors)[] = isSignUp ? ['email', 'password'] : ['email', 'password'];
            const firstErrorMessage =
                errorFieldOrder
                    .map((field) => validationErrors[field])
                    .find((message) => Boolean(message)) ||
                'Please fix the errors';

            showToast(firstErrorMessage, 'error');
            return;
        }

        setErrors({});
        setLoading(true);
        hapticLight();

        if (isSignUp) {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: 'User',
                        role: 'teacher',
                    }
                }
            });

            if (authError) {
                hapticError();
                if (authError.message.toLowerCase().includes('already registered')) {
                    showToast(t('auth.accountExistsNudge') || 'You already have an account! Switching to login...', 'success');
                    setIsSignUp(false);
                    setLoading(false);
                    return;
                }
                showToast(authError.message, "error");
                setLoading(false);
                return;
            }

            if (authData.user) {
                try {
                    const schoolName = 'Personal Workspace';
                    const schoolType = 'personal_workspace';

                    const { data: schoolData, error: schoolError } = await supabase
                        .from('schools')
                        .insert({
                            name: schoolName,
                            type: schoolType,
                            created_by: authData.user.id,
                        })
                        .select()
                        .single();

                    if (schoolError) throw schoolError;

                    const { error: profileError } = await supabase
                        .from('users')
                        .insert({
                            id: authData.user.id,
                            email: email,
                            full_name: fullName,
                            role: role,
                            school_id: schoolData.id,
                            language: 'si',
                        });

                    if (profileError) throw profileError;
                    useStore.getState().setUserRole(role);
                    useStore.getState().setSchoolType(schoolType as SchoolType);
                    hapticSuccess();
                    showToast(t('auth.signupSuccess') || 'Account created!', "success");
                } catch (error: any) {
                    hapticError();
                    showToast(error.message || 'Failed to create profile', "error");
                }
            }
        } else {
            const { data: authData, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) {
                hapticError();
                showToast(error.message, "error");
            } else if (authData.user) {
                const { data: userProfile, error: profileError } = await supabase
                    .from('users')
                    .select('role, school_id')
                    .eq('id', authData.user.id)
                    .single();

                if (!profileError && userProfile) {
                    useStore.getState().setUserRole(userProfile.role as UserRole);
                    if (userProfile.school_id) {
                        const { data: schoolData } = await supabase
                            .from('schools')
                            .select('type')
                            .eq('id', userProfile.school_id)
                            .single();
                        if (schoolData) {
                            useStore.getState().setSchoolType(schoolData.type as SchoolType);
                        }
                    }
                }
                hapticSuccess();
            }
        }
        setLoading(false);
    }

    async function handleOAuthSignIn(provider: 'google' | 'apple') {
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
            const errorKey = provider === 'google' ? 'auth.googleSignInError' : 'auth.appleSignInError';
            showToast(t(errorKey), "error");
            setLoading(false);
        }
    }

    async function handleForgotPassword() {
        if (!email) {
            showToast(t('auth.enterEmailFirst') || 'Please enter your email address first', 'error');
            return;
        }
        setLoading(true);
        hapticLight();
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'gurudevi://auth/callback',
        });
        if (error) {
            hapticError();
            showToast(t('auth.resetPasswordError') || 'Failed to send reset email', 'error');
        } else {
            hapticSuccess();
            showToast(t('auth.resetPasswordSent') || 'Password reset email sent! Check your inbox.', 'success');
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
            <Center sx={{ flex: 1, paddingVertical: Theme.spacing.xl }}>
                <VStack space="lg" sx={{ width: '100%', maxWidth: 400 }}>
                    {/* Login/Signup Toggle at Top */}
                    <HStack
                        space="xs"
                        justifyContent="center"
                        mb={Theme.spacing.sm}
                        sx={{
                            backgroundColor: colors.secondary,
                            borderRadius: Theme.corners.full,
                            padding: 4,
                        }}
                    >
                        <Pressable
                            onPress={() => {
                                hapticLight();
                                setIsSignUp(false);
                            }}
                            style={{
                                flex: 1,
                                paddingVertical: 8,
                                paddingHorizontal: 16,
                                borderRadius: 20,
                                backgroundColor: !isSignUp ? colors.action : 'transparent',
                            }}
                        >
                            <Text
                                color={!isSignUp ? Theme.colors.white : colors.textTertiary}
                                size="sm"
                                fontWeight="$semibold"
                                textAlign="center"
                            >
                                {t('auth.login')}
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => {
                                hapticLight();
                                setIsSignUp(true);
                            }}
                            style={{
                                flex: 1,
                                paddingVertical: 8,
                                paddingHorizontal: 16,
                                borderRadius: 20,
                                backgroundColor: isSignUp ? colors.action : 'transparent',
                            }}
                        >
                            <Text
                                color={isSignUp ? Theme.colors.white : colors.textTertiary}
                                size="sm"
                                fontWeight="$semibold"
                                textAlign="center"
                            >
                                {t('auth.signup')}
                            </Text>
                        </Pressable>
                    </HStack>

                    {/* Heading */}
                    <VStack space="xs" mb={Theme.spacing.lg}>
                        <Heading color={colors.action} size="3xl" textAlign="center">
                            {t('auth.enterSanctuary')}
                        </Heading>
                        <Text color={colors.textSecondary} size="md" textAlign="center">
                            {isSignUp ? t('auth.joinCommunity') : t('auth.enterSanctuary')}
                        </Text>
                    </VStack>

                    {/* Email */}
                    <VStack space="xs">
                        <Text color={colors.text} size="sm">
                            {t('auth.email')}
                        </Text>
                        <Input
                            variant="outline"
                            size="lg"
                            isInvalid={!!errors.email}
                            sx={{
                                borderColor: errors.email ? colors.error : colors.textTertiary,
                                borderRadius: Theme.corners.comfortable,
                                backgroundColor: colors.secondary,
                            }}
                        >
                            <InputField
                                placeholder={t('auth.email')}
                                value={email}
                                onChangeText={(text: string) => {
                                    setEmail(text);
                                    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                                }}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                color={colors.text}
                                placeholderTextColor={colors.textTertiary}
                            />
                        </Input>
                        {errors.email && (
                            <Text color={colors.error} size="xs">
                                {errors.email}
                            </Text>
                        )}
                    </VStack>

                    {/* Password */}
                    <VStack space="xs">
                        <Text color={colors.text} size="sm">
                            {t('auth.password')}
                        </Text>
                        <Input
                            variant="outline"
                            size="lg"
                            isInvalid={!!errors.password}
                            sx={{
                                borderColor: errors.password ? colors.error : colors.textTertiary,
                                borderRadius: Theme.corners.comfortable,
                                backgroundColor: colors.secondary,
                            }}
                        >
                            <InputField
                                placeholder={t('auth.password')}
                                value={password}
                                onChangeText={(text: string) => {
                                    setPassword(text);
                                    if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                                }}
                                secureTextEntry
                                color={colors.text}
                                placeholderTextColor={colors.textTertiary}
                            />
                        </Input>
                        {errors.password && (
                            <Text color={colors.error} size="xs">
                                {errors.password}
                            </Text>
                        )}

                        {!isSignUp && (
                            <Pressable onPress={handleForgotPassword} alignSelf="flex-end" mt="$2">
                                <Text color={colors.action} size="sm">
                                    {t('auth.forgotPassword', 'Forgot Password?')}
                                </Text>
                            </Pressable>
                        )}
                    </VStack>

                    {isSignUp && (
                        <VStack space="xs">
                            <Text color={colors.text} size="sm">
                                {t('auth.inviteCode', 'Invite Code (Optional)')}
                            </Text>
                            <Input
                                variant="outline"
                                size="lg"
                                sx={{
                                    borderColor: colors.textTertiary,
                                    borderRadius: Theme.corners.comfortable,
                                    backgroundColor: colors.secondary,
                                }}
                            >
                                <InputField
                                    placeholder="Enter or Scan Code"
                                    value={inviteCode}
                                    onChangeText={(text: string) => setInviteCode(text)}
                                    color={colors.text}
                                    placeholderTextColor={colors.textTertiary}
                                />
                            </Input>
                        </VStack>
                    )}

                    {/* Submit Button */}
                    <Button
                        size="lg"
                        onPress={handleAuth}
                        isDisabled={loading}
                        sx={{
                            backgroundColor: colors.action,
                            borderRadius: Theme.corners.comfortable,
                            marginTop: Theme.spacing.md,
                        }}
                    >
                        <ButtonText color={Theme.colors.white} fontWeight="$semibold">
                            {loading
                                ? t('auth.processing')
                                : isSignUp
                                    ? t('auth.signup')
                                    : t('auth.login')}
                        </ButtonText>
                    </Button>

                    <Button
                        variant="outline"
                        action="secondary"
                        size="md"
                        onPress={() => setShowScanner(true)}
                        style={{ borderColor: colors.action, marginTop: 8 }}
                    >
                        <ButtonText color={colors.action}>
                            {isSignUp ? 'Scan Invite Code' : 'Scan to Login'}
                        </ButtonText>
                        <QrCode size={18} color={colors.action} style={{ marginLeft: 8 }} />
                    </Button>

                    <HStack space="md" alignItems="center" mt={Theme.spacing.lg}>
                        <Divider sx={{ flex: 1, backgroundColor: colors.border }} />
                        <Text color={colors.textTertiary} size="sm">
                            {t('auth.orContinueWith')}
                        </Text>
                        <Divider sx={{ flex: 1, backgroundColor: colors.border }} />
                    </HStack>

                    <VStack space="md" mt={Theme.spacing.md}>
                        <Button
                            size="lg"
                            onPress={() => handleOAuthSignIn('google')}
                            isDisabled={loading}
                            variant="outline"
                            sx={{
                                borderColor: colors.textTertiary,
                                borderRadius: Theme.corners.comfortable,
                                backgroundColor: colors.secondary,
                            }}
                        >
                            <HStack space="sm" alignItems="center">
                                {loading ? (
                                    <Spinner size="small" color={colors.text} />
                                ) : (
                                    <GoogleIcon />
                                )}
                                <ButtonText color={colors.text}>
                                    {loading ? t('auth.openingBrowser') : t('auth.signInWithGoogle')}
                                </ButtonText>
                            </HStack>
                        </Button>
                    </VStack>
                </VStack>
            </Center>

            <ScannerModal
                visible={showScanner}
                onClose={() => setShowScanner(false)}
                onScan={handleScan}
                title={isSignUp ? "Scan Invite Code" : "Scan Login QR"}
            />
        </ScreenWrapper>
    );
}
