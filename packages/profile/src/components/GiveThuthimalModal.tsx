import React, { useState, useCallback } from 'react';
import { Modal, StyleSheet, TextInput } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    useThemedColors,
    Theme,
    SanctuaryButton,
    useLotusToast,
    hapticSuccess,
    hapticError,
} from '@repo/ui';
import { thuthimalAPI } from '@repo/core';

interface GiveThuthimalModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipientId: string;
    recipientName: string;
    /** Role of the recipient — used to attribute the gift correctly. Defaults to 'teacher'. */
    recipientRole?: string;
    giverId: string;
    giverName: string;
    /** @deprecated Use recipientId. Kept for backwards-compatibility. */
    teacherId?: string;
    /** @deprecated Use recipientName. Kept for backwards-compatibility. */
    teacherName?: string;
}

export function GiveThuthimalModal({
    isOpen,
    onClose,
    recipientId,
    recipientName,
    recipientRole = 'teacher',
    giverId,
    giverName,
    // Legacy props — resolve to canonical names for callers that haven't migrated yet
    teacherId,
    teacherName,
}: GiveThuthimalModalProps) {
    const resolvedRecipientId = recipientId ?? teacherId ?? '';
    const resolvedRecipientName = recipientName ?? teacherName ?? 'this person';

    const colors = useThemedColors();
    const { showToast } = useLotusToast();
    const [isSending, setIsSending] = useState(false);
    const [message, setMessage] = useState('');

    const handleSend = useCallback(async () => {
        if (isSending) return;
        setIsSending(true);
        try {
            await thuthimalAPI.createGift(giverId, {
                gifterName: giverName,
                recipientRole: recipientRole as 'teacher' | 'principal',
                recipientId: resolvedRecipientId,
                message: message.trim() || undefined,
            });
            hapticSuccess();
            showToast({ message: 'Your gift of gratitude has been sent 🌸', type: 'sanctuary' });
            setMessage('');
            onClose();
        } catch (e: any) {
            hapticError();
            showToast({ message: e?.message ?? 'Could not send gift. Please try again.', type: 'error' });
        } finally {
            setIsSending(false);
        }
    }, [isSending, giverId, giverName, recipientRole, resolvedRecipientId, message, showToast, onClose]);

    return (
        <Modal
            visible={isOpen}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <Box
                sx={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    justifyContent: 'flex-end',
                }}
            >
                <Box
                    sx={{
                        backgroundColor: colors.secondary,
                        borderTopLeftRadius: Theme.corners.generous,
                        borderTopRightRadius: Theme.corners.generous,
                        padding: Theme.spacing.xl,
                        paddingBottom: Theme.spacing.xl + 20,
                        borderTopWidth: 1,
                        borderColor: colors.border,
                    }}
                >
                    <VStack space="lg">
                        <HStack justifyContent="space-between" alignItems="center">
                            <Heading size="md" color={colors.text}>
                                🌸 Give Gratitude
                            </Heading>
                            <SanctuaryButton variant="ghost" size="sm" onPress={onClose} accessibilityLabel="Close">
                                ✕
                            </SanctuaryButton>
                        </HStack>

                        <Text size="sm" color={colors.textSecondary}>
                            Send a Thuthimal gift to {resolvedRecipientName}. They will receive a notification when the gift is claimed.
                        </Text>

                        {/* Optional personal message */}
                        <TextInput
                            value={message}
                            onChangeText={setMessage}
                            placeholder="Add a personal message (optional)"
                            placeholderTextColor={colors.textSecondary}
                            multiline
                            numberOfLines={3}
                            maxLength={300}
                            style={[
                                styles.messageInput,
                                {
                                    backgroundColor: colors.primary,
                                    color: colors.text,
                                    borderColor: colors.border,
                                },
                            ]}
                            accessibilityLabel="Personal message"
                        />

                        <SanctuaryButton
                            onPress={handleSend}
                            isLoading={isSending}
                            accessibilityLabel="Send gift of gratitude"
                        >
                            Send Gift of Gratitude
                        </SanctuaryButton>
                    </VStack>
                </Box>
            </Box>
        </Modal>
    );
}

const styles = StyleSheet.create({
    messageInput: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        minHeight: 80,
        textAlignVertical: 'top',
    },
});
