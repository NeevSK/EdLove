import React from 'react';
import {
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Heading,
    Text,
    Button,
    ButtonText,
    Icon,
    CloseIcon,
    VStack,
    Theme
} from '@repo/ui';
import { useThemedColors } from '@repo/ui';

interface GuestConversionPromptProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateAccount: () => void;
    feature: string;
}

export default function GuestConversionPrompt({
    isOpen,
    onClose,
    onCreateAccount,
    feature
}: GuestConversionPromptProps) {
    const colors = useThemedColors();

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalBackdrop />
            <ModalContent sx={{ backgroundColor: colors.primary }}>
                <ModalHeader>
                    <Heading size="lg" color={colors.text}>Account Required</Heading>
                    <ModalCloseButton>
                        <Icon as={CloseIcon} />
                    </ModalCloseButton>
                </ModalHeader>
                <ModalBody>
                    <VStack sx={{ gap: Theme.spacing.md }}>
                        <Text color={colors.text}>
                            You need to create an account to use {feature}.
                        </Text>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button variant="outline" action="secondary" mr="$3" onPress={onClose}>
                        <ButtonText>Cancel</ButtonText>
                    </Button>
                    <Button action="primary" onPress={onCreateAccount}>
                        <ButtonText>Create Account</ButtonText>
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
