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
    View,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    StyleSheet,
} from 'react-native';
import { Theme, useTheme, getInitialsFromName, formatTimestamp } from '@repo/ui';
import { Text, Box, HStack, VStack } from '@repo/ui';
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
        <View style={[styles.commentRow, comment.is_official_answer && { borderLeftWidth: 3, borderLeftColor: accent.reward as string }]}>
            {/* Avatar */}
            <View style={[styles.avatar, { backgroundColor: (comment.is_anonymous ? glass.interact.bg : accent.muted) as string }]}>
                {comment.is_anonymous ? (
                    <EyeOff size={14} color={text.muted as string} />
                ) : (
                    <Text sx={{ fontSize: 11, fontWeight: '700', color: accent.action }}>{initials}</Text>
                )}
            </View>

            <View style={styles.commentBody}>
                <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <HStack sx={{ gap: 4, alignItems: 'center' }}>
                        <Text sx={{ fontSize: 12, fontWeight: '700', color: text.primary }}>
                            {comment.author_name}
                        </Text>
                        {comment.is_official_answer && (
                            <View style={[styles.officialBadge, { backgroundColor: accent.reward as string }]}>
                                <Shield size={9} color="#fff" />
                                <Text sx={{ fontSize: 9, color: '#fff', fontWeight: '700', marginLeft: 2 }}>Official</Text>
                            </View>
                        )}
                    </HStack>
                    <Text sx={{ fontSize: 10, color: text.muted }}>
                        {formatTimestamp(comment.created_at)}
                    </Text>
                </HStack>

                <Text sx={{ fontSize: 14, color: text.secondary, marginTop: 3, lineHeight: 20 }}>
                    {comment.content}
                </Text>

                <HStack sx={{ gap: 16, alignItems: 'center', marginTop: 6 }}>
                    {/* Upvote */}
                    <TouchableOpacity onPress={() => onUpvote(comment.id)} style={styles.actionBtn}>
                        <ThumbsUp
                            size={13}
                            color={comment.has_upvoted ? accent.action as string : text.muted as string}
                            fill={comment.has_upvoted ? accent.action as string : 'transparent'}
                        />
                        {comment.upvotes > 0 && (
                            <Text sx={{ fontSize: 11, color: comment.has_upvoted ? accent.action : text.muted, marginLeft: 3 }}>
                                {comment.upvotes}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* Mark official (post author, question type) */}
                    {isPostAuthor && postType === 'question' && !comment.is_anonymous && (
                        <TouchableOpacity
                            onPress={() => onMarkOfficial(comment.id, !comment.is_official_answer)}
                            style={styles.actionBtn}
                        >
                            <Shield size={13} color={comment.is_official_answer ? accent.reward as string : text.muted as string} />
                            <Text sx={{ fontSize: 11, color: comment.is_official_answer ? accent.reward : text.muted, marginLeft: 3 }}>
                                {comment.is_official_answer ? 'Unmark' : 'Mark answer'}
                            </Text>
                        </TouchableOpacity>
                    )}

                    {/* Delete own */}
                    {isOwn && (
                        <TouchableOpacity onPress={confirmDelete} style={styles.actionBtn}>
                            <Trash2 size={13} color={text.muted as string} />
                        </TouchableOpacity>
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
                styles.sheet,
                {
                    backgroundColor: (glass?.modal?.bg ?? glass?.surface?.bg ?? Theme.colors.vellum) as string,
                    borderTopColor: (glass?.interact?.border ?? 'rgba(42,35,24,0.08)') as string,
                },
            ]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={onClose} 
                    style={styles.dragHandle} 
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <ChevronDown size={22} color={text.secondary as string} />
                </TouchableOpacity>
                <Text sx={{ fontSize: 15, fontWeight: '700', color: text.primary, flex: 1, textAlign: 'center' }}>
                    {`${comments.length} Comment${comments.length !== 1 ? 's' : ''}`}
                </Text>
                <View style={{ width: 34 }} />
            </View>

            {/* Comment list */}
            {isLoading ? (
                <ActivityIndicator color={accent.action as string} style={{ marginVertical: 40 }} />
            ) : comments.length === 0 ? (
                <View style={styles.empty}>
                    <Text sx={{ fontSize: 14, color: text.muted, textAlign: 'center' }}>
                        Be the first to share a thought
                    </Text>
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={comments}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
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
            <View style={[styles.composer, { borderTopColor: (glass.interact.border || 'rgba(0,0,0,0.1)') as string }]}>
                {/* Anonymous toggle */}
                <TouchableOpacity
                    onPress={() => setIsAnonymous(v => !v)}
                    style={[
                        styles.anonBtn, 
                        { borderColor: (isAnonymous ? accent.action : glass.interact.border) as string }
                    ]}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <Lock size={14} color={(isAnonymous ? accent.action : text.muted) as string} />
                </TouchableOpacity>

                <TextInput
                    style={[
                        styles.input,
                        {
                            backgroundColor: (glass.interact.bg || 'rgba(0,0,0,0.05)') as string,
                            borderColor: (glass.interact.border || 'rgba(0,0,0,0.1)') as string,
                            color: text.primary as string,
                        },
                    ]}
                    placeholder={isAnonymous ? 'Reply anonymously...' : 'Add a comment...'}
                    placeholderTextColor={text.muted as string}
                    value={draft}
                    onChangeText={setDraft}
                    multiline
                    maxLength={1000}
                    returnKeyType="default"
                    blurOnSubmit={false}
                />

                <TouchableOpacity
                    onPress={handleSend}
                    disabled={!draft.trim() || isCreatingComment}
                    style={[
                        styles.sendBtn,
                        { backgroundColor: (!draft.trim() ? glass.interact.bg : accent.action) as string },
                    ]}
                >
                    {isCreatingComment ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Send size={16} color={!draft.trim() ? text.muted as string : '#fff'} />
                    )}
                </TouchableOpacity>
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
                    borderTopLeftRadius: Theme.corners.comfortable,
                    borderTopRightRadius: Theme.corners.comfortable,
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
            <TouchableOpacity
                activeOpacity={1}
                onPress={onClose}
                style={styles.backdrop}
            />
            {sheetContent}
        </Modal>
    );
}

// 
const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(17,12,36,0.55)',
    },
    sheet: {
        borderTopLeftRadius: Theme.corners.comfortable,
        borderTopRightRadius: Theme.corners.comfortable,
        borderTopWidth: 1,
        maxHeight: '80%',
        minHeight: 320,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    dragHandle: {
        width: 34,
        alignItems: 'flex-start',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    empty: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        paddingHorizontal: 24,
    },
    commentRow: {
        flexDirection: 'row',
        marginBottom: 16,
        paddingLeft: 4,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        marginTop: 2,
        flexShrink: 0,
    },
    commentBody: {
        flex: 1,
    },
    officialBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 8,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    composer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 12,
        gap: 8,
        borderTopWidth: 1,
    },
    anonBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderRadius: Theme.corners.comfortable,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 14,
        maxHeight: 120,
        lineHeight: 20,
    },
    sendBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
});
