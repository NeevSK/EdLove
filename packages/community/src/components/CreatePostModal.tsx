import React, { useState } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Button,
    ButtonText,
    SanctuaryModal,
    Textarea,
    TextareaInput,
    useThemedColors,
    useTheme,
    Theme,
} from '@repo/ui';
import { Mic, Image as ImageIcon, X, Trash2 } from 'lucide-react-native';
import { useCommunity } from '../hooks/useCommunity';
import { uploadToCloudinary } from '@repo/core';
import { TouchableOpacity, Image, ActivityIndicator, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface PostMetadata {
    education_tags?: string[];
    [key: string]: unknown;
}

// Education tag catalogue — stored in metadata.education_tags
const EDUCATION_TAGS = [
    { id: 'lesson', label: '📚 Lesson' },
    { id: 'assignment', label: '📝 Assignment' },
    { id: 'tip', label: '💡 Tip' },
    { id: 'resource', label: '🔗 Resource' },
    { id: 'celebration', label: '🎉 Celebration' },
    { id: 'question', label: '❓ Question' },
    { id: 'announcement', label: '📢 Announcement' },
    { id: 'wellbeing', label: '🌱 Wellbeing' },
];

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupId?: string;
}

export default function CreatePostModal({ isOpen, onClose, groupId }: CreatePostModalProps) {
    const { createPost } = useCommunity();
    const colors = useThemedColors();
    const { text, accent, glass } = useTheme();
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const toggleTag = (id: string) => {
        setSelectedTags((prev) =>
            prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
        );
    };

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

    const handleClose = () => {
        setContent('');
        setSelectedImage(null);
        setSelectedTags([]);
        onClose();
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
                metadata: selectedTags.length > 0 ? ({ education_tags: selectedTags } as PostMetadata) : undefined,
            });
            setContent('');
            setSelectedImage(null);
            setSelectedTags([]);
            onClose();
        } catch (error) {
            console.error('Failed to create post:', error);
            setIsUploading(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const footer = (
        <Button
            action="primary"
            onPress={handleSubmit}
            isDisabled={(!content.trim() && !selectedImage) || isSubmitting || isUploading}
            sx={{
                backgroundColor: accent.action,
                borderRadius: Theme.corners.comfortable,
                width: '100%',
            }}
        >
            <ButtonText {...({ color: text.inverse, bold: true } as any)}>Post Resonance</ButtonText>
        </Button>
    );

    return (
        <SanctuaryModal
            isOpen={isOpen}
            onClose={handleClose}
            title="Share with the Circle"
            footer={footer}
        >
            <VStack {...({ space: "md" } as any)}>
                <Textarea sx={{
                    backgroundColor: glass.interact.bg,
                    borderColor: glass.interact.border,
                    borderRadius: Theme.corners.comfortable,
                    minHeight: 180
                }}>
                    <TextareaInput
                        placeholder="What's alive in you to share?"
                        placeholderTextColor={text.muted}
                        {...({ color: text.primary } as any)}
                        value={content}
                        onChangeText={setContent}
                        sx={{ lineHeight: 22 }}
                    />
                </Textarea>

                {/* Education Tags */}
                <VStack {...({ space: "xs" } as any)}>
                    <Text {...({ color: text.secondary, size: "$xs" } as any)} sx={{ fontWeight: '600' }}>
                        Tag this post (optional)
                    </Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 8 }}
                    >
                        {EDUCATION_TAGS.map((tag) => {
                            const active = selectedTags.includes(tag.id);
                            return (
                                <TouchableOpacity
                                    key={tag.id}
                                    onPress={() => toggleTag(tag.id)}
                                    style={{
                                        paddingHorizontal: 12,
                                        paddingVertical: 6,
                                        borderRadius: Theme.corners.full,
                                        backgroundColor: active ? accent.action : glass.interact.bg,
                                        borderWidth: 1,
                                        borderColor: active ? accent.action : glass.interact.border,
                                    }}
                                >
                                    <Text sx={{
                                        fontSize: 12,
                                        color: active ? text.inverse : text.secondary,
                                        fontWeight: active ? '600' : '400',
                                    }}>
                                        {tag.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </VStack>

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
                                // Shadow Violet overlay — NEVER black rgba(0,0,0,x)
                                backgroundColor: 'rgba(107,100,128,0.60)',
                                padding: 8,
                                borderRadius: 20
                            }}
                        >
                            <Trash2 size={16} color={text.inverse} />
                        </TouchableOpacity>
                        {isUploading && (
                            <Box sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                // Shadow Violet overlay — NEVER black rgba(0,0,0,x)
                                backgroundColor: 'rgba(107,100,128,0.40)',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <ActivityIndicator color={accent.action} />
                            </Box>
                        )}
                    </Box>
                )}

                <HStack {...({ space: "md" } as any)}>
                    <TouchableOpacity
                        onPress={pickImage}
                        style={{ padding: 8, backgroundColor: glass.interact.bg, borderRadius: 8 }}
                    >
                        <ImageIcon size={20} color={selectedImage ? accent.action : text.secondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={{ padding: 8, backgroundColor: glass.interact.bg, borderRadius: 8 }}>
                        <Mic size={20} color={text.secondary} />
                    </TouchableOpacity>
                </HStack>
            </VStack>
        </SanctuaryModal>
    );
}
