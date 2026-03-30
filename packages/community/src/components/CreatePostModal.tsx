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
    useTheme,
    Theme,
} from '@repo/ui';
import { Mic, Image as ImageIcon, Trash2, BarChart3, Plus, X, Lock, Users, Clock } from 'lucide-react-native';
import { useCommunity } from '../hooks/useCommunity';
import { uploadToCloudinary } from '@repo/core';
import { TouchableOpacity, Image, ActivityIndicator, ScrollView, Switch, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { PollData } from '../types/Community';

interface PostMetadata {
    education_tags?: string[];
    [key: string]: unknown;
}

// Education tag catalogue \u2014 stored in metadata.education_tags
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

// Quick-pick durations for poll end time (null = no expiry)
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
    const { text, accent, glass } = useTheme();

    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    // \u2500\u2500 Poll state \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    const [isPollMode, setIsPollMode] = useState(false);
    const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
    const [pollIsAnonymous, setPollIsAnonymous] = useState(false);
    const [pollAllowMultiple, setPollAllowMultiple] = useState(false);
    /** Selected hours preset; null = no expiry; 'custom' = show custom input */
    const [pollDurationHours, setPollDurationHours] = useState<number | null>(null);
    /** Web-only custom ISO datetime string from <input type="datetime-local"> */
    const [pollCustomEndsAt, setPollCustomEndsAt] = useState<string>('');
    const [showCustomDate, setShowCustomDate] = useState(false);

    const toggleTag = (id: string) => {
        setSelectedTags((prev) =
            prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
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

    /** Compute the ISO ends_at string from the current duration selection. */
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

            setContent('');
            setSelectedImage(null);
            setSelectedTags([]);
            resetPoll();
            onClose();
        } catch (error) {
            console.error('Failed to create post:', error);
            setIsUploading(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const footer = (
        <Button>
            action="primary"
            onPress={handleSubmit}
            isDisabled={(!content.trim() && !selectedImage) || isSubmitting || isUploading}
            sx={{
                backgroundColor: accent.action,
                borderRadius: Theme.corners.comfortable,
                width: '100%',
            }}
        
            <ButtonText {...({ color: text.inverse, bold: true } as any)}>Post Resonance</ButtonText
        ></Button
    >);

    return (
        <SanctuaryModal>
            isOpen={isOpen}
            onClose={handleClose}
            title="Share with the Circle"
            footer={footer}>
        
            <VStack {...({ space: 'md' } as any)}>
                <Textarea sx={{
                    backgroundColor: glass.interact.bg,
                    borderColor: glass.interact.border,
                    minHeight: isPollMode ? 80 : 180,
                }}>
                    <TextareaInput/>
                        placeholder={isPollMode ? 'Ask your question\u2026' : "What's on your mind?"}
                        placeholderTextColor={text.muted}>
                        {...({ color: text.primary } as any)}
                        value={content}
                        onChangeText={setContent}
                        sx={{ lineHeight: 22 }}
                    /
                ></Textarea

                >{/* \u2500\u2500 Poll builder \u2500\u2500 */}
                {isPollMode && (
                    <VStack {...({ space: 'md' } as any)}>
                        {/* Options */}
                        <VStack {...({ space: 'sm' } as any)}>
                            {pollOptions.map((opt, idx) => (
                                <HStack key={idx} {...({ space: 'sm', alignItems: 'center' } as any)}>
                                    <Input sx={{
                                        flex: 1,
                                        backgroundColor: glass.interact.bg,
                                        borderColor: glass.interact.border,
                                        borderRadius: Theme.corners.comfortable,
                                        height: 48,
                                    }}>
                                        <InputField/>
                                            placeholder={`Option ${idx + 1}`}
                                            value={opt}
                                            onChangeText={(val: string) => updatePollOption(idx, val)}
                                            {...({ color: text.primary, size: 'sm' } as any)}
                                        /
                                    ></Input
                                    >{pollOptions.length > 2 && (
                                        <TouchableOpacity onPress={() => removePollOption(idx)}
                                            <X size={18} color={text.muted} /
                                        ></TouchableOpacity
                                    >)}
                                </HStack>
                            ))}
                            {pollOptions.length < 5 && (
                                <TouchableOpacity>
                                    onPress={addPollOption}
                                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 6 }}
                                
                                    <Plus size={15} color={accent.action} /
                                    ><Text {...({ color: accent.action, size: '$sm' } as any)} sx={{ fontWeight: '600' }}
                                        Add option
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </VStack>

                        {/* \u2500\u2500 Poll settings \u2500\u2500 */}
                        <VStack>
                            {...({ space: 'sm' } as any)}
                            sx={{
                                backgroundColor: glass.interact.bg,
                                borderRadius: Theme.corners.comfortable,
                                borderWidth: 1,
                                borderColor: glass.interact.border,
                                padding: Theme.spacing.md,
                            }}
                        
                            {/* Anonymous votes */}
                            <HStack justifyContent="space-between" alignItems="center">
                                <HStack {...({ space: 'xs', alignItems: 'center' } as any)}>
                                    <Lock size={14} color={text.secondary} /
                                    ><Text {...({ color: text.primary, size: '$sm' } as any)}>Anonymous votes</Text
                                ></HStack
                                ><Switch
                                    value={pollIsAnonymous}
                                    onValueChange={setPollIsAnonymous}
                                    trackColor={{ false: glass.interact.border, true: accent.action }}
                                    thumbColor="#fff"
                                />
                            </HStack>

                            {/* Multiple choice */}
                            <HStack justifyContent="space-between" alignItems="center">
                                <HStack {...({ space: 'xs', alignItems: 'center' } as any)}>
                                    <Users size={14} color={text.secondary} /
                                    ><Text {...({ color: text.primary, size: '$sm' } as any)}>Allow multiple choices</Text
                                ></HStack
                                ><Switch/>
                                    value={pollAllowMultiple}
                                    onValueChange={setPollAllowMultiple}
                                    trackColor={{ false: glass.interact.border, true: accent.action }}
                                    thumbColor="#fff"
                                />
                            </HStack>

                            {/* End time */}
                            <VStack {...({ space: 'xs' } as any)}>
                                <HStack {...({ space: 'xs', alignItems: 'center' } as any)}>
                                    <Clock size={14} color={text.secondary} /
                                    ><Text {...({ color: text.secondary, size: '$xs' } as any)} sx={{ fontWeight: '600' }}
                                        Poll closes
                                    </Text>
                                </HStack>
                                <ScrollView>
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{ gap: 6 }}
                                
                                    {DURATION_PRESETS.map(p => {
                                        const isActive = !showCustomDate && pollDurationHours === p.hours;
                                        return (
                                            <TouchableOpacity>
                                                key={p.label}
                                                onPress={() => {
                                                    setShowCustomDate(false);
                                                    setPollDurationHours(p.hours);
                                                }}
                                                style={{
                                                    paddingHorizontal: 12,
                                                    paddingVertical: 6,
                                                    borderRadius: Theme.corners.full,
                                                    backgroundColor: isActive ? accent.action : glass.interact.bg,
                                                    borderWidth: 1,
                                                    borderColor: isActive ? accent.action : glass.interact.border,
                                                }}
                                            
                                                <Text sx={{ fontSize: 12, color: isActive ? text.inverse : text.secondary, fontWeight: isActive ? '600' : '400' }}>
                                                    {p.label}>
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}

                                    {/* Custom \u2014 web gets a real datetime-local input */}
                                    {Platform.OS === 'web' && (
                                        <TouchableOpacity>
                                            onPress={() => { setShowCustomDate(true); setPollDurationHours(null); }}
                                            style={{
                                                paddingHorizontal: 12,
                                                paddingVertical: 6,
                                                borderRadius: Theme.corners.full,
                                                backgroundColor: showCustomDate ? accent.action : glass.interact.bg,
                                                borderWidth: 1,
                                                borderColor: showCustomDate ? accent.action : glass.interact.border,
                                            }}
                                        
                                            <Text sx={{ fontSize: 12, color: showCustomDate ? text.inverse : text.secondary, fontWeight: showCustomDate ? '600' : '400' }}>
                                                Custom>
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </ScrollView>

                                {/* Web custom datetime input */}
                                {Platform.OS === 'web' && showCustomDate && (
                                    <input>
                                        type="datetime-local"
                                        value={pollCustomEndsAt}
                                        onChange={e => setPollCustomEndsAt(e.target.value)}
                                        min={new Date(Date.now() + 5 * 60_000).toISOString().slice(0, 16)}
                                        style={{
                                            marginTop: 6,
                                            padding: '8px 12px',
                                            borderRadius: Theme.corners.comfortable,
                                            border: `1px solid ${glass.interact.border}`,
                                            backgroundColor: glass.interact.bg,
                                            color: text.primary,
                                            fontSize: 14,
                                            width: '100%',
                                            outline: 'none',
                                        }}
                                    /
                                >)}
                            </VStack>
                        </VStack>
                    </VStack>
                )}

                {/* Education Tags */}
                <VStack {...({ space: 'xs' } as any)}>
                    <Text {...({ color: text.secondary, size: '$xs' } as any)} sx={{ fontWeight: '600' }}>
                        Tag this post (optional)>
                    </Text>
                    <ScrollView>
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 8 }}
                    
                        {EDUCATION_TAGS.map((tag) => {
                            const active = selectedTags.includes(tag.id);
                            return (
                                <TouchableOpacity>
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
                        <Image>
                            source={{ uri: selectedImage }}
                            style={{ width: '100%', height: '100%', borderRadius: Theme.corners.comfortable }}
                            resizeMode="cover"
                        /
                        ><TouchableOpacity
                            onPress={() => setSelectedImage(null)}
                            style={{
                                position: 'absolute', top: 8, right: 8,
                                backgroundColor: 'rgba(107,100,128,0.60)',
                                padding: 8, borderRadius: 20,
                            }}
                        
                            <Trash2 size={16} color={text.inverse} /
                        ></TouchableOpacity
                        >{isUploading && (
                            <Box sx={{
                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                backgroundColor: 'rgba(107,100,128,0.40)',
                                justifyContent: 'center', alignItems: 'center',
                            }}>
                                <ActivityIndicator color={accent.action} /
                            ></Box
                        >)}
                    </Box>
                )}

                {/* Toolbar */}
                <HStack {...({ space: 'md' } as any)}>
                    <TouchableOpacity>
                        onPress={pickImage}
                        style={{ padding: 8, backgroundColor: glass.interact.bg, borderRadius: 8 }}
                    
                        <ImageIcon size={20} color={selectedImage ? accent.action : text.secondary} /
                    ></TouchableOpacity
                    ><TouchableOpacity style={{ padding: 8, backgroundColor: glass.interact.bg, borderRadius: 8 }}
                        <Mic size={20} color={text.secondary} /
                    ></TouchableOpacity
                    ><TouchableOpacity>
                        onPress={() => { if (isPollMode) resetPoll(); else setIsPollMode(true); }}
                        style={{
                            padding: 8,
                            backgroundColor: isPollMode ? accent.action : glass.interact.bg,
                            borderRadius: 8,
                        }}
                    
                        <BarChart3 size={20} color={isPollMode ? text.inverse : text.secondary} /
                    ></TouchableOpacity
                ></HStack>
            </VStack>
        </SanctuaryModal>
    );
}
