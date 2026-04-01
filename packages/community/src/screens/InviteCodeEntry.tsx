import React, { useState } from 'react';
import {
    Box,
    VStack,
    HStack,
    Input,
    InputField,
    Button,
    ButtonText,
    ButtonIcon,
    Text,
    Heading,
    Pressable,
    Spinner,
    useToast,
    Toast,
    ToastTitle,
    Theme,
    ScreenWrapper,
    hapticLight,
    hapticSuccess,
    hapticError,
    useThemedColors
} from '@repo/ui';
import { ArrowRight, HelpCircle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { validateInviteCode, InviteCodeData } from '@repo/core';

interface InviteCodeEntryProps {
    onCodeValidated: (codeData: InviteCodeData) => void;
    onSkip: () => void;
}

export default function InviteCodeEntry({ onCodeValidated, onSkip }: InviteCodeEntryProps) {
    const { t } = useTranslation();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const colors = useThemedColors();

    async function handleValidateCode() {
        if (!code.trim()) {
            showToast(t('invite.error.noCode') || 'Please enter an invite code', 'error');
            return;
        }

        setLoading(true);
        hapticLight();

        try {
            const result = await validateInviteCode(code.trim());

            if (result.valid && result.data) {
                hapticSuccess();
                showToast(t('invite.success.joining', { school: result.data.school_name }) || `Joining ${result.data.school_name}!`, 'success');
                onCodeValidated(result.data);
            } else {
                hapticError();
                showToast(result.error || t('invite.error.invalid') || 'Invalid code', 'error');
            }
        } catch (err) {
            hapticError();
            showToast('An unexpected error occurred', 'error');
        } finally {
            setLoading(false);
        }
    }

    function showToast(message: string, action: 'error' | 'success') {
        toast.show({
            placement: 'bottom',
            render: ({ id }: { id: string }) => (
                <Toast nativeID={id} action={action} variant="solid">
                    <VStack space="xs">
                        <ToastTitle>{message}</ToastTitle>
                    </VStack>
                </Toast>
            ),
        });
    }

    function formatCodeInput(text: string) {
        const cleaned = text.toUpperCase().replace(/[^A-Z0-9]/g, '');

        if (cleaned.length <= 4) {
            return cleaned;
        } else if (cleaned.length <= 10) {
            return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
        } else {
            return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 10)}-${cleaned.slice(10, 15)}`;
        }
    }

    function handleCodeChange(text: string) {
        const formatted = formatCodeInput(text);
        setCode(formatted);
    }

    return (
        <ScreenWrapper scroll={true}>
            <Box sx={{ flex: 1, backgroundColor: Theme.colors.obsidian, padding: Theme.spacing.xl, justifyContent: 'center', minHeight: '100%' }}>
                <VStack space="xl" sx={{ maxWidth: 400, width: '100%', alignSelf: 'center' }}>
                    {/* Header */}
                    <VStack space="sm" sx={{ marginBottom: 24 }}>
                        <Heading sx={{ fontSize: 32, color: Theme.colors.sanctuarySaffron, textAlign: 'center' }}>
                            {t('invite.enterCode') || 'Enter Invite Code'}
                        </Heading>
                        <Text sx={{ color: Theme.colors.starlightGray, fontSize: 16, textAlign: 'center' }}>
                            {t('invite.codeDesc') || 'Join your school with an invite code'}
                        </Text>
                    </VStack>

                    {/* Code Input */}
                    <VStack space="xs">
                        <Text sx={{ color: Theme.colors.sacredWhite, fontSize: 14 }}>
                            {t('invite.inviteCode') || 'Invite Code'}
                        </Text>
                        <Input
                            variant="outline"
                            size="lg"
                            sx={{
                                borderColor: Theme.colors.mistGray,
                                borderRadius: Theme.corners.comfortable,
                                backgroundColor: Theme.colors.ink,
                            }}
                        >
                            <InputField
                                placeholder="GURU-ABC123-TEACH"
                                value={code}
                                onChangeText={handleCodeChange}
                                autoCapitalize="characters"
                                maxLength={20}
                                sx={{ color: Theme.colors.sacredWhite }}
                                placeholderTextColor={Theme.colors.dimGray}
                                onSubmitEditing={handleValidateCode}
                            />
                        </Input>
                        <Text sx={{ color: Theme.colors.dimGray, fontSize: 12 }}>
                            {t('invite.codeFormat') || 'Format: GURU-XXXXXX-TEACH'}
                        </Text>
                    </VStack>

                    {/* Validate Button */}
                    <Button
                        size="lg"
                        onPress={handleValidateCode}
                        isDisabled={loading || code.length < 5}
                        sx={{
                            backgroundColor: Theme.colors.sanctuarySaffron,
                            borderRadius: Theme.corners.comfortable,
                            height: 56,
                        }}
                    >
                        {loading ? (
                            <Spinner color="white" />
                        ) : (
                            <HStack space="xs" sx={{ alignItems: 'center' }}>
                                <ButtonText sx={{ color: Theme.colors.obsidian, fontWeight: '700' }}>
                                    {t('invite.validate') || 'Validate Code'}
                                </ButtonText>
                                <ButtonIcon as={ArrowRight} sx={{ color: Theme.colors.obsidian }} />
                            </HStack>
                        )}
                    </Button>

                    {/* Info Box */}
                    <Box
                        sx={{
                            padding: Theme.spacing.lg,
                            backgroundColor: Theme.colors.shroud,
                            borderRadius: Theme.corners.comfortable,
                            borderWidth: 1,
                            borderColor: Theme.colors.mistGray,
                            marginTop: Theme.spacing.md,
                        }}
                    >
                        <HStack space="md" sx={{ alignItems: 'flex-start' }}>
                            <HelpCircle color={Theme.colors.sanctuarySaffron} size={20} />
                            <VStack space="xs" sx={{ flex: 1 }}>
                                <Text sx={{ color: Theme.colors.sacredWhite, fontSize: 14, fontWeight: '700' }}>
                                    {t('invite.whereToFind') || 'Where to find your code?'}
                                </Text>
                                <Text sx={{ color: Theme.colors.dimGray, fontSize: 12 }}>
                                    {t('invite.whereDesc') || 'Ask your principal or administrator for an invite code'}
                                </Text>
                            </VStack>
                        </HStack>
                    </Box>

                    {/* Skip / Create School */}
                    <VStack sx={{ marginTop: 16 }}>
                        <Pressable 
                            onPress={() => {
                                hapticLight();
                                onSkip();
                            }}
                        >
                            <Text sx={{ color: Theme.colors.sanctuarySaffron, fontSize: 14, textAlign: 'center', fontWeight: '700' }}>
                                {t('invite.createSchool') || "I'm a Principal - Create my school →"}
                            </Text>
                        </Pressable>
                    </VStack>
                </VStack>
            </Box>
        </ScreenWrapper>
    );
}
