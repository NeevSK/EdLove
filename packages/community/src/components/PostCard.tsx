import React from 'react';
import { StyleSheet, TouchableOpacity, Image, Platform, Share, ActivityIndicator, Animated } from 'react-native';
import { Box, HStack, VStack, Text, Avatar, AvatarFallbackText, AvatarImage } from '@repo/ui';
import { MoreHorizontal, Heart, MessageCircle, Sparkles, Share2, CheckCircle2, AlertTriangle, FileText, Video, Music, Link2, BookOpen, Lock, Clock, Check, Trophy, X as XIcon } from 'lucide-react-native';
import { SanctuaryCard, Theme, useThemedColors, LivingGlow } from '@repo/ui';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@repo/core';
import * as Clipboard from 'expo-clipboard';
import { useCommunity } from '../hooks/useCommunity';
import { useSocialShield } from '../hooks/useSocialShield';
import { communityAPI } from '../api/community';
import { ShieldAlert, UserX } from 'lucide-react-native';
import { PostType, FeedbackStatus, PollData } from '../types/Community';

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
    const [hasResonated, setHasResonated] = React.useState(false);
    const [isResonating, setIsResonating] = React.useState(false);

    React.useEffect(() => {
        setLocalLikeCount(reactions['❤️'] || 0);
        setLiked(false);
    }, [id, reactions['❤️']]);

    // Fetch initial resonance state for current user
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

    const isLiked = liked;

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
            // Parent list will refresh via React Query invalidation
        } catch (err) {
            console.error('[PostCard] deletePost failed:', err);
        }
    };

    const renderPollContent = () => {
        if (post_type === 'poll' && poll_data) {
            return (
                <PollWidget
                    postId={id}
                    pollData={poll_data}
                    currentUserId={currentUserId}
                    isAuthor={author_id === currentUserId}
                />
            );
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
                                    {/* Own post: Delete */}
                                    {author_id === currentUserId && (
                                        <TouchableOpacity
                                            style={styles.menuItem}
                                            onPress={handleDelete}
                                        >
                                            <HStack space="md" alignItems="center">
                                                <XIcon size={16} color={colors.error} />
                                                <Text size="sm" color={colors.error}>Delete Post</Text>
                                            </HStack>
                                        </TouchableOpacity>
                                    )}

                                    {/* Report (other people's posts) */}
                                    {author_id !== currentUserId && (
                                        <TouchableOpacity 
                                            style={styles.menuItem} 
                                            onPress={() => { onReport?.(); setMenuOpen(false); }}
                                        >
                                            <HStack space="md" alignItems="center">
                                                <ShieldAlert size={16} color={colors.text} />
                                                <Text size="sm" color={colors.text}>Report Post</Text>
                                            </HStack>
                                        </TouchableOpacity>
                                    )}

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
        is_anonymous = false,
        ends_at,
    } = pollData;

    const colors = useThemedColors();

    // ── Vote state ──────────────────────────────────────────────────────────
    const [counts, setCounts] = React.useState<Record<string, number>>({});
    const [userVotes, setUserVotes] = React.useState<Set<string>>(new Set());
    const [totalVotes, setTotalVotes] = React.useState(0);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isVoting, setIsVoting] = React.useState(false);
    const [isRemoving, setIsRemoving] = React.useState(false);

    // ── Time state ───────────────────────────────────────────────────────────
    const [timeLeft, setTimeLeft] = React.useState<string | null>(null);
    const [isExpired, setIsExpired] = React.useState(false);

    // ── Animated progress bars (one Animated.Value per option, 0–100) ────────
    const progressAnims = React.useRef<Record<string, Animated.Value>>({});
    options.forEach(opt => {
        if (!progressAnims.current[opt.id]) {
            progressAnims.current[opt.id] = new Animated.Value(0);
        }
    });

    const hasVoted = userVotes.size > 0;
    // Results are revealed once user has voted, poll has ended, or author is viewing.
    const showResults = hasVoted || isExpired || isAuthor;
    const maxCount = options.reduce((m, o) => Math.max(m, counts[o.id] ?? 0), 0);

    // ── Fetch votes from DB ──────────────────────────────────────────────────
    const fetchVotes = React.useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('community_poll_votes')
                .select('user_id, option_id')
                .eq('post_id', postId);
            if (error) throw error;

            const newCounts: Record<string, number> = {};
            const myVotes = new Set<string>();
            let total = 0;

            (data ?? []).forEach((v: { user_id: string; option_id: string }) => {
                newCounts[v.option_id] = (newCounts[v.option_id] ?? 0) + 1;
                total++;
                if (currentUserId && v.user_id === currentUserId) myVotes.add(v.option_id);
            });

            setCounts(newCounts);
            setUserVotes(myVotes);
            setTotalVotes(total);
        } catch (err) {
            console.error('[PollWidget] fetchVotes error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [postId, currentUserId]);

    React.useEffect(() => { fetchVotes(); }, [fetchVotes]);

    // ── Supabase realtime subscription ───────────────────────────────────────
    React.useEffect(() => {
        const channel = supabase
            .channel(`poll-${postId}`)
            .on(
                'postgres_changes' as any,
                { event: '*', schema: 'public', table: 'community_poll_votes', filter: `post_id=eq.${postId}` },
                () => fetchVotes(),
            )
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [postId, fetchVotes]);

    // ── Animate progress bars whenever results change ────────────────────────
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
    }, [counts, totalVotes, showResults]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Countdown timer ──────────────────────────────────────────────────────
    React.useEffect(() => {
        if (!ends_at) return;
        const end = new Date(ends_at).getTime();

        const tick = () => {
            const diff = end - Date.now();
            if (diff <= 0) { setIsExpired(true); setTimeLeft(null); return; }
            const totalMins = Math.floor(diff / 60_000);
            const d = Math.floor(totalMins / (60 * 24));
            const h = Math.floor((totalMins % (60 * 24)) / 60);
            const m = totalMins % 60;
            setTimeLeft(d > 0 ? `${d}d ${h}h left` : h > 0 ? `${h}h ${m}m left` : `${m}m left`);
        };

        if (end <= Date.now()) { setIsExpired(true); return; }
        tick();
        const timer = setInterval(tick, 30_000);
        return () => clearInterval(timer);
    }, [ends_at]);

    // ── Vote handler ─────────────────────────────────────────────────────────
    const handleVote = async (optionId: string) => {
        if (isExpired || !currentUserId || isVoting || isRemoving) return;
        setIsVoting(true);

        // --- Optimistic update ---
        const wasSelected = userVotes.has(optionId);

        if (allow_multiple) {
            // Toggle this option on/off
            setUserVotes(prev => {
                const next = new Set(prev);
                wasSelected ? next.delete(optionId) : next.add(optionId);
                return next;
            });
            setCounts(prev => ({ ...prev, [optionId]: Math.max(0, (prev[optionId] ?? 0) + (wasSelected ? -1 : 1)) }));
            setTotalVotes(prev => Math.max(0, prev + (wasSelected ? -1 : 1)));
        } else {
            // Single-choice: tap same → retract; tap different → replace
            const prevId = [...userVotes][0] as string | undefined;
            const isSame = prevId === optionId;

            const newCounts = { ...counts };
            if (isSame) {
                // Retract
                newCounts[optionId] = Math.max(0, (newCounts[optionId] ?? 0) - 1);
                setUserVotes(new Set());
                setTotalVotes(prev => Math.max(0, prev - 1));
            } else {
                // Replace
                if (prevId) newCounts[prevId] = Math.max(0, (newCounts[prevId] ?? 0) - 1);
                newCounts[optionId] = (newCounts[optionId] ?? 0) + 1;
                setUserVotes(new Set([optionId]));
                if (!prevId) setTotalVotes(prev => prev + 1);
            }
            setCounts(newCounts);
        }

        try {
            await communityAPI.voteInPoll(postId, optionId, allow_multiple);
        } catch (err) {
            console.error('[PollWidget] vote error:', err);
            fetchVotes(); // revert on error
        } finally {
            setIsVoting(false);
        }
    };

    // ── Remove ALL votes ─────────────────────────────────────────────────────
    const handleRemoveVote = async () => {
        if (isExpired || !currentUserId || isVoting || isRemoving || !hasVoted) return;
        setIsRemoving(true);

        // Optimistic: subtract user's votes from counts then clear
        const removedVotes = new Set(userVotes);
        setCounts(prev => {
            const next = { ...prev };
            removedVotes.forEach(id => { next[id] = Math.max(0, (next[id] ?? 0) - 1); });
            return next;
        });
        setTotalVotes(prev => Math.max(0, prev - removedVotes.size));
        setUserVotes(new Set());

        try {
            await communityAPI.retractAllVotes(postId);
        } catch (err) {
            console.error('[PollWidget] retract error:', err);
            fetchVotes(); // revert on error
        } finally {
            setIsRemoving(false);
        }
    };

    if (isLoading) {
        return <ActivityIndicator size="small" color={colors.action} style={{ marginTop: 12 }} />;
    }

    return (
        <VStack space="sm" sx={{ marginTop: Theme.spacing.sm }}>

            {/* Poll header: meta badges + countdown */}
            <HStack justifyContent="space-between" alignItems="center">
                <HStack space="xs" alignItems="center">
                    {is_anonymous && (
                        <HStack space="xs" alignItems="center"
                            style={{ backgroundColor: colors.overlay, paddingHorizontal: 7, paddingVertical: 3, borderRadius: Theme.corners.tight }}>
                            <Lock size={11} color={colors.textTertiary} />
                            <Text color={colors.textTertiary} size="xs">Anonymous</Text>
                        </HStack>
                    )}
                    {allow_multiple && (
                        <Box style={{ backgroundColor: colors.overlay, paddingHorizontal: 7, paddingVertical: 3, borderRadius: Theme.corners.tight }}>
                            <Text color={colors.textTertiary} size="xs">Multi-select</Text>
                        </Box>
                    )}
                </HStack>

                {isExpired ? (
                    <HStack space="xs" alignItems="center">
                        <Clock size={12} color={colors.textTertiary} />
                        <Text color={colors.textTertiary} size="xs">Poll ended</Text>
                    </HStack>
                ) : timeLeft ? (
                    <HStack space="xs" alignItems="center">
                        <Clock size={12} color={colors.action} />
                        <Text color={colors.action} size="xs">{timeLeft}</Text>
                    </HStack>
                ) : null}
            </HStack>

            {/* Options */}
            {options.map(opt => {
                const count = counts[opt.id] ?? 0;
                const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
                const isSelected = userVotes.has(opt.id);
                const isWinner = isExpired && count > 0 && count === maxCount;
                const canTap = !isExpired && !!currentUserId && !isVoting && !isRemoving;

                return (
                    <TouchableOpacity
                        key={opt.id}
                        onPress={() => handleVote(opt.id)}
                        disabled={!canTap}
                        activeOpacity={canTap ? 0.7 : 1}
                        style={{
                            borderRadius: Theme.corners.comfortable,
                            overflow: 'hidden',
                            borderWidth: isSelected ? 2 : 1,
                            borderColor: isWinner
                                ? Theme.colors.sanctuarySaffron
                                : isSelected ? colors.action : colors.overlay,
                            backgroundColor: colors.secondary,
                            minHeight: 48,
                            justifyContent: 'center',
                        }}
                    >
                        {/* Animated fill bar — only shown after voting/expiry */}
                        {showResults && (
                            <Animated.View
                                style={{
                                    position: 'absolute',
                                    left: 0, top: 0, bottom: 0,
                                    width: progressAnims.current[opt.id]!.interpolate({
                                        inputRange: [0, 100],
                                        outputRange: ['0%', '100%'],
                                    }),
                                    backgroundColor: isWinner
                                        ? `${Theme.colors.sanctuarySaffron}28`
                                        : isSelected
                                            ? `${colors.action}22`
                                            : `${colors.overlay}88`,
                                }}
                            />
                        )}

                        <HStack justifyContent="space-between" style={{ paddingHorizontal: 12, zIndex: 1 }} alignItems="center">
                            <HStack space="sm" alignItems="center" style={{ flex: 1 }}>
                                {/* Checkbox (multi) or radio dot (single) — hidden when poll is closed */}
                                {!isExpired && (
                                    <Box style={{
                                        width: 20, height: 20,
                                        borderRadius: allow_multiple ? 5 : 10,
                                        borderWidth: isSelected ? 0 : 1.5,
                                        borderColor: colors.overlay,
                                        backgroundColor: isSelected ? colors.action : 'transparent',
                                        alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        {isSelected && (
                                            allow_multiple
                                                ? <Check size={12} color="#fff" strokeWidth={3} />
                                                : <Box style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' }} />
                                        )}
                                    </Box>
                                )}
                                {isWinner && <Trophy size={14} color={Theme.colors.sanctuarySaffron} />}
                                <Text
                                    color={isSelected ? colors.textPrimary : colors.textSecondary}
                                    size="sm"
                                    bold={isSelected || isWinner}
                                    style={{ flex: 1, paddingVertical: 12 }}
                                    numberOfLines={3}
                                >
                                    {opt.text}
                                </Text>
                            </HStack>

                            {/* Percentage + count — only after voting/expiry */}
                            {showResults && (
                                <VStack alignItems="flex-end" style={{ marginLeft: 8 }}>
                                    <Text
                                        size="sm"
                                        bold={isSelected || isWinner}
                                        style={{
                                            color: isWinner
                                                ? Theme.colors.sanctuarySaffron
                                                : isSelected ? colors.action : colors.textTertiary,
                                        }}
                                    >
                                        {Math.round(percentage)}%
                                    </Text>
                                    {!is_anonymous && (
                                        <Text color={colors.textTertiary} size="xs">{count}</Text>
                                    )}
                                </VStack>
                            )}
                        </HStack>
                    </TouchableOpacity>
                );
            })}

            {/* Footer row: total responses + contextual hints */}
            <HStack justifyContent="space-between" alignItems="center" style={{ marginTop: 2 }}>
                <Text color={colors.textTertiary} size="xs">
                    {totalVotes} {totalVotes === 1 ? 'response' : 'responses'}
                </Text>

                <HStack space="md" alignItems="center">
                    {/* Change-vote hint — visible when voted + poll open */}
                    {hasVoted && !isExpired && (
                        <Text color={colors.textTertiary} size="xs" italic>
                            {allow_multiple ? 'Tap to toggle' : 'Tap to change'}
                        </Text>
                    )}

                    {/* Remove vote — explicit retract button */}
                    {hasVoted && !isExpired && (
                        <TouchableOpacity
                            onPress={handleRemoveVote}
                            disabled={isRemoving}
                            style={{
                                flexDirection: 'row', alignItems: 'center', gap: 3,
                                paddingHorizontal: 8, paddingVertical: 4,
                                borderRadius: Theme.corners.tight,
                                borderWidth: 1, borderColor: colors.overlay,
                            }}
                            accessibilityLabel="Remove my vote"
                        >
                            {isRemoving
                                ? <ActivityIndicator size="small" color={colors.textTertiary} />
                                : <XIcon size={11} color={colors.textTertiary} />
                            }
                            <Text color={colors.textTertiary} size="xs">
                                {isRemoving ? 'Removing…' : 'Remove vote'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </HStack>
            </HStack>
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
