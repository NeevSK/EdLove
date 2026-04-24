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
    Input,
    InputField,
    Icon,
    Pressable,
    Image,
    Spinner
} from '@repo/ui';
import { useCommunity } from '../hooks/useCommunity';
import { uploadToCloudinary, usePermissions } from '@repo/core';
import { ScrollView, Switch, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { PollData } from '../types/Community';

interface PostMetadata {
    education_tags?: string[];
    [key: string]: unknown;
}

const EDUCATION_TAGS = [
    { id: 'lesson', label: '\uD83D\uDCDA Lesson' },
    { id: 'assignment', label: '\uD83D\uDCDD Assignment' },
    { id: 'tip', label: '\uD83D\uDCA1 Tip' },
    { id: 'resource', label: '\uD83D\uDD17 Resource' },
    { id: 'celebration', label: '\uD83C\uDF89 Celebration' },
    { id: 'question', label: '\u2753 Question' },
    { id: 'announcement', label: '\uD83D\uDCE2 Announcement' },
    { id: 'wellbeing', label: '\uD83C\uDF31 Wellbeing' },
];

const DURATION_PRESETS: { label: string; hours: number | null }[] = [
    { label: 'No end', hours: null },
    { label: '1 h',   hours: 1 },
    { label: '24 h',  hours: 24 },
    { label: '3 d',   hours: 72 },
    { label: '7 d',   hours: 168 },
];

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupId?: string;
}

export default function CreatePostModal({ isOpen, onClose, groupId }: CreatePostModalProps) {
    const { createPost } = useCommunity();
    const { can, flags } = usePermissions();

    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const [isPollMode, setIsPollMode] = useState(false);
    const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
    const [pollIsAnonymous, setPollIsAnonymous] = useState(false);
    const [pollAllowMultiple, setPollAllowMultiple] = useState(false);
    const [pollDurationHours, setPollDurationHours] = useState<number | null>(null);
    const [pollCustomEndsAt, setPollCustomEndsAt] = useState<string>('');
    const [showCustomDate, setShowCustomDate] = useState(false);

    const toggleTag = (id: string) => {
        setSelectedTags((prev) =>
            prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
        );
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });
        if (!result.canceled && result.assets?.[0]?.uri) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const resetPoll = () => {
        setIsPollMode(false);
        setPollOptions(['', '']);
        setPollIsAnonymous(false);
        setPollAllowMultiple(false);
        setPollDurationHours(null);
        setPollCustomEndsAt('');
        setShowCustomDate(false);
    };

    const handleClose = () => {
        setContent('');
        setSelectedImage(null);
        setSelectedTags([]);
        resetPoll();
        onClose();
    };

    const addPollOption = () => {
        if (pollOptions.length < 5) setPollOptions([...pollOptions, '']);
    };

    const updatePollOption = (index: number, val: string) => {
        const updated = [...pollOptions];
        updated[index] = val;
        setPollOptions(updated);
    };

    const removePollOption = (index: number) => {
        if (pollOptions.length > 2) setPollOptions(pollOptions.filter((_, i) => i !== index));
    };

    const computeEndsAt = (): string | null => {
        if (showCustomDate && pollCustomEndsAt) return new Date(pollCustomEndsAt).toISOString();
        if (pollDurationHours === null) return null;
        return new Date(Date.now() + pollDurationHours * 60 * 60 * 1000).toISOString();
    };

    const handleSubmit = async () => {
        if (!content.trim() && !selectedImage) return;

        setIsSubmitting(true);
        let mediaUrl = '';
        let mediaType: 'image' | 'document' | 'audio' | 'video' | undefined;

        try {
            if (selectedImage) {
                setIsUploading(true);
                mediaUrl = await uploadToCloudinary(selectedImage, 'image');
                mediaType = 'image';
                setIsUploading(false);
            }

            const pollData: PollData | undefined = isPollMode ? {
                options: pollOptions
                    .filter(o => o.trim())
                    .map((o, i) => ({ id: `opt_${i}`, text: o.trim() })),
                allow_multiple: pollAllowMultiple,
                is_anonymous: pollIsAnonymous,
                ends_at: computeEndsAt(),
            } : undefined;

            await createPost({
                group_id: groupId || 'general',
                content: content.trim(),
                post_type: isPollMode ? 'poll' : (mediaUrl ? 'resource' : 'discussion'),
                visibility: 'school',
                media_url: mediaUrl,
                media_type: mediaType,
                poll_data: pollData,
                metadata: selectedTags.length > 0 ? ({ education_tags: selectedTags } as PostMetadata) : undefined,
            });

            handleClose();
        } catch (error) {
            console.error('Failed to create post:', error);
            setIsUploading(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const footer = (
        <Button
            onPress={handleSubmit}
            isDisabled={(!content.trim() && !selectedImage) || isSubmitting || isUploading}
            className="w-full bg-phase-interactive h-12 rounded-2xl active:opacity-90"
        >
            <ButtonText className="text-inverted font-bold">Post Resonance</ButtonText>
        </Button>
    );

    return (
        <SanctuaryModal
            isOpen={isOpen}
            onClose={handleClose}
            title="Share with the Circle"
            footer={footer}
        >
            <VStack className="gap-4">
                <Textarea className="bg-phase-surface border-border min-h-[180px] rounded-2xl">
                    <TextareaInput
                        placeholder={isPollMode ? 'Ask your question\u2026' : "What's on your mind?"}
                        className="text-ink text-base"
                        value={content}
                        onChangeText={setContent}
                    />
                </Textarea>

                {isPollMode && (
                    <VStack className="gap-4">
                        <VStack className="gap-2">
                            {pollOptions.map((opt, idx) => (
                                <HStack key={idx} className="items-center gap-2">
                                    <Input className="flex-1 bg-phase-surface border-border h-12 rounded-xl">
                                        <InputField
                                            placeholder={`Option ${idx + 1}`}
                                            value={opt}
                                            onChangeText={(val: string) => updatePollOption(idx, val)}
                                            className="text-ink text-sm"
                                        />
                                    </Input>
                                    {pollOptions.length > 2 && (
                                        <Pressable onPress={() => removePollOption(idx)} className="p-2">
                                            <Icon as={X} size="sm" className="text-ink/40" />
                                        </Pressable>
                                    )}
                                </HStack>
                            ))}
                            {pollOptions.length < 5 && (
                                <Pressable
                                    onPress={addPollOption}
                                    className="flex-row items-center py-2 gap-2"
                                >
                                    <Icon as={Plus} size="xs" className="text-phase-interactive" />
                                    <Text className="text-phase-interactive text-sm font-semibold">
                                        Add option
                                    </Text>
                                </Pressable>
                            )}
                        </VStack>

                        <VStack
                            className="gap-3 bg-phase-surface/50 p-4 border border-border rounded-2xl"
                        >
                            <HStack className="justify-between items-center">
                                <HStack className="items-center gap-2">
                                    <Icon as={Lock} size="xs" className="text-ink/60" />
                                    <Text className="text-ink text-sm">Anonymous votes</Text>
                                </HStack>
                                <Switch
                                    value={pollIsAnonymous}
                                    onValueChange={setPollIsAnonymous}
                                    trackColor={{ false: '#e2e8f0', true: '#6366f1' }}
                                    thumbColor="#fff"
                                />
                            </HStack>
 
                            <HStack className="justify-between items-center">
                                <HStack className="items-center gap-2">
                                    <Icon as={Users} size="xs" className="text-ink/60" />
                                    <Text className="text-ink text-sm">Allow multiple choices</Text>
                                </HStack>
                                <Switch
                                    value={pollAllowMultiple}
                                    onValueChange={setPollAllowMultiple}
                                    trackColor={{ false: '#e2e8f0', true: '#6366f1' }}
                                    thumbColor="#fff"
                                />
                            </HStack>
 
                            <VStack className="gap-2">
                                <HStack className="items-center gap-2">
                                    <Icon as={Clock} size="xs" className="text-ink/60" />
                                    <Text className="text-ink/60 text-xs font-semibold">
                                        Poll closes
                                    </Text>
                                </HStack>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                >
                                    <HStack className="gap-2">
                                        {DURATION_PRESETS.map(p => {
                                            const isActive = !showCustomDate && pollDurationHours === p.hours;
                                            return (
                                                <Pressable
                                                    key={p.label || 'none'}
                                                    onPress={() => {
                                                        setShowCustomDate(false);
                                                        setPollDurationHours(p.hours);
                                                    }}
                                                    className={`px-3 py-1.5 rounded-full border ${isActive ? 'bg-phase-interactive border-phase-interactive' : 'bg-phase-surface border-border'}`}
                                                >
                                                    <Text className={`text-xs ${isActive ? 'text-inverted font-semibold' : 'text-ink/60'}`}>
                                                        {p.label}
                                                    </Text>
                                                </Pressable>
                                            );
                                        })}

                                        {Platform.OS === 'web' && (
                                            <Pressable
                                                onPress={() => { setShowCustomDate(true); setPollDurationHours(null); }}
                                                className={`px-3 py-1.5 rounded-full border ${showCustomDate ? 'bg-phase-interactive border-phase-interactive' : 'bg-phase-surface border-border'}`}
                                            >
                                                <Text className={`text-xs ${showCustomDate ? 'text-inverted font-semibold' : 'text-ink/60'}`}>
                                                    Custom
                                                </Text>
                                            </Pressable>
                                        )}
                                    </HStack>
                                </ScrollView>

                                {Platform.OS === 'web' && showCustomDate && (
                                    <input
                                        type="datetime-local"
                                        value={pollCustomEndsAt}
                                        onChange={e => setPollCustomEndsAt(e.target.value)}
                                        min={new Date(Date.now() + 5 * 60_000).toISOString().slice(0, 16)}
                                        style={{
                                            marginTop: 6,
                                            padding: '8px 12px',
                                            borderRadius: '12px',
                                            border: '1px solid #e2e8f0',
                                            backgroundColor: '#f8fafc',
                                            color: '#0f172a',
                                            fontSize: 14,
                                            width: '100%',
                                            outline: 'none',
                                        }}
                                    />
                                )}
                            </VStack>
                        </VStack>
                    </VStack>
                )}

                {/* Education Tags */}
                <VStack className="gap-2">
                    <Text className="text-ink/60 text-xs font-semibold">
                        Tag this post (optional)
                    </Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                    >
                        <HStack className="gap-2">
                            {EDUCATION_TAGS.map((tag) => {
                                const active = selectedTags.includes(tag.id);
                                return (
                                    <Pressable
                                        key={tag.id}
                                        onPress={() => toggleTag(tag.id)}
                                        className={`px-3 py-1.5 rounded-full border ${active ? 'bg-phase-interactive border-phase-interactive' : 'bg-phase-surface border-border'}`}
                                    >
                                        <Text className={`text-xs ${active ? 'text-inverted font-semibold' : 'text-ink/60'}`}>
                                            {tag.label}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </HStack>
                    </ScrollView>
                </VStack>

                {selectedImage && (
                    <Box className="relative rounded-2xl overflow-hidden h-[200px]">
                        <Image
                            source={{ uri: selectedImage }}
                            className="w-full h-full rounded-2xl"
                            alt="Selected post image"
                        />
                        <Pressable
                            onPress={() => setSelectedImage(null)}
                            className="absolute top-2 right-2 bg-black/40 p-2 rounded-full"
                        >
                            <Icon as={Trash2} size="sm" className="text-inverted" />
                        </Pressable>
                        {isUploading && (
                            <Box className="absolute inset-0 bg-black/20 justify-center items-center">
                                <Spinner />
                            </Box>
                        )}
                    </Box>
                )}

                {/* Toolbar */}
                <HStack className="gap-4">
                    <Pressable
                        onPress={pickImage}
                        className={`p-3 rounded-xl ${selectedImage ? 'bg-phase-interactive/10' : 'bg-phase-surface'}`}
                    >
                        <Icon as={ImageIcon} size="md" className={selectedImage ? 'text-phase-interactive' : 'text-ink/40'} />
                    </Pressable>
                    <Pressable className="p-3 bg-phase-surface rounded-xl">
                        <Icon as={Mic} size="md" className="text-ink/40" />
                    </Pressable>
                    {/* Polls gated by permissions or a specific flag if we add it, for now using general community flag */}
                    {flags.isCommunityEnabled && (
                        <Pressable
                            onPress={() => { if (isPollMode) resetPoll(); else setIsPollMode(true); }}
                            className={`p-3 rounded-xl ${isPollMode ? 'bg-phase-interactive' : 'bg-phase-surface'}`}
                        >
                            <Icon as={BarChart3} size="md" className={isPollMode ? 'text-inverted' : 'text-ink/40'} />
                        </Pressable>
                    )}
                </HStack>
            </VStack>
        </SanctuaryModal>
    );
}
