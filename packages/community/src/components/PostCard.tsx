import React from 'react';
import { StyleSheet, TouchableOpacity, Image, Platform, Share, ActivityIndicator } from 'react-native';
import { Box, HStack, VStack, Text, Avatar, AvatarFallbackText, AvatarImage } from '@repo/ui';
import { MoreHorizontal, Heart, MessageCircle, Sparkles, Share2, CheckCircle2, AlertTriangle, FileText, Video, Music, Link2, BookOpen } from 'lucide-react-native';
import { SanctuaryCard, Theme, useThemedColors, LivingGlow } from '@repo/ui';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@repo/core';
import * as Clipboard from 'expo-clipboard';
import { useCommunity } from '../hooks/useCommunity';
import { useSocialShield } from '../hooks/useSocialShield';
import { communityAPI } from '../api/community';
import { ShieldAlert, UserX } from 'lucide-react-native';
import { PostType, FeedbackStatus } from '../types/Community';

import { CommunityPost } from '../types';

interface PostCardProps {
    post: CommunityPost;
    onPress?: () => void;
    onLike?: () => void;
    onResonate?: () => void;
    onComment?: () => void;
    onReport?: () => void;
    /** Called when the author avatar/name is tapped — use to navigate to the author's public profile */
    onAuthorPress?: () => void;
    /** Called when the share button is tapped on native. On web, the post link is copied to clipboard automatically. */
    onShare?: () => void;
    isSample?: boolean;
    currentUserId?: string;
}

const MEDIA_HEIGHT = 260;

const PostCard = React.memo(function PostCard({
    post,
    onPress,
    onLike,
    onResonate,
    onComment,
    onReport,
    onAuthorPress,
    onShare,
    isSample,
    currentUserId
}: PostCardProps) {
    const {
        author_id,
        author_name,
        author_avatar,
        content,
        post_type,
        created_at,
        reactions = {},
        comment_count,
        media_url,
        media_type,
        is_anonymous,
        id,
        poll_data,
        urgency,
        has_accepted_answer,
        feedback_status,
        feedback_response,
    } = post;
    const colors = useThemedColors();

    const isAnnouncement = post_type === 'announcement';
    const isQuestion = post_type === 'question';
    const isResource = post_type === 'resource';
    const isFeedback = post_type === 'feedback';
    const isDiscussion = post_type === 'discussion';
    const totalReactions = Object.values(reactions).reduce((a, b) => a + b, 0);

    const renderMediaContent = () => {
        if (!media_url) return null;

        if (media_type === 'image') {
            return (
                <Box sx={{ marginTop: Theme.spacing.sm }}>
                    <Box
                        sx={{
                            height: MEDIA_HEIGHT,
                            borderRadius: Theme.corners.comfortable,
                            overflow: 'hidden',
                            borderWidth: 1,
                            borderColor: colors.overlay,
                            backgroundColor: colors.secondary,
                        }}
                    >
                        <Image
                            source={{ uri: media_url }}
                            style={StyleSheet.absoluteFill}
                            resizeMode="cover"
                        />
                        <Box sx={{ ...StyleSheet.absoluteFillObject, backgroundColor: Theme.colors.glass.dark.highlight }} />
                    </Box>
                </Box>
            );
        }

        // Non-image attachments: document / video / audio — render a tappable link chip
        const mediaIcon = media_type === 'video'
            ? <Video size={16} color={colors.action} />
            : media_type === 'audio'
                ? <Music size={16} color={colors.action} />
                : <FileText size={16} color={colors.action} />;

        const mediaLabel = media_type === 'video' ? 'Video'
            : media_type === 'audio' ? 'Audio'
            : 'Attachment';

        return (
            <TouchableOpacity
                onPress={() => { if (Platform.OS === 'web') { window.open(media_url, '_blank'); } }}
                style={[styles.attachmentChip, { borderColor: colors.action }]}
                accessibilityLabel={`Open ${mediaLabel}`}
            >
                {mediaIcon}
                <Text color={colors.action} size="sm" sx={{ marginLeft: 6 }}>{mediaLabel}</Text>
                <Link2 size={12} color={colors.action} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
        );
    };

    /**
     * Renders type-specific metadata above the post content.
     * - question: urgency badge + accepted-answer checkmark
     * - resource: resource-type chip
     * - feedback: status badge + authority response if present
     */
    const renderTypeMetadata = () => {
        if (isQuestion) {
            const urgencyConfig: Record<string, { label: string; color: string; bg: string }> = {
                high:   { label: 'Urgent',  color: '#DC2626', bg: 'rgba(220,38,38,0.1)' },
                medium: { label: 'Medium',  color: '#D97706', bg: 'rgba(217,119,6,0.1)' },
                low:    { label: 'Low',     color: colors.textTertiary, bg: colors.overlay },
            };
            const urg = urgencyConfig[urgency ?? 'low'];
            return (
                <HStack space="sm" alignItems="center" sx={{ marginBottom: 4 }}>
                    {urgency && urgency !== 'low' && (
                        <Box sx={{ backgroundColor: urg.bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: Theme.corners.tight, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <AlertTriangle size={11} color={urg.color} />
                            <Text size="xs" bold sx={{ color: urg.color }}>{urg.label}</Text>
                        </Box>
                    )}
                    {has_accepted_answer && (
                        <Box sx={{ backgroundColor: 'rgba(22,163,74,0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: Theme.corners.tight, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <CheckCircle2 size={11} color="#16A34A" />
                            <Text size="xs" bold sx={{ color: '#16A34A' }}>Answered</Text>
                        </Box>
                    )}
                </HStack>
            );
        }

        if (isResource) {
            return (
                <Box sx={{ marginBottom: 4 }}>
                    <Box sx={{ backgroundColor: 'rgba(99,102,241,0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: Theme.corners.tight, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <BookOpen size={11} color="#6366F1" />
                        <Text size="xs" bold sx={{ color: '#6366F1' }}>Resource</Text>
                    </Box>
                </Box>
            );
        }

        if (isFeedback) {
            const statusConfig: Record<FeedbackStatus, { label: string; color: string; bg: string }> = {
                pending:      { label: 'Pending',      color: colors.textTertiary,    bg: colors.overlay },
                under_review: { label: 'Under Review', color: '#D97706',              bg: 'rgba(217,119,6,0.1)' },
                approved:     { label: 'Approved',     color: '#16A34A',              bg: 'rgba(22,163,74,0.1)' },
                implemented:  { label: 'Implemented',  color: Theme.colors.sanctuarySaffron, bg: 'rgba(246,191,140,0.15)' },
                declined:     { label: 'Declined',     color: '#DC2626',              bg: 'rgba(220,38,38,0.1)' },
            };
            const cfg = feedback_status ? statusConfig[feedback_status] : statusConfig.pending;
            return (
                <VStack space="xs" sx={{ marginBottom: 4 }}>
                    <Box sx={{ backgroundColor: cfg.bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: Theme.corners.tight, alignSelf: 'flex-start' }}>
                        <Text size="xs" bold sx={{ color: cfg.color }}>{cfg.label}</Text>
                    </Box>
                    {!!feedback_response && (
                        <Box sx={{ backgroundColor: colors.secondary, padding: Theme.spacing.sm, borderRadius: Theme.corners.comfortable, borderLeftWidth: 3, borderLeftColor: Theme.colors.sanctuarySaffron }}>
                            <Text color={colors.textSecondary} size="xs" italic>{feedback_response}</Text>
                        </Box>
                    )}
                </VStack>
            );
        }

        return null;
    };

    // Optimistic local like state — re-sync when post data changes (e.g. feed refresh)
    const [liked, setLiked] = React.useState(false);
    const [localLikeCount, setLocalLikeCount] = React.useState(reactions['❤️'] || 0);

    React.useEffect(() => {
        setLocalLikeCount(reactions['❤️'] || 0);
        setLiked(false);
    }, [id, reactions['❤️']]);

    const handleLike = async () => {
        const prevLiked = liked;
        const prevCount = localLikeCount;
        const nowLiked = !liked;
        setLiked(nowLiked);
        setLocalLikeCount((prev) => Math.max(0, prev + (nowLiked ? 1 : -1)));
        try {
            await onLike?.();
        } catch {
            // Revert optimistic update on failure
            setLiked(prevLiked);
            setLocalLikeCount(prevCount);
        }
    };

    const isLiked = liked;
    const hasResonated = false;

    const [menuOpen, setMenuOpen] = React.useState(false);
    const { blockUser } = useSocialShield();

    const handleShare = async () => {
        // Include the post ID so the share link is post-specific (deep link ready)
        const shareUrl = `https://app.gurudevi.edlove.org/app?post=${id}`;
        if (Platform.OS === 'web') {
            if (typeof navigator !== 'undefined' && navigator.share) {
                try {
                    await navigator.share({ title: `Post by ${is_anonymous ? 'Anonymous' : author_name}`, url: shareUrl });
                } catch {
                    // User cancelled or share unavailable — fall back to clipboard silently
                    try { await Clipboard.setStringAsync(shareUrl); } catch { /* ignore */ }
                }
            } else {
                await Clipboard.setStringAsync(shareUrl);
            }
        } else {
            if (onShare) {
                onShare();
            } else {
                Share.share({ message: shareUrl });
            }
        }
    };

    const handleBlock = async () => {
        if (!is_anonymous && author_id) {
            await blockUser(author_id);
            setMenuOpen(false);
        }
    };

    const renderPollContent = () => {
        if (post_type === 'poll' && poll_data) {
            return <PollWidget postId={id} pollData={poll_data} currentUserId={currentUserId} />;
        }
        return null;
    };

    return (
        <SanctuaryCard onPress={onPress} elevated={isAnnouncement}>
            <VStack space="md">
                {/* Header: Author & Meta */}
                <HStack justifyContent="space-between" alignItems="center">
                    <HStack space="md" alignItems="center">
                        <TouchableOpacity
                            onPress={!is_anonymous ? onAuthorPress : undefined}
                            disabled={is_anonymous || !onAuthorPress}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Avatar size="sm" sx={{ backgroundColor: is_anonymous ? colors.secondary : colors.action }}>
                                <AvatarFallbackText>{is_anonymous ? '?' : author_name}</AvatarFallbackText>
                                {!is_anonymous && author_avatar && (
                                    <AvatarImage source={{ uri: author_avatar }} alt={author_name} />
                                )}
                            </Avatar>
                        </TouchableOpacity>
                        <VStack>
                            <HStack space="xs" alignItems="center">
                                <Text color={colors.text} bold size="sm">
                                    {is_anonymous ? 'Anonymous' : author_name}
                                </Text>
                            </HStack>
                            <Text color={colors.textSecondary} size="xs">
                                {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
                            </Text>
                        </VStack>
                    </HStack>

                    <Box>
                        <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)}>
                            <MoreHorizontal color={colors.textTertiary} size={20} />
                        </TouchableOpacity>

                        {menuOpen && (
                            <Box sx={{
                                position: 'absolute',
                                top: 25,
                                right: 0,
                                backgroundColor: colors.secondary,
                                borderRadius: Theme.corners.comfortable,
                                borderWidth: 1,
                                borderColor: colors.border,
                                minWidth: 150,
                                zIndex: 10,
                                overflow: 'hidden',
                                elevation: 4,
                            }}>
                                <VStack>
                                    <TouchableOpacity 
                                        style={styles.menuItem} 
                                        onPress={() => { onReport?.(); setMenuOpen(false); }}
                                    >
                                        <HStack space="md" alignItems="center">
                                            <ShieldAlert size={16} color={colors.text} />
                                            <Text size="sm" color={colors.text}>Report Post</Text>
                                        </HStack>
                                    </TouchableOpacity>

                                    {!is_anonymous && author_id !== currentUserId && (
                                        <TouchableOpacity 
                                            style={[styles.menuItem, { borderBottomWidth: 0 }]} 
                                            onPress={handleBlock}
                                        >
                                            <HStack space="md" alignItems="center">
                                                <UserX size={16} color={Theme.colors.sanctuarySaffron} />
                                                <Text size="sm" color={Theme.colors.sanctuarySaffron}>Block User</Text>
                                            </HStack>
                                        </TouchableOpacity>
                                    )}
                                </VStack>
                            </Box>
                        )}
                    </Box>
                </HStack>

                {/* Type-specific metadata (urgency, feedback status, resource chip) */}
                {renderTypeMetadata()}

                {/* Content */}
                <Text color={colors.textPrimary} size="md" sx={{ lineHeight: 22 }} numberOfLines={onPress ? 4 : undefined}>
                    {content}
                </Text>

                {/* Media Content */}
                {renderMediaContent()}

                {/* Poll Content */}
                {renderPollContent()}

                {/* Footer: Actions */}
                <HStack justifyContent="space-between" alignItems="center" mt="$1">
                    <HStack space="lg">
                        {/* Like / Heart Reaction */}
                        <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
                            <Heart
                                size={20}
                                color={isLiked ? colors.error : colors.textTertiary}
                                fill={isLiked ? colors.error : 'none'}
                            />
                            {localLikeCount > 0 && (
                                <Text color={isLiked ? colors.error : colors.textTertiary} size="xs" sx={{ marginLeft: 4 }}>
                                    {localLikeCount}
                                </Text>
                            )}
                        </TouchableOpacity>

                        {/* Resonance Reaction */}
                        <TouchableOpacity onPress={onResonate} style={styles.actionButton}>
                            <LivingGlow active={hasResonated}>
                                <Sparkles
                                    size={20}
                                    color={hasResonated ? colors.action : colors.textTertiary}
                                />
                            </LivingGlow>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={onComment} style={styles.actionButton}>
                            <MessageCircle size={20} color={colors.textTertiary} />
                            <Text color={colors.textTertiary} size="sm" sx={{ marginLeft: 4 }}>
                                {comment_count}
                            </Text>
                        </TouchableOpacity>

                        {/* Share button — clipboard on web, native share sheet otherwise */}
                        <TouchableOpacity onPress={handleShare} style={styles.actionButton} accessibilityLabel="Share post">
                            <Share2 size={18} color={colors.textTertiary} />
                        </TouchableOpacity>
                    </HStack>

                    {/* Engagement Count */}
                    {totalReactions > 0 && (
                        <Text color={colors.textTertiary} size="xs">
                            {totalReactions} {isQuestion ? 'Upvotes' : 'Resonances'}
                        </Text>
                    )}

                    {/* Type Badge — contextual label per post type */}
                    <LivingGlow active={isAnnouncement}>
                        <Box sx={{
                            backgroundColor: TYPE_BADGE[post_type]?.bg ?? colors.overlay,
                            borderWidth: 1,
                            borderColor: TYPE_BADGE[post_type]?.border ?? colors.action,
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: Theme.corners.tight,
                        }}>
                            <Text sx={{ color: TYPE_BADGE[post_type]?.text ?? colors.action }} size="xs" bold>
                                {TYPE_BADGE[post_type]?.label ?? 'Post'}
                            </Text>
                        </Box>
                    </LivingGlow>
                </HStack>
            </VStack>
        </SanctuaryCard>
    );
});

function PollWidget({ postId, pollData, currentUserId }: { postId: string, pollData: any, currentUserId?: string }) {
    const { options = [] } = pollData;
    const colors = useThemedColors();
    const [votes, setVotes] = React.useState<Record<string, number>>({});
    const [userVotedOption, setUserVotedOption] = React.useState<string | null>(null);
    const [totalVotes, setTotalVotes] = React.useState(0);
    const [isLoading, setIsLoading] = React.useState(true);

    const fetchVotes = React.useCallback(async () => {
        try {
            const { data: votesData, error } = await supabase
                .from('community_poll_votes')
                .select('user_id, option_id')
                .eq('post_id', postId);

            if (error) throw error;

            const counts: Record<string, number> = {};
            let userChoice: string | null = null;
            
            (votesData || []).forEach((v: any) => {
                counts[v.option_id] = (counts[v.option_id] || 0) + 1;
                if (v.user_id === currentUserId) {
                    userChoice = v.option_id;
                }
            });

            setVotes(counts);
            setTotalVotes(votesData?.length || 0);
            setUserVotedOption(userChoice);
        } catch (err) {
            console.error('Failed to fetch poll votes:', err);
        } finally {
            setIsLoading(false);
        }
    }, [postId, currentUserId]);

    React.useEffect(() => {
        fetchVotes();
    }, [fetchVotes]);

    const handleVote = async (optionId: string) => {
        if (userVotedOption || !currentUserId) return;

        // Optimistic update
        setUserVotedOption(optionId);
        setVotes(prev => ({ ...prev, [optionId]: (prev[optionId] || 0) + 1 }));
        setTotalVotes(prev => prev + 1);

        try {
            await communityAPI.voteInPoll(postId, optionId);
        } catch (err) {
            console.error('Failed to vote:', err);
            // Revert on error
            setUserVotedOption(null);
            fetchVotes();
        }
    };

    if (isLoading) {
        return <ActivityIndicator size="small" color={colors.action} />;
    }

    return (
        <VStack space="sm" sx={{ marginTop: Theme.spacing.sm }}>
            {options.map((opt: any) => {
                const count = votes[opt.id] || 0;
                const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
                const isSelected = userVotedOption === opt.id;

                return (
                    <TouchableOpacity
                        key={opt.id}
                        onPress={() => handleVote(opt.id)}
                        disabled={!!userVotedOption || !currentUserId}
                        style={{
                            borderRadius: Theme.corners.comfortable,
                            overflow: 'hidden',
                            borderWidth: 1,
                            borderColor: isSelected ? colors.action : colors.overlay,
                            backgroundColor: colors.secondary,
                            height: 44,
                            justifyContent: 'center'
                        }}
                    >
                        {/* Progress Bar Background */}
                        <Box sx={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: `${percentage}%`,
                            backgroundColor: isSelected ? colors.action : colors.overlay,
                            opacity: 0.3
                        }} />
                        
                        <HStack justifyContent="space-between" px="$3" alignItems="center">
                            <Text color={colors.textPrimary} size="sm" bold={isSelected}>
                                {opt.text}
                            </Text>
                            {userVotedOption && (
                                <Text color={colors.textSecondary} size="xs">
                                    {Math.round(percentage)}%
                                </Text>
                            )}
                        </HStack>
                    </TouchableOpacity>
                );
            })}
            <Text color={colors.textTertiary} size="xs" sx={{ textAlign: 'right', marginTop: 4 }}>
                {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
            </Text>
        </VStack>
    );
}

export default PostCard;

/** Maps each canonical PostType to its footer badge config. */
const TYPE_BADGE: Record<PostType, { label: string; bg: string; border: string; text: string }> = {
    announcement: { label: 'Sacred Bulletin', bg: '$amber100',          border: '$amber400',           text: '$amber700' },
    question:     { label: 'Question',        bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.5)', text: '#3B82F6' },
    resource:     { label: 'Resource',        bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.5)', text: '#6366F1' },
    feedback:     { label: 'Feedback',        bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.5)', text: '#A855F7' },
    discussion:   { label: 'Discussion',      bg: 'rgba(20,184,166,0.1)', border: 'rgba(20,184,166,0.5)', text: '#14B8A6' },
    poll:         { label: 'Poll',            bg: 'rgba(246,191,140,0.15)', border: 'rgba(246,143,15,0.4)', text: '#F68F0F' },
};

const styles = StyleSheet.create({
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 4,
    },
    menuItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    attachmentChip: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Theme.spacing.sm,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: Theme.corners.comfortable,
        borderWidth: 1,
        alignSelf: 'flex-start',
    },
});
