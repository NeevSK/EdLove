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
} from '@/ui';
import { QrCode, CheckCircle2 } from 'lucide-react-native';
import { Theme } from '../../constants/Theme';
import { api } from '../../lib/api';
import { hapticSuccess } from '../../utils/haptics';
import { useThemedColors } from '../../hooks/useThemedColors';

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

    const handleClaim = async () => {
        if (!inviteCode.trim()) return;
        try {
            setLoading(true);
            const result = await api.classroomStudents.claimStudent(inviteCode.trim());
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
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <ModalBackdrop />
            <ModalContent sx={{ backgroundColor: colors.secondary, borderColor: colors.border, borderWidth: 1 }}>
                <ModalHeader>
                    <Heading color={colors.text}>Claim Invite</Heading>
                    <ModalCloseButton>
                        <Icon as={CloseIcon} color={colors.textSecondary} />
                    </ModalCloseButton>
                </ModalHeader>
                <ModalBody>
                    {successData ? (
                        <VStack space="lg" alignItems="center" py="$6">
                            <Box sx={{ backgroundColor: colors.tertiary, padding: 20, borderRadius: 40 }}>
                                <CheckCircle2 size={48} color={Theme.colors.sageGreen} />
                            </Box>
                            <VStack space="xs" alignItems="center">
                                <Text color={colors.text} fontWeight="$bold" size="lg">Successfully Enrolled!</Text>
                                <Text color={colors.textSecondary} textAlign="center">
                                    You have successfully linked your account to your classroom record.
                                </Text>
                            </VStack>
                            <Button
                                onPress={handleDone}
                                sx={{ backgroundColor: Theme.colors.sanctuarySaffron, width: '100%' }}
                            >
                                <ButtonText>Continue to Classroom</ButtonText>
                            </Button>
                        </VStack>
                    ) : (
                        <VStack space="lg" pb="$4">
                            <Box sx={{ padding: Theme.spacing.md, backgroundColor: colors.tertiary, borderRadius: Theme.corners.comfortable }}>
                                <HStack space="sm" alignItems="center">
                                    <QrCode size={20} color={Theme.colors.sanctuarySaffron} />
                                    <Text size="sm" color={colors.textSecondary}>
                                        Enter the 8-character invite code provided by your teacher.
                                    </Text>
                                </HStack>
                            </Box>

                            <FormControl isRequired>
                                <FormControlLabel>
                                    <FormControlLabelText color={colors.textSecondary}>Invite Code</FormControlLabelText>
                                </FormControlLabel>
                                <Input sx={{ borderColor: colors.border, backgroundColor: colors.primary, height: 60 }}>
                                    <InputField
                                        placeholder="e.g. a1b2c3d4"
                                        color={colors.text}
                                        value={inviteCode}
                                        onChangeText={setInviteCode}
                                        autoCapitalize="none"
                                        sx={{ fontSize: 24, textAlign: 'center', fontWeight: 'bold', letterSpacing: 4 }}
                                    />
                                </Input>
                            </FormControl>

                            <Button
                                onPress={handleClaim}
                                disabled={loading || inviteCode.length < 6}
                                sx={{ backgroundColor: Theme.colors.sanctuarySaffron, height: 50 }}
                            >
                                {loading ? <Spinner color="white" /> : <ButtonText>Claim Record</ButtonText>}
                            </Button>
                        </VStack>
                    )}
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
