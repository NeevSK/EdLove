import React, { useState } from 'react';
import {
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Heading,
    Icon,
    CloseIcon,
    VStack,
    HStack,
    Box,
    Text,
    Input,
    InputField,
    Button,
    ButtonText,
    FormControl,
    FormControlLabel,
    FormControlLabelText,
    Spinner,
    useTheme,
} from '@repo/ui';
import { QrCode, CheckCircle2 } from 'lucide-react-native';
import { Theme } from '@repo/ui';
import { api, identityAPI, useStore } from '@repo/core';
import { hapticSuccess } from '@repo/ui';
import { useThemedColors } from '@repo/ui';

interface ClaimInviteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function ClaimInviteModal({ isOpen, onClose, onSuccess }: ClaimInviteModalProps) {
    const [inviteCode, setInviteCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [successData, setSuccessData] = useState<any>(null);
    const colors = useThemedColors();
    const { text } = useTheme();
    const { user, setUser } = useStore();

    const handleClaim = async () => {
        if (!inviteCode.trim()) return;
        try {
            setLoading(true);
            const result = await api.classroomStudents.claimStudent(inviteCode.trim());
            
            // Sync school_id if the classroom belongs to a school
            if (result?.class_id) {
                const classroom = await api.classrooms.getById(result.class_id);
                
                if (classroom?.school_id) {
                    const userId = await identityAPI.getMyInternalId();
                    if (userId) {
                        await identityAPI.updateProfile(userId, { school_id: classroom.school_id });
                        if (user) {
                            setUser({ ...user, school_id: classroom.school_id } as any);
                        }
                    }
                }
            }

            setSuccessData(result);
            hapticSuccess();
        } catch (error: any) {
            console.error('Failed to claim record:', error);
            alert(error.message || 'Invalid invite code or record already claimed.');
        } finally {
            setLoading(false);
        }
    };

    const handleDone = () => {
        onSuccess();
        setInviteCode('');
        setSuccessData(null);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}            <ModalBackdrop /            <ModalContent sx={{ backgroundColor: colors.secondary, borderColor: colors.border, borderWidth: 1 }}                <ModalHeader                    <Heading color={colors.text}>Claim Invite</Heading                    <ModalCloseButton                        <Icon as={CloseIcon} color={colors.textSecondary} /                    </ModalCloseButton                </ModalHeader                <ModalBody                    {successData ? (
                        <VStack sx={{ gap: 16, alignItems: 'center', paddingVertical: 24 }}                            <Box sx={{ backgroundColor: colors.tertiary, padding: 20, borderRadius: 40 }}                                <CheckCircle2 size={48} color={Theme.colors.sageGreen} /                            </Box                            <VStack sx={{ gap: 4, alignItems: 'center' }}                                <Text color={colors.text} sx={{ fontWeight: 'bold', fontSize: 18 }}>Successfully Enrolled!</Text                                <Text color={colors.textSecondary} textAlign="center"                                    You have successfully linked your account to your classroom record.
                                </Text                            </VStack                            <Button
                                onPress={handleDone}
                                sx={{ backgroundColor: Theme.colors.sanctuarySaffron, width: '100%' }}
                                                            <ButtonText>Continue to Classroom</ButtonText                            </Button                        </VStack                    ) : (
                        <VStack sx={{ gap: 16, paddingBottom: 16 }}                            <Box sx={{ padding: Theme.spacing.md, backgroundColor: colors.tertiary, borderRadius: Theme.corners.comfortable }}                                <HStack sx={{ gap: 8, alignItems: 'center' }}                                    <QrCode size={20} color={Theme.colors.sanctuarySaffron} /                                    <Text color={colors.textSecondary} sx={{ fontSize: 14 }}                                        Enter the 8-character invite code provided by your teacher.
                                    </Text                                </HStack                            </Box
                            <FormControl isRequired                                <FormControlLabel                                    <FormControlLabelText color={colors.textSecondary}>Invite Code</FormControlLabelText                                </FormControlLabel                                <Input sx={{ borderColor: colors.border, backgroundColor: colors.primary, height: 60 }}                                    <InputField
                                        placeholder="e.g. a1b2c3d4"
                                        color={colors.text}
                                        value={inviteCode}
                                        onChangeText={setInviteCode}
                                        autoCapitalize="none"
                                        sx={{ fontSize: 24, textAlign: 'center', fontWeight: 'bold', letterSpacing: 4 }}
                                    /                                </Input                            </FormControl
                            <Button
                                onPress={handleClaim}
                                disabled={loading || inviteCode.length < 6}
                                sx={{ backgroundColor: Theme.colors.sanctuarySaffron, height: 50 }}
                                                            {loading ? <Spinner {...({ color: text.inverse } as any)} /> : <ButtonText>Claim Record</ButtonText>}
                            </Button                        </VStack                    )}
                </ModalBody            </ModalContent        </Modal    );
}
