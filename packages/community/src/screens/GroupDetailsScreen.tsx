import React, { useState, useEffect } from 'react';
import { View, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
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
    useLotusToast
} from '@repo/ui';
import {
    ChevronLeft,
    Users,
    Shield,
    Settings,
    MoreVertical,
    UserPlus,
    MessageSquare
} from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCommunity } from '../hooks/useCommunity';
import { Group, Post } from '../types';
import GroupMemberManagement from '../components/GroupMemberManagement';
import { PinnedResourcesShelf } from '../components/PinnedResourcesShelf';
import { useUserRole, useStore, supabase, CommunityStackParamList } from '@repo/core';
// @ts-ignore
import { isDemo } from '@repo/core';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import PostCard from '../components/PostCard';
import ReportPostModal from '../components/ReportPostModal';

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
                message: t('community.groups.joinRequested', 'Request to join this circle has been sent.'),
                type: 'success'
            });
        } catch (err) {
            showToast({
                message: t('common.error', 'Something went wrong.'),
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
                    <Text bold size="lg">{t('community.groups.manage', 'Circle Management')}</Text>
                </HStack>
                <GroupMemberManagement groupId={groupId} />
            </Box>
        );
    }

    return (
        <ScreenWrapper>
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
                        <TouchableOpacity>
                            <MoreVertical size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </HStack>
                </HStack>

                <FlatList
                    data={[]}
                    renderItem={() => null}
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
                                                        {group.member_count || 0} {t('community.groups.members', 'Members')}
                                                    </Text>
                                                </HStack>
                                            </VStack>
                                        </HStack>

                                        <Text color={Theme.colors.mistGray} size="sm">
                                            {group.description || t('community.groups.noDesc', 'A space for collective learning and support.')}
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
                                                    {t('community.groups.join', 'Join this Circle')}
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
                                    {t('community.groups.feed', 'Resonant Feed')}
                                </Text>
                            </HStack>

                            <VStack space="md" mt="$2">
                                {posts.map((post: Post) => (
                                    <PostCard
                                        key={post.id}
                                        post={post}
                                        onPress={() => console.log('OPEN_POST', post.id)}
                                        onReport={() => {
                                            setReportPostId(post.id);
                                            setShowReportModal(true);
                                        }}
                                    />
                                ))}
                            </VStack>
                        </VStack>
                    }
                    ListEmptyComponent={
                        posts.length === 0 ? (
                            <VStack p="$8" alignItems="center" space="md">
                                <Box sx={{ p: '$4', borderRadius: '$full', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                                    <MessageSquare size={32} color={Theme.colors.mistGray} />
                                </Box>
                                <Text color={Theme.colors.mistGray} textAlign="center">
                                    {t('community.groups.emptyFeed', 'The conversation is waiting to blossom. Be the first to share.')}
                                </Text>
                            </VStack>
                        ) : null
                    }
                />

                <ReportPostModal
                    isOpen={showReportModal}
                    onClose={() => {
                        setShowReportModal(false);
                        setReportPostId(undefined);
                    }}
                    postId={reportPostId}
                    groupId={groupId}
                    reporterId={user?.id || ''}
                />
            </Box>
        </ScreenWrapper>
    );
}
