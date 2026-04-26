import {
  Button,
  ButtonText,
  hapticSuccess,
  SanctuaryModal,
  Text,
  Theme,
  useTheme,
  VStack,
} from '@repo/ui';
import React from 'react';
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
      style={{
        backgroundColor: accent.action,
        width: '100%',
        borderRadius: Theme.corners.comfortable,
      }}
    >
      <ButtonText {...({ color: text.inverse } as any)}>{t('welcome.start')}</ButtonText>
    </Button>
  );

  return (
    <SanctuaryModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('welcome.title')}
      showCloseButton={false}
      footer={footer}
    >
      <VStack space="md">
        <Text size="lg" className="text-sacredWhite leading-relaxed">
          {t('welcome.message')}
        </Text>
        <Text size="md" className="text-mistGray leading-normal">
          {t('welcome.description')}
        </Text>
      </VStack>
    </SanctuaryModal>
  );
}

export { WelcomeModal };
