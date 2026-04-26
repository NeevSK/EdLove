import React from 'react';
import { Platform, Share, Animated } from 'react-native';
import { 
    Box, 
    HStack, 
    VStack, 
    Text, 
    Icon,
    Avatar, 
    AvatarFallbackText, 
    AvatarImage, 
    openExternalURL,
    SanctuaryCard, 
    Theme, 
    useTheme, 
    LivingGlow,
    Pressable,
    Spinner,
    Image,
    AnimatedView
} from '@repo/ui';
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
    X as XIcon,
    ShieldAlert, 
    UserX 
} from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { supabase, usePermissions } from '@repo/core';
import * as Clipboard from 'expo-clipboard';
import { useSocialShield } from '../hooks/useSocialShield';
import { communityAPI } from '../api/community';
import type { CommunityPost } from '../types';
import type { FeedbackStatus, PollData, Urgency } from '../types/Community';

// —————————————————————————————————————————————————————————————————————————————
// CONSTANTS
// —————————————————————————————————————————————————————————————————————————————

const MEDIA_HEIGHT = 260;

const TYPE_BADGE: Record<string, { label: string; textClass: string; bgClass: string; borderClass: string }> = {
    announcement: { label: 'Announcement', textClass: 'text-sanctuarySaffron', bgClass: 'bg-sanctuarySaffron/10', borderClass: 'border-sanctuarySaffron' },
    question: { label: 'Question', textClass: 'text-indigo-500', bgClass: 'bg-indigo-500/10', borderClass: 'border-indigo-500' },
    resource: { label: 'Resource', textClass: 'text-emerald-500', bgClass: 'bg-emerald-500/10', borderClass: 'border-emerald-500' },
    feedback: { label: 'Feedback', textClass: 'text-rose-500', bgClass: 'bg-rose-500/10', borderClass: 'border-rose-500' },
    discussion: { label: 'Discussion', textClass: 'text-slate-400', bgClass: 'bg-slate-400/10', borderClass: 'border-slate-400' },
    poll: { label: 'Poll', textClass: 'text-purple-500', bgClass: 'bg-purple-500/10', borderClass: 'border-purple-500' },
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
    isSocialShieldEnabled?: boolean;
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
    currentUserId,
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
    
    const theme = useTheme();
    const { can, flags } = usePermissions();
    const isAnnouncement = post_type === 'announcement';
    const isQuestion = post_type === 'question';
    const isResource = post_type === 'resource';
    const isFeedback = post_type === 'feedback';

    const renderMediaContent = () => {
        if (!media_url) return null;

        if (media_type === 'image') {
            return (
                <Box className="mt-2">
                    <Box
                        className="rounded-xl overflow-hidden border border-white/5 bg-phase-surface relative"
                        style={{ height: MEDIA_HEIGHT }}
                    >
                        <Image
                            source={{ uri: media_url }}
                            className="absolute inset-0"
                            resizeMode="cover"
                        />
                        <Box className="absolute inset-0 bg-black/20" />
                    </Box>
                </Box>
            );
        }

        const mediaLabel = media_type === 'video' ? 'Video'
            : media_type === 'audio' ? 'Audio'
            : 'Attachment';

        return (
            <Pressable
                onPress={() => {
                    if (!media_url) return;
                    openExternalURL(media_url, {
                        title: mediaLabel,
                        sourceLabel: 'Community',
                        sourceBadge: 'Shared attachment',
                        trustLevel: 'external',
                    }).catch(() => {});
                }}
                className="flex-row items-center px-3 py-2 rounded-xl border border-phase-interactive mt-2 self-start active:opacity-70 gap-2"
                accessibilityLabel={`Open ${mediaLabel}`}
            >
                {media_type === 'video' ? <Icon as={Video} size="sm" color={theme.accent.action} />
                    : media_type === 'audio' ? <Icon as={Music} size="sm" color={theme.accent.action} />
                    : <Icon as={FileText} size="sm" color={theme.accent.action} />}
                <Text className="text-phase-accent text-sm">{mediaLabel}</Text>
                <Icon as={Link2} size={12} color={theme.accent.action} />
            </Pressable>
        );
    };

    const renderTypeMetadata = () => {
        if (isQuestion) {
            const urgencyConfig: Record<Urgency, { label: string; textClass: string; bgClass: string }> = {
                high:   { label: 'Urgent',  textClass: 'text-red-600', bgClass: 'bg-red-600/10' },
                medium: { label: 'Medium',  textClass: 'text-amber-600', bgClass: 'bg-amber-600/10' },
                low:    { label: 'Low',     textClass: 'text-phaseText-secondary', bgClass: 'bg-phase-interactive' },
            };
            const urg = urgencyConfig[urgency ?? 'low'];
            return (
                <HStack className="items-center mb-2 gap-2">
                    {urgency && urgency !== 'low' && (
                        <Box className={`${urg.bgClass} px-2 py-0.5 rounded-md flex-row items-center gap-1`}>
                            <Icon as={AlertTriangle} size={11} color={urgency === 'high' ? '#DC2626' : '#D97706'} />
                            <Text className={`text-[11px] font-bold ${urg.textClass}`}>{urg.label}</Text>
                        </Box>
                    )}
                    {has_accepted_answer && (
                        <Box className="bg-emerald-600/10 px-2 py-0.5 rounded-md flex-row items-center gap-1">
                            <Icon as={CheckCircle2} size={11} color="#16A34A" />
                            <Text className="text-[11px] font-bold text-emerald-600">Answered</Text>
                        </Box>
                    )}
                </HStack>
            );
        }

        if (isResource) {
            return (
                <Box className="mb-2">
                    <Box className="bg-indigo-500/10 px-2 py-0.5 rounded-md self-start flex-row items-center gap-1">
                        <Icon as={BookOpen} size={11} color="#6366F1" />
                        <Text className="text-[11px] font-bold text-indigo-500">Resource</Text>
                    </Box>
                </Box>
            );
        }

        if (isFeedback) {
            const statusConfig: Record<FeedbackStatus, { label: string; textClass: string; bgClass: string }> = {
                pending:      { label: 'Pending',      textClass: 'text-phaseText-secondary',    bgClass: 'bg-phase-interactive' },
                under_review: { label: 'Under Review', textClass: 'text-amber-600',              bgClass: 'bg-amber-600/10' },
                approved:     { label: 'Approved',     textClass: 'text-emerald-600',              bgClass: 'bg-emerald-600/10' },
                implemented:  { label: 'Implemented',  textClass: 'text-sanctuarySaffron', bgClass: 'bg-sanctuarySaffron/15' },
                declined:     { label: 'Declined',     textClass: 'text-red-600',              bgClass: 'bg-red-600/10' },
            };
            const cfg = statusConfig[feedback_status ?? 'pending'];
            return (
                <VStack className="mb-2 gap-1.5">
                    <Box className={`${cfg.bgClass} px-2 py-0.5 rounded-md self-start`}>
                        <Text className={`text-[11px] font-bold ${cfg.textClass}`}>{cfg.label}</Text>
                    </Box>
                    {!!feedback_response && (
                        <Box className="bg-phase-surface/50 p-3 rounded-xl border-l-[3px] border-sanctuarySaffron">
                            <Text className="text-phaseText-secondary text-xs italic">{feedback_response}</Text>
                        </Box>
                    )}
                </VStack>
            );
        }

        return null;
    };

    const [liked, setLiked] = React.useState(false);
    const [localLikeCount, setLocalLikeCount] = React.useState(Number(reactions['❤️']) || 0);
    const [hasResonated, setHasResonated] = React.useState(false);
    const [isResonating, setIsResonating] = React.useState(false);
    const [menuOpen, setMenuOpen] = React.useState(false);
    const { blockUser } = useSocialShield();

    React.useEffect(() => {
        setLocalLikeCount(Number(reactions['❤️']) || 0);
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
            <VStack className="gap-4">
                {/* Header */}
                <HStack className="justify-between items-center">
                    <HStack className="items-center gap-3">
                        <Pressable
                            onPress={!is_anonymous ? onAuthorPress : undefined}
                            disabled={is_anonymous || !onAuthorPress}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Avatar size="sm" className={is_anonymous ? 'bg-phase-surface' : 'bg-phase-accent'}>
                                <AvatarFallbackText>{is_anonymous ? '?' : (author_name?.[0] || 'U')}</AvatarFallbackText>
                                {!is_anonymous && author_avatar && (
                                    <AvatarImage source={{ uri: author_avatar }} />
                                )}
                            </Avatar>
                        </Pressable>
                        <VStack>
                            <Text className="text-phaseText-primary font-bold text-[13px]">
                                {is_anonymous ? 'Anonymous' : author_name}
                            </Text>
                            <Text className="text-phaseText-secondary text-[11px]">
                                {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
                            </Text>
                        </VStack>
                    </HStack>

                    <Box>
                        <Pressable onPress={() => setMenuOpen(!menuOpen)} className="p-1">
                            <Icon as={MoreHorizontal} color={theme.text.secondary} size="md" />
                        </Pressable>

                        {menuOpen && (
                            <Box className="absolute top-[25px] right-0 bg-phase-surface rounded-xl border border-phase-surface min-w-[160px] z-10 overflow-hidden shadow-xl" style={{ elevation: 4 }}>
                                <VStack>
                                    {author_id === currentUserId && can('delete', 'Post') && (
                                        <Pressable className="p-4 border-b border-white/5 active:bg-white/5" onPress={handleDelete}>
                                            <HStack className="items-center gap-3">
                                                <Icon as={XIcon} size={16} color={Theme.colors.error} />
                                                <Text className="text-[13px] text-phase-danger">Delete Post</Text>
                                            </HStack>
                                        </Pressable>
                                    )}

                                    {author_id !== currentUserId && flags.isSocialShieldEnabled && (
                                        <Pressable className="p-4 border-b border-white/5 active:bg-white/5" onPress={() => { onReport?.(); setMenuOpen(false); }}>
                                            <HStack className="items-center gap-3">
                                                <Icon as={ShieldAlert} size={16} color={theme.text.primary} />
                                                <Text className="text-[13px] text-phaseText-primary">Report Post</Text>
                                            </HStack>
                                        </Pressable>
                                    )}

                                    {!is_anonymous && author_id !== currentUserId && flags.isSocialShieldEnabled && (
                                        <Pressable className="p-4 active:bg-white/5" onPress={handleBlock}>
                                            <HStack className="items-center gap-3">
                                                <Icon as={UserX} size={16} color={Theme.colors.sanctuarySaffron} />
                                                <Text className="text-[13px] text-sanctuarySaffron">Block User</Text>
                                            </HStack>
                                        </Pressable>
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
                    className="text-phaseText-primary text-[15px] leading-[22px]"
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
                <HStack className="justify-between items-center mt-1">
                    <HStack className="gap-6 items-center">
                        <Pressable onPress={handleLike} className="flex-row items-center py-1">
                            <Icon
                                as={Heart}
                                size="md"
                                color={liked ? '#EF4444' : theme.text.secondary}
                                fill={liked ? '#EF4444' : 'none'}
                            />
                            {localLikeCount > 0 && (
                                <Text className={`text-xs ml-1 ${liked ? 'text-red-500' : 'text-phaseText-secondary'}`}>
                                    {localLikeCount}
                                </Text>
                            )}
                        </Pressable>

                        <Pressable onPress={handleResonate} className="flex-row items-center py-1" disabled={isResonating}>
                            <LivingGlow active={hasResonated}>
                                <Icon
                                    as={Sparkles}
                                    size="md"
                                    color={hasResonated ? theme.accent.action : theme.text.secondary}
                                />
                            </LivingGlow>
                        </Pressable>

                        <Pressable onPress={onComment} className="flex-row items-center py-1">
                            <Icon as={MessageCircle} size="md" color={theme.text.secondary} />
                            <Text className="text-phaseText-secondary text-xs ml-1">
                                {comment_count}
                            </Text>
                        </Pressable>

                        <Pressable onPress={handleShare} className="flex-row items-center py-1" accessibilityLabel="Share post">
                            <Icon as={Share2} size={18} color={theme.text.secondary} />
                        </Pressable>
                    </HStack>

                    <HStack className="items-center">
                        <LivingGlow active={isAnnouncement}>
                            <Box className={`
                                ${TYPE_BADGE[post_type]?.bgClass ?? 'bg-phase-interactive'} 
                                ${TYPE_BADGE[post_type]?.borderClass ?? 'border-phase-interactive'} 
                                border px-2 py-0.5 rounded-md
                            `}>
                                <Text className={`${TYPE_BADGE[post_type]?.textClass ?? 'text-phase-accent'} text-[10px] font-bold`}>
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

    const theme = useTheme();
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
        return <Spinner size="small" className="mt-3" />;
    }

    return (
        <VStack className="gap-2 mt-2">
            <HStack className="justify-between items-center">
                <HStack className="items-center gap-1.5">
                    {pollAnon && (
                        <Box className="bg-phase-interactive px-2 py-0.5 rounded-md flex-row items-center gap-1">
                            <Icon as={Lock} size={11} color={theme.text.secondary} />
                            <Text className="text-phaseText-secondary text-[10px]">Anonymous</Text>
                        </Box>
                    )}
                    {allow_multiple && (
                        <Box className="bg-phase-interactive px-2 py-0.5 rounded-md">
                            <Text className="text-phaseText-secondary text-[10px]">Multi-select</Text>
                        </Box>
                    )}
                </HStack>

                {isExpired ? (
                    <HStack className="items-center gap-1">
                        <Icon as={Clock} size={12} color={theme.text.secondary} />
                        <Text className="text-phaseText-secondary text-[11px]">Poll ended</Text>
                    </HStack>
                ) : timeLeft ? (
                    <HStack className="items-center gap-1">
                        <Icon as={Clock} size={12} color={theme.accent.action} />
                        <Text className="text-phase-accent text-[11px]">{timeLeft}</Text>
                    </HStack>
                ) : null}
            </HStack>

            {options.map(opt => {
                const count = counts[opt.id] ?? 0;
                const isSelected = userVotes.has(opt.id);
                const isWinner = isExpired && count > 0 && count === maxCount;
                const canTap = !isExpired && !!currentUserId && !isVoting && !isRemoving;

                return (
                    <Pressable
                        key={opt.id}
                        onPress={() => handleVote(opt.id)}
                        disabled={!canTap}
                        className={`
                            h-12 rounded-xl overflow-hidden relative justify-center border
                            ${isWinner ? 'border-sanctuarySaffron' : isSelected ? 'border-phase-accent' : 'border-phase-interactive'}
                            ${isSelected ? 'border-2' : 'border-1'}
                            bg-phase-surface
                        `}
                    >
                        {showResults && (
                            <AnimatedView
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    bottom: 0,
                                    width: progressAnims.current[opt.id]!.interpolate({
                                        inputRange: [0, 100],
                                        outputRange: ['0%', '100%'],
                                    }),
                                    backgroundColor: isWinner ? `${Theme.colors.sanctuarySaffron}20` : isSelected ? `${theme.accent.action}15` : `${theme.scene.interactive.bg}40`
                                }}
                            />
                        )}
                        <HStack className="justify-between px-3 z-1 items-center w-full">
                            <HStack className="items-center gap-2 flex-1">
                                {!isExpired && currentUserId && (
                                    <Box className={`
                                        w-[18px] h-[18px] items-center justify-center border-2
                                        ${allow_multiple ? 'rounded-[4px]' : 'rounded-full'}
                                        ${isSelected ? 'bg-phase-accent border-phase-accent' : 'border-phase-interactive'}
                                    `}>
                                        {isSelected && <Icon as={Check} size={12} color="white" />}
                                    </Box>
                                )}
                                <Text className={`text-phaseText-primary text-sm ${isSelected ? 'font-bold' : 'font-normal'}`}>
                                    {opt.text}
                                </Text>
                            </HStack>
                            {showResults && (
                                <Text className={`text-xs font-bold ${isSelected ? 'text-phase-accent' : 'text-phaseText-secondary'}`}>
                                    {totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0}%
                                </Text>
                            )}
                        </HStack>
                    </Pressable>
                );
            })}
            
            <HStack className="justify-between mt-1">
                <Text className="text-phaseText-secondary text-[11px]">
                    {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
                </Text>
                {hasVoted && !isExpired && (
                    <Pressable onPress={fetchVotes}>
                        <Text className="text-phase-accent text-[11px] font-semibold">Change vote</Text>
                    </Pressable>
                )}
            </HStack>
        </VStack>
    );
}

export default PostCard;
