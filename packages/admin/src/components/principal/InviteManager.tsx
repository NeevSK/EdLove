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
    Icon,
    Pressable
} from '@repo/ui';
import { useTranslation } from 'react-i18next';
import * as Clipboard from 'expo-clipboard';
import { api, InviteCode, handleAPIError, type PrincipalInviteRole as UserRole } from '@repo/core';
import { Copy, Users, Shield, QrCode, ArrowLeft, ChevronRight, Plus } from 'lucide-react-native';
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
        }
    };

    useEffect(() => {
        loadInviteCodes();
    }, [schoolId]);

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
        }
    };

    const handleCopyCode = async (code: string) => {
        try {
            await Clipboard.setStringAsync(code);
            toast.showToast({
                message: t('principal.invites.copied') || 'Copied to Clipboard',
                type: 'success'
            });
        } catch (err) {
            handleAPIError(err);
        }
    };

    const getRoleConfig = (role: string) => {
        switch (role) {
            case 'teacher':
                return { color: 'text-blue-600', bg: 'bg-blue-500/10', icon: '👨‍🏫' };
            case 'student':
                return { color: 'text-amber-600', bg: 'bg-amber-500/10', icon: '👨‍🎓' };
            case 'principal':
                return { color: 'text-purple-600', bg: 'bg-purple-500/10', icon: '👔' };
            case 'sectionHead':
                return { color: 'text-indigo-600', bg: 'bg-indigo-500/10', icon: '🏢' };
            case 'gradeHead':
                return { color: 'text-cyan-600', bg: 'bg-cyan-500/10', icon: '📏' };
            default:
                return { color: 'text-ink/60', bg: 'bg-ink/5', icon: '👤' };
        }
    };

    return (
        <VStack className="flex-1 bg-silk">
            <ScrollView showsVerticalScrollIndicator={false}>
                <VStack className="gap-8 p-6 pb-20">
                    {/* Header */}
                    <VStack className="gap-4">
                        <Pressable onPress={onBack}>
                            <HStack className="items-center gap-2 bg-white px-4 py-2 rounded-xl border border-border self-start shadow-sm active:opacity-70">
                                <Icon as={ArrowLeft} size="sm" className="text-ink" />
                                <Text className="text-sm font-black text-ink">Back</Text>
                            </HStack>
                        </Pressable>
                        
                        <VStack className="gap-1">
                            <Heading className="text-3xl font-black text-ink uppercase tracking-wider">
                                {t('principal.invites.title', 'Invite Codes')}
                            </Heading>
                            <Text className="text-sm font-bold text-ink/40 leading-relaxed max-w-[80%]">
                                {t('principal.invites.description', 'Generate and manage secure access keys for your faculty and students.')}
                            </Text>
                        </VStack>
                    </VStack>

                    {/* Generate Actions */}
                    <VStack className="gap-3">
                        <Button
                            onPress={() => handleGenerateCode('principal')}
                            isDisabled={isGenerating}
                            className="bg-indigo-600 h-16 rounded-2xl flex-row items-center px-6 shadow-sm active:scale-95"
                        >
                            <HStack className="flex-1 items-center justify-between">
                                <HStack className="items-center gap-3">
                                    <Box className="w-10 h-10 rounded-xl bg-white/20 items-center justify-center">
                                        <Icon as={Shield} className="text-white" size="sm" />
                                    </Box>
                                    <ButtonText className="text-white font-black uppercase tracking-widest text-sm">
                                        {isGenerating ? 'Engaging...' : 'Acknowledge Principal'}
                                    </ButtonText>
                                </HStack>
                                <Icon as={Plus} className="text-white" />
                            </HStack>
                        </Button>

                        <HStack className="gap-3">
                            <Button
                                onPress={() => handleGenerateCode('teacher')}
                                isDisabled={isGenerating}
                                className="flex-1 bg-blue-600 h-16 rounded-2xl items-center justify-center shadow-sm active:scale-95"
                            >
                                <ButtonText className="text-white font-black uppercase tracking-widest text-xs">
                                    Add Teacher
                                </ButtonText>
                            </Button>
                            <Button
                                onPress={() => handleGenerateCode('student')}
                                isDisabled={isGenerating}
                                className="flex-1 bg-amber-500 h-16 rounded-2xl items-center justify-center shadow-sm active:scale-95"
                            >
                                <ButtonText className="text-white font-black uppercase tracking-widest text-xs">
                                    Add Student
                                </ButtonText>
                            </Button>
                        </HStack>

                        <HStack className="gap-3">
                            <Button
                                onPress={() => handleGenerateCode('sectionHead')}
                                isDisabled={isGenerating}
                                className="flex-1 bg-zinc-800 h-14 rounded-2xl items-center justify-center active:scale-95"
                            >
                                <ButtonText className="text-white font-bold uppercase tracking-widest text-[10px]">
                                    + Section Head
                                </ButtonText>
                            </Button>
                            <Button
                                onPress={() => handleGenerateCode('gradeHead')}
                                isDisabled={isGenerating}
                                className="flex-1 bg-zinc-800 h-14 rounded-2xl items-center justify-center active:scale-95"
                            >
                                <ButtonText className="text-white font-bold uppercase tracking-widest text-[10px]">
                                    + Grade Head
                                </ButtonText>
                            </Button>
                        </HStack>
                    </VStack>

                    {/* Error Handle */}
                    {error && (
                        <Box className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
                            <Text className="text-red-600 font-bold text-sm text-center">{error}</Text>
                        </Box>
                    )}

                    {/* Active Codes */}
                    <VStack className="gap-4">
                        <HStack className="justify-between items-center px-1">
                            <Heading className="text-lg font-black text-ink uppercase tracking-widest">
                                {t('principal.invites.activeCodesTitle', 'Active Keys')}
                            </Heading>
                            {isLoading && <Spinner color="#ffbf00" />}
                        </HStack>

                        {inviteCodes.length === 0 && !isLoading ? (
                            <Box className="p-12 items-center justify-center bg-ink/5 rounded-3xl border border-dashed border-border">
                                <Icon as={Users} size="xl" className="text-ink/10 mb-3" />
                                <Text className="text-center font-bold text-ink/30 italic">
                                    No active keys found.
                                </Text>
                            </Box>
                        ) : (
                            <VStack className="gap-3">
                                {inviteCodes.map((invite) => {
                                    const config = getRoleConfig(invite.role);
                                    return (
                                        <Box
                                            key={invite.code}
                                            className="bg-white p-5 rounded-3xl border border-border flex-row items-center shadow-sm"
                                        >
                                            <VStack className="flex-1 gap-2">
                                                <HStack className="items-baseline gap-2">
                                                    <Text className="text-2xl font-black text-primary italic tracking-widest font-mono">
                                                        {invite.code}
                                                    </Text>
                                                    <Box className={`px-2 py-0.5 rounded-lg ${config.bg}`}>
                                                        <Text className={`text-[10px] font-black uppercase ${config.color}`}>
                                                            {config.icon} {invite.role}
                                                        </Text>
                                                    </Box>
                                                </HStack>
                                                
                                                <HStack className="gap-3">
                                                    <Text className="text-[10px] font-bold text-ink/30 uppercase tracking-widest">
                                                        Issued: {new Date(invite.created_at).toLocaleDateString()}
                                                    </Text>
                                                    <Box className={`w-1.5 h-1.5 rounded-full mt-1 ${invite.used ? 'bg-ink/30' : 'bg-green-500'}`} />
                                                    <Text className={`text-[10px] font-black uppercase tracking-widest ${invite.used ? 'text-ink/30' : 'text-green-600'}`}>
                                                        {invite.used ? 'Redeemed' : 'Ready'}
                                                    </Text>
                                                </HStack>
                                            </VStack>

                                            <HStack className="gap-2">
                                                <Pressable
                                                    onPress={() => handleCopyCode(invite.code)}
                                                    className="w-11 h-11 rounded-2xl bg-silk items-center justify-center border border-border active:opacity-60"
                                                >
                                                    <Icon as={Copy} size="sm" className="text-ink/60" />
                                                </Pressable>
                                                <Pressable
                                                    onPress={() => setQrCodeData({ code: invite.code, role: invite.role })}
                                                    className="w-11 h-11 rounded-2xl bg-primary items-center justify-center shadow-md shadow-primary/20 active:opacity-80"
                                                >
                                                    <Icon as={QrCode} size="sm" className="text-white" />
                                                </Pressable>
                                            </HStack>
                                        </Box>
                                    );
                                })}
                            </VStack>
                        )}
                    </VStack>
                </VStack>
            </ScrollView>

            {/* QR Modal */}
            <Modal
                isOpen={qrCodeData !== null}
                onClose={() => setQrCodeData(null)}
            >
                <ModalBackdrop />
                <ModalContent className="bg-white rounded-[40px] p-8 items-center max-w-[340px]">
                    <ModalHeader className="mb-6 border-b-0">
                        <VStack className="items-center gap-1">
                            <ModalHeading className="text-xl font-black text-ink uppercase tracking-widest text-center">
                                Access Key
                            </ModalHeading>
                            {qrCodeData && (
                                <Text className="text-xs font-bold text-ink/40 uppercase">
                                    {qrCodeData.role} • IDENTITY VERIFIED
                                </Text>
                            )}
                        </VStack>
                        <ModalCloseButton onPress={() => setQrCodeData(null)} />
                    </ModalHeader>
                    <ModalBody className="items-center gap-6">
                        {qrCodeData && (
                            <VStack className="items-center gap-6">
                                <Box className="p-6 bg-silk rounded-[32px] border border-border">
                                    <QRCodeGenerator
                                        value={QRBuilder.invite(
                                            qrCodeData.code,
                                            schoolId,
                                            qrCodeData.role,
                                        )}
                                        size={220}
                                        color="#111827"
                                        backgroundColor="#FAFAFA"
                                        label={qrCodeData.code}
                                        errorCorrectionLevel="H"
                                        borderRadius={16}
                                        padding={20}
                                    />
                                </Box>
                                <VStack className="items-center gap-1">
                                    <Text className="text-2xl font-mono font-black text-primary tracking-widest italic">
                                        {qrCodeData.code}
                                    </Text>
                                    <Text className="text-[10px] font-black text-ink/40 uppercase tracking-widest">
                                        Scan to establish authority
                                    </Text>
                                </VStack>
                            </VStack>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </VStack>
    );
}
