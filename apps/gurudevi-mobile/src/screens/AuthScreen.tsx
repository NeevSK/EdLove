import React, { useState } from 'react';
import {
    Box,
    VStack,
    Input,
    InputField,
    Button,
    ButtonText,
    ButtonIcon,
    Text,
    Heading,
    useToast,
    Toast,
    ToastTitle,
    Center,
    HStack,
    Pressable,
    Select,
    SelectTrigger,
    SelectInput,
    SelectIcon,
    SelectPortal,
    SelectBackdrop,
    SelectContent,
    SelectDragIndicatorWrapper,
    SelectDragIndicator,
    SelectItem,
    Divider,
    Spinner,
} from "@gluestack-ui/themed";
import { ChevronDown } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { Theme } from '../constants/Theme';
import { UserRole } from '../types/User';
import { hapticLight, hapticSuccess, hapticError } from '../utils/haptics';

// Google icon using react-native-svg
const GoogleIcon = ({ color = "#FFF", size = 20 }: { color?: string; size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
        <Path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4" />
        <Path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853" />
        <Path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z" fill="#FBBC05" />
        <Path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z" fill="#EA4335" />
    </Svg>
);

// Apple icon using react-native-svg
const AppleIcon = ({ color = "#FFF", size = 20 }: { color?: string; size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
        <Path d="M16.23 10.52c-.03-3.08 2.51-4.56 2.63-4.63-1.43-2.1-3.67-2.39-4.46-2.42-1.9-.19-3.71 1.12-4.67 1.12-.97 0-2.46-1.09-4.04-1.06-2.08.03-4 1.21-5.07 3.07-2.16 3.75-.55 9.32 1.55 12.37 1.03 1.49 2.25 3.17 3.86 3.11 1.57-.06 2.16-1.01 4.05-1.01 1.88 0 2.42 1.01 4.04.98 1.67-.03 2.73-1.52 3.75-3.02 1.18-1.74 1.67-3.42 1.7-3.51-.04-.01-3.25-1.25-3.28-4.95z" fill={color} />
        <Path d="M13.27 2.74c.85-1.03 1.43-2.47 1.27-3.9-1.23.05-2.72.82-3.6 1.85-.79.92-1.48 2.38-1.29 3.78 1.36.11 2.75-.69 3.62-1.73z" fill={color} />
    </Svg>
);

export default function AuthScreen() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState<UserRole>('teacher'); // Default to teacher
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const toast = useToast();

    async function handleAuth() {
        setLoading(true);
        hapticLight();

        if (isSignUp) {
            // Step 1: Create auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: role,
                    }
                }
            });

            if (authError) {
                hapticError();
                showToast(authError.message, "error");
                setLoading(false);
                return;
            }

            if (authData.user) {
                try {
                    // Step 2: Create school based on role
                    let schoolName;
                    let schoolType;

                    if (role === 'principal') {
                        // Principal creates an official school
                        schoolName = `${fullName}'s School`;
                        schoolType = '1AB'; // Default to 1AB (can be changed later)
                    } else {
                        // Teachers/students create a personal workspace
                        // They can join a real school later via invite code
                        schoolName = `${fullName}'s Workspace`;
                        schoolType = 'personal_workspace';
                    }

                    const { data: schoolData, error: schoolError } = await supabase
                        .from('schools')
                        .insert({
                            name: schoolName,
                            type: schoolType,
                        })
                        .select()
                        .single();

                    if (schoolError) throw schoolError;

                    // Step 3: Create user profile with school_id
                    const { error: profileError } = await supabase
                        .from('users')
                        .insert({
                            id: authData.user.id,
                            email: email,
                            full_name: fullName,
                            role: role,
                            school_id: schoolData.id,
                            language: 'si',  // Default to Sinhala
                        });

                    if (profileError) throw profileError;

                    hapticSuccess();
                    showToast(t('auth.signupSuccess') || 'Account created!', "success");
                } catch (error: any) {
                    hapticError();
                    showToast(error.message || 'Failed to create profile', "error");
                    console.error('Profile creation error:', error);
                }
            }
        } else {
            // Login flow (unchanged)
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) {
                hapticError();
                showToast(error.message, "error");
            } else {
                hapticSuccess();
            }
        }
        setLoading(false);
    }

    async function handleOAuthSignIn(provider: 'google' | 'apple') {
        setLoading(true);
        hapticLight();

        // Redirect URL must match:
        // 1. The deep link scheme configured in app.json
        // 2. Allowed redirect URLs in Supabase dashboard (Authentication -> URL Configuration)
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
        // Note: Success haptic removed - actual authentication happens when user returns from OAuth provider
        // OAuth users may need profile completion flow for required fields (full_name, role)
        // The loading state will be cleared when auth state changes via onAuthStateChange in App.tsx
    }

    function showToast(message: string, action: "error" | "success") {
        toast.show({
            placement: "bottom",
            render: ({ id }) => (
                <Toast nativeID={id} action={action} variant="solid">
                    <ToastTitle>{message}</ToastTitle>
                </Toast>
            ),
        });
    }

    return (
        <Box sx={{ flex: 1, backgroundColor: Theme.colors.voidIndigo, padding: Theme.spacing.xl }}>
            <Center sx={{ flex: 1 }}>
                <VStack space="lg" sx={{ width: '100%', maxWidth: 400 }}>
                    {/* Heading */}
                    <VStack space="xs" mb={Theme.spacing.lg}>
                        <Heading color={Theme.colors.sanctuarySaffron} size="3xl" textAlign="center">
                            {t('auth.enterSanctuary')}
                        </Heading>
                        <Text color={Theme.colors.pearlGray} size="md" textAlign="center">
                            {isSignUp ? t('auth.joinCommunity') : t('auth.enterSanctuary')}
                        </Text>
                    </VStack>

                    {/* Full Name (Sign Up Only) */}
                    {isSignUp && (
                        <VStack space="xs">
                            <Text color={Theme.colors.sacredWhite} size="sm">
                                {t('auth.fullName')}
                            </Text>
                            <Input
                                variant="outline"
                                size="lg"
                                sx={{
                                    borderColor: Theme.colors.mistGray,
                                    borderRadius: Theme.corners.comfortable,
                                    backgroundColor: Theme.colors.deepIndigo,
                                }}
                            >
                                <InputField
                                    placeholder={t('auth.fullName')}
                                    value={fullName}
                                    onChangeText={setFullName}
                                    color={Theme.colors.sacredWhite}
                                    placeholderTextColor={Theme.colors.dimGray}
                                />
                            </Input>
                        </VStack>
                    )}

                    {/* Email */}
                    <VStack space="xs">
                        <Text color={Theme.colors.sacredWhite} size="sm">
                            {t('auth.email')}
                        </Text>
                        <Input
                            variant="outline"
                            size="lg"
                            sx={{
                                borderColor: Theme.colors.mistGray,
                                borderRadius: Theme.corners.comfortable,
                                backgroundColor: Theme.colors.deepIndigo,
                            }}
                        >
                            <InputField
                                placeholder={t('auth.email')}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                color={Theme.colors.sacredWhite}
                                placeholderTextColor={Theme.colors.dimGray}
                            />
                        </Input>
                    </VStack>

                    {/* Password */}
                    <VStack space="xs">
                        <Text color={Theme.colors.sacredWhite} size="sm">
                            {t('auth.password')}
                        </Text>
                        <Input
                            variant="outline"
                            size="lg"
                            sx={{
                                borderColor: Theme.colors.mistGray,
                                borderRadius: Theme.corners.comfortable,
                                backgroundColor: Theme.colors.deepIndigo,
                            }}
                        >
                            <InputField
                                placeholder={t('auth.password')}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                color={Theme.colors.sacredWhite}
                                placeholderTextColor={Theme.colors.dimGray}
                            />
                        </Input>
                    </VStack>

                    {/* Role Selection (Sign Up Only) */}
                    {isSignUp && (
                        <VStack space="xs">
                            <Text color={Theme.colors.sacredWhite} size="sm">
                                {t('auth.role')}
                            </Text>
                            <Select
                                selectedValue={role}
                                onValueChange={(value) => setRole(value as UserRole)}
                            >
                                <SelectTrigger
                                    variant="outline"
                                    size="lg"
                                    sx={{
                                        borderColor: Theme.colors.mistGray,
                                        borderRadius: Theme.corners.comfortable,
                                        backgroundColor: Theme.colors.deepIndigo,
                                    }}
                                >
                                    <SelectInput
                                        placeholder={t('auth.role')}
                                        color={Theme.colors.sacredWhite}
                                    />
                                    <SelectIcon mr="$3" as={ChevronDown} color={Theme.colors.mistGray} />
                                </SelectTrigger>
                                <SelectPortal>
                                    <SelectBackdrop />
                                    <SelectContent>
                                        <SelectDragIndicatorWrapper>
                                            <SelectDragIndicator />
                                        </SelectDragIndicatorWrapper>
                                        <SelectItem label={t('auth.teacher')} value="teacher" />
                                        <SelectItem label={t('auth.student')} value="student" />
                                        <SelectItem label={t('auth.principal')} value="principal" />
                                    </SelectContent>
                                </SelectPortal>
                            </Select>
                        </VStack>
                    )}

                    {/* Submit Button */}
                    <Button
                        size="lg"
                        onPress={handleAuth}
                        isDisabled={loading}
                        sx={{
                            backgroundColor: Theme.colors.sanctuarySaffron,
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

                    {/* Divider with "Or continue with" */}
                    <HStack space="md" alignItems="center" mt={Theme.spacing.lg}>
                        <Divider sx={{ flex: 1, backgroundColor: Theme.colors.mistGray }} />
                        <Text color={Theme.colors.mistGray} size="sm">
                            {t('auth.orContinueWith')}
                        </Text>
                        <Divider sx={{ flex: 1, backgroundColor: Theme.colors.mistGray }} />
                    </HStack>

                    {/* Social Auth Buttons */}
                    <VStack space="md" mt={Theme.spacing.md}>
                        {/* Google Sign In */}
                        <Button
                            size="lg"
                            onPress={() => handleOAuthSignIn('google')}
                            isDisabled={loading}
                            variant="outline"
                            sx={{
                                borderColor: Theme.colors.mistGray,
                                borderRadius: Theme.corners.comfortable,
                                backgroundColor: Theme.colors.deepIndigo,
                            }}
                        >
                            <HStack space="sm" alignItems="center">
                                {loading ? (
                                    <Spinner size="small" color={Theme.colors.sacredWhite} />
                                ) : (
                                    <GoogleIcon size={20} />
                                )}
                                <ButtonText color={Theme.colors.sacredWhite}>
                                    {loading ? t('auth.openingBrowser') : t('auth.signInWithGoogle')}
                                </ButtonText>
                            </HStack>
                        </Button>

                        {/* Apple Sign In */}
                        <Button
                            size="lg"
                            onPress={() => handleOAuthSignIn('apple')}
                            isDisabled={loading}
                            variant="outline"
                            sx={{
                                borderColor: Theme.colors.mistGray,
                                borderRadius: Theme.corners.comfortable,
                                backgroundColor: Theme.colors.deepIndigo,
                            }}
                        >
                            <HStack space="sm" alignItems="center">
                                {loading ? (
                                    <Spinner size="small" color={Theme.colors.sacredWhite} />
                                ) : (
                                    <AppleIcon color={Theme.colors.sacredWhite} size={20} />
                                )}
                                <ButtonText color={Theme.colors.sacredWhite}>
                                    {loading ? t('auth.openingBrowser') : t('auth.signInWithApple')}
                                </ButtonText>
                            </HStack>
                        </Button>
                    </VStack>

                    {/* Toggle Sign Up / Login */}
                    <HStack space="xs" justifyContent="center" mt={Theme.spacing.md}>
                        <Text color={Theme.colors.mistGray} size="sm">
                            {isSignUp ? t('auth.alreadyHaveAccount') : t('auth.newToGurudevi')}
                        </Text>
                        <Pressable onPress={() => {
                            hapticLight();
                            setIsSignUp(!isSignUp);
                        }}>
                            <Text color={Theme.colors.sanctuarySaffron} size="sm" fontWeight="$semibold">
                                {isSignUp ? t('auth.login') : t('auth.createAccount')}
                            </Text>
                        </Pressable>
                    </HStack>
                </VStack>
            </Center>
        </Box>
    );
}
