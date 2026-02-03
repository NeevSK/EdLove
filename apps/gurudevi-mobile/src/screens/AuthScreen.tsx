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
} from "@gluestack-ui/themed";
import { ChevronDown } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { Theme } from '../constants/Theme';
import { UserRole } from '../types/User';
import { hapticLight, hapticSuccess, hapticError } from '../utils/haptics';

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
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: role,
                    }
                }
            });
            if (error) {
                hapticError();
                showToast(error.message, "error");
            } else {
                hapticSuccess();
                showToast(t('auth.checkEmail'), "success");
            }
        } else {
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
        } else {
            hapticSuccess();
        }
        setLoading(false);
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
                            <ButtonText color={Theme.colors.sacredWhite}>
                                {t('auth.signInWithGoogle')}
                            </ButtonText>
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
                            <ButtonText color={Theme.colors.sacredWhite}>
                                {t('auth.signInWithApple')}
                            </ButtonText>
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
