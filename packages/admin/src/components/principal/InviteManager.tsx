/**
 * INVITE MANAGER COMPONENT
 *
 * Manage invite codes for staff and students to join the school.
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
    Theme,
} from '@repo/ui';
import { useTranslation } from 'react-i18next';
import * as Clipboard from 'expo-clipboard';
import { type InviteCode, type AuthorityTier, handleAPIError, usePermissions } from '@repo/core';
import { invitesAPI } from '../../invites';
import { Copy, QrCode } from 'lucide-react-native';
import { QRCodeGenerator, QRBuilder } from '@repo/ui';

interface InviteManagerProps {
    schoolId: string;
    userId?: string;
    onBack: () => void;
}

export default function InviteManager({ schoolId, userId: providedUserId, onBack }: InviteManagerProps) {
    const { can, context } = usePermissions();
    const userId = providedUserId ?? context.userId;
    const { t } = useTranslation();
    const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const toast = useToast();
    const [qrCodeData, setQrCodeData] = useState<{ code: string, authority: AuthorityTier } | null>(null);

    useEffect(() => {
        loadInviteCodes();
    }, [schoolId]);

    const loadInviteCodes = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const codes = await invitesAPI.listInviteCodes(schoolId);
            setInviteCodes(codes);
        } catch (err: any) {
            const apiError = handleAPIError(err, true);
            setError(apiError.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateCode = async (role: AuthorityTier) => {
        if (!userId) {
            setError(t('common.notAuthenticated') || 'You must be signed in to generate invite codes.');
            return;
        }
        setIsGenerating(true);
        setError(null);
        try {
            await invitesAPI.generateInviteCode(schoolId, role, userId);
            await loadInviteCodes();
        } catch (err: any) {
            const apiError = handleAPIError(err, true);
            setError(apiError.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopyCode = async (code: string) => {
        try {
            await Clipboard.setStringAsync(code);
            toast.show({
                placement: 'top',
                render: ({ id }: { id: string }) => (
                    <Toast nativeID={id} action="success" variant="solid" sx={{}}                        <ToastTitle>{t('principal.invites.copied') || 'Copied!'}</ToastTitle                    ></Toast                ),
            });
        } catch (err) {
            handleAPIError(err);
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'teacher':
                return Theme.colors.sageGreen;
            case 'student':
                return Theme.colors.sanctuarySaffron;
            case 'principal':
                return Theme.colors.twilightBlue;
            default:
                return Theme.colors.mistGray;
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'teacher':
                return 'Teacher';
            case 'student':
                return 'Student';
            case 'principal':
                return 'Principal';
            default:
                return 'Member';
        }
    };

    return (
        <Box sx={{ flex: 1, backgroundColor: Theme.colors.ink }}            <ScrollView                <VStack >space="lg" sx={{ padding: Theme.spacing.lg }}                    <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}                        <Heading color={Theme.colors.sanctuarySaffron} sx={{ fontSize: 32 }}                            {t('principal.invites.title') || 'Invite Codes'}
                        </Heading                        <Button variant="outline" size="sm" sx={{ borderColor: Theme.colors.starlightGray }} onPress={onBack}                            <ButtonText color={Theme.colors.sacredWhite}>{t('common.back') || 'Back'}</ButtonText                        ></Button                    </HStack
                    <Text color={Theme.colors.starlightGray}                        {t('principal.invites.description') || 'Generate invite codes for teachers and students to join your school.'}
                    </Text
                    <VStack space="md"                        {can('create', 'PrincipalPulse') && (
                            <Button
                                sx={{ backgroundColor: Theme.colors.twilightBlue, padding: Theme.spacing.lg, marginBottom: Theme.spacing.xs }}
                                onPress={() => handleGenerateCode('principal')}
                                disabled={isGenerating}
                                                            <ButtonText color={Theme.colors.sacredWhite}                                    {isGenerating ? t('common.generating') || 'Generating...' : t('principal.invites.generatePrincipal') || 'Generate Principal Code'}
                                </ButtonText                            </Button                        )}

                        {can('create', 'TeacherPulse') && (
                            <Button
                                sx={{ backgroundColor: Theme.colors.sageGreen, padding: Theme.spacing.lg }}
                                onPress={() => handleGenerateCode('teacher')}
                                disabled={isGenerating}
                                                            <ButtonText color={Theme.colors.sacredWhite}                                    {isGenerating ? t('common.generating') || 'Generating...' : t('principal.invites.generateTeacher') || 'Generate Teacher Code'}
                                </ButtonText                            </Button                        )}

                        <HStack space="md"                            <Button
                                sx={{ flex: 1, backgroundColor: Theme.colors.twilightBlue, padding: Theme.spacing.lg }}
                                onPress={() => handleGenerateCode('sectionHead')}
                                disabled={isGenerating}
                                                            <ButtonText color={Theme.colors.sacredWhite}>{t('principal.invites.generateSectionHead') || '+ Section Head'}</ButtonText                            ></Button                            <Button
                                sx={{ flex: 1, backgroundColor: Theme.colors.twilightBlue, padding: Theme.spacing.lg }}
                                onPress={() => handleGenerateCode('gradeHead')}
                                disabled={isGenerating}
                                                            <ButtonText color={Theme.colors.sacredWhite}>{t('principal.invites.generateGradeHead') || '+ Grade Head'}</ButtonText                            </Button                        </HStack
                        {can('create', 'StudentPulse') && (
                            <Button
                                sx={{ backgroundColor: Theme.colors.sanctuarySaffron, padding: Theme.spacing.lg }}
                                onPress={() => handleGenerateCode('student')}
                                disabled={isGenerating}
                                                            <ButtonText color={Theme.colors.sacredWhite}                                    {isGenerating ? t('common.generating') || 'Generating...' : t('principal.invites.generateStudent') || 'Generate Student Code'}
                                </ButtonText                            </Button                        )}
                    </VStack
                    {isLoading && (
                        <Box sx={{ padding: Theme.spacing.xl, alignItems: 'center' }}                            <Spinner color={Theme.colors.sanctuarySaffron} /                        ></Box                    )}

                    {error && (
                        <Box sx={{ padding: Theme.spacing.md, backgroundColor: Theme.colors.emberRed, borderRadius: Theme.corners.comfortable }}                            <Text color={Theme.colors.sacredWhite}>{error}</Text                        ></Box                    )}

                    {!isLoading && inviteCodes.length > 0 && (
                        <VStack space="md"                            <Text color={Theme.colors.starlightGray} sx={{ fontWeight: '600', marginTop: Theme.spacing.md, fontSize: 18 }}                                {t('principal.invites.activeCodesTitle') || 'Active Invite Codes'}
                            </Text                            {inviteCodes.map((invite) => (
                                <Box
                                    key={invite.code}
                                    sx={{
                                        padding: Theme.spacing.md,
                                        backgroundColor: Theme.colors.ink,
                                        borderRadius: Theme.corners.comfortable,
                                        borderLeftWidth: 4,
                                        borderLeftColor: getRoleBadgeColor(invite.authority),
                                    }}
                                                                    <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}                                        <VStack space="xs" sx={{ flex: 1 }}                                            <HStack space="sm" sx={{ alignItems: 'center' }}                                                <Text color={Theme.colors.sacredWhite} sx={{ fontWeight: '700', fontSize: 20, fontFamily: 'monospace' }}                                                    {invite.code}
                                                </Text                                                <HStack space="xs"                                                    <Button size="xs" variant="link" action="secondary" onPress={() => handleCopyCode(invite.code)} sx={{}}                                                        <Copy size={14} color={Theme.colors.mistGray} /                                                    ></Button                                                    <Button size="xs" variant="link" action="secondary" onPress={() => setQrCodeData({ code: invite.code, authority: invite.authority })} sx={{}}                                                        <QrCode size={14} color={Theme.colors.mistGray} /                                                    ></Button                                                </HStack                                            </HStack
                                            <HStack space="sm" sx={{ alignItems: 'center' }}                                                <Box
                                                    sx={{
                                                        paddingHorizontal: Theme.spacing.sm,
                                                        paddingVertical: Theme.spacing.xs,
                                                        backgroundColor: getRoleBadgeColor(invite.authority),
                                                        borderRadius: Theme.corners.tight,
                                                    }}
                                                                                                    <Text color={Theme.colors.sacredWhite} sx={{ fontWeight: '600', fontSize: 12 }}                                                        {getRoleIcon(invite.authority)} {invite.authority.toUpperCase()}
                                                    </Text                                                </Box                                                <Text color={Theme.colors.mistGray} sx={{ fontSize: 12 }}                                                    {invite.used ? t('principal.invites.used') || 'Used' : t('principal.invites.active') || 'Active'}
                                                </Text                                            </HStack
                                            <Text color={Theme.colors.mistGray} sx={{ fontSize: 12 }}                                                {t('principal.invites.createdAt') || 'Created:'} {new Date(invite.created_at).toLocaleDateString()}
                                            </Text                                        </VStack                                    </HStack                                </Box                            ))}
                        </VStack                    )}

                    {!isLoading && inviteCodes.length === 0 && (
                        <Box sx={{ padding: Theme.spacing.xl, alignItems: 'center' }}                            <Text color={Theme.colors.starlightGray} textAlign="center" sx={{ fontSize: 18 }}                                {t('principal.invites.noCodes') || 'No active invite codes. Generate your first code to get started!'}
                            </Text                        </Box                    )}
                </VStack            </ScrollView
            <Modal isOpen={qrCodeData !== null} onClose={() => setQrCodeData(null)}                <ModalBackdrop /                ><ModalContent
                    sx={{
                        backgroundColor: Theme.colors.ink,
                        borderRadius: Theme.corners.generous,
                        padding: Theme.spacing.xl,
                        alignItems: 'center',
                        maxWidth: 320,
                    }}
                                    <ModalHeader                        <ModalHeading >color={Theme.colors.sanctuarySaffron} sx={{ textAlign: 'center', fontSize: 18, fontWeight: '600' }}                            {qrCodeData ? `${getRoleIcon(qrCodeData.authority)} INVITE` : 'Invite QR'}
                        </ModalHeading                        <ModalCloseButton onPress={() => setQrCodeData(null)} /                    ></ModalHeader                    <ModalBody sx={{ alignItems: 'center', paddingVertical: Theme.spacing.lg }}                        {qrCodeData && (
                            <                                <QRCodeGenerator
                                    value={QRBuilder.invite(qrCodeData.code, schoolId, qrCodeData.authority)}
                                    size={220}
                                    color={Theme.colors.ink}
                                    backgroundColor={Theme.colors.sacredWhite}
                                    label={qrCodeData.code}
                                    errorCorrectionLevel="H"
                                    borderRadius={12}
                                    padding={16}
                                /                                ><Text color={Theme.colors.starlightGray} sx={{ marginTop: Theme.spacing.md, textAlign: 'center', fontSize: 13 }}                                    Scan to join as {qrCodeData.authority}
                                </Text                            </                        )}
                    </ModalBody                </ModalContent            </Modal        </Box    );
}
