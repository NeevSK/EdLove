import React, { useState } from 'react';
import {
    VStack,
    HStack,
    Text,
    Input,
    InputField,
    SanctuaryButton,
    SanctuaryModal,
    Theme,
    useThemedColors,
    HorizontalChipRow,
} from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { ResourceVisibility } from '../types';

interface AddCollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (data: { name: string; description: string; visibility: ResourceVisibility }) => void;
}

export default function AddCollectionModal({ isOpen, onClose, onAdd }: AddCollectionModalProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [visibility, setVisibility] = useState<ResourceVisibility>('personal');

    const handleAdd = () => {
        if (!name) return;

        onAdd({
            name,
            description,
            visibility,
        });

        onClose();
        // Reset
        setName('');
        setDescription('');
        setVisibility('personal');
    };

    const visibilityOptions = [
        { label: '🔒 ' + t('library.visibility.personal'), value: 'personal' },
        { label: '🏫 ' + t('library.visibility.school'), value: 'school' },
        { label: '🌐 ' + t('library.visibility.public'), value: 'public' },
    ];

    const footer = (
        <HStack sx={{ gap: 12 }}>
            <SanctuaryButton onPress={onClose} variant="ghost" action="secondary">
                {t('common.cancel') || 'Cancel'}
            </SanctuaryButton>
            <SanctuaryButton
                onPress={handleAdd}
                isDisabled={!name}
            >
                {t('library.createCollection.submit') || 'Create Collection'}
            </SanctuaryButton>
        </HStack>
    );

    return (
        <SanctuaryModal
            isOpen={isOpen}
            onClose={onClose}
            title={t('library.createCollection.title') || 'New Collection'}
            subtitle={t('library.createCollection.subtitle') || 'Organize resources into a shared or personal stream.'}
            footer={footer}
        >
            <VStack sx={{ gap: 16, mt: 16 }}>
                <VStack sx={{ gap: 4 }}>
                    <Text sx={{ color: colors.textSecondary, fontSize: 12, fontWeight: '700' }}>
                        {t('library.createCollection.nameLabel') || 'COLLECTION NAME'}
                    </Text>
                    <Input sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                        <InputField
                            sx={{ color: colors.textPrimary }}
                            placeholder={t('library.createCollection.namePlaceholder') || 'e.g., Grade 10 Science Essentials'}
                            value={name}
                            onChangeText={setName}
                        />
                    </Input>
                </VStack>

                <VStack sx={{ gap: 4 }}>
                    <Text sx={{ color: colors.textSecondary, fontSize: 12, fontWeight: '700' }}>
                        {t('library.createCollection.descriptionLabel') || 'DESCRIPTION'}
                    </Text>
                    <Input sx={{ minHeight: 80, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                        <InputField
                            sx={{ color: colors.textPrimary }}
                            placeholder={t('library.createCollection.descriptionPlaceholder') || 'What is this collection about?'}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                        />
                    </Input>
                </VStack>

                <VStack sx={{ gap: 8 }}>
                    <Text sx={{ color: colors.textSecondary, fontSize: 12, fontWeight: '700' }}>
                        {t('library.createCollection.visibilityLabel') || 'VISIBILITY (SHARDING)'}
                    </Text>
                    <HorizontalChipRow
                        chips={visibilityOptions}
                        selectedValue={visibility}
                        onSelect={(v) => setVisibility(v as ResourceVisibility)}
                        size="sm"
                    />
                    <Text sx={{ color: colors.textSecondary, fontSize: 11, fontStyle: 'italic', mt: 4 }}>
                        {visibility === 'personal' && (t('library.visibility.personalNote') || 'Only you can see this.')}
                        {visibility === 'school' && (t('library.visibility.schoolNote') || 'Visible to everyone in your school.')}
                        {visibility === 'public' && (t('library.visibility.publicNote') || 'Global visibility for all Gurudevi users.')}
                    </Text>
                </VStack>
            </VStack>
        </SanctuaryModal>
    );
}
