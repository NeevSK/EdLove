import React from 'react';
import {
    Text,
    VStack,
    Button,
    ButtonText,
    SanctuaryModal,
    Theme,
    useTheme,
    hapticSuccess,
} from '@repo/ui';
import { useTranslation } from 'react-i18next';

interface WelcomeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
    const { t } = useTranslation();
    const { text, accent } = useTheme();

    const handleStart = () => {
        hapticSuccess();
        onClose();
    };

    const footer = (
        <Button
            size="md"
            onPress={handleStart}
            sx={{ backgroundColor: accent.action, width: '100%', borderRadius: Theme.corners.comfortable }}
        >
            <ButtonText {...({ color: text.inverse } as any)}>
                {t('welcome.start') || 'Begin Journey'}
            </ButtonText>
        </Button>
    );

    return (
        <SanctuaryModal
            isOpen={isOpen}
            onClose={onClose}
            title={t('welcome.title') || 'Welcome Home'}
            showCloseButton={false}
            footer={footer}
        >
            <VStack {...({ space: "md" } as any)}>
                <Text {...({ size: "lg", lineHeight: "$xl", color: text.primary } as any)}>
                    {t('welcome.message') || 'Your sanctuary awaits.'}
                </Text>
                <Text {...({ size: "md", lineHeight: "$lg", color: text.secondary } as any)}>
                    {t('welcome.description') || 'Here you can reflect, grow, and connect with your educational ecology.'}
                </Text>
            </VStack>
        </SanctuaryModal>
    );
}

