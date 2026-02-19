import React from 'react';
import {
    Box,
    VStack,
    Text,
    Heading,
    Button,
    ButtonText,
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    CloseIcon
} from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { Sparkles, Cloud, Lock } from 'lucide-react-native';
import { Theme, useThemedColors } from '@repo/ui';


export interface GuestConversionPromptProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateAccount: () => void;
    feature: 'classroom' | 'community' | 'library' | 'self' | 'general';
    itemCount?: number; // For "You have X items saved locally"
}

const FEATURE_CONFIG = {
    classroom: {
        icon: Sparkles,
        title: 'classroom.guestPrompt.title',
        description: 'classroom.guestPrompt.description',
        benefit: 'classroom.guestPrompt.benefit'
    },
    community: {
        icon: Cloud,
        title: 'community.guestPrompt.title',
        description: 'community.guestPrompt.description',
        benefit: 'community.guestPrompt.benefit'
    },
    library: {
        icon: Lock,
        title: 'library.guestPrompt.title',
        description: 'library.guestPrompt.description',
        benefit: 'library.guestPrompt.benefit'
    },
    self: {
        icon: Cloud,
        title: 'self.guestPrompt.title',
        description: 'self.guestPrompt.description',
        benefit: 'self.guestPrompt.benefit'
    },
    general: {
        icon: Sparkles,
        title: 'guest.createAccountTitle',
        description: 'guest.createAccountDescription',
        benefit: 'guest.createAccountBenefit'
    }
};

export default function GuestConversionPrompt({
    isOpen,
    onClose,
    onCreateAccount,
    feature,
    itemCount
}: GuestConversionPromptProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const config = FEATURE_CONFIG[feature];
    const IconComponent = config.icon;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalBackdrop />
            <ModalContent
                sx={{
                    backgroundColor: colors.primary,
                    borderRadius: Theme.corners.comfortable,
                    maxWidth: 400
                }}
            >
                <ModalHeader>
                    <ModalCloseButton>
                        <CloseIcon color={colors.textSecondary} />
                    </ModalCloseButton>
                </ModalHeader>

                <ModalBody pb="$6">
                    <VStack space="lg" alignItems="center">
                        {/* Icon */}
                        <Box
                            sx={{
                                width: 80,
                                height: 80,
                                borderRadius: '$full',
                                backgroundColor: Theme.colors.deepIndigo,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <IconComponent size={40} color={Theme.colors.sanctuarySaffron} />
                        </Box>

                        {/* Title */}
                        <Heading
                            size="xl"
                            color={Theme.colors.sanctuarySaffron}
                            textAlign="center"
                        >
                            {t(config.title)}
                        </Heading>

                        {/* Description */}
                        <Text
                            size="md"
                            color={colors.textSecondary}
                            textAlign="center"
                        >
                            {t(config.description)}
                        </Text>

                        {/* Local Data Count */}
                        {itemCount !== undefined && itemCount > 0 && (
                            <Box
                                p="$3"
                                sx={{
                                    backgroundColor: colors.secondary,
                                    borderRadius: Theme.corners.comfortable,
                                    borderLeftWidth: 4,
                                    borderLeftColor: Theme.colors.sageGreen
                                }}
                            >
                                <Text size="sm" color={colors.text} textAlign="center">
                                    💾 {t('guest.dataSavedLocally', { count: itemCount })}
                                </Text>
                            </Box>
                        )}

                        {/* Benefit */}
                        <Box
                            p="$4"
                            sx={{
                                backgroundColor: 'rgba(255, 165, 0, 0.1)',
                                borderRadius: Theme.corners.comfortable,
                                borderWidth: 1,
                                borderColor: Theme.colors.sanctuarySaffron
                            }}
                        >
                            <Text
                                size="sm"
                                color={Theme.colors.sanctuarySaffron}
                                textAlign="center"
                                fontWeight="$semibold"
                            >
                                ✨ {t(config.benefit)}
                            </Text>
                        </Box>

                        {/* Actions */}
                        <VStack space="sm" sx={{ width: '100%' }}>
                            <Button
                                size="lg"
                                onPress={onCreateAccount}
                                sx={{
                                    backgroundColor: Theme.colors.sanctuarySaffron,
                                    borderRadius: Theme.corners.comfortable
                                }}
                            >
                                <ButtonText color={Theme.colors.white}>
                                    {t('guest.createAccount')}
                                </ButtonText>
                            </Button>

                            <Button
                                size="md"
                                variant="link"
                                onPress={onClose}
                            >
                                <ButtonText color={colors.textSecondary}>
                                    {t('guest.continueBrowsing')}
                                </ButtonText>
                            </Button>
                        </VStack>
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
