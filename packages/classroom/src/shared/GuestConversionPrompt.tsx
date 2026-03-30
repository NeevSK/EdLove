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
    const config = FEATURE_CONFIG[feature] || FEATURE_CONFIG.general;
    const IconComponent = config.icon;

    return (
        <Modal isOpen={isOpen} onClose={onClose}
            <ModalBackdrop /
            <ModalContent
                sx={{
                    backgroundColor: colors.primary,
                    borderRadius: Theme.corners.comfortable,
                    maxWidth: 400
                }}
            
                <ModalHeader
                    <ModalCloseButton
                        <CloseIcon color={colors.textSecondary} /
                    </ModalCloseButton
                </ModalHeader

                <ModalBody sx={{ paddingBottom: Theme.spacing.lg }}
                    <VStack space="lg" alignItems="center"
                        {/* Icon */}
                        <Box
                            sx={{
                                width: 80,
                                height: 80,
                                borderRadius: '$full',
                                backgroundColor: Theme.colors.ink, // Updated to Ink
                                alignItems: 'center',
                                justifyContent: 'center',
                                shadowColor: Theme.colors.shadowViolet,
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.24,
                                shadowRadius: 8,
                                elevation: 4
                            }}
                        
                            <IconComponent size={40} color={Theme.colors.sanctuarySaffron} /
                        </Box

                        {/* Title */}
                        <Heading
                            size="xl"
                            color={Theme.colors.sanctuarySaffron}
                            textAlign="center"
                        
                            {t(config.title)}
                        </Heading

                        {/* Description */}
                        <Text
                            size="md"
                            color={colors.textSecondary}
                            textAlign="center"
                        
                            {t(config.description)}
                        </Text

                        {/* Local Data Count */}
                        {itemCount !== undefined && itemCount > 0 && (
                            <Box
                                sx={{
                                    p: "$3",
                                    backgroundColor: colors.secondary,
                                    borderRadius: Theme.corners.comfortable,
                                    borderLeftWidth: 4,
                                    borderLeftColor: Theme.colors.sageGreen
                                }}
                            
                                <Text size="sm" color={colors.text} textAlign="center"
                                    \uD83D\uDCBE {t('guest.dataSavedLocally', { count: itemCount })}
                                </Text
                            </Box
                        )}

                        {/* Benefit */}
                        <Box
                            sx={{
                                p: "$4",
                                backgroundColor: `${Theme.colors.amberGlow}1A`, // 10% Opacity
                                borderRadius: Theme.corners.comfortable,
                                borderWidth: 1,
                                borderColor: Theme.colors.amberGlow
                            }}
                        
                            <Text
                                size="sm"
                                color={Theme.colors.amberGlow}
                                textAlign="center"
                                fontWeight="$semibold"
                            
                                \u2728 {t(config.benefit)}
                            </Text
                        </Box

                        {/* Actions */}
                        <VStack space="sm" sx={{ width: '100%' }}
                            <Button
                                size="lg"
                                onPress={onCreateAccount}
                                sx={{
                                    backgroundColor: Theme.colors.sanctuarySaffron,
                                    borderRadius: Theme.corners.comfortable
                                }}
                            
                                <ButtonText color={Theme.colors.sacredWhite}
                                    {t('guest.createAccount')}
                                </ButtonText
                            </Button

                            <Button
                                size="md"
                                variant="link"
                                onPress={onClose}
                            
                                <ButtonText color={colors.textSecondary}
                                    {t('guest.continueBrowsing')}
                                </ButtonText
                            </Button
                        </VStack
                    </VStack
                </ModalBody
            </ModalContent
        </Modal
    );
}
