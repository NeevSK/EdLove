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
    Theme,
    hapticSuccess,
    hapticError,
    useLotusToast,
    useTheme,
} from '@repo/ui';
import { X, AlertTriangle, ShieldOff, UserX } from 'lucide-react-native';
import { communityAPI } from '../api/community';

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
    const { glass, text, accent, isDark } = useTheme();
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
            {/* Backdrop: Shadow Violet — NEVER black */}
            <Box sx={{
                flex: 1,
                justifyContent: 'flex-end',
                backgroundColor: isDark
                    ? 'rgba(107,100,128,0.65)'
                    : 'rgba(107,100,128,0.45)',
            }}>
                <Box
                    sx={{
                        backgroundColor: glass.modal.bg,
                        borderTopLeftRadius: Theme.corners.generous,
                        borderTopRightRadius: Theme.corners.generous,
                        borderTopWidth: 1,
                        borderLeftWidth: 1,
                        borderRightWidth: 1,
                        borderColor: glass.modal.border,
                        padding: Theme.spacing.lg,
                        paddingBottom: 40,
                        // Shadow Violet — never black
                        shadowColor: Theme.colors.shadowViolet,
                        shadowOffset: { width: 0, height: -4 },
                        shadowOpacity: 0.12,
                        shadowRadius: 16,
                        elevation: 8,
                    }}
                >
                    <VStack {...({ space: "xl" } as any)}>
                        <HStack justifyContent="space-between" alignItems="center">
                            <VStack {...({ space: "xs" } as any)}>
                                <Heading {...({ color: text.primary, size: "lg" } as any)}>
                                    Report for High Care
                                </Heading>
                                <Text {...({ color: text.secondary, size: "sm" } as any)}>
                                    Help keep the Sanctuary safe and nurturing.
                                </Text>
                            </VStack>
                            <TouchableOpacity onPress={onClose}>
                                <X color={text.muted} size={24} />
                            </TouchableOpacity>
                        </HStack>

                        <VStack {...({ space: "md" } as any)}>
                            {REPORT_REASONS.map((item) => {
                                const ItemIcon = item.icon;
                                const isSelected = reason === item.value;
                                return (
                                    <TouchableOpacity
                                        key={item.value}
                                        onPress={() => setReason(item.value)}
                                        style={[
                                            styles.reasonItem,
                                            {
                                                borderColor: isSelected
                                                    ? accent.action
                                                    : glass.interact.border,
                                                backgroundColor: isSelected
                                                    ? `${accent.action}18`
                                                    : glass.interact.bg,
                                            }
                                        ]}
                                    >
                                        <HStack {...({ space: "md", alignItems: "center" } as any)}>
                                            <Box sx={{
                                                p: '$2',
                                                borderRadius: '$full',
                                                backgroundColor: glass.surface.bg,
                                            }}>
                                                <ItemIcon
                                                    size={20}
                                                    color={isSelected ? accent.action : text.muted}
                                                />
                                            </Box>
                                            <Text
                                                {...({
                                                    color: isSelected ? text.primary : text.secondary,
                                                    bold: isSelected,
                                                } as any)}
                                            >
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
                                backgroundColor: accent.action,
                                borderRadius: Theme.corners.comfortable,
                                height: 50,
                                // Shadow Violet glow on primary action
                                shadowColor: Theme.colors.shadowViolet,
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.16,
                                shadowRadius: 8,
                                elevation: 4,
                            }}
                        >
                            <ButtonText
                                {...({ color: text.inverse, bold: true } as any)}
                            >
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

