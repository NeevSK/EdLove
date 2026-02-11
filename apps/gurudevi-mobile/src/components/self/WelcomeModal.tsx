import React from 'react';
import {
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Heading,
    Text,
    Button,
    ButtonText,
    VStack,
    Box
} from '@/ui';
import { Theme } from '../../constants/Theme';
import { useTranslation } from 'react-i18next';
import { hapticSuccess } from '../../utils/haptics';

interface WelcomeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
    const { t } = useTranslation();

    const handleStart = () => {
        hapticSuccess();
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
        >
            <ModalBackdrop />
            <ModalContent sx={{ backgroundColor: Theme.colors.deepIndigo, borderColor: Theme.colors.sanctuarySaffron, borderWidth: 1 }}>
                <ModalHeader>
                    <Heading size="xl" color={Theme.colors.sanctuarySaffron}>
                        {t('welcome.title') || 'Welcome Home'}
                    </Heading>
                </ModalHeader>
                <ModalBody>
                    <VStack space="md">
                        <Text color={Theme.colors.sacredWhite} size="lg" lineHeight="$xl">
                            {t('welcome.message') || 'Your sanctuary awaits.'}
                        </Text>
                        <Text color={Theme.colors.mistGray} size="md" lineHeight="$lg">
                            {t('welcome.description') || 'Here you can reflect, grow, and connect with your educational ecology.'}
                        </Text>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button
                        size="md"
                        variant="solid"
                        action="primary"
                        onPress={handleStart}
                        sx={{ backgroundColor: Theme.colors.sanctuarySaffron }}
                    >
                        <ButtonText color={Theme.colors.white}>
                            {t('welcome.start') || 'Begin Journey'}
                        </ButtonText>
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
