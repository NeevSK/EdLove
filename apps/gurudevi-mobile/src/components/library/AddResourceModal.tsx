import React, { useState } from 'react';
import { Modal, ModalBackdrop, ModalContent, ModalHeader, ModalBody, ModalFooter, Heading, VStack, HStack, Text, Input, InputField } from '@repo/ui';
import { SanctuaryButton } from '@repo/ui';
import { Theme } from '@repo/ui';
import { ResourceType } from '@repo/ui';

interface AddResourceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (data: { title: string; type: ResourceType; url: string; description: string }) => void;
}

export default function AddResourceModal({ isOpen, onClose, onAdd }: AddResourceModalProps) {
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<ResourceType>('link');

    const handleAdd = () => {
        if (!title || !url) return;
        onAdd({ title, type, url, description });
        onClose();
        // Reset
        setTitle('');
        setUrl('');
        setDescription('');
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
                        <HStack space="sm">
                            {(['link', 'pdf', 'video'] as ResourceType[]).map(t => (
                                <SanctuaryButton
                                    key={t}
                                    onPress={() => setType(t)}
                                    variant={type === t ? 'solid' : 'outline'}
                                    size="xs"
                                    action="secondary"
                                >
                                    {t.toUpperCase()}
                                </SanctuaryButton>
                            ))}
                        </HStack>
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
