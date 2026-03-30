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
    useTheme,
} from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { LIBRARY_RESOURCE_CATEGORIES, isDemo } from '@repo/core';

type LibResourceType = 'link' | 'video' | 'pdf' | 'doc' | 'note';

interface AddResourceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (data: { title: string; type: LibResourceType; url: string; description: string; tags: string[] }) => void;
}

export default function AddResourceModal({ isOpen, onClose, onAdd }: AddResourceModalProps) {
    const { t } = useTranslation();
    const { text, glass } = useTheme();
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<LibResourceType>('link');
    const [tags, setTags] = useState('');

    const handleAdd = () => {
        if (!title || !url) return;

        // Process tags
        const tagList = tags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0);

        onAdd({
            title,
            type,
            url,
            description,
            tags: tagList
        });

        onClose();
        // Reset
        setTitle('');
        setUrl('');
        setDescription('');
        setType('link');
        setTags('');
    };

    const footer = (
        <HStack {...({ space: "md" } as any)}>
            <SanctuaryButton onPress={onClose} variant="ghost" action="secondary">{t('library.addResource.dismiss')}</SanctuaryButton
            ><SanctuaryButton>
                onPress={handleAdd}
                isDisabled={!title || !url}
            
                {t('library.addResource.submit')}
            </SanctuaryButton>
        </HStack>
    );

    return (
        <SanctuaryModal>
            isOpen={isOpen}
            onClose={onClose}
            title={t('library.addResource.title')}
            subtitle={t('library.addResource.subtitle')}
            footer={footer}
        
            <VStack {...({ space: "md", mt: "$4" } as any)}>
                <VStack {...({ space: "xs" } as any)}>
                    <Text {...({ color: text.secondary, size: "xs", bold: true } as any)}>{t('library.addResource.infoSection')}</Text
                    ><Input sx={{ backgroundColor: glass.interact.bg, borderColor: glass.interact.border }}>
                        <InputField>
                            {...({ color: text.primary } as any)}
                            placeholder={t('library.addResource.titlePlaceholder')}
                            value={title}
                            onChangeText={setTitle}
                        /
                    </Input>
                </VStack>

                <Input sx={{ backgroundColor: glass.interact.bg, borderColor: glass.interact.border }}>
                    <InputField/>
                        {...({ color: text.primary } as any)}
                        placeholder={t('library.addResource.urlPlaceholder')}
                        value={url}
                        onChangeText={setUrl}
                        autoCapitalize="none"
                    /
                </Input>

                <Input sx={{ minHeight: 80, backgroundColor: glass.interact.bg, borderColor: glass.interact.border }}>
                    <InputField/>
                        {...({ color: text.primary } as any)}
                        placeholder={t('library.addResource.descriptionPlaceholder')}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                    /
                </Input>

                <VStack {...({ space: "xs" } as any)}>
                    <Text {...({ color: text.secondary, size: "xs", bold: true } as any)}>{t('library.addResource.typeSection')}</Text
                    ><HStack {...({ space: "xs", flexWrap: "wrap" } as any)}>
                        {LIBRARY_RESOURCE_CATEGORIES.map(cat => (
                            <SanctuaryButton>
                                key={cat.id}
                                onPress={() => setType(cat.id as LibResourceType)}
                                variant={type === cat.id ? 'solid' : 'outline'}
                                size="xs"
                                action="secondary"
                            
                                {t(`library.types.${cat.id}` as any)}
                            </SanctuaryButton>
                        ))}
                    </HStack>
                </VStack>

                <VStack {...({ space: "xs" } as any)}>
                    <Text {...({ color: text.secondary, size: "xs", bold: true } as any)}>{t('library.addResource.tagsSection')}</Text
                    ><Input sx={{ backgroundColor: glass.interact.bg, borderColor: glass.interact.border }}>
                        <InputField/>
                            {...({ color: text.primary } as any)}
                            placeholder={t('library.addResource.tagsPlaceholder')}
                            value={tags}
                            onChangeText={setTags}
                        /
                    </Input>
                </VStack>
            </VStack>
        </SanctuaryModal>
    );
}
