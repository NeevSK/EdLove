import React from 'react';
import { StyleSheet, TouchableOpacity, Image, Platform, Share, ActivityIndicator, Animated, View } from 'react-native';
import { Box, HStack, VStack, Text, Avatar, AvatarFallbackText, AvatarImage, openExternalURL } from '@repo/ui';
import { 
    MoreHorizontal, 
    Heart, 
    MessageCircle, 
    Sparkles, 
    Share2, 
    CheckCircle2, 
    AlertTriangle, 
    FileText, 
    Video, 
    Music, 
    Link2, 
    BookOpen, 
    Lock, 
    Clock, 
    Check, 
    Trophy, 
    X as XIcon,
    ShieldAlert, 
    UserX 
} from 'lucide-react-native';
import { SanctuaryCard, Theme, useThemedColors, LivingGlow } from '@repo/ui';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@repo/core';
import * as Clipboard from 'expo-clipboard';
import { useSocialShield } from '../hooks/useSocialShield';
import { communityAPI } from '../api/community';
import type { CommunityPost } from '../types';
import type { PostType, FeedbackStatus, PollData, Urgency } from '../types/Community';

// —————————————————————————————————————————————————————————————————————————————
// CONSTANTS
// —————————————————————————————————————————————————————————————————————————————

const MEDIA_HEIGHT = 260;

const TYPE_BADGE: Record<string, { label: string; color: string; bg: string; border: string; text: string }> = {
    announcement: { label: 'Announcement', color: '#F6BF8C', bg: 'rgba(246,191,140,0.1)', border: '#F6BF8C', text: '#F6BF8C' },
    question: { label: 'Question', color: '#6366F1', bg: 'rgba(99,102,241,0.1)', border: '#6366F1', text: '#6366F1' },
    resource: { label: 'Resource', color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: '#10B981', text: '#10B981' },
    feedback: { label: 'Feedback', color: '#F43F5E', bg: 'rgba(244,63,94,0.1)', border: '#F43F5E', text: '#F43F5E' },
    discussion: { label: 'Discussion', color: '#94A3B8', bg: 'rgba(148,163,184,0.1)', border: '#94A3B8', text: '#94A3B8' },
    poll: { label: 'Poll', color: '#A855F7', bg: 'rgba(168,85,247,0.1)', border: '#A855F7', text: '#A855F7' },
};

// —————————————————————————————————————————————————————————————————————————————
// TYPES
// —————————————————————————————————————————————————————————————————————————————

interface PostCardProps {
    post: CommunityPost;
    onPress?: () => void;
    onLike?: () => void;
    onResonate?: () => void;
    onComment?: () => void;
    onReport?: () => void;
    onAuthorPress?: () => void;
    onShare?: () => void;
    isSample?: boolean;
    currentUserId?: string;
}

// —————————————————————————————————————————————————————————————————————————————
// COMPONENT: PostCard
// —————————————————————————————————————————————————————————————————————————————

export const PostCard = React.memo(function PostCard({
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
    const totalReactions = Object.values(reactions).reduce((a, b) => (a as number) + (b as number), 0);

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
                        <Box sx={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)' }} />
                    </Box>
                </Box>
            );
        }

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
                onPress={() => {
                    if (!media_url) return;
                    openExternalURL(media_url, {
                        title: mediaLabel,
                        sourceLabel: 'Community',
                        sourceBadge: 'Shared attachment',
                        trustLevel: 'external',
                    }).catch(() => {});
                }}
                style={[styles.attachmentChip, { borderColor: colors.action, marginTop: 8 }]}
                accessibilityLabel={`Open ${mediaLabel}`}
            >
                {mediaIcon}
                <Text sx={{ color: colors.action, fontSize: 13, marginLeft: 6 }}>{mediaLabel}</Text>
                <Link2 size={12} color={colors.action} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
        );
    };

    const renderTypeMetadata = () => {
        if (isQuestion) {
            const urgencyConfig: Record<Urgency, { label: string; color: string; bg: string }> = {
                high:   { label: 'Urgent',  color: '#DC2626', bg: 'rgba(220,38,38,0.1)' },
                medium: { label: 'Medium',  color: '#D97706', bg: 'rgba(217,119,6,0.1)' },
                low:    { label: 'Low',     color: colors.textTertiary, bg: colors.overlay },
            };
            const urg = urgencyConfig[urgency ?? 'low'];
            return (
                <HStack space="sm" sx={{ alignItems: 'center', marginBottom: 8 }}>
                    {urgency && urgency !== 'low' && (
                        <Box sx={{ backgroundColor: urg.bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: Theme.corners.tight, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <AlertTriangle size={11} color={urg.color} />
                            <Text sx={{ fontSize: 11, fontWeight: '700', color: urg.color }}>{urg.label}</Text>
                        </Box>
                    )}
                    {has_accepted_answer && (
                        <Box sx={{ backgroundColor: 'rgba(22,163,74,0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: Theme.corners.tight, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <CheckCircle2 size={11} color="#16A34A" />
                            <Text sx={{ fontSize: 11, fontWeight: '700', color: '#16A34A' }}>Answered</Text>
                        </Box>
                    )}
                </HStack>
            );
        }

        if (isResource) {
            return (
                <Box sx={{ marginBottom: 8 }}>
                    <Box sx={{ backgroundColor: 'rgba(99,102,241,0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: Theme.corners.tight, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <BookOpen size={11} color="#6366F1" />
                        <Text sx={{ fontSize: 11, fontWeight: '700', color: '#6366F1' }}>Resource</Text>
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
            const cfg = statusConfig[feedback_status ?? 'pending'];
            return (
                <VStack space="xs" sx={{ marginBottom: 8 }}>
                    <Box sx={{ backgroundColor: cfg.bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: Theme.corners.tight, alignSelf: 'flex-start' }}>
                        <Text sx={{ fontSize: 11, fontWeight: '700', color: cfg.color }}>{cfg.label}</Text>
                    </Box>
                    {!!feedback_response && (
                        <Box sx={{ backgroundColor: colors.secondary, padding: Theme.spacing.sm, borderRadius: Theme.corners.comfortable, borderLeftWidth: 3, borderLeftColor: Theme.colors.sanctuarySaffron }}>
                            <Text sx={{ color: colors.textSecondary, fontSize: 12, fontStyle: 'italic' }}>{feedback_response}</Text>
                        </Box>
                    )}
                </VStack>
            );
        }

        return null;
    };

    const [liked, setLiked] = React.useState(false);
    const [localLikeCount, setLocalLikeCount] = React.useState(reactions['❤️'] || 0);
    const [hasResonated, setHasResonated] = React.useState(false);
    const [isResonating, setIsResonating] = React.useState(false);
    const [menuOpen, setMenuOpen] = React.useState(false);
    const { blockUser } = useSocialShield();

    React.useEffect(() => {
        setLocalLikeCount(reactions['❤️'] || 0);
        setLiked(false);
    }, [id, reactions['❤️']]);

    React.useEffect(() => {
        if (!currentUserId) return;
        communityAPI.hasResonated(id).then(setHasResonated).catch(() => null);
    }, [id, currentUserId]);

    const handleLike = async () => {
        const prevLiked = liked;
        const prevCount = localLikeCount;
        const nowLiked = !liked;
        setLiked(nowLiked);
        setLocalLikeCount((prev) => Math.max(0, prev + (nowLiked ? 1 : -1)));
        try {
            await onLike?.();
        } catch {
            setLiked(prevLiked);
            setLocalLikeCount(prevCount);
        }
    };

    const handleResonate = async () => {
        if (isResonating || !currentUserId) return;
        setIsResonating(true);
        const prev = hasResonated;
        setHasResonated(!prev);
        try {
            const next = await communityAPI.toggleResonance(id);
            setHasResonated(next);
            onResonate?.();
        } catch {
            setHasResonated(prev);
        } finally {
            setIsResonating(false);
        }
    };

    const handleShare = async () => {
        const shareUrl = `https://app.gurudevi.edlove.org/app?post=${id}`;
        if (Platform.OS === 'web') {
            if (typeof navigator !== 'undefined' && navigator.share) {
                try {
                    await navigator.share({ title: `Post by ${is_anonymous ? 'Anonymous' : author_name}`, url: shareUrl });
                } catch {
                    await Clipboard.setStringAsync(shareUrl);
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

    const handleDelete = async () => {
        setMenuOpen(false);
        const confirm = Platform.OS === 'web'
            ? window.confirm('Delete this post? This cannot be undone.')
            : await new Promise<boolean>(resolve =>
                require('react-native').Alert.alert(
                    'Delete post',
                    'Are you sure? This cannot be undone.',
                    [
                        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
                        { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
                    ],
                )
            );
        if (!confirm) return;
        try {
            await communityAPI.deletePost(id);
        } catch (err) {
            console.error('[PostCard] deletePost failed:', err);
        }
    };

    return (
        <SanctuaryCard onPress={onPress} elevated={isAnnouncement}>
            <VStack space="md">
                {/* Header */}
                <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <HStack space="md" sx={{ alignItems: 'center' }}>
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
                            <Text sx={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>
                                {is_anonymous ? 'Anonymous' : author_name}
                            </Text>
                            <Text sx={{ color: colors.textSecondary, fontSize: 11 }}>
                                {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
                            </Text>
                        </VStack>
                    </HStack>

                    <Box>
                        <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)} style={{ padding: 4 }}>
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
                                minWidth: 160,
                                zIndex: 10,
                                overflow: 'hidden',
                                elevation: 4,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.25,
                                shadowRadius: 3.84,
                            }}>
                                <VStack>
                                    {author_id === currentUserId && (
                                        <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
                                            <HStack space="md" sx={{ alignItems: 'center' }}>
                                                <XIcon size={16} color={colors.error} />
                                                <Text sx={{ fontSize: 13, color: colors.error }}>Delete Post</Text>
                                            </HStack>
                                        </TouchableOpacity>
                                    )}

                                    {author_id !== currentUserId && (
                                        <TouchableOpacity style={styles.menuItem} onPress={() => { onReport?.(); setMenuOpen(false); }}>
                                            <HStack space="md" sx={{ alignItems: 'center' }}>
                                                <ShieldAlert size={16} color={colors.text} />
                                                <Text sx={{ fontSize: 13, color: colors.text }}>Report Post</Text>
                                            </HStack>
                                        </TouchableOpacity>
                                    )}

                                    {!is_anonymous && author_id !== currentUserId && (
                                        <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={handleBlock}>
                                            <HStack space="md" sx={{ alignItems: 'center' }}>
                                                <UserX size={16} color={Theme.colors.sanctuarySaffron} />
                                                <Text sx={{ fontSize: 13, color: Theme.colors.sanctuarySaffron }}>Block User</Text>
                                            </HStack>
                                        </TouchableOpacity>
                                    )}
                                </VStack>
                            </Box>
                        )}
                    </Box>
                </HStack>

                {/* Metadata */}
                {renderTypeMetadata()}

                {/* Post Content */}
                <Text 
                    numberOfLines={onPress ? 4 : undefined}
                    sx={{ color: colors.text, fontSize: 15, lineHeight: 22 }}
                >
                    {content}
                </Text>

                {/* Attachments */}
                {renderMediaContent()}

                {/* Polls */}
                {post_type === 'poll' && poll_data && (
                    <PollWidget
                        postId={id}
                        pollData={poll_data}
                        currentUserId={currentUserId}
                        isAuthor={author_id === currentUserId}
                    />
                )}

                {/* Footer Actions */}
                <HStack sx={{ justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <HStack space="lg">
                        <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
                            <Heart
                                size={20}
                                color={liked ? colors.error : colors.textTertiary}
                                fill={liked ? colors.error : 'none'}
                            />
                            {localLikeCount > 0 && (
                                <Text sx={{ color: liked ? colors.error : colors.textTertiary, fontSize: 12, marginLeft: 4 }}>
                                    {localLikeCount}
                                </Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleResonate} style={styles.actionButton} disabled={isResonating}>
                            <LivingGlow active={hasResonated}>
                                <Sparkles
                                    size={20}
                                    color={hasResonated ? colors.action : colors.textTertiary}
                                />
                            </LivingGlow>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={onComment} style={styles.actionButton}>
                            <MessageCircle size={20} color={colors.textTertiary} />
                            <Text sx={{ color: colors.textTertiary, fontSize: 12, marginLeft: 4 }}>
                                {comment_count}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleShare} style={styles.actionButton} accessibilityLabel="Share post">
                            <Share2 size={18} color={colors.textTertiary} />
                        </TouchableOpacity>
                    </HStack>

                    <HStack sx={{ alignItems: 'center' }}>
                        <LivingGlow active={isAnnouncement}>
                            <Box sx={{
                                backgroundColor: TYPE_BADGE[post_type]?.bg ?? colors.overlay,
                                borderWidth: 1,
                                borderColor: TYPE_BADGE[post_type]?.border ?? colors.action,
                                paddingHorizontal: 8,
                                paddingVertical: 2,
                                borderRadius: Theme.corners.tight,
                            }}>
                                <Text sx={{ color: TYPE_BADGE[post_type]?.text ?? colors.action, fontSize: 10, fontWeight: '700' }}>
                                    {TYPE_BADGE[post_type]?.label ?? 'Post'}
                                </Text>
                            </Box>
                        </LivingGlow>
                    </HStack>
                </HStack>
            </VStack>
        </SanctuaryCard>
    );
});

// —————————————————————————————————————————————————————————————————————————————
// COMPONENT: PollWidget
// —————————————————————————————————————————————————————————————————————————————

function PollWidget({
    postId,
    pollData,
    currentUserId,
    isAuthor = false,
}: {
    postId: string;
    pollData: PollData;
    currentUserId?: string;
    isAuthor?: boolean;
}) {
    const {
        options = [],
        allow_multiple = false,
        is_anonymous: pollAnon = false,
        ends_at,
    } = pollData;

    const colors = useThemedColors();
    const [counts, setCounts] = React.useState<Record<string, number>>({});
    const [userVotes, setUserVotes] = React.useState<Set<string>>(new Set());
    const [totalVotes, setTotalVotes] = React.useState(0);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isVoting, setIsVoting] = React.useState(false);
    const [isRemoving, setIsRemoving] = React.useState(false);
    const [timeLeft, setTimeLeft] = React.useState<string | null>(null);
    const [isExpired, setIsExpired] = React.useState(false);

    const progressAnims = React.useRef<Record<string, Animated.Value>>({});
    options.forEach(opt => {
        if (!progressAnims.current[opt.id]) {
            progressAnims.current[opt.id] = new Animated.Value(0);
        }
    });

    const hasVoted = userVotes.size > 0;
    const showResults = hasVoted || isExpired || isAuthor;
    const maxCount = options.reduce((m, o) => Math.max(m, counts[o.id] ?? 0), 0);

    const fetchVotes = React.useCallback(async () => {
        try {
            const { data: countData, error: countError } = await supabase
                .from('community_poll_votes')
                .select('option_id')
                .eq('post_id', postId);
            if (countError) throw countError;

            const newCounts: Record<string, number> = {};
            let total = 0;
            (countData ?? []).forEach((v: any) => {
                newCounts[v.option_id] = (newCounts[v.option_id] ?? 0) + 1;
                total++;
            });
            setCounts(newCounts);
            setTotalVotes(total);

            if (currentUserId) {
                const { data: myVotesData, error: myVotesError } = await supabase
                    .from('community_poll_votes')
                    .select('option_id')
                    .eq('post_id', postId)
                    .eq('user_id', currentUserId);
                if (myVotesError) throw myVotesError;

                const myVotes = new Set<string>();
                (myVotesData ?? []).forEach((v: any) => myVotes.add(v.option_id));
                setUserVotes(myVotes);
            }
        } catch (err) {
            console.error('[PollWidget] fetchVotes error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [postId, currentUserId]);

    React.useEffect(() => { fetchVotes(); }, [fetchVotes]);

    React.useEffect(() => {
        if (!showResults) return;
        options.forEach(opt => {
            const pct = totalVotes > 0 ? ((counts[opt.id] ?? 0) / totalVotes) * 100 : 0;
            Animated.timing(progressAnims.current[opt.id]!, {
                toValue: pct,
                duration: 500,
                useNativeDriver: false,
            }).start();
        });
    }, [counts, totalVotes, showResults, options]);

    React.useEffect(() => {
        if (!ends_at) return;
        const tick = () => {
            const diff = new Date(ends_at).getTime() - Date.now();
            if (diff <= 0) { setIsExpired(true); setTimeLeft(null); return; }
            const totalMins = Math.floor(diff / 60_000);
            const d = Math.floor(totalMins / (60 * 24));
            const h = Math.floor((totalMins % (60 * 24)) / 60);
            const m = totalMins % 60;
            setTimeLeft(d > 0 ? `${d}d ${h}h left` : h > 0 ? `${h}h ${m}m left` : `${m}m left`);
        };
        tick();
        const timer = setInterval(tick, 30_000);
        return () => clearInterval(timer);
    }, [ends_at]);

    const handleVote = async (optionId: string) => {
        if (isExpired || !currentUserId || isVoting || isRemoving) return;
        setIsVoting(true);
        try {
            await communityAPI.voteInPoll(postId, optionId, allow_multiple);
            await fetchVotes();
        } catch (err) {
            console.error('[PollWidget] vote error:', err);
        } finally {
            setIsVoting(false);
        }
    };

    if (isLoading) {
        return <ActivityIndicator size="small" color={colors.action} style={{ marginTop: 12 }} />;
    }

    return (
        <VStack space="sm" sx={{ marginTop: Theme.spacing.sm }}>
            <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <HStack space="xs" sx={{ alignItems: 'center' }}>
                    {pollAnon && (
                        <Box sx={{ backgroundColor: colors.overlay, paddingHorizontal: 7, paddingVertical: 3, borderRadius: Theme.corners.tight, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Lock size={11} color={colors.textTertiary} />
                            <Text sx={{ color: colors.textTertiary, fontSize: 10 }}>Anonymous</Text>
                        </Box>
                    )}
                    {allow_multiple && (
                        <Box sx={{ backgroundColor: colors.overlay, paddingHorizontal: 7, paddingVertical: 3, borderRadius: Theme.corners.tight }}>
                            <Text sx={{ color: colors.textTertiary, fontSize: 10 }}>Multi-select</Text>
                        </Box>
                    )}
                </HStack>

                {isExpired ? (
                    <HStack space="xs" sx={{ alignItems: 'center' }}>
                        <Clock size={12} color={colors.textTertiary} />
                        <Text sx={{ color: colors.textTertiary, fontSize: 11 }}>Poll ended</Text>
                    </HStack>
                ) : timeLeft ? (
                    <HStack space="xs" sx={{ alignItems: 'center' }}>
                        <Clock size={12} color={colors.action} />
                        <Text sx={{ color: colors.action, fontSize: 11 }}>{timeLeft}</Text>
                    </HStack>
                ) : null}
            </HStack>

            {options.map(opt => {
                const count = counts[opt.id] ?? 0;
                const isSelected = userVotes.has(opt.id);
                const isWinner = isExpired && count > 0 && count === maxCount;
                const canTap = !isExpired && !!currentUserId && !isVoting && !isRemoving;

                return (
                    <TouchableOpacity
                        key={opt.id}
                        onPress={() => handleVote(opt.id)}
                        disabled={!canTap}
                        activeOpacity={0.7}
                        style={[
                            styles.pollOption,
                            { 
                                borderColor: isWinner ? Theme.colors.sanctuarySaffron : isSelected ? colors.action : colors.overlay,
                                backgroundColor: colors.secondary,
                                borderWidth: isSelected ? 2 : 1
                            }
                        ]}
                    >
                        {showResults && (
                            <Animated.View
                                style={[
                                    styles.pollProgress,
                                    {
                                        width: progressAnims.current[opt.id]!.interpolate({
                                            inputRange: [0, 100],
                                            outputRange: ['0%', '100%'],
                                        }),
                                        backgroundColor: isWinner ? `${Theme.colors.sanctuarySaffron}20` : isSelected ? `${colors.action}15` : `${colors.overlay}40`
                                    }
                                ]}
                            />
                        )}
                        <HStack sx={{ justifyContent: 'space-between', paddingHorizontal: 12, zIndex: 1, alignItems: 'center', width: '100%' }}>
                            <HStack space="sm" sx={{ alignItems: 'center', flex: 1 }}>
                                {!isExpired && currentUserId && (
                                    <Box sx={{
                                        width: 18, height: 18, borderRadius: allow_multiple ? 4 : 9,
                                        borderWidth: 2, borderColor: isSelected ? colors.action : colors.textTertiary,
                                        alignItems: 'center', justifyContent: 'center',
                                        backgroundColor: isSelected ? colors.action : 'transparent'
                                    }}>
                                        {isSelected && <Check size={12} color="white" />}
                                    </Box>
                                )}
                                <Text sx={{ color: colors.text, fontSize: 14, fontWeight: isSelected ? '700' : '400' }}>
                                    {opt.text}
                                </Text>
                            </HStack>
                            {showResults && (
                                <Text sx={{ color: isSelected ? colors.action : colors.textSecondary, fontSize: 12, fontWeight: '700' }}>
                                    {totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0}%
                                </Text>
                            )}
                        </HStack>
                    </TouchableOpacity>
                );
            })}
            
            <HStack sx={{ justifyContent: 'space-between', marginTop: 4 }}>
                <Text sx={{ color: colors.textTertiary, fontSize: 11 }}>
                    {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
                </Text>
                {hasVoted && !isExpired && (
                    <TouchableOpacity onPress={fetchVotes}>
                        <Text sx={{ color: colors.action, fontSize: 11, fontWeight: '600' }}>Change vote</Text>
                    </TouchableOpacity>
                )}
            </HStack>
        </VStack>
    );
}

const styles = StyleSheet.create({
    attachmentChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: Theme.corners.comfortable,
        borderWidth: 1,
        alignSelf: 'flex-start',
    },
    menuItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    pollOption: {
        height: 48,
        borderRadius: Theme.corners.comfortable,
        overflow: 'hidden',
        justifyContent: 'center',
        position: 'relative',
    },
    pollProgress: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
    }
});
