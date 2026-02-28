import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Box, HStack, VStack, Text, Avatar, AvatarFallbackText, AvatarImage } from '@repo/ui';
import { MoreHorizontal, Heart, MessageCircle, Sparkles, Globe } from 'lucide-react-native';
import { SanctuaryCard, Theme, useThemedColors, LivingGlow } from '@repo/ui';
import { formatDistanceToNow } from 'date-fns';
import { MediaAsset } from '@repo/core';

export type PostType = 'post' | 'text' | 'announcement' | 'poll';

import { CommunityPost } from '../index';

interface PostCardProps {
    post: CommunityPost;
    onPress?: () => void;
    onLike?: () => void;
    onResonate?: () => void;
    onComment?: () => void;
    onReport?: () => void;
    /** Called when the author avatar/name is tapped — use to navigate to the author's public profile */
    onAuthorPress?: () => void;
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
    isSample,
    currentUserId
}: PostCardProps) {
    const {
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
        id
    } = post;
    const colors = useThemedColors();
    const [activeMediaIndex, setActiveMediaIndex] = React.useState(0);

    const isAnnouncement = post_type === 'announcement';
    const totalReactions = Object.values(reactions).reduce((a, b) => a + b, 0);

    const renderMediaContent = () => {
        // Handle direct media_url if provided (new schema)
        if (media_url && media_type === 'image') {
            return (
                <Box sx={{ marginTop: Theme.spacing.sm }}>
                    <Box
                        sx={{
                            height: MEDIA_HEIGHT, // Keep original height for media display
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
        setLocalLikeCount(Math.max(0, localLikeCount + (nowLiked ? 1 : -1)));
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

                    <TouchableOpacity onPress={onReport}>
                        <MoreHorizontal color={colors.textTertiary} size={20} />
                    </TouchableOpacity>
                </HStack>

                {/* Content */}
                <Text color={colors.textPrimary} size="md" sx={{ lineHeight: 22 }} numberOfLines={onPress ? 4 : undefined}>
                    {content}
                </Text>

                {/* Media Content */}
                {renderMediaContent()}

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
                    </HStack>

                    {/* Engagement Count */}
                    {totalReactions > 0 && (
                        <Text color={colors.textTertiary} size="xs">
                            {totalReactions} Resonances
                        </Text>
                    )}

                    {/* Announcement Badge */}
                    <LivingGlow active={isAnnouncement}>
                        <Box sx={{
                            backgroundColor: isAnnouncement ? '$amber100' : colors.overlay,
                            borderWidth: 1,
                            borderColor: isAnnouncement ? '$amber400' : colors.action,
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: Theme.corners.tight,
                        }}>
                            <Text color={isAnnouncement ? '$amber700' : colors.action} size="xs" bold>
                                {isAnnouncement ? 'Sacred Bulletin' : 'Resonance'}
                            </Text>
                        </Box>
                    </LivingGlow>
                </HStack>
            </VStack>
        </SanctuaryCard>
    );
});

export default PostCard;

const styles = StyleSheet.create({
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 4,
    },
});
