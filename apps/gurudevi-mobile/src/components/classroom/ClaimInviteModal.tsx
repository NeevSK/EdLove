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

interface ClaimInviteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function ClaimInviteModal({ isOpen, onClose, onSuccess }: ClaimInviteModalProps) {
    const [inviteCode, setInviteCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [successData, setSuccessData] = useState<any>(null);

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
            <ModalContent sx={{ backgroundColor: Theme.colors.midnightBlue, borderColor: Theme.colors.deepIndigo, borderWidth: 1 }}>
                <ModalHeader>
                    <Heading color={Theme.colors.sacredWhite}>Claim Invite</Heading>
                    <ModalCloseButton>
                        <Icon as={CloseIcon} color={Theme.colors.mistGray} />
                    </ModalCloseButton>
                </ModalHeader>
                <ModalBody>
                    {successData ? (
                        <VStack space="lg" alignItems="center" py="$6">
                            <Box sx={{ backgroundColor: Theme.colors.deepIndigo, padding: 20, borderRadius: 40 }}>
                                <CheckCircle2 size={48} color={Theme.colors.sageGreen} />
                            </Box>
                            <VStack space="xs" alignItems="center">
                                <Text color={Theme.colors.sacredWhite} fontWeight="$bold" size="lg">Successfully Enrolled!</Text>
                                <Text color={Theme.colors.mistGray} textAlign="center">
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
                            <Box sx={{ padding: Theme.spacing.md, backgroundColor: Theme.colors.deepIndigo, borderRadius: Theme.corners.comfortable }}>
                                <HStack space="sm" alignItems="center">
                                    <QrCode size={20} color={Theme.colors.sanctuarySaffron} />
                                    <Text size="sm" color={Theme.colors.mistGray}>
                                        Enter the 8-character invite code provided by your teacher.
                                    </Text>
                                </HStack>
                            </Box>

                            <FormControl isRequired>
                                <FormControlLabel>
                                    <FormControlLabelText color={Theme.colors.mistGray}>Invite Code</FormControlLabelText>
                                </FormControlLabel>
                                <Input sx={{ borderColor: Theme.colors.deepIndigo, backgroundColor: Theme.colors.voidIndigo, height: 60 }}>
                                    <InputField
                                        placeholder="e.g. a1b2c3d4"
                                        color={Theme.colors.sacredWhite}
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
