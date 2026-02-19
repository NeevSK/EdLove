import React, { useState } from 'react';
import { Modal, ModalBackdrop, ModalContent, ModalHeader, ModalBody, ModalFooter, Heading, VStack, HStack, Text, Input, InputField } from '@repo/ui';
import { SanctuaryButton } from '@repo/ui';
import { Theme } from '@repo/ui';
import { LIBRARY_RESOURCE_CATEGORIES } from '@repo/core';

type LibResourceType = typeof LIBRARY_RESOURCE_CATEGORIES[number]['id'];

interface AddResourceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (data: { title: string; type: LibResourceType; url: string; description: string; tags: string[] }) => void;
}

export default function AddResourceModal({ isOpen, onClose, onAdd }: AddResourceModalProps) {
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
            <ModalContent sx={{ backgroundColor: Theme.colors.midnightBlue }}>
                <ModalHeader>
                    <Heading color={Theme.colors.sacredWhite}>Add Resource</Heading>
                </ModalHeader>
                <ModalBody>
                    <VStack space="md">
                        <Input variant="outline" size="md">
                            <InputField
                                color={Theme.colors.sacredWhite}
                                placeholder="Title"
                                value={title}
                                onChangeText={setTitle}
                            />
                        </Input>
                        <Input variant="outline" size="md">
                            <InputField
                                color={Theme.colors.sacredWhite}
                                placeholder="URL"
                                value={url}
                                onChangeText={setUrl}
                                autoCapitalize="none"
                            />
                        </Input>
                        <Input variant="outline" size="md">
                            <InputField
                                color={Theme.colors.sacredWhite}
                                placeholder="Description (Optional)"
                                value={description}
                                onChangeText={setDescription}
                            />
                        </Input>

                        <Text color={Theme.colors.mistGray} size="sm">Type</Text>
                        <HStack space="sm" flexWrap="wrap" sx={{ gap: 8 }}>
                            {LIBRARY_RESOURCE_CATEGORIES.map(cat => (
                                <SanctuaryButton
                                    key={cat.id}
                                    onPress={() => setType(cat.id as LibResourceType)}
                                    variant={type === cat.id ? 'solid' : 'outline'}
                                    size="xs"
                                    action="secondary"
                                    sx={{ minWidth: 80 }}
                                >
                                    {cat.en}
                                </SanctuaryButton>
                            ))}
                        </HStack>

                        <Text color={Theme.colors.mistGray} size="sm">Tags (comma-separated)</Text>
                        <Input variant="outline" size="md">
                            <InputField
                                color={Theme.colors.sacredWhite}
                                placeholder="e.g. grade10, maths, geometry"
                                value={tags}
                                onChangeText={setTags}
                            />
                        </Input>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <HStack space="md">
                        <SanctuaryButton onPress={onClose} variant="ghost" action="secondary">
                            Cancel
                        </SanctuaryButton>
                        <SanctuaryButton onPress={handleAdd} isDisabled={!title || !url}>
                            Add Resource
                        </SanctuaryButton>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
