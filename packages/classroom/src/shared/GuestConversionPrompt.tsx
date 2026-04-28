import {
  Box,
  Button,
  ButtonText,
  Cloud,
  Heading,
  Icon,
  Lock,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  Sparkles,
  Text,
  Theme,
  useThemedColors,
  VStack,
  X,
} from '@repo/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface GuestConversionPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateAccount: () => void;
  feature: 'classroom' | 'community' | 'library' | 'self' | 'general';
  itemCount?: number;
}

const FEATURE_CONFIG = {
  classroom: {
    icon: Sparkles,
    title: 'classroom.guestPrompt.title',
    description: 'classroom.guestPrompt.description',
    benefit: 'classroom.guestPrompt.benefit',
  },
  community: {
    icon: Cloud,
    title: 'community.guestPrompt.title',
    description: 'community.guestPrompt.description',
    benefit: 'community.guestPrompt.benefit',
  },
  library: {
    icon: Lock,
    title: 'library.guestPrompt.title',
    description: 'library.guestPrompt.description',
    benefit: 'library.guestPrompt.benefit',
  },
  self: {
    icon: Cloud,
    title: 'self.guestPrompt.title',
    description: 'self.guestPrompt.description',
    benefit: 'self.guestPrompt.benefit',
  },
  general: {
    icon: Sparkles,
    title: 'guest.createAccountTitle',
    description: 'guest.createAccountDescription',
    benefit: 'guest.createAccountBenefit',
  },
};

export default function GuestConversionPrompt({
  isOpen,
  onClose,
  onCreateAccount,
  feature,
  itemCount,
}: GuestConversionPromptProps) {
  const { t } = useTranslation();
  const colors = useThemedColors();
  const config = FEATURE_CONFIG[feature] || FEATURE_CONFIG.general;
  const IconComponent = config.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent className="max-w-[400px] rounded-[24px] bg-phase-canvas">
        <ModalHeader>
          <ModalCloseButton>
            <Icon as={X} size={20} color={colors.textSecondary} />
          </ModalCloseButton>
        </ModalHeader>

        <ModalBody className="pb-6">
          <VStack space="lg" className="items-center">
            <Box className="h-20 w-20 items-center justify-center rounded-full bg-phase-surface shadow-md">
              <IconComponent size={40} color={Theme.colors.sanctuarySaffron} />
            </Box>

            <Heading size="xl" className="text-center text-sanctuarySaffron">
              {t(config.title)}
            </Heading>

            <Text className="text-center text-phase-text-secondary">{t(config.description)}</Text>

            {itemCount !== undefined && itemCount > 0 && (
              <Box className="w-full rounded-[20px] border-l-4 border-l-sageGreen bg-phase-surface-secondary px-4 py-3">
                <Text className="text-center text-phase-text-primary">
                  {t('guest.dataSavedLocally', { count: itemCount })}
                </Text>
              </Box>
            )}

            <Box className="w-full rounded-[20px] border border-amberGlow/30 bg-amberGlow/10 px-4 py-3">
              <Text className="text-center font-semibold text-amberGlow">{t(config.benefit)}</Text>
            </Box>

            <VStack space="sm" className="w-full">
              <Button onPress={onCreateAccount} className="h-12 rounded-full bg-sanctuarySaffron">
                <ButtonText className="text-white">{t('guest.createAccount')}</ButtonText>
              </Button>

              <Button
                variant="outline"
                action="secondary"
                onPress={onClose}
                className="border-transparent"
              >
                <ButtonText className="text-phase-text-secondary">
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
