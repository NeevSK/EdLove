import React, { useState } from 'react';
import {
    Box,
    VStack,
    HStack,
    Input,
    InputField,
    Button,
    Text,
    Heading,
    Pressable,
    Spinner,
    useToast,
    Toast,
    ToastTitle,
    ScreenWrapper,
    hapticLight,
    hapticSuccess,
    hapticError,
    Icon
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
            <Box className="flex-1 bg-slate-950 p-8 justify-center min-h-screen">
                <VStack className="gap-8 max-w-[400px] w-full self-center">
                    {/* Header */}
                    <VStack className="gap-2 mb-6">
                        <Heading className="text-3xl text-amber-500 text-center font-bold">
                            {t('invite.enterCode') || 'Enter Invite Code'}
                        </Heading>
                        <Text className="text-slate-400 text-lg text-center font-medium">
                            {t('invite.codeDesc') || 'Join your school with an invite code'}
                        </Text>
                    </VStack>
 
                    {/* Code Input */}
                    <VStack className="gap-2">
                        <Text className="text-white text-sm font-semibold mb-1">
                            {t('invite.inviteCode') || 'Invite Code'}
                        </Text>
                        <Input
                            className="h-14 bg-slate-900 border-slate-700 rounded-xl"
                        >
                            <InputField
                                placeholder="GURU-ABC123-TEACH"
                                value={code}
                                onChangeText={handleCodeChange}
                                autoCapitalize="characters"
                                maxLength={20}
                                className="text-white"
                                placeholderTextColor="#475569" // slate-500
                                onSubmitEditing={handleValidateCode}
                            />
                        </Input>
                        <Text className="text-slate-500 text-xs font-medium">
                            {t('invite.codeFormat') || 'Format: GURU-XXXXXX-TEACH'}
                        </Text>
                    </VStack>
 
                    {/* Validate Button */}
                    <Button
                        onPress={handleValidateCode}
                        isDisabled={loading || code.length < 5}
                        className="h-14 bg-amber-500 rounded-xl items-center justify-center"
                    >
                        {loading ? (
                            <Spinner color="white" />
                        ) : (
                            <HStack className="gap-2 items-center">
                                <Text className="text-slate-950 font-bold text-lg">
                                    {t('invite.validate') || 'Validate Code'}
                                </Text>
                                <Icon as={ArrowRight} className="text-slate-950" size="sm" />
                            </HStack>
                        )}
                    </Button>
 
                    {/* Info Box */}
                    <Box
                        className="p-6 bg-slate-900/50 border border-slate-700 rounded-xl mt-4"
                    >
                        <HStack className="gap-4 items-start">
                            <Icon as={HelpCircle} className="text-amber-500" size="sm" />
                            <VStack className="gap-1 flex-1">
                                <Text className="text-white text-sm font-bold">
                                    {t('invite.whereToFind') || 'Where to find your code?'}
                                </Text>
                                <Text className="text-slate-500 text-xs font-medium leading-relaxed">
                                    {t('invite.whereDesc') || 'Ask your principal or administrator for an invite code'}
                                </Text>
                            </VStack>
                        </HStack>
                    </Box>
 
                    {/* Skip / Create School */}
                    <VStack className="mt-4">
                        <Pressable 
                            onPress={() => {
                                hapticLight();
                                onSkip();
                            }}
                            className="active:opacity-70"
                        >
                            <Text className="text-amber-500 text-sm text-center font-bold">
                                {t('invite.createSchool') || "I'm a Principal - Create my school →"}
                            </Text>
                        </Pressable>
                    </VStack>
                </VStack>
            </Box>
        </ScreenWrapper>

    );
}
