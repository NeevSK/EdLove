import React, { useState } from 'react';
import {
    VStack,
    HStack,
    Text,
    Input,
    InputField,
    SanctuaryButton,
    SanctuaryModal,
    useThemedColors
} from '@repo/ui';
import { useTranslation } from 'react-i18next';

interface AddCollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string; description: string }) => Promise<void>;
}

export const AddCollectionModal: React.FC<AddCollectionModalProps> = ({ 
    isOpen, 
    onClose, 
    onSubmit 
}) => {
    const { t } = useTranslation();
    const colors = useThemedColors();
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
            <VStack space="lg" sx={{ p: 20 }}>
                <VStack space="xs">
                    <Text size="sm" fontWeight="600">{t('library.collectionName') || 'Name'}</Text>
                    <Input>
                        <InputField 
                            value={name}
                            onChangeText={setName}
                            placeholder={t('library.collectionNamePlaceholder') || 'Enter collection name...'}
                        />
                    </Input>
                </VStack>

                <VStack space="xs">
                    <Text size="sm" fontWeight="600">{t('library.collectionDescription') || 'Description'}</Text>
                    <Input>
                        <InputField 
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={3}
                            placeholder={t('library.collectionDescriptionPlaceholder') || 'What is this collection about?'}
                        />
                    </Input>
                </VStack>

                <HStack space="md" sx={{ mt: 10, justifyContent: 'flex-end' }}>
                    <SanctuaryButton 
                        variant="outline" 
                        onPress={onClose}
                        disabled={isSubmitting}
                    >
                        {t('common.cancel') || 'Cancel'}
                    </SanctuaryButton>
                    <SanctuaryButton 
                        onPress={handleSubmit}
                        isLoading={isSubmitting}
                        disabled={!name.trim()}
                    >
                        {t('common.create') || 'Create'}
                    </SanctuaryButton>
                </HStack>
            </VStack>
        </SanctuaryModal>
    );
};
