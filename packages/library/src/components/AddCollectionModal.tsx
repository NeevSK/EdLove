import { HStack, Input, InputField, SanctuaryButton, SanctuaryModal, Text, VStack } from '@repo/ui';
import type React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface AddCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description: string }) => Promise<void>;
}

export const AddCollectionModal: React.FC<AddCollectionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({ name, description });
      setName('');
      setDescription('');
      onClose();
    } catch (error) {
      console.error('Failed to create collection:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SanctuaryModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('library.addCollection') || 'Add New Collection'}
    >
      <VStack className="gap-4 p-5">
        <VStack className="gap-1">
          <Text className="text-sm font-semibold">{t('library.collectionName') || 'Name'}</Text>
          <Input>
            <InputField
              value={name}
              onChangeText={setName}
              placeholder={t('library.collectionNamePlaceholder') || 'Enter collection name...'}
            />
          </Input>
        </VStack>

        <VStack className="gap-1">
          <Text className="text-sm font-semibold">
            {t('library.collectionDescription') || 'Description'}
          </Text>
          <Input className="min-h-[80px]">
            <InputField
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              placeholder={
                t('library.collectionDescriptionPlaceholder') || 'What is this collection about?'
              }
            />
          </Input>
        </VStack>

        <HStack className="gap-3 mt-2.5 justify-end">
          <SanctuaryButton variant="outline" onPress={onClose} isDisabled={isSubmitting}>
            {t('common.cancel') || 'Cancel'}
          </SanctuaryButton>
          <SanctuaryButton
            onPress={handleSubmit}
            isLoading={isSubmitting}
            isDisabled={!name.trim()}
          >
            {t('common.create') || 'Create'}
          </SanctuaryButton>
        </HStack>
      </VStack>
    </SanctuaryModal>
  );
};

export default AddCollectionModal;
