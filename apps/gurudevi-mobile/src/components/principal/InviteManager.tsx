/**
 * INVITE MANAGER COMPONENT
 * 
 * Manage invite codes for staff and students to join the school.
 * Features:
 * - Generate Teacher Code button
 * - Generate Student Code button
 * - List of active codes with copy functionality
 * 
 * Mission 04: Principal's Office
 */

import React, { useState, useEffect } from 'react';
import {
    VStack,
    HStack,
    Text,
    Heading,
    Box,
    Button,
    ButtonText,
    ScrollView,
    Spinner,
    useToast,
    Toast,
    ToastTitle,
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    Heading as ModalHeading,
} from '@repo/ui';
import { TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Clipboard from 'expo-clipboard';
import { api } from '../../lib/api';
import { InviteCode } from '../../lib/api/school';
import { Theme } from '@repo/ui';
import { Copy, RefreshCw, Users, Shield, QrCode } from 'lucide-react-native';
import { UserRole, ADMIN_ROLES, hasRole } from '@repo/core';
import { QRCodeGenerator } from '@repo/scanner-kit';

interface InviteManagerProps {
    schoolId: string;
    userId: string;
    onBack: () => void;
}

export default function InviteManager({ schoolId, userId, onBack }: InviteManagerProps) {
    const { t } = useTranslation();
    const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const toast = useToast();
    const [qrCodeData, setQrCodeData] = useState<{ code: string, role: string } | null>(null);

    useEffect(() => {
        loadInviteCodes();
    }, [schoolId]);

    const loadInviteCodes = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const codes = await api.school.getInviteCodes(schoolId);
            setInviteCodes(codes);
        } catch (err: any) {
            console.error('Failed to load invite codes:', err);
            setError(err.message || 'Failed to load invite codes');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateCode = async (role: UserRole) => {
        setIsGenerating(true);
        setError(null);
        try {
            await api.school.generateInviteCode(schoolId, role, userId);
            await loadInviteCodes();
        } catch (err: any) {
            console.error('Failed to generate code:', err);
            setError(err.message || 'Failed to generate code');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopyCode = async (code: string) => {
        try {
            await Clipboard.setStringAsync(code);
            toast.show({
                placement: 'top',
                render: ({ id }: { id: string }) => {
                    return (
                        <Toast nativeID={id} action="success" variant="solid">
                            <ToastTitle>{t('principal.invites.copied') || 'Copied!'}</ToastTitle>
                        </Toast>
                    );
                },
            });
        } catch (err) {
            console.error('Failed to copy code:', err);
            Alert.alert('Error', 'Failed to copy code to clipboard.');
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'teacher':
                return Theme.colors.sageGreen;
            case 'student':
                return Theme.colors.sanctuarySaffron;
            case 'principal':
                return Theme.colors.twilightPurple;
            default:
                return Theme.colors.mistGray;
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'teacher':
                return '👨‍🏫';
            case 'student':
                return '👨‍🎓';
            case 'principal':
                return '👔';
            default:
                return '👤';
        }
    };

    return (
        <Box
            sx={{
                flex: 1,
                backgroundColor: Theme.colors.voidIndigo,
            }}
        >
            <ScrollView>
                <VStack space="lg" sx={{ padding: Theme.spacing.lg }}>
                    {/* Header */}
                    <HStack
                        sx={{
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Heading size="2xl" color={Theme.colors.sanctuarySaffron}>
                            {t('principal.invites.title') || 'Invite Codes'}
                        </Heading>

                        <Button
                            variant="outline"
                            size="sm"
                            sx={{
                                borderColor: Theme.colors.pearlGray,
                            }}
                            onPress={onBack}
                        >
                            <ButtonText color={Theme.colors.sacredWhite}>
                                {t('common.back') || 'Back'}
                            </ButtonText>
                        </Button>
                    </HStack>

                    {/* Description */}
                    <Text color={Theme.colors.pearlGray}>
                        {t('principal.invites.description') ||
                            'Generate invite codes for teachers and students to join your school.'}
                    </Text>

                    {/* Generate Buttons */}
                    <VStack space="md">
                        <Button
                            sx={{
                                backgroundColor: Theme.colors.sageGreen,
                                padding: Theme.spacing.lg,
                            }}
                            onPress={() => handleGenerateCode('teacher')}
                            disabled={isGenerating}
                        >
                            <ButtonText color={Theme.colors.sacredWhite}>
                                {isGenerating
                                    ? t('common.generating') || 'Generating...'
                                    : t('principal.invites.generateTeacher') ||
                                    '👨‍🏫 Generate Teacher Code'}
                            </ButtonText>
                        </Button>

                        <HStack space="md">
                            <Button
                                sx={{
                                    flex: 1,
                                    backgroundColor: Theme.colors.twilightPurple,
                                    padding: Theme.spacing.lg,
                                }}
                                onPress={() => handleGenerateCode('section_head')}
                                disabled={isGenerating}
                            >
                                <ButtonText color={Theme.colors.sacredWhite}>
                                    {t('principal.invites.generateSectionHead') || '+ Section Head'}
                                </ButtonText>
                            </Button>

                            <Button
                                sx={{
                                    flex: 1,
                                    backgroundColor: Theme.colors.twilightPurple,
                                    padding: Theme.spacing.lg,
                                }}
                                onPress={() => handleGenerateCode('grade_head')}
                                disabled={isGenerating}
                            >
                                <ButtonText color={Theme.colors.sacredWhite}>
                                    {t('principal.invites.generateGradeHead') || '+ Grade Head'}
                                </ButtonText>
                            </Button>
                        </HStack>

                        <Button
                            sx={{
                                backgroundColor: Theme.colors.sanctuarySaffron,
                                padding: Theme.spacing.lg,
                            }}
                            onPress={() => handleGenerateCode('student')}
                            disabled={isGenerating}
                        >
                            <ButtonText color={Theme.colors.sacredWhite}>
                                {isGenerating
                                    ? t('common.generating') || 'Generating...'
                                    : t('principal.invites.generateStudent') ||
                                    '👨‍🎓 Generate Student Code'}
                            </ButtonText>
                        </Button>
                    </VStack>

                    {/* Loading State */}
                    {isLoading && (
                        <Box
                            sx={{
                                padding: Theme.spacing.xl,
                                alignItems: 'center',
                            }}
                        >
                            <Spinner color={Theme.colors.sanctuarySaffron} />
                        </Box>
                    )}

                    {/* Error State */}
                    {error && (
                        <Box
                            sx={{
                                padding: Theme.spacing.md,
                                backgroundColor: Theme.colors.emberRed,
                                borderRadius: Theme.corners.comfortable,
                            }}
                        >
                            <Text color={Theme.colors.sacredWhite}>{error}</Text>
                        </Box>
                    )}

                    {/* Active Codes List */}
                    {!isLoading && inviteCodes.length > 0 && (
                        <VStack space="md">
                            <Text
                                size="lg"
                                color={Theme.colors.pearlGray}
                                sx={{ fontWeight: '600', marginTop: Theme.spacing.md }}
                            >
                                {t('principal.invites.activeCodesTitle') || 'Active Invite Codes'}
                            </Text>

                            {inviteCodes.map((invite) => (
                                <Box
                                    key={invite.code}
                                    sx={{
                                        padding: Theme.spacing.md,
                                        backgroundColor: Theme.colors.deepIndigo,
                                        borderRadius: Theme.corners.comfortable,
                                        borderLeftWidth: 4,
                                        borderLeftColor: getRoleBadgeColor(invite.role),
                                    }}
                                >
                                    <HStack
                                        sx={{
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <VStack space="xs" sx={{ flex: 1 }}>
                                            {/* Code */}
                                            <HStack space="sm" sx={{ alignItems: 'center' }}>
                                                <Text
                                                    color={Theme.colors.sacredWhite}
                                                    sx={{
                                                        fontWeight: '700',
                                                        fontSize: 20,
                                                        fontFamily: 'monospace',
                                                    }}
                                                >
                                                    {invite.code}
                                                </Text>
                                                <HStack space="xs">
                                                    <Button
                                                        size="xs"
                                                        variant="link"
                                                        action="secondary"
                                                        onPress={() => handleCopyCode(invite.code)}
                                                    >
                                                        <Copy size={14} color={Theme.colors.mistGray} />
                                                    </Button>
                                                    <Button
                                                        size="xs"
                                                        variant="link"
                                                        action="secondary"
                                                        onPress={() => setQrCodeData({ code: invite.code, role: invite.role })}
                                                    >
                                                        <QrCode size={14} color={Theme.colors.mistGray} />
                                                    </Button>
                                                </HStack>
                                            </HStack>



                                            {/* Role Badge */}
                                            <HStack space="sm" sx={{ alignItems: 'center' }}>
                                                <Box
                                                    sx={{
                                                        paddingHorizontal: Theme.spacing.sm,
                                                        paddingVertical: Theme.spacing.xs,
                                                        backgroundColor: getRoleBadgeColor(
                                                            invite.role
                                                        ),
                                                        borderRadius: Theme.corners.tight,
                                                    }}
                                                >
                                                    <Text
                                                        color={Theme.colors.sacredWhite}
                                                        size="xs"
                                                        sx={{ fontWeight: '600' }}
                                                    >
                                                        {getRoleIcon(invite.role)}{' '}
                                                        {invite.role.toUpperCase()}
                                                    </Text>
                                                </Box>

                                                {/* Status */}
                                                <Text
                                                    color={Theme.colors.mistGray}
                                                    size="xs"
                                                >
                                                    {invite.used
                                                        ? t('principal.invites.used') || 'Used'
                                                        : t('principal.invites.active') ||
                                                        'Active'}
                                                </Text>
                                            </HStack>

                                            {/* Created Date */}
                                            <Text color={Theme.colors.mistGray} size="xs">
                                                {t('principal.invites.createdAt') ||
                                                    'Created:'}{' '}
                                                {new Date(
                                                    invite.created_at
                                                ).toLocaleDateString()}
                                            </Text>
                                        </VStack>

                                        {/* Copy Hint */}
                                        <Text color={Theme.colors.mistGray} size="xs">
                                            {t('principal.invites.tapToCopy') || 'Tap to copy'}
                                        </Text>
                                    </HStack>
                                </Box>
                            ))}
                        </VStack>
                    )}

                    {/* Empty State */}
                    {!isLoading && inviteCodes.length === 0 && (
                        <Box
                            sx={{
                                padding: Theme.spacing.xl,
                                alignItems: 'center',
                            }}
                        >
                            <Text
                                size="lg"
                                color={Theme.colors.pearlGray}
                                textAlign="center"
                            >
                                {t('principal.invites.noCodes') ||
                                    'No active invite codes. Generate your first code to get started!'}
                            </Text>
                        </Box>
                    )}
                </VStack>
            </ScrollView>
        </Box >
    );
}
