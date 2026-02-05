import React, { useState } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    Button,
    ButtonText,
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Input,
    InputField,
    Textarea,
    TextareaInput,
} from "@gluestack-ui/themed";
import { MessageCircle, Mic, Image as ImageIcon } from 'lucide-react-native';
import { Theme } from '../../constants/Theme';
import { useCommunity } from '../../hooks/useCommunity';

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupId?: string;
}

export default function CreatePostModal({ isOpen, onClose, groupId }: CreatePostModalProps) {
    const { createPost } = useCommunity();
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!content.trim()) return;

        setIsSubmitting(true);
        try {
            await createPost({
                group_id: groupId || 'general',
                content,
                type: 'text',
                author_id: 'current-user', // Handled by backend/hook usually
            });
            setContent('');
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalBackdrop />
            <ModalContent sx={{ backgroundColor: Theme.colors.midnightBlue }}>
                <ModalHeader>
                    <Heading color={Theme.colors.sanctuarySaffron} size="lg">Create Post</Heading>
                </ModalHeader>
                <ModalBody>
                    <VStack space="md">
                        <Textarea size="md" sx={{
                            backgroundColor: Theme.colors.deepIndigo,
                            borderColor: 'transparent',
                            minHeight: 150
                        }}>
                            <TextareaInput
                                placeholder="Share your thoughts..."
                                placeholderTextColor={Theme.colors.mistGray}
                                color={Theme.colors.sacredWhite}
                                value={content}
                                onChangeText={setContent}
                            />
                        </Textarea>

                        <HStack space="md">
                            <Button variant="outline" size="sm" sx={{ borderColor: Theme.colors.dimGray }}>
                                <ImageIcon size={18} color={Theme.colors.mistGray} />
                            </Button>
                            <Button variant="outline" size="sm" sx={{ borderColor: Theme.colors.dimGray }}>
                                <Mic size={18} color={Theme.colors.mistGray} />
                            </Button>
                        </HStack>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button variant="outline" action="secondary" onPress={onClose} mr="$2">
                        <ButtonText color={Theme.colors.mistGray}>Cancel</ButtonText>
                    </Button>
                    <Button
                        action="primary"
                        onPress={handleSubmit}
                        isDisabled={!content.trim() || isSubmitting}
                        sx={{ backgroundColor: Theme.colors.sanctuarySaffron }}
                    >
                        <ButtonText color={Theme.colors.white}>Post</ButtonText>
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
