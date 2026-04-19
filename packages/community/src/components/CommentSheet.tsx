import React, { useState, useEffect, useRef } from 'react';
import {
    Modal,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { 
    Text, 
    Box, 
    HStack, 
    VStack, 
    Pressable, 
    View,
    Icon,
    InputField,
    Spinner,
    getInitialsFromName,
    formatTimestamp
} from '@repo/ui';
import { ChevronDown, Send, ThumbsUp, Trash2, Shield, Lock, EyeOff } from 'lucide-react-native';
import { useComments } from '../hooks/useComments';
import type { Comment } from '../types/Community';

interface CommentSheetProps {
    postId: string | null;
    postAuthorId?: string;
    currentUserId?: string;
    /** If 'question' the post author can mark official answers */
    postType?: string;
    onClose: () => void;
}

/**
 * Single comment row refactored for Sanctuary V3
 */
function CommentRow({
    comment,
    currentUserId,
    isPostAuthor,
    postType,
    onDelete,
    onUpvote,
    onMarkOfficial,
}: {
    comment: Comment;
    currentUserId?: string;
    isPostAuthor?: boolean;
    postType?: string;
    onDelete: (id: string) => void;
    onUpvote: (id: string) => void;
    onMarkOfficial: (id: string, flag: boolean) => void;
}) {
    const isOwn = comment.author_id === currentUserId;
    const initials = getInitialsFromName(comment.author_name);

    const confirmDelete = () => {
        if (Platform.OS === 'web') {
            if (window.confirm('Delete this comment?')) onDelete(comment.id);
        } else {
            Alert.alert('Delete comment', 'Are you sure you want to delete this comment?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => onDelete(comment.id) },
            ]);
        }
    };

    return (
        <View 
            className={`flex-row mb-5 pl-1 ${comment.is_official_answer ? 'border-l-4 border-l-phase-reward' : ''}`}
        >
            {/* Avatar */}
            <View 
                className={`w-9 h-9 rounded-full items-center justify-center mr-3 mt-1 shrink-0 ${comment.is_anonymous ? 'bg-phase-surface border border-border' : 'bg-phase-interactive/10'}`}
            >
                {comment.is_anonymous ? (
                    <Icon as={EyeOff} size="xs" className="text-ink/40" />
                ) : (
                    <Text className="text-[12px] font-bold text-phase-interactive">{initials}</Text>
                )}
            </View>

            <View className="flex-1">
                <HStack className="justify-between items-center h-5">
                    <HStack className="items-center gap-1.5">
                        <Text className="text-xs font-bold text-ink">
                            {comment.author_name}
                        </Text>
                        {comment.is_official_answer && (
                            <HStack className="items-center px-1.5 py-0.5 rounded-md bg-phase-reward">
                                <Icon as={Shield} size="xs" className="text-white" />
                                <Text className="text-[9px] text-white font-bold ml-0.5 uppercase tracking-tighter">Official</Text>
                            </HStack>
                        )}
                    </HStack>
                    <Text className="text-[10px] text-ink/40">
                        {formatTimestamp(comment.created_at)}
                    </Text>
                </HStack>

                <Text className="text-sm text-ink/70 mt-1 leading-relaxed">
                    {comment.content}
                </Text>

                <HStack className="items-center mt-2.5 gap-6">
                    {/* Upvote */}
                    <Pressable onPress={() => onUpvote(comment.id)} className="flex-row items-center">
                        <Icon 
                            as={ThumbsUp}
                            size="xs"
                            className={comment.has_upvoted ? 'text-phase-interactive' : 'text-ink/40'}
                        />
                        {comment.upvotes > 0 && (
                            <Text 
                                className={`text-[11px] font-bold ml-1.5 ${comment.has_upvoted ? 'text-phase-interactive' : 'text-ink/40'}`}
                            >
                                {comment.upvotes}
                            </Text>
                        )}
                    </Pressable>

                    {/* Mark official (post author, question type) - Not anonymous only */}
                    {isPostAuthor && postType === 'question' && !comment.is_anonymous && (
                        <Pressable
                            onPress={() => onMarkOfficial(comment.id, !comment.is_official_answer)}
                            className="flex-row items-center"
                        >
                            <Icon 
                                as={Shield} 
                                size="xs" 
                                className={comment.is_official_answer ? 'text-phase-reward' : 'text-ink/40'} 
                            />
                            <Text 
                                className={`text-[11px] font-bold ml-1.5 ${comment.is_official_answer ? 'text-phase-reward' : 'text-ink/40'}`}
                            >
                                {comment.is_official_answer ? 'Unmark' : 'Mark answer'}
                            </Text>
                        </Pressable>
                    )}

                    {/* Delete own */}
                    {isOwn && (
                        <Pressable onPress={confirmDelete} className="flex-row items-center p-1">
                            <Icon as={Trash2} size="xs" className="text-ink/40" />
                        </Pressable>
                    )}
                </HStack>
            </View>
        </View>
    );
}

/**
 * Main CommentSheet refactored for Sanctuary V3
 */
export function CommentSheet({
    postId,
    postAuthorId,
    currentUserId,
    postType,
    onClose,
}: CommentSheetProps) {
    const {
        comments,
        isLoading,
        createComment,
        isCreatingComment,
        deleteComment,
        toggleUpvote,
        markOfficialAnswer,
    } = useComments(postId);

    const [draft, setDraft] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    const isPostAuthor = !!currentUserId && currentUserId === postAuthorId;

    // Scroll to bottom when new comments arrive
    useEffect(() => {
        if (comments.length > 0) {
            const timer = setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
            return () => clearTimeout(timer);
        }
    }, [comments.length]);

    const handleSend = async () => {
        const trimmed = draft.trim();
        if (!trimmed || isCreatingComment) return;
        setDraft('');
        try {
            await createComment({ content: trimmed, isAnonymous });
        } catch (err) {
            console.error('[CommentSheet] createComment error:', err);
        }
    };

    const sheetContent = (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
            style={{ flex: 1 }}
        >
            <Box className="flex-1 bg-phase-surface border-t border-border rounded-t-[32px] overflow-hidden shadow-2xl">
            {/* Header Handle */}
            <Box className="w-12 h-1.5 bg-ink/10 rounded-full self-center mt-3 mb-1" />

            {/* Header */}
            <HStack className="items-center px-5 py-4">
                <Pressable 
                    onPress={onClose} 
                    className="w-10 h-10 items-center justify-center rounded-full bg-ink/5"
                    hitSlop={12}
                >
                    <Icon as={ChevronDown} size="md" className="text-ink/60" />
                </Pressable>
                <Text className="text-md font-bold text-ink flex-1 text-center">
                    {isLoading ? 'Loading resonance\u2026' : `${comments.length} Reflection${comments.length !== 1 ? 's' : ''}`}
                </Text>
                <Box className="w-10" />
            </HStack>

            {/* Comment list */}
            {isLoading ? (
                <Box className="flex-1 items-center justify-center py-20">
                    <Spinner />
                </Box>
            ) : comments.length === 0 ? (
                <VStack className="flex-1 items-center justify-center py-12 px-8 gap-3">
                    <Text className="text-md font-bold text-ink/20">The Heart is Quiet</Text>
                    <Text className="text-sm text-ink/40 text-center leading-relaxed">
                        Be the first to seed a reflection into this conversation circle.
                    </Text>
                </VStack>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={comments}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 24 }}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <CommentRow
                            comment={item}
                            currentUserId={currentUserId}
                            isPostAuthor={isPostAuthor}
                            postType={postType}
                            onDelete={deleteComment}
                            onUpvote={toggleUpvote}
                            onMarkOfficial={(id, flag) => markOfficialAnswer({ commentId: id, isOfficial: flag })}
                        />
                    )}
                />
            )}

            {/* Composer */}
            <HStack 
                className="items-end p-4 gap-3 border-t border-border bg-phase-surface/80"
            >
                {/* Anonymous toggle */}
                <Pressable
                    onPress={() => setIsAnonymous(v => !v)}
                    className={`w-11 h-11 rounded-2xl border items-center justify-center shrink-0 ${isAnonymous ? 'bg-phase-interactive border-phase-interactive' : 'bg-phase-surface border-border'}`}
                    hitSlop={8}
                >
                    <Icon as={Lock} size="sm" className={isAnonymous ? 'text-white' : 'text-ink/40'} />
                </Pressable>

                <Box className="flex-1 bg-ink/5 rounded-2xl border border-border px-1">
                    <InputField
                        className="text-ink text-sm py-2.5 px-3 min-h-[44px] max-h-[120px]"
                        placeholder={isAnonymous ? 'Reflect anonymously\u2026' : 'Add a reflection\u2026'}
                        placeholderTextColor="#94a3b8"
                        value={draft}
                        onChangeText={setDraft}
                        multiline
                        maxLength={1000}
                    />
                </Box>

                <Pressable
                    onPress={handleSend}
                    disabled={!draft.trim() || isCreatingComment}
                    className={`w-11 h-11 rounded-2xl items-center justify-center shrink-0 ${!draft.trim() ? 'bg-ink/5' : 'bg-phase-interactive'}`}
                >
                    {isCreatingComment ? (
                        <Spinner />
                    ) : (
                        <Icon as={Send} size="sm" className={!draft.trim() ? 'text-ink/20' : 'text-white'} />
                    )}
                </Pressable>
            </HStack>
            </Box>
        </KeyboardAvoidingView>
    );

    if (Platform.OS === 'web') {
        if (!postId) return null;
        return (
            <View
                style={{
                    position: 'fixed' as any,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    maxHeight: '85vh',
                    zIndex: 1000,
                    boxShadow: '0 -10px 40px rgba(107,100,128,0.15)',
                    overflow: 'hidden',
                } as any}
            >
                {sheetContent}
            </View>
        );
    }

    return (
        <Modal
            visible={!!postId}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <View className="flex-1">
                <Pressable
                    className="flex-1 bg-black/40"
                    onPress={onClose}
                />
                {sheetContent}
            </View>
        </Modal>
    );
}
