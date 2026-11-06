import { Button, Dialog } from '@repo/ui/components/native';
import { useWorld } from '@repo/ui/theme/native';
import { hapticSuccess } from '@repo/ui/utils/haptics';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

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
    <Dialog
      open={isOpen}
      onClose={onClose}
      title={t('welcome.title')}
      actions={
        <Button
          label={t('welcome.start')}
          variant="primary"
          onPress={handleStart}
          fullWidth
        />
      }
    >
      <View className="gap-3 my-2">
        <Text className="text-sacredWhite leading-relaxed text-base font-semibold">
          {t('welcome.message')}
        </Text>
        <Text className="text-mistGray leading-normal text-sm">
          {t('welcome.description')}
        </Text>
      </View>
    </Dialog>
  );
}

export { WelcomeModal };
