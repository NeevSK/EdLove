import React, { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    ScreenWrapper,
    FadeInDown,
    SanctuaryCard,
    SanctuaryButton,
    SanctuaryFlashList,
    useLotusToast,
    Theme,
    Spinner,
    Image,
    Pressable,
    Modal,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Heading as UIHeading
} from '@repo/ui';
import {
    ChevronLeft,
    Users,
    Settings,
    MoreVertical,
    UserPlus,
    MessageSquare,
    QrCode,
    X
} from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCommunity } from '../hooks/useCommunity';
import GroupMemberManagement from '../components/GroupMemberManagement';
import { PinnedResourcesShelf } from '../components/PinnedResourcesShelf';
import { clearPendingGateAction, getPendingGateAction, setPendingGateAction, useStore, supabase, type CommunityStackParamList } from '@repo/core';
import { usePermissions } from '@repo/core';
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
    const { can } = usePermissions();
    const user = useStore(state => state.user);
    const { showToast } = useLotusToast();
    const { joinGroup, isJoiningGroup, posts, fetchPosts } = useCommunity();

    const [group, setGroup] = useState<any>(null);
    const [isMember, setIsMember] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showAdmin, setShowAdmin] = useState(false);
    const [reportPostId, setReportPostId] = useState<string | undefined>(undefined);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [commentPostId, setCommentPostId] = useState<string | null>(null);
    const [commentPostAuthorId, setCommentPostAuthorId] = useState<string | undefined>();
    const [commentPostType, setCommentPostType] = useState<string | undefined>();
    const canJoinGroup = can('create', 'Group') || can('create', 'CommunityGroup');
    const canManageGroup = can('manage', 'Group') || can('manage', 'CommunityGroup');

    useEffect(() => {
        const fetchGroup = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('community_groups')
                    .select('*, creator:users!community_groups_created_by_fkey(full_name, avatar_url)')
                    .eq('id', groupId)
                    .single();

                if (data) {
                    setGroup(data);
                    
                    if (user?.id) {
                        const { data: memberData } = await supabase
                            .from('community_group_members')
                            .select('id')
                            .eq('group_id', groupId)
                            .eq('user_id', user.id)
                            .maybeSingle();
                        
                        setIsMember(!!memberData);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchGroup();
        fetchPosts(groupId);
    }, [groupId, user?.id, fetchPosts]);

    const handleJoin = async () => {
        if (!canJoinGroup || !user?.id) {
            await setPendingGateAction({ kind: 'community_join_group', createdAt: Date.now(), groupId, joinPolicy: group?.join_policy || 'open' });
            showToast({
                message: t('community.groups.joinAuthRequired') || "To join this group, let's create an account first!",
            });
            navigation.navigate('Auth' as any);
            return;
        }

        try {
            await joinGroup({ groupId, userId: user.id, joinPolicy: group?.join_policy || 'open' });
            
            if (group?.join_policy === 'open') {
                setIsMember(true);
                showToast({
                    message: t('community.groups.joinedSuccess') || 'Welcome to the circle!',
                    type: 'success'
                });
            } else {
                showToast({
                    message: t('community.groups.joinRequested'),
                    type: 'success'
                });
            }
        } catch (err) {
            showToast({
                message: t('common.error'),
                type: 'error'
            });
        }
    };

    useEffect(() => {
        let cancelled = false;
        const maybeReplayJoin = async () => {
            if (!canJoinGroup) return;
            if (!user?.id) return;
            if (isMember) return;
            const pending = await getPendingGateAction();
            if (!pending || pending.kind !== 'community_join_group') return;
            if (pending.groupId !== groupId) return;
            if (cancelled) return;
            await clearPendingGateAction();
            await handleJoin();
        };
        maybeReplayJoin().catch(() => { });
        return () => { cancelled = true; };
    }, [canJoinGroup, groupId, user?.id, isMember, group?.join_policy]);

    if (loading) {
        return (
            <ScreenWrapper>
                <Box className="flex-1 justify-center items-center">
                    <Spinner size="large" />
                </Box>
            </ScreenWrapper>
        );
    }

    if (!group) return null;

    const isAdmin = group.created_by === user?.id || canManageGroup;

    if (showAdmin && isAdmin) {
        return (
            <Box className="flex-1 bg-background">
                <HStack className="p-4 pt-10 items-center bg-surface-low gap-4">
                    <Pressable onPress={() => setShowAdmin(false)}>
                        <ChevronLeft color="#FFFFFF" />
                    </Pressable>
                    <Text className="font-bold text-lg text-foreground">{t('community.groups.manage')}</Text>
                </HStack>
                <GroupMemberManagement groupId={groupId} />
            </Box>
        );
    }

    const renderHeader = () => (
        <VStack className="p-4 gap-6">
            <Animated.View entering={FadeInDown.duration(600).springify()}>
                <SanctuaryCard className="bg-surface-lowest">
                    <VStack className="gap-4">
                        <HStack className="items-center gap-4">
                            <Box className={`w-16 h-16 rounded-full justify-center items-center overflow-hidden border-2 border-outline/15 ${group.image_url ? 'bg-transparent' : 'bg-primary-500'}`}>
                                {group.image_url ? (
                                    <Image
                                        source={{ uri: group.image_url }}
                                        className="w-16 h-16 rounded-full"
                                    />
                                ) : (
                                    <Text className="text-2xl font-bold text-white">
                                        {group.name.charAt(0).toUpperCase()}
                                    </Text>
                                )}
                            </Box>
                            <VStack className="flex-1">
                                <HStack className="items-center gap-2">
                                    <Text className="font-bold text-xl text-foreground">{group.name}</Text>
                                    {group.classroom_id && (
                                        <Box className="px-2 py-0.5 bg-primary-500/15 rounded-sm border border-primary-500">
                                            <Text className="text-primary-500 text-[10px] font-extrabold uppercase">
                                                CLASS
                                            </Text>
                                        </Box>
                                    )}
                                </HStack>
                                <HStack className="items-center gap-1">
                                    <Users size={14} color="rgba(255,255,255,0.6)" />
                                    <Text className="text-muted-foreground text-[13px]">
                                        {group.member_count || 0} {t('community.groups.members')}
                                    </Text>
                                </HStack>
                            </VStack>
                        </HStack>

                        <Text className="text-muted-foreground text-sm">
                            {group.description || t('community.groups.noDesc')}
                        </Text>

                        {!isAdmin && (
                            <Box className="mt-2">
                                <SanctuaryButton
                                    action={isMember ? "secondary" : "primary"}
                                    variant={isMember ? "outline" : "solid"}
                                    onPress={isMember ? () => {} : handleJoin}
                                    isLoading={isJoiningGroup}
                                    leftIcon={isMember ? Users : UserPlus}
                                    isDisabled={isMember}
                                >
                                    {isMember ? (t('community.groups.member') || 'Member') : t('community.groups.join')}
                                </SanctuaryButton>
                            </Box>
                        )}
                    </VStack>
                </SanctuaryCard>
            </Animated.View>

            <PinnedResourcesShelf resources={[]} />

            <HStack className="items-center mt-1 gap-2">
                <MessageSquare size={18} color="#E67E22" />
                <Text className="font-bold text-base text-foreground">
                    {t('community.groups.feed')}
                </Text>
            </HStack>
        </VStack>
    );

    return (
        <ScreenWrapper scroll={false}>
            <Box className="flex-1">
                {/* Custom Header */}
                <HStack className="p-4 items-center justify-between bg-transparent">
                    <HStack className="items-center gap-4">
                        <Pressable onPress={() => navigation.goBack()}>
                            <ChevronLeft color="#FFFFFF" />
                        </Pressable>
                        <Text className="font-bold text-lg text-foreground max-w-[200px]" numberOfLines={1}>
                            {group.name}
                        </Text>
                    </HStack>

                    <HStack className="items-center gap-4">
                        <Pressable onPress={() => navigation.navigate('GroupChat', { groupId, groupName: group.name })}>
                            <MessageSquare size={20} color="rgba(255,255,255,0.6)" />
                        </Pressable>
                        {isAdmin && (
                            <Pressable onPress={() => setShowAdmin(true)}>
                                <Settings size={20} color="rgba(255,255,255,0.6)" />
                            </Pressable>
                        )}
                        <Pressable onPress={() => setShowQRModal(true)}>
                            <QrCode size={20} color="rgba(255,255,255,0.6)" />
                        </Pressable>
                        <Pressable>
                            <MoreVertical size={20} color="rgba(255,255,255,0.6)" />
                        </Pressable>
                    </HStack>
                </HStack>

                <SanctuaryFlashList
                    data={posts}
                    estimatedItemSize={280}
                    ListHeaderComponent={renderHeader}
                    renderItem={({ item, index }) => (
                        <Animated.View entering={FadeInDown.duration(400).delay(index * 150).springify()}>
                            <Box className="px-4 pb-4">
                                <PostCard
                                    post={item}
                                    currentUserId={user?.id}
                                    onPress={() => {}}
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
                    ListEmptyComponent={
                        posts.length === 0 ? (
                            <VStack className="p-8 items-center gap-4">
                                <Box className="p-6 rounded-full bg-white/5">
                                    <MessageSquare size={32} color="rgba(255,255,255,0.4)" />
                                </Box>
                                <Text className="text-muted-foreground text-center">
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
                >
                    <ModalContent className="bg-surface-low">
                        <ModalHeader>
                            <UIHeading className="text-xl">{t('community.groups.qrTitle', 'Group QR Code')}</UIHeading>
                            <ModalCloseButton>
                                <Pressable onPress={() => setShowQRModal(false)}>
                                    <X size={20} color="#FFFFFF" />
                                </Pressable>
                            </ModalCloseButton>
                        </ModalHeader>
                        <ModalBody>
                            <VStack className="items-center py-6 gap-6">
                                <QRCodeGenerator
                                    value={QRBuilder.group(group.id, group.handle)}
                                    size={240}
                                />
                                <VStack className="items-center gap-1">
                                    <Text className="font-bold text-xl text-center text-foreground">{group.name}</Text>
                                    {group.handle && (
                                        <Text className="text-muted-foreground text-[13px]">@{group.handle}</Text>
                                    )}
                                    <Text className="text-[13px] text-muted-foreground text-center mt-2 px-6">
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
                                {t('common.close') || 'Close'}
                            </SanctuaryButton>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </Box>
        </ScreenWrapper>
    );
}
