/**
 * CommentSheet
 *
 * A full-featured comment system that works on both React Native (native modal
 * bottom-sheet) and web (fixed bottom drawer). Features:
 *
 * - Real-time comment feed (via useComments hook)
 * - Anonymous posting toggle
 * - Upvote toggle with optimistic update
 * - Delete own comment (long-press menu)
 * - Mark "official answer" for Question-type posts (post author only)
 * - Keyboard-aware layout on both platforms
 */
import React from 'react';
import {
    Modal,
    FlatList,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useTheme, getInitialsFromName, formatTimestamp } from '@repo/ui';
import { Text, Box, HStack, VStack, Pressable, View } from '@repo/ui';
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

// 
// Single comment row
// 
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
    const { text, accent, glass } = useTheme();
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
            className={`flex-row mb-4 pl-1 ${comment.is_official_answer ? 'border-l-4 border-l-phase-reward' : ''}`}
        >
            {/* Avatar */}
            <View 
                className="w-8 h-8 rounded-full items-center justify-center mr-2.5 mt-0.5 shrink-0"
                style={{ backgroundColor: (comment.is_anonymous ? glass.interact.bg : accent.muted) as string }}
            >
                {comment.is_anonymous ? (
                    <EyeOff size={14} color={text.muted as string} />
                ) : (
                    <Text className="text-[11px] font-bold text-phase-interactive">{initials}</Text>
                )}
            </View>

            <View className="flex-1">
                <HStack className="justify-between items-center">
                    <HStack space="xs" className="items-center">
                        <Text className="text-xs font-bold text-phaseText-primary">
                            {comment.author_name}
                        </Text>
                        {comment.is_official_answer && (
                            <View className="flex-row items-center px-1.5 py-0.5 rounded-tight bg-phase-reward">
                                <Shield size={9} color="#fff" />
                                <Text className="text-[9px] text-white font-bold ml-0.5">Official</Text>
                            </View>
                        )}
                    </HStack>
                    <Text className="text-[10px] text-mistGray">
                        {formatTimestamp(comment.created_at)}
                    </Text>
                </HStack>

                <Text className="text-sm text-phaseText-secondary mt-1 leading-5">
                    {comment.content}
                </Text>

                <HStack space="lg" className="items-center mt-1.5">
                    {/* Upvote */}
                    <Pressable onPress={() => onUpvote(comment.id)} className="flex-row items-center">
                        <ThumbsUp
                            size={13}
                            color={comment.has_upvoted ? (accent.action as string) : (text.muted as string)}
                            fill={comment.has_upvoted ? (accent.action as string) : 'transparent'}
                        />
                        {comment.upvotes > 0 && (
                            <Text 
                                className={`text-[11px] ml-1 ${comment.has_upvoted ? 'text-phase-interactive' : 'text-mistGray'}`}
                            >
                                {comment.upvotes}
                            </Text>
                        )}
                    </Pressable>

                    {/* Mark official (post author, question type) */}
                    {isPostAuthor && postType === 'question' && !comment.is_anonymous && (
                        <Pressable
                            onPress={() => onMarkOfficial(comment.id, !comment.is_official_answer)}
                            className="flex-row items-center"
                        >
                            <Shield size={13} color={comment.is_official_answer ? (accent.reward as string) : (text.muted as string)} />
                            <Text 
                                className={`text-[11px] ml-1 ${comment.is_official_answer ? 'text-phase-reward' : 'text-mistGray'}`}
                            >
                                {comment.is_official_answer ? 'Unmark' : 'Mark answer'}
                            </Text>
                        </Pressable>
                    )}

                    {/* Delete own */}
                    {isOwn && (
                        <Pressable onPress={confirmDelete} className="flex-row items-center">
                            <Trash2 size={13} color={text.muted as string} />
                        </Pressable>
                    )}
                </HStack>
            </View>
        </View>
    );
}

// 
// Main CommentSheet
// 
export function CommentSheet({
    postId,
    postAuthorId,
    currentUserId,
    postType,
    onClose,
}: CommentSheetProps) {
    const { text, accent, glass } = useTheme();
    const {
        comments,
        isLoading,
        createComment,
        isCreatingComment,
        deleteComment,
        toggleUpvote,
        markOfficialAnswer,
    } = useComments(postId);

    const [draft, setDraft] = React.useState('');
    const [isAnonymous, setIsAnonymous] = React.useState(false);
    const flatListRef = React.useRef<FlatList>(null);

    const isPostAuthor = !!currentUserId && currentUserId === postAuthorId;

    // Scroll to bottom when new comments arrive
    React.useEffect(() => {
        if (comments.length > 0) {
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
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
            style={[
                {
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    borderTopWidth: 1,
                    minHeight: 320,
                    maxHeight: '80%',
                    backgroundColor: (glass?.modal?.bg ?? glass?.surface?.bg ?? '#F5EDD6') as string,
                    borderTopColor: (glass?.interact?.border ?? 'rgba(42,35,24,0.08)') as string,
                },
            ]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
        >
            {/* Header */}
            <View className="flex-row items-center px-4 py-3">
                <Pressable 
                    onPress={onClose} 
                    className="w-[34px] items-start"
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <ChevronDown size={22} color={text.secondary as string} />
                </Pressable>
                <Text className="text-[15px] font-bold text-phaseText-primary flex-1 text-center">
                    {`${comments.length} Comment${comments.length !== 1 ? 's' : ''}`}
                </Text>
                <View className="w-[34px]" />
            </View>

            {/* Comment list */}
            {isLoading ? (
                <ActivityIndicator color={accent.action as string} style={{ marginVertical: 40 }} />
            ) : comments.length === 0 ? (
                <View className="flex-1 items-center justify-center py-10 px-6">
                    <Text className="text-sm text-mistGray text-center">
                        Be the first to share a thought
                    </Text>
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={comments}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}
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
            <View 
                className="flex-row items-end p-3 gap-2 border-t"
                style={{ borderTopColor: (glass.interact.border || 'rgba(0,0,0,0.1)') as string }}
            >
                {/* Anonymous toggle */}
                <Pressable
                    onPress={() => setIsAnonymous(v => !v)}
                    className="w-9 h-9 rounded-full border-1.5 items-center justify-center shrink-0"
                    style={{ borderColor: (isAnonymous ? accent.action : glass.interact.border) as string }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <Lock size={14} color={(isAnonymous ? accent.action : text.muted) as string} />
                </Pressable>

                <TextInput
                    style={{
                        flex: 1,
                        borderWidth: 1,
                        borderRadius: 16,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        fontSize: 14,
                        maxHeight: 120,
                        backgroundColor: (glass.interact.bg || 'rgba(0,0,0,0.05)') as string,
                        borderColor: (glass.interact.border || 'rgba(0,0,0,0.1)') as string,
                        color: text.primary as string,
                    }}
                    placeholder={isAnonymous ? 'Reply anonymously...' : 'Add a comment...'}
                    placeholderTextColor={text.muted as string}
                    value={draft}
                    onChangeText={setDraft}
                    multiline
                    maxLength={1000}
                    returnKeyType="default"
                    blurOnSubmit={false}
                />

                <Pressable
                    onPress={handleSend}
                    disabled={!draft.trim() || isCreatingComment}
                    className="w-9 h-9 rounded-full items-center justify-center shrink-0"
                    style={{ backgroundColor: (!draft.trim() ? glass.interact.bg : accent.action) as string }}
                >
                    {isCreatingComment ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Send size={16} color={!draft.trim() ? (text.muted as string) : '#fff'} />
                    )}
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );

    if (Platform.OS === 'web') {
        // Web: fixed bottom drawer, no RN Modal needed
        if (!postId) return null;
        return (
            <View
                style={{
                    position: 'fixed' as any,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    maxHeight: '70vh',
                    zIndex: 1000,
                    borderTopLeftRadius: 16, // Theme.corners.comfortable
                    borderTopRightRadius: 16,
                    boxShadow: '0 -4px 32px rgba(107,100,128,0.18)',
                    overflow: 'hidden',
                } as any}
            >
                {sheetContent}
            </View>
        );
    }

    // Native: Modal bottom sheet
    return (
        <Modal
            visible={!!postId}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <Pressable
                className="flex-1 bg-[rgba(17,12,36,0.55)]"
                onPress={onClose}
            >
                {sheetContent}
            </Pressable>
        </Modal>
    );
}
