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
    Textarea,
    TextareaInput,
    useThemedColors,
    Theme,
} from '@repo/ui';
import { Mic, Image as ImageIcon, X, Trash2 } from 'lucide-react-native';
import { useCommunity } from '../hooks/useCommunity';
import { uploadToCloudinary } from '@repo/core';
import { TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupId?: string;
}

export default function CreatePostModal({ isOpen, onClose, groupId }: CreatePostModalProps) {
    const { createPost } = useCommunity();
    const colors = useThemedColors();
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets?.[0]?.uri) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!content.trim() && !selectedImage) return;

        setIsSubmitting(true);
        let mediaUrl = '';
        let mediaType: 'image' | 'document' | 'audio' | 'video' | undefined = undefined;

        try {
            if (selectedImage) {
                setIsUploading(true);
                mediaUrl = await uploadToCloudinary(selectedImage, 'image');
                mediaType = 'image';
                setIsUploading(false);
            }

            await createPost({
                group_id: groupId || 'general',
                content,
                post_type: mediaUrl ? 'resource' : 'post',
                visibility: 'school',
                media_url: mediaUrl,
                media_type: mediaType,
            });
            setContent('');
            setSelectedImage(null);
            onClose();
        } catch (error) {
            console.error('Failed to create post:', error);
            setIsUploading(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalBackdrop />
            <ModalContent sx={{ backgroundColor: colors.secondary, borderRadius: Theme.corners.generous }}>
                <ModalHeader>
                    <HStack justifyContent="space-between" alignItems="center" w="$full">
                        <Heading color={colors.action} size="lg">Share with the Circle</Heading>
                        <TouchableOpacity onPress={onClose}>
                            <X size={20} color={colors.textTertiary} />
                        </TouchableOpacity>
                    </HStack>
                </ModalHeader>
                <ModalBody>
                    <VStack space="md">
                        <Textarea sx={{
                            backgroundColor: colors.overlay,
                            borderColor: 'transparent',
                            borderRadius: Theme.corners.comfortable,
                            minHeight: 180
                        }}>
                            <TextareaInput
                                placeholder="What's on your mind?"
                                placeholderTextColor={colors.textTertiary}
                                color={colors.textPrimary}
                                value={content}
                                onChangeText={setContent}
                                sx={{ lineHeight: 22 }}
                            />
                        </Textarea>

                        {selectedImage && (
                            <Box sx={{ position: 'relative', borderRadius: Theme.corners.comfortable, overflow: 'hidden', height: 200 }}>
                                <Image
                                    source={{ uri: selectedImage }}
                                    style={{ width: '100%', height: '100%', borderRadius: Theme.corners.comfortable }}
                                    resizeMode="cover"
                                />
                                <TouchableOpacity
                                    onPress={() => setSelectedImage(null)}
                                    style={{
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                        backgroundColor: 'rgba(0,0,0,0.5)',
                                        padding: 8,
                                        borderRadius: 20
                                    }}
                                >
                                    <Trash2 size={16} color="white" />
                                </TouchableOpacity>
                                {isUploading && (
                                    <Box sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        backgroundColor: 'rgba(0,0,0,0.3)',
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}>
                                        <ActivityIndicator color={colors.action} />
                                    </Box>
                                )}
                            </Box>
                        )}

                        <HStack space="md">
                            <TouchableOpacity
                                onPress={pickImage}
                                style={{ padding: 8, backgroundColor: colors.overlay, borderRadius: 8 }}
                            >
                                <ImageIcon size={20} color={selectedImage ? colors.action : colors.textSecondary} />
                            </TouchableOpacity>
                            <TouchableOpacity style={{ padding: 8, backgroundColor: colors.overlay, borderRadius: 8 }}>
                                <Mic size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </HStack>
                    </VStack>
                </ModalBody>
                <ModalFooter sx={{ borderTopWidth: 0 }}>
                    <Button
                        action="primary"
                        onPress={handleSubmit}
                        isDisabled={(!content.trim() && !selectedImage) || isSubmitting || isUploading}
                        sx={{
                            backgroundColor: colors.action,
                            borderRadius: Theme.corners.comfortable,
                            paddingHorizontal: 32,
                        }}
                    >
                        <ButtonText color={Theme.colors.white} bold>Post Resonance</ButtonText>
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
