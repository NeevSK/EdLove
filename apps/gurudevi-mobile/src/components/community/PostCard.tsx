import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Box, HStack, VStack, Text, Avatar, AvatarFallbackText, AvatarImage } from '@repo/ui';
import { MoreHorizontal, Heart, MessageCircle, Share2, BarChart2, Globe } from 'lucide-react-native';
import { SanctuaryCard } from '@repo/ui';
import { Theme } from '@repo/ui';
import { formatDistanceToNow } from 'date-fns';
import { MediaAsset } from '@repo/core';

export type PostType = 'post' | 'text' | 'announcement' | 'poll';

interface PostCardProps {
    id: string;
    author: {
        id: string;
        name: string;
        avatarUrl?: string;
        role?: string;
    };
    content: string;
    type: PostType;
    createdAt: string;
    reactions: number;
    comments: number;
    isLiked?: boolean;
    groupName?: string;
    isInterSchool?: boolean;
    mediaAssets?: MediaAsset[];
    onPress?: () => void;
    onLike?: () => void;
    onComment?: () => void;
    isAnonymous?: boolean;
}

const MEDIA_HEIGHT = 220;

const PostCard = React.memo(function PostCard({
    author,
    content,
    type,
    createdAt,
    reactions,
    comments,
    isLiked,
    groupName,
    isInterSchool,
    mediaAssets,
    onPress,
    onLike,
    onComment,
    isAnonymous
}: PostCardProps) {

    const [activeMediaIndex, setActiveMediaIndex] = React.useState(0);

    // Announcement Style
    const isAnnouncement = type === 'announcement';
    const borderColor = isAnnouncement ? Theme.colors.sanctuarySaffron : 'transparent';

    const renderMediaCarousel = () => {
        if (!mediaAssets || mediaAssets.length === 0) return null;
        const imageAssets = mediaAssets.filter((a) => a.resource_type === 'image');
        if (imageAssets.length === 0) return null;

        const activeAsset = imageAssets[activeMediaIndex];
        return (
            <View>
                <Image
                    source={{ uri: activeAsset?.secure_url || activeAsset?.url }}
                    style={styles.mediaImage}
                    resizeMode="cover"
                />
                {imageAssets.length > 1 && (
                    <HStack space="xs" justifyContent="center" mt="$1">
                        {imageAssets.map((_, idx) => (
                            <TouchableOpacity key={idx} onPress={() => setActiveMediaIndex(idx)}>
                                <View
                                    style={[
                                        styles.mediaDot,
                                        { backgroundColor: idx === activeMediaIndex ? Theme.colors.sanctuarySaffron : Theme.colors.dimGray }
                                    ]}
                                />
                            </TouchableOpacity>
                        ))}
                    </HStack>
                )}
            </View>
        );
    };

    return (
        <SanctuaryCard onPress={onPress} elevated={isAnnouncement}>
            <VStack space="md">
                {/* Header: Author & Meta */}
                <HStack justifyContent="space-between" alignItems="center">
                    <HStack space="md" alignItems="center">
                        <Avatar size="sm" bgColor={isAnonymous ? Theme.colors.deepIndigo : Theme.colors.sanctuarySaffron}>
                            <AvatarFallbackText>{isAnonymous ? '?' : author.name}</AvatarFallbackText>
                            {!isAnonymous && author.avatarUrl && (
                                <AvatarImage source={{ uri: author.avatarUrl }} alt={author.name} />
                            )}
                        </Avatar>
                        <VStack>
                            <HStack space="xs" alignItems="center">
                                <Text color={Theme.colors.sacredWhite} bold size="sm">
                                    {isAnonymous ? 'Anonymous' : author.name}
                                </Text>
                                {groupName && (
                                    <>
                                        <Text color={Theme.colors.dimGray} size="xs">•</Text>
                                        {isInterSchool && (
                                            <Globe
                                                size={12}
                                                color={Theme.colors.sageGreen}
                                                style={{ marginRight: 4 }}
                                            />
                                        )}
                                        <Text color={Theme.colors.sanctuarySaffron} size="xs" bold>
                                            {groupName}
                                        </Text>
                                    </>
                                )}
                            </HStack>
                            <Text color={Theme.colors.mistGray} size="xs">
                                {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
                            </Text>
                        </VStack>
                    </HStack>

                    {/* Options */}
                    <TouchableOpacity>
                        <MoreHorizontal color={Theme.colors.mistGray} size={20} />
                    </TouchableOpacity>
                </HStack>

                {/* Content */}
                <Text color={Theme.colors.pearlGray} size="md" numberOfLines={onPress ? 3 : undefined}>
                    {content}
                </Text>

                {/* Media Carousel */}
                {renderMediaCarousel()}

                {/* Footer: Actions */}
                <HStack justifyContent="space-between" alignItems="center" mt="$2">
                    <HStack space="lg">
                        <TouchableOpacity onPress={onLike} style={styles.actionButton}>
                            <Heart
                                size={20}
                                color={isLiked ? Theme.colors.emberRed : Theme.colors.mistGray}
                                fill={isLiked ? Theme.colors.emberRed : 'none'}
                            />
                            <Text color={isLiked ? Theme.colors.emberRed : Theme.colors.mistGray} size="sm">
                                {reactions}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={onComment} style={styles.actionButton}>
                            <MessageCircle size={20} color={Theme.colors.mistGray} />
                            <Text color={Theme.colors.mistGray} size="sm">
                                {comments}
                            </Text>
                        </TouchableOpacity>
                    </HStack>

                    {/* Type Badge */}
                    {isAnnouncement && (
                        <Box sx={{ backgroundColor: 'rgba(255, 165, 0, 0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
                            <Text color={Theme.colors.sanctuarySaffron} size="xs" bold>Announcement</Text>
                        </Box>
                    )}
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
        gap: 6,
    },
    mediaImage: {
        width: '100%',
        height: MEDIA_HEIGHT,
        borderRadius: Theme.corners.comfortable,
        marginTop: 4,
    },
    mediaDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
});
