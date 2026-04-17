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
    Heading as ModalHeading} from '@repo/ui';
import { TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Clipboard from 'expo-clipboard';
import { api, InviteCode, handleAPIError, type PrincipalInviteRole as UserRole } from '@repo/core';
import {  } from '@repo/ui';
import { Copy, RefreshCw, Users, Shield, QrCode } from 'lucide-react-native';
import { QRCodeGenerator, QRBuilder } from '@repo/scanner-kit';

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
            const apiError = handleAPIError(err, true);
            setError(apiError.message);
        } finally {
            setIsLoading(false);
        };

    const handleGenerateCode = async (role: UserRole) => {
        setIsGenerating(true);
        setError(null);
        try {
            await api.school.generateInviteCode(schoolId, role, userId);
            await loadInviteCodes();
        } catch (err: any) {
            const apiError = handleAPIError(err, true);
            setError(apiError.message);
        } finally {
            setIsGenerating(false);
        };

    const handleCopyCode = async (code: string) => {
        try {
            await Clipboard.setStringAsync(code);
            toast.show({
                placement: 'top',
                render: ({ id }: { id: string }) => {
                    return (
                        <Toast nativeID={id} action="success" variant="solid" sx={{}}>
                            <ToastTitle>{t('principal.invites.copied') || 'Copied!'}</ToastTitle>
                        </Toast>
                    );
                }});
        } catch (err) {
            handleAPIError(err);
        };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'teacher':
                return sageGreen;
            case 'student':
                return sanctuarySaffron;
            case 'principal':
                return twilightBlue;
            default:
                return mistGray;
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
        };

    return (
        <Box
            sx={{
                flex: 1,
                backgroundColor: '#2A2318'}}
        >
            <ScrollView>
                <VStack space="lg" sx={{ padding: Theme.spacing.lg }}>
                    {/* Header */}
                    <HStack
                        sx={{
                            justifyContent: 'space-between',
                            alignItems: 'center'}}
                    >
                        <Heading
                            color={sanctuarySaffron}
                            sx={{ fontSize: 32 }}
                        >
                            {t('principal.invites.title') || 'Invite Codes'}
                        </Heading>

                        <Button
                            variant="outline"
                            size="sm"
                            sx={{
                                borderColor: starlightGray}}
                            onPress={onBack}
                        >
                            <ButtonText color={sacredWhite}>
                                {t('common.back') || 'Back'}
                            </ButtonText>
                        </Button>
                    </HStack>

                    {/* Description */}
                    <Text color={starlightGray}>
                        {t('principal.invites.description') ||
                            'Generate invite codes for teachers and students to join your school.'}
                    </Text>

                    {/* Generate Buttons */}
                    <VStack space="md">
                        <Button
                            sx={{
                                backgroundColor: twilightBlue,
                                padding: Theme.spacing.lg,
                                marginBottom: Theme.spacing.xs}}
                            onPress={() => handleGenerateCode('principal')}
                            disabled={isGenerating}
                        >
                            <ButtonText color={sacredWhite}>
                                {isGenerating
                                    ? t('common.generating') || 'Generating...'
                                    : t('principal.invites.generatePrincipal') ||
                                    '👔 Generate Principal Code'}
                            </ButtonText>
                        </Button>

                        <Button
                            sx={{
                                backgroundColor: sageGreen,
                                padding: Theme.spacing.lg}}
                            onPress={() => handleGenerateCode('teacher')}
                            disabled={isGenerating}
                        >

                            <ButtonText color={sacredWhite}>
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
                                    backgroundColor: twilightBlue,
                                    padding: Theme.spacing.lg}}
                                onPress={() => handleGenerateCode('sectionHead')}
                                disabled={isGenerating}
                            >
                                <ButtonText color={sacredWhite}>
                                    {t('principal.invites.generateSectionHead') || '+ Section Head'}
                                </ButtonText>
                            </Button>

                            <Button
                                sx={{
                                    flex: 1,
                                    backgroundColor: twilightBlue,
                                    padding: Theme.spacing.lg}}
                                onPress={() => handleGenerateCode('gradeHead')}
                                disabled={isGenerating}
                            >
                                <ButtonText color={sacredWhite}>
                                    {t('principal.invites.generateGradeHead') || '+ Grade Head'}
                                </ButtonText>
                            </Button>
                        </HStack>

                        <Button
                            sx={{
                                backgroundColor: sanctuarySaffron,
                                padding: Theme.spacing.lg}}
                            onPress={() => handleGenerateCode('student')}
                            disabled={isGenerating}
                        >
                            <ButtonText color={sacredWhite}>
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
                                alignItems: 'center'}}
                        >
                            <Spinner color={sanctuarySaffron} />
                        </Box>
                    )}

                    {/* Error State */}
                    {error && (
                        <Box
                            sx={{
                                padding: Theme.spacing.md,
                                backgroundColor: emberRed,
                                borderRadius: Theme.corners.comfortable}}
                        >
                            <Text color={sacredWhite}>{error}</Text>
                        </Box>
                    )}

                    {/* Active Codes List */}
                    {!isLoading && inviteCodes.length > 0 && (
                        <VStack space="md">
                            <Text
                                color={starlightGray}
                                sx={{
                                    fontWeight: '600',
                                    marginTop: Theme.spacing.md,
                                    fontSize: 18}}
                            >
                                {t('principal.invites.activeCodesTitle') || 'Active Invite Codes'}
                            </Text>

                            {inviteCodes.map((invite) => (
                                <Box
                                    key={invite.code}
                                    sx={{
                                        padding: Theme.spacing.md,
                                        backgroundColor: '#2A2318',
                                        borderRadius: Theme.corners.comfortable,
                                        borderLeftWidth: 4,
                                        borderLeftColor: getRoleBadgeColor(invite.role)}}
                                >
                                    <HStack
                                        sx={{
                                            justifyContent: 'space-between',
                                            alignItems: 'center'}}
                                    >
                                        <VStack space="xs" sx={{ flex: 1 }}>
                                            {/* Code */}
                                            <HStack space="sm" sx={{ alignItems: 'center' }}>
                                                <Text
                                                    color={sacredWhite}
                                                    sx={{
                                                        fontWeight: '700',
                                                        fontSize: 20,
                                                        fontFamily: 'monospace'}}
                                                >
                                                    {invite.code}
                                                </Text>
                                                <HStack space="xs">
                                                    <Button
                                                        size="xs"
                                                        variant="link"
                                                        action="secondary"
                                                        onPress={() => handleCopyCode(invite.code)}
                                                        sx={{}}
                                                    >
                                                        <Copy size={14} color={mistGray} />
                                                    </Button>
                                                    <Button
                                                        size="xs"
                                                        variant="link"
                                                        action="secondary"
                                                        onPress={() => setQrCodeData({ code: invite.code, role: invite.role })}
                                                        sx={{}}
                                                    >
                                                        <QrCode size={14} color={mistGray} />
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
                                                        borderRadius: Theme.corners.tight}}
                                                >
                                                    <Text
                                                        color={sacredWhite}
                                                        sx={{ fontWeight: '600', fontSize: 12 }}
                                                    >
                                                        {getRoleIcon(invite.role)}{' '}
                                                        {invite.role.toUpperCase()}
                                                    </Text>
                                                </Box>

                                                {/* Status */}
                                                <Text
                                                    color={mistGray}
                                                    sx={{ fontSize: 12 }}
                                                >
                                                    {invite.used
                                                        ? t('principal.invites.used') || 'Used'
                                                        : t('principal.invites.active') ||
                                                        'Active'}
                                                </Text>
                                            </HStack>

                                            {/* Created Date */}
                                            <Text color={mistGray} sx={{ fontSize: 12 }}>
                                                {t('principal.invites.createdAt') ||
                                                    'Created:'}{' '}
                                                {new Date(
                                                    invite.created_at
                                                ).toLocaleDateString()}
                                            </Text>
                                        </VStack>

                                        {/* Copy Hint */}
                                        <Text color={mistGray} sx={{ fontSize: 12 }}>
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
                                alignItems: 'center'}}
                        >
                            <Text
                                color={starlightGray}
                                textAlign="center"
                                sx={{ fontSize: 18 }}
                            >
                                {t('principal.invites.noCodes') ||
                                    'No active invite codes. Generate your first code to get started!'}
                            </Text>
                        </Box>
                    )}
                </VStack>
            </ScrollView>

            {/* QR Code Modal — shows invite QR when principal taps the QR icon */}
            <Modal
                isOpen={qrCodeData !== null}
                onClose={() => setQrCodeData(null)}
            >
                <ModalBackdrop />
                <ModalContent
                    sx={{
                        backgroundColor: '#2A2318',
                        borderRadius: Theme.corners.generous,
                        padding: Theme.spacing.xl,
                        alignItems: 'center',
                        maxWidth: 320}}
                >
                    <ModalHeader>
                        <ModalHeading
                            color={sanctuarySaffron}
                            sx={{ textAlign: 'center', fontSize: 18, fontWeight: '600' }}
                        >
                            {qrCodeData
                                ? `${getRoleIcon(qrCodeData.role)} ${qrCodeData.role.toUpperCase()} INVITE`
                                : 'Invite QR'}
                        </ModalHeading>
                        <ModalCloseButton onPress={() => setQrCodeData(null)} />
                    </ModalHeader>
                    <ModalBody sx={{ alignItems: 'center', paddingVertical: Theme.spacing.lg }}>
                        {qrCodeData && (
                            <>
                                <QRCodeGenerator
                                    value={QRBuilder.invite(
                                        qrCodeData.code,
                                        schoolId,
                                        qrCodeData.role,
                                    )}
                                    size={220}
                                    color={'#2A2318'}
                                    backgroundColor={sacredWhite}
                                    label={qrCodeData.code}
                                    errorCorrectionLevel="H"
                                    borderRadius={12}
                                    padding={16}
                                />
                                <Text
                                    color={starlightGray}
                                    sx={{ marginTop: Theme.spacing.md, textAlign: 'center', fontSize: 13 }}
                                >
                                    Scan to join as {qrCodeData.role}
                                </Text>
                                <Text
                                    color={mistGray}
                                    sx={{ marginTop: Theme.spacing.xs, textAlign: 'center', fontSize: 12, fontFamily: 'monospace' }}
                                >
                                    Code: {qrCodeData.code}
                                </Text>
                            </>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box >
    );
}
