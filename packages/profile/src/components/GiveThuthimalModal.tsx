import React, { useState, useCallback } from 'react';
import { Modal, StyleSheet } from 'react-native';
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
    teacherId: string;
    teacherName: string;
    giverId: string;
    giverName: string;
}

export function GiveThuthimalModal({
    isOpen,
    onClose,
    teacherId,
    teacherName,
    giverId,
    giverName,
}: GiveThuthimalModalProps) {
    const colors = useThemedColors();
    const { showToast } = useLotusToast();
    const [isSending, setIsSending] = useState(false);

    const handleSend = useCallback(async () => {
        if (isSending) return;
        setIsSending(true);
        try {
            await thuthimalAPI.createGift(giverId, {
                gifterName: giverName,
                recipientRole: 'teacher',
                recipientId: teacherId,
            });
            hapticSuccess();
            showToast({ message: 'Your gift of gratitude has been sent 🌸', type: 'sanctuary' });
            onClose();
        } catch (e: any) {
            hapticError();
            showToast({ message: e?.message ?? 'Could not send gift. Please try again.', type: 'error' });
        } finally {
            setIsSending(false);
        }
    }, [isSending, giverId, giverName, teacherId, showToast, onClose]);

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
                            Send a Thuthimal gift to {teacherName}. They will receive a notification when the gift is claimed.
                        </Text>

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

const styles = StyleSheet.create({});
