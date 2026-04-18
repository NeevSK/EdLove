import React, { useState, useCallback } from 'react';
import { Modal } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    Button,
    ButtonText,
    Input,
    InputField,
    useLotusToast,
    hapticSuccess,
    hapticError,
    Pressable,
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

/**
 * GIVE THUTHIMAL MODAL
 * Sanctuary V3 standard for gifting gratitude (Pro subscriptions).
 */
export function GiveThuthimalModal({
    isOpen,
    onClose,
    recipientId,
    recipientName,
    recipientTier = 'teacher',
    giverId,
    giverName,
}: GiveThuthimalModalProps) {
    const { showToast } = useLotusToast();
    const [isSending, setIsSending] = useState(false);
    const [message, setMessage] = useState('');

    const handleSend = useCallback(async () => {
        if (isSending) return;
        setIsSending(true);
        try {
            await thuthimalAPI.createGift({
                gifter_id: giverId,
                gifterName: giverName,
                recipientTier: recipientTier as 'teacher' | 'principal',
                recipientId: recipientId,
                message: message.trim() || undefined,
            });
            hapticSuccess();
            showToast({ message: 'Your gift of gratitude has been sent 🎁', type: 'sanctuary' });
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
        >
            <Box
                className="flex-1 justify-end bg-black/60"
            >
                <Box
                    className="bg-phase-canvas rounded-t-generous p-8 pb-12 border-t border-phase-surface"
                >
                    <VStack space="lg">
                        <HStack className="justify-between items-center">
                            <Heading className="text-xl text-phase-text-primary">
                                🎁 Give Gratitude
                            </Heading>
                            <Pressable onPress={onClose} accessibilityLabel="Close" className="p-2">
                                <Text className="text-phase-interactive text-sm font-bold">Close</Text>
                            </Pressable>
                        </HStack>

                        <Text className="text-sm text-phase-text-secondary leading-5">
                            Send a Thuthimal gift to {recipientName}. They will receive a notification when the gift is claimed.
                        </Text>

                        {/* Optional personal message */}
                        <Input
                            className="h-28 rounded-xl bg-phase-surface border-phase-surface"
                            isDisabled={isSending}
                        >
                            <InputField
                                value={message}
                                onChangeText={setMessage}
                                placeholder="Add a personal message (optional)"
                                placeholderTextColor="#9DA1A3"
                                multiline
                                numberOfLines={4}
                                maxLength={300}
                                className="text-phase-text-primary p-3"
                                style={{ textAlignVertical: 'top' }}
                                accessibilityLabel="Personal message"
                            />
                        </Input>

                        <Button
                            size="xl"
                            className="mt-4 bg-phase-interactive rounded-comfortable h-14"
                            isDisabled={isSending}
                            onPress={handleSend}
                            accessibilityLabel="Send gift of gratitude"
                        >
                            <ButtonText className="text-white font-bold">
                                {isSending ? 'Sending...' : 'Send Gift of Gratitude'}
                            </ButtonText>
                        </Button>
                    </VStack>
                </Box>
            </Box>
        </Modal>
    );
}
