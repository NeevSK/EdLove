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
    /** Role of the recipient - used to attribute the gift correctly. Defaults to 'teacher'. */
    recipientTier?: string;
    /** ID of the giver. */
    giverId: string;
    /** Name of the giver. */
    giverName: string;
}

export function GiveThuthimalModal({
    isOpen,
    onClose,
    recipientId,
    recipientName,
    recipientTier = 'teacher',
    giverId,
    giverName,
}: GiveThuthimalModalProps) {
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
                recipientTier: recipientTier as 'teacher' | 'principal',
                recipientId: recipientId,
                message: message.trim() || undefined,
            });
            hapticSuccess();
            showToast({ message: 'Your gift of gratitude has been sent =O', type: 'sanctuary' });
            setMessage('');
            onClose();
        } catch (e: any) {
            hapticError();
            showToast({ message: e?.message ?? 'Could not send gift. Please try again.', type: 'error' });
        } finally {
            setIsSending(false);
        }
    }, [isSending, giverId, giverName, recipientTier, recipientId, message, showToast, onClose]);

    return (
        <Modal
            visible={isOpen}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        
            <Box
                sx={{
                    flex: 1,
                    backgroundColor: 'rgba(38,26,69,0.7)',
                    justifyContent: 'flex-end',
                }}
            
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
                
                    <VStack space="lg"
                        <HStack justifyContent="space-between" alignItems="center"
                            <Heading size="md" color={colors.text}
                                {'=O'} Give Gratitude
                            </Heading
                            <SanctuaryButton variant="ghost" size="sm" onPress={onClose} accessibilityLabel="Close"
                                {''}
                            </SanctuaryButton
                        </HStack

                        <Text size="sm" color={colors.textSecondary}
                            Send a Thuthimal gift to {recipientName}. They will receive a notification when the gift is claimed.
                        </Text

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
                        /

                        <SanctuaryButton
                            onPress={handleSend}
                            isLoading={isSending}
                            accessibilityLabel="Send gift of gratitude"
                        
                            Send Gift of Gratitude
                        </SanctuaryButton
                    </VStack
                </Box
            </Box
        </Modal
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
