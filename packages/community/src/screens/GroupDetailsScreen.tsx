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
import { GroupMemberManagement } from '../components/GroupMemberManagement';
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
    const { can } = usePermissions();
    const user = useStore(state => state.user);
    const colors = useThemedColors();
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

    useEffect(() => {
        const fetchGroup = async () => {
            setLoading(true);
            try {
                // Fetch group details
                const { data, error } = await supabase
                    .from('community_groups')
                    .select('*, creator:users!community_groups_created_by_fkey(full_name, avatar_url)')
                    .eq('id', groupId)
                    .single();

                if (data) {
                    setGroup(data);
                    
                    // Check if current user is a member
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
        // 'create' CommunityGroup is the capability to join/become a member in POA
        const canJoinGroup = can('create', 'CommunityGroup');
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

    // Resume-after-upgrade: if the user attempted to join this group while wandering, replay now.
    useEffect(() => {
        let cancelled = false;
        const maybeReplayJoin = async () => {
            if (!can('create', 'CommunityGroup')) return;
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
    }, [can, groupId, user?.id, isMember, group?.join_policy]);

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

    // Admin: circle creator OR users with management capability over groups
    const isAdmin = group.created_by === user?.id || can('manage', 'CommunityGroup');

    if (showAdmin && isAdmin) {
        return (
            <Box sx={{ flex: 1, backgroundColor: colors.background }}>
                <HStack space="md" sx={{ padding: Theme.spacing.lg, paddingTop: Theme.spacing.xl, alignItems: 'center', backgroundColor: colors.secondary }}>
                    <TouchableOpacity onPress={() => setShowAdmin(false)}>
                        <ChevronLeft color={colors.text} />
                    </TouchableOpacity>
                    <Text sx={{ fontWeight: '700', fontSize: 18, color: colors.text }}>{t('community.groups.manage')}</Text>
                </HStack>
                <GroupMemberManagement groupId={groupId} />
            </Box>
        );
    }

    const renderHeader = () => (
        <VStack space="xl" sx={{ padding: Theme.spacing.lg }}>
            {/* Hero Card */}
            <Animated.View entering={FadeInDown.duration(600).springify()}>
                <SanctuaryCard variant="glass">
                    <VStack space="md">
                        <HStack space="md" sx={{ alignItems: 'center' }}>
                            <Box sx={{
                                width: 64,
                                height: 64,
                                borderRadius: 32,
                                backgroundColor: group.image_url ? 'transparent' : Theme.colors.sanctuarySaffron,
                                justifyContent: 'center',
                                alignItems: 'center',
                                overflow: 'hidden',
                                borderWidth: 2,
                                borderColor: 'rgba(255,255,255,0.15)',
                            }}>
                                {group.image_url ? (
                                    <Image
                                        source={{ uri: group.image_url }}
                                        style={{ width: 64, height: 64, borderRadius: 32 }}
                                    />
                                ) : (
                                    <Text sx={{ fontSize: 24, fontWeight: '700', color: Theme.colors.sacredWhite }}>
                                        {group.name.charAt(0).toUpperCase()}
                                    </Text>
                                )}
                            </Box>
                            <VStack sx={{ flex: 1 }}>
                                <HStack space="sm" sx={{ alignItems: 'center' }}>
                                    <Text sx={{ fontWeight: '700', fontSize: 20, color: Theme.colors.sacredWhite }}>{group.name}</Text>
                                    {group.classroom_id && (
                                        <Box sx={{
                                            paddingHorizontal: 8,
                                            paddingVertical: 2,
                                            backgroundColor: 'rgba(230, 126, 34, 0.15)',
                                            borderRadius: Theme.corners.tight,
                                            borderWidth: 1,
                                            borderColor: Theme.colors.sanctuarySaffron
                                        }}>
                                            <Text sx={{ color: Theme.colors.sanctuarySaffron, fontSize: 10, fontWeight: '800' }}>
                                                CLASS
                                            </Text>
                                        </Box>
                                    )}
                                </HStack>
                                <HStack space="xs" sx={{ alignItems: 'center' }}>
                                    <Users size={14} color={Theme.colors.dimGray} />
                                    <Text sx={{ color: Theme.colors.dimGray, fontSize: 13 }}>
                                        {group.member_count || 0} {t('community.groups.members')}
                                    </Text>
                                </HStack>
                            </VStack>
                        </HStack>

                        <Text sx={{ color: Theme.colors.mistGray, fontSize: 14 }}>
                            {group.description || t('community.groups.noDesc')}
                        </Text>

                        {!isAdmin && (
                            <Box sx={{ marginTop: Theme.spacing.sm }}>
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

            {/* Pinned Resources - Library First */}
            <PinnedResourcesShelf resources={[]} />

            {/* Feed Header */}
            <HStack space="sm" sx={{ alignItems: 'center', marginTop: Theme.spacing.xs }}>
                <MessageSquare size={18} color={Theme.colors.sanctuarySaffron} />
                <Text sx={{ fontWeight: '700', fontSize: 16, color: Theme.colors.sacredWhite }}>
                    {t('community.groups.feed')}
                </Text>
            </HStack>
        </VStack>
    );

    return (
        <ScreenWrapper scroll={false}>
            <Box sx={{ flex: 1 }}>
                {/* Custom Header */}
                <HStack sx={{
                    padding: Theme.spacing.md,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'transparent'
                }}>
                    <HStack space="md" sx={{ alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <ChevronLeft color={colors.text} />
                        </TouchableOpacity>
                        <Text sx={{ fontWeight: '700', fontSize: 18, color: colors.text, maxWidth: 200 }} numberOfLines={1}>
                            {group.name}
                        </Text>
                    </HStack>

                    <HStack space="md" sx={{ alignItems: 'center' }}>
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
                    ListHeaderComponent={renderHeader}
                    renderItem={({ item, index }: { item: any; index: number }) => (
                        <Animated.View entering={FadeInDown.duration(400).delay(index * 150).springify()}>
                            <Box sx={{ paddingHorizontal: Theme.spacing.lg, paddingBottom: Theme.spacing.lg }}>
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
                            <VStack sx={{ padding: Theme.spacing.xl, alignItems: 'center' }} space="md">
                                <Box sx={{ padding: Theme.spacing.lg, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.03)' }}>
                                    <MessageSquare size={32} color={Theme.colors.mistGray} />
                                </Box>
                                <Text sx={{ color: Theme.colors.mistGray, textAlign: 'center' }}>
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

                {commentPostId && (
                    <CommentSheet
                        postId={commentPostId}
                        postAuthorId={commentPostAuthorId}
                        currentUserId={user?.id}
                        postType={commentPostType}
                        onClose={() => setCommentPostId(null)}
                    />
                )}

                <Modal
                    isOpen={showQRModal}
                    onClose={() => setShowQRModal(false)}
                    size="md"
                >
                    <ModalBackdrop />
                    <ModalContent sx={{ backgroundColor: colors.secondary }}>
                        <ModalHeader>
                            <UIHeading sx={{ fontSize: 20 }}>{t('community.groups.qrTitle', 'Group QR Code')}</UIHeading>
                            <ModalCloseButton>
                                <Icon as={CloseIcon} />
                            </ModalCloseButton>
                        </ModalHeader>
                        <ModalBody>
                            <VStack space="xl" sx={{ alignItems: 'center', paddingVertical: Theme.spacing.lg }}>
                                <QRCodeGenerator
                                    value={QRBuilder.group(group.id, group.handle)}
                                    size={240}
                                />
                                <VStack space="xs" sx={{ alignItems: 'center' }}>
                                    <Text sx={{ fontWeight: '700', fontSize: 20, textAlign: 'center', color: colors.text }}>{group.name}</Text>
                                    {group.handle && (
                                        <Text sx={{ color: colors.textSecondary, fontSize: 13 }}>@{group.handle}</Text>
                                    )}
                                    <Text sx={{ fontSize: 13, color: colors.textTertiary, textAlign: 'center', marginTop: Theme.spacing.sm, paddingHorizontal: Theme.spacing.lg }}>
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
