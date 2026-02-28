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
            <SanctuaryButton onPress={onClose} variant="ghost" action="secondary">Dismiss</SanctuaryButton>
            <SanctuaryButton
                onPress={handleAdd}
                isDisabled={!title || !url}
            >
                Endorse & Add
            </SanctuaryButton>
        </HStack>
    );

    return (
        <SanctuaryModal
            isOpen={isOpen}
            onClose={onClose}
            title="Contribute to the Sanctuary"
            subtitle="Share knowledge with your community"
            footer={footer}
        >
            <VStack {...({ space: "md", mt: "$4" } as any)}>
                <VStack {...({ space: "xs" } as any)}>
                    <Text {...({ color: text.secondary, size: "xs", bold: true } as any)}>Resource Information</Text>
                    <Input sx={{ backgroundColor: glass.interact.bg, borderColor: glass.interact.border }}>
                        <InputField
                            {...({ color: text.primary } as any)}
                            placeholder="Resource Title (e.g. Unit 5 Past Paper)"
                            value={title}
                            onChangeText={setTitle}
                        />
                    </Input>
                </VStack>

                <Input sx={{ backgroundColor: glass.interact.bg, borderColor: glass.interact.border }}>
                    <InputField
                        {...({ color: text.primary } as any)}
                        placeholder="Universal Resource Link (URL)"
                        value={url}
                        onChangeText={setUrl}
                        autoCapitalize="none"
                    />
                </Input>

                <Input sx={{ minHeight: 80, backgroundColor: glass.interact.bg, borderColor: glass.interact.border }}>
                    <InputField
                        {...({ color: text.primary } as any)}
                        placeholder="Brief Description (Optional)"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                    />
                </Input>

                <VStack {...({ space: "xs" } as any)}>
                    <Text {...({ color: text.secondary, size: "xs", bold: true } as any)}>Resource Type</Text>
                    <HStack {...({ space: "xs", flexWrap: "wrap" } as any)}>
                        {LIBRARY_RESOURCE_CATEGORIES.map(cat => (
                            <SanctuaryButton
                                key={cat.id}
                                onPress={() => setType(cat.id as LibResourceType)}
                                variant={type === cat.id ? 'solid' : 'outline'}
                                size="xs"
                                action="secondary"
                            >
                                {t(`library.types.${cat.id}` as any)}
                            </SanctuaryButton>
                        ))}
                    </HStack>
                </VStack>

                <VStack {...({ space: "xs" } as any)}>
                    <Text {...({ color: text.secondary, size: "xs", bold: true } as any)}>Searchable Tags</Text>
                    <Input sx={{ backgroundColor: glass.interact.bg, borderColor: glass.interact.border }}>
                        <InputField
                            {...({ color: text.primary } as any)}
                            placeholder="e.g. grade10, maths, geometry"
                            value={tags}
                            onChangeText={setTags}
                        />
                    </Input>
                </VStack>
            </VStack>
        </SanctuaryModal>
    );
}
