import React, { useState, useEffect } from 'react';
import { ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    useThemedColors,
    Theme,
    ScreenWrapper,
    FadeInDown,
    SanctuaryCard,
    SanctuaryButton,
    SanctuaryFlashList,
    useLotusToast
} from '@repo/ui';
import {
    ChevronLeft,
    Users,
    Settings,
    MoreVertical,
    UserPlus,
    MessageSquare,
    QrCode
} from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCommunity } from '../hooks/useCommunity';
import { useCommunityGroups } from '../hooks/useCommunityGroups';
import { Group, Post } from '../types';
import GroupMemberManagement from '../components/GroupMemberManagement';
import { PinnedResourcesShelf } from '../components/PinnedResourcesShelf';
import { useUserRole, useStore, supabase, CommunityStackParamList } from '@repo/core';
// @ts-ignore
import { isDemo } from '@repo/core';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import PostCard from '../components/PostCard';
import SocialShieldModal from '../components/SocialShieldModal';
import { CommentSheet } from '../components/CommentSheet';
import { communityAPI } from '../api/community';
import {
    QRBuilder,
    QRCodeGenerator
} from '@repo/scanner-kit';
import {
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Icon,
    CloseIcon,
    Heading as UIHeading
} from '@repo/ui';

type GroupDetailsRouteProp = {
    key: string;
    name: 'GroupDetails';
    params: {
        groupId: string;
    };
};

export default function GroupDetailsScreen() {
    const route = useRoute<GroupDetailsRouteProp>();
    const navigation = useNavigation<NativeStackNavigationProp<CommunityStackParamList>>();
    const { t } = useTranslation();
    const { groupId } = route.params;
    const { role } = useUserRole();
    const user = useStore(state => state.user);
    const colors = useThemedColors();
    const { showToast } = useLotusToast();
    const { joinGroup, isJoiningGroup, posts, fetchPosts } = useCommunity();

    const [group, setGroup] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showAdmin, setShowAdmin] = useState(false);
    const [reportPostId, setReportPostId] = useState<string | undefined>(undefined);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [commentPostId, setCommentPostId] = useState<string | null>(null);
    const [commentPostAuthorId, setCommentPostAuthorId] = useState<string | undefined>();
    const [commentPostType, setCommentPostType] = useState<string | undefined>();

    useEffect(() => {
        const fetchGroup = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('community_groups')
                    .select('*, creator:users!community_groups_created_by_fkey(full_name, avatar_url)')
                    .eq('id', groupId)
                    .single();

                if (data) setGroup(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchGroup();
        fetchPosts(groupId);
    }, [groupId]);

    const handleJoin = async () => {
        if (!user) return;
        try {
            await joinGroup({ groupId, userId: user.id, joinPolicy: group?.join_policy || 'open' });
            showToast({
                message: t('community.groups.joinRequested'),
                type: 'success'
            });
        } catch (err) {
            showToast({
                message: t('common.error'),
                type: 'error'
            });
        }
    };

    if (loading) {
        return (
            <ScreenWrapper>
                <Box sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={Theme.colors.sanctuarySaffron} />
                </Box>
            </ScreenWrapper>
        );
    }

    if (!group) return null;

    // Admin: circle creator OR users with the 'principal' role
    const isAdmin = group.created_by === user?.id || role === 'principal';

    if (showAdmin && isAdmin) {
        return (
            <Box sx={{ flex: 1 }}>
                <HStack space="md" p="$4" pt="$8" alignItems="center" bg={colors.secondary}>
                    <TouchableOpacity onPress={() => setShowAdmin(false)}>
                        <ChevronLeft color={colors.textPrimary} />
                    </TouchableOpacity>
                    <Text bold size="lg">{t('community.groups.manage')}</Text>
                </HStack>
                <GroupMemberManagement groupId={groupId} />
            </Box>
        );
    }

    return (
        <ScreenWrapper scroll={false}>
            <Box sx={{ flex: 1 }}>
                {/* Custom Header */}
                <HStack
                    space="md"
                    p="$4"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <HStack space="md" alignItems="center">
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <ChevronLeft color={colors.textPrimary} />
                        </TouchableOpacity>
                        <Text bold size="lg" numberOfLines={1} sx={{ maxWidth: 200 }}>{group.name}</Text>
                    </HStack>

                    <HStack space="sm">
                        <TouchableOpacity onPress={() => navigation.navigate('GroupChat', { groupId, groupName: group.name })}>
                            <MessageSquare size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                        {isAdmin && (
                            <TouchableOpacity onPress={() => setShowAdmin(true)}>
                                <Settings size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={() => setShowQRModal(true)}>
                            <QrCode size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <MoreVertical size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </HStack>
                </HStack>

                <SanctuaryFlashList
                    data={posts}
                    estimatedItemSize={Theme.listSizes.communityCard}
                    renderItem={({ item, index }) => (
                        <Animated.View entering={FadeInDown.duration(400).delay(index * 150).springify()}>
                            <Box px="$4" pb="$4">
                                <PostCard
                                    post={item}
                                    currentUserId={user?.id}
                                    onPress={() => console.log('OPEN_POST', item.id)}
                                    onLike={() => {
                                        if (user?.id) communityAPI.togglePostReaction(item.id, user.id).catch(console.error);
                                    }}
                                    onComment={() => {
                                        setCommentPostId(item.id);
                                        setCommentPostAuthorId(item.author_id ?? undefined);
                                        setCommentPostType(item.post_type);
                                    }}
                                    onReport={() => {
                                        setReportPostId(item.id);
                                        setShowReportModal(true);
                                    }}
                                />
                            </Box>
                        </Animated.View>
                    )}
                    ListHeaderComponent={
                        <VStack space="xl" p="$4">
                            {/* Hero Card */}
                            <Animated.View entering={FadeInDown.duration(600).springify()}>
                                <SanctuaryCard variant="glass">
                                    <VStack space="md">
                                        <HStack space="md" alignItems="center">
                                            <Box
                                                sx={{
                                                    width: 64,
                                                    height: 64,
                                                    borderRadius: 32,
                                                    backgroundColor: group.image_url ? 'transparent' : Theme.colors.sanctuarySaffron,
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    overflow: 'hidden',
                                                    borderWidth: 2,
                                                    borderColor: 'rgba(255,255,255,0.15)',
                                                }}
                                            >
                                                {group.image_url ? (
                                                    <Image
                                                        source={{ uri: group.image_url }}
                                                        style={{ width: 64, height: 64, borderRadius: 32 }}
                                                    />
                                                ) : (
                                                    <Text size="2xl" bold color={Theme.colors.sacredWhite}>
                                                        {group.name.charAt(0).toUpperCase()}
                                                    </Text>
                                                )}
                                            </Box>
                                            <VStack flex={1}>
                                                <HStack space="md" alignItems="center">
                                                    <Text bold size="xl" color={Theme.colors.sacredWhite}>{group.name}</Text>
                                                    {group.classroom_id && (
                                                        <Box
                                                            px="$2"
                                                            py="$0.5"
                                                            sx={{
                                                                backgroundColor: 'rgba(230, 126, 34, 0.15)',
                                                                borderRadius: Theme.corners.tight,
                                                                borderWidth: 1,
                                                                borderColor: Theme.colors.sanctuarySaffron
                                                            }}
                                                        >
                                                            <Text color={Theme.colors.sanctuarySaffron} size="2xs" bold>
                                                                CLASS
                                                            </Text>
                                                        </Box>
                                                    )}
                                                </HStack>
                                                <HStack space="xs" alignItems="center">
                                                    <Users size={14} color={Theme.colors.dimGray} />
                                                    <Text color={Theme.colors.dimGray} size="sm">
                                                        {group.member_count || 0} {t('community.groups.members')}
                                                    </Text>
                                                </HStack>
                                            </VStack>
                                        </HStack>

                                        <Text color={Theme.colors.mistGray} size="sm">
                                            {group.description || t('community.groups.noDesc')}
                                        </Text>

                                        {!isAdmin && (
                                            <Box mt="$2">
                                                <SanctuaryButton
                                                    action="primary"
                                                    variant="solid"
                                                    onPress={handleJoin}
                                                    isLoading={isJoiningGroup}
                                                    leftIcon={UserPlus}
                                                >
                                                    {t('community.groups.join')}
                                                </SanctuaryButton>
                                            </Box>
                                        )}
                                    </VStack>
                                </SanctuaryCard>
                            </Animated.View>

                            {/* Pinned Resources - Library First */}
                            <PinnedResourcesShelf resources={[]} />

                            {/* Feed Header */}
                            <HStack space="sm" alignItems="center" mt="$2">
                                <MessageSquare size={18} color={Theme.colors.sanctuarySaffron} />
                                <Text bold size="md" color={Theme.colors.sacredWhite}>
                                    {t('community.groups.feed')}
                                </Text>
                            </HStack>
                        </VStack>
                    }
                    ListEmptyComponent={
                        posts.length === 0 ? (
                            <VStack p="$8" alignItems="center" space="md">
                                <Box sx={{ p: '$4', borderRadius: '$full', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                                    <MessageSquare size={32} color={Theme.colors.mistGray} />
                                </Box>
                                <Text color={Theme.colors.mistGray} textAlign="center">
                                    {t('community.groups.emptyFeed')}
                                </Text>
                            </VStack>
                        ) : null
                    }
                />

                <SocialShieldModal
                    isOpen={showReportModal}
                    onClose={() => {
                        setShowReportModal(false);
                        setReportPostId(undefined);
                    }}
                    postId={reportPostId}
                    groupId={groupId}
                />

                {/* Comment Sheet — opens when user taps the comment button on a post */}
                <CommentSheet
                    postId={commentPostId}
                    postAuthorId={commentPostAuthorId}
                    currentUserId={user?.id}
                    postType={commentPostType}
                    onClose={() => setCommentPostId(null)}
                />

                <Modal
                    isOpen={showQRModal}
                    onClose={() => setShowQRModal(false)}
                    size="md"
                >
                    <ModalBackdrop />
                    <ModalContent sx={{ bg: colors.secondary }}>
                        <ModalHeader>
                            <UIHeading size="lg">{t('community.groups.qrTitle', 'Group QR Code')}</UIHeading>
                            <ModalCloseButton>
                                <Icon as={CloseIcon} />
                            </ModalCloseButton>
                        </ModalHeader>
                        <ModalBody>
                            <VStack space="xl" alignItems="center" py="$4">
                                <QRCodeGenerator
                                    value={QRBuilder.group(group.id, group.handle)}
                                    size={240}
                                />
                                <VStack space="xs" alignItems="center">
                                    <Text bold size="xl" textAlign="center">{group.name}</Text>
                                    {group.handle && (
                                        <Text color={colors.textSecondary} size="sm">@{group.handle}</Text>
                                    )}
                                    <Text size="sm" color={colors.textTertiary} textAlign="center" sx={{ mt: '$2', px: '$4' }}>
                                        {t('community.groups.qrHint', 'Scan to join this community group')}
                                    </Text>
                                </VStack>
                            </VStack>
                        </ModalBody>
                        <ModalFooter>
                            <SanctuaryButton
                                variant="outline"
                                action="secondary"
                                onPress={() => setShowQRModal(false)}
                            >
                                {t('common.close')}
                            </SanctuaryButton>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </Box>
        </ScreenWrapper>
    );
}
