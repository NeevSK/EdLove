import React, { useState } from 'react';
import {
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Heading,
    VStack,
    HStack,
    Text,
    Input,
    InputField,
    SanctuaryButton,
    Theme,
    useThemedColors
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
    const colors = useThemedColors();
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

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalBackdrop />
            <ModalContent sx={{ backgroundColor: Theme.colors.midnightBlue, borderRadius: Theme.corners.comfortable }}>
                <ModalHeader>
                    <VStack>
                        <Heading color={Theme.colors.sacredWhite} size="md">Contribute to the Sanctuary</Heading>
                        <Text color={Theme.colors.mistGray} size="xs">Share knowledge with your community</Text>
                    </VStack>
                </ModalHeader>
                <ModalBody>
                    <VStack space="md" mt="$4">
                        <VStack space="xs">
                            <Text color={Theme.colors.mistGray} size="xs" bold>Resource Information</Text>
                            <Input sx={{ backgroundColor: Theme.colors.glassHighlight, borderColor: Theme.colors.glassBorder }}>
                                <InputField
                                    color={Theme.colors.sacredWhite}
                                    placeholder="Resource Title (e.g. Unit 5 Past Paper)"
                                    value={title}
                                    onChangeText={setTitle}
                                />
                            </Input>
                        </VStack>

                        <Input sx={{ backgroundColor: Theme.colors.glassHighlight, borderColor: Theme.colors.glassBorder }}>
                            <InputField
                                color={Theme.colors.sacredWhite}
                                placeholder="Universal Resource Link (URL)"
                                value={url}
                                onChangeText={setUrl}
                                autoCapitalize="none"
                            />
                        </Input>

                        <Input sx={{ minHeight: 80, backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
                            <InputField
                                color={Theme.colors.sacredWhite}
                                placeholder="Brief Description (Optional)"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                            />
                        </Input>

                        <VStack space="xs">
                            <Text color={Theme.colors.mistGray} size="xs" bold>Resource Type</Text>
                            <HStack space="xs" flexWrap="wrap">
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

                        <VStack space="xs">
                            <Text color={Theme.colors.mistGray} size="xs" bold>Searchable Tags</Text>
                            <Input sx={{ backgroundColor: Theme.colors.glassHighlight, borderColor: Theme.colors.glassBorder }}>
                                <InputField
                                    color={Theme.colors.sacredWhite}
                                    placeholder="e.g. grade10, maths, geometry"
                                    value={tags}
                                    onChangeText={setTags}
                                />
                            </Input>
                        </VStack>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <HStack space="md">
                        <SanctuaryButton onPress={onClose} variant="ghost" action="secondary">Dismiss</SanctuaryButton>
                        <SanctuaryButton
                            onPress={handleAdd}
                            isDisabled={!title || !url}
                        >
                            Endorse & Add
                        </SanctuaryButton>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
