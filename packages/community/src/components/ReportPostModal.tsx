import React, { useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    Button,
    ButtonText,
    useThemedColors,
    Theme,
    hapticSuccess,
    hapticError,
    useLotusToast
} from '@repo/ui';
import { X, AlertTriangle, ShieldOff, UserX } from 'lucide-react-native';
import { communityAPI } from '@repo/community';

interface ReportPostModalProps {
    isOpen: boolean;
    onClose: () => void;
    postId?: string;
    groupId?: string;
    targetUserId?: string;
    reporterId: string;
}

const REPORT_REASONS = [
    { label: 'Harmful Content', value: 'harmful', icon: AlertTriangle },
    { label: 'Harassment', value: 'harassment', icon: UserX },
    { label: 'Inappropriate for School', value: 'inappropriate', icon: ShieldOff },
    { label: 'Other', value: 'other', icon: AlertTriangle },
];

export default function ReportPostModal({
    isOpen,
    onClose,
    postId,
    groupId,
    targetUserId,
    reporterId
}: ReportPostModalProps) {
    const colors = useThemedColors();
    const { showToast } = useLotusToast();
    const [reason, setReason] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);

    const handleReport = async () => {
        if (!reason) return;

        setSubmitting(true);
        try {
            await communityAPI.reportContent({
                post_id: postId,
                group_id: groupId,
                target_user_id: targetUserId,
                reason: reason,
            }, reporterId);

            hapticSuccess();
            showToast({
                message: "Thank you for your care. Our guardians will review this shortly.",
                type: 'success'
            });
            onClose();
        } catch (error) {
            console.error('Report error:', error);
            hapticError();
            showToast({
                message: "Failed to send report. Please try again later.",
                type: 'error'
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            visible={isOpen}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <Box sx={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' }}>
                <Box
                    sx={{
                        backgroundColor: Theme.colors.midnightBlue,
                        borderTopLeftRadius: Theme.corners.generous,
                        borderTopRightRadius: Theme.corners.generous,
                        padding: Theme.spacing.lg,
                        paddingBottom: 40,
                    }}
                >
                    <VStack space="xl">
                        <HStack justifyContent="space-between" alignItems="center">
                            <VStack space="xs">
                                <Heading color={Theme.colors.sacredWhite} size="lg">Report for High Care</Heading>
                                <Text color={Theme.colors.mistGray} size="sm">Help keep the Sanctuary safe and nurturing.</Text>
                            </VStack>
                            <TouchableOpacity onPress={onClose}>
                                <X color={Theme.colors.mistGray} size={24} />
                            </TouchableOpacity>
                        </HStack>

                        <VStack space="md">
                            {REPORT_REASONS.map((item) => {
                                const Icon = item.icon;
                                const isSelected = reason === item.value;
                                return (
                                    <TouchableOpacity
                                        key={item.value}
                                        onPress={() => setReason(item.value)}
                                        style={[
                                            styles.reasonItem,
                                            {
                                                borderColor: isSelected ? Theme.colors.sanctuarySaffron : 'rgba(255,255,255,0.05)',
                                                backgroundColor: isSelected ? 'rgba(230, 126, 34, 0.1)' : 'rgba(255,255,255,0.02)'
                                            }
                                        ]}
                                    >
                                        <HStack space="md" alignItems="center">
                                            <Box sx={{ p: '$2', borderRadius: '$full', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                                <Icon size={20} color={isSelected ? Theme.colors.sanctuarySaffron : Theme.colors.mistGray} />
                                            </Box>
                                            <Text color={isSelected ? Theme.colors.sacredWhite : Theme.colors.pearlGray} bold={isSelected}>
                                                {item.label}
                                            </Text>
                                        </HStack>
                                    </TouchableOpacity>
                                );
                            })}
                        </VStack>

                        <Button
                            onPress={handleReport}
                            isDisabled={!reason || submitting}
                            sx={{
                                backgroundColor: Theme.colors.sanctuarySaffron,
                                borderRadius: Theme.corners.comfortable,
                                height: 50,
                            }}
                        >
                            <ButtonText color="black" bold>
                                {submitting ? 'Sending Report...' : 'Submit Report'}
                            </ButtonText>
                        </Button>
                    </VStack>
                </Box>
            </Box>
        </Modal>
    );
}

const styles = StyleSheet.create({
    reasonItem: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    }
});
