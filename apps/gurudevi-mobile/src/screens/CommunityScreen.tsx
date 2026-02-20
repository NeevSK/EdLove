import React, { useState, useEffect, useMemo } from 'react';
import { RefreshControl, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { Box, VStack, HStack, Text, Pressable, useThemedColors, SkeletonCard, GlobalHeader, ScreenWrapper, PositiveInvitation, Theme } from '@repo/ui';
import LotusPetalFAB from '../components/shared/LotusPetalFAB';
import PostCard from '../components/community/PostCard';
import CreatePostModal from '../components/community/CreatePostModal';
import GroupsScreen from './community/GroupsScreen';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Users, PenTool } from 'lucide-react-native';
import { useCommunity, Post, Group } from '@repo/community';
import { useUserRole, useRoleFeatures, useTracking, supabase } from '@repo/core';
import { isDemo } from '../lib/api/demo';
import CommunityPresence from '../components/self/CommunityPresence';
import ManifestoCard from '../components/community/ManifestoCard';
import { useManifestos } from '@repo/community';

type TabType = 'feed' | 'groups';

type FeedFilter = 'all' | string;

export default function CommunityScreen() {
    const { t } = useTranslation();
    const { role } = useUserRole();
    const { isGuest } = useRoleFeatures();
    const {
        posts,
        groups,
        loading,
        fetchPosts,
        fetchGroups,
        fetchNextPosts,
        hasNextPosts,
        isFetchingNextPosts,
    } = useCommunity();
    const [activeTab, setActiveTab] = useState<TabType>('feed');
    const [activeFeedFilter, setActiveFeedFilter] = useState<FeedFilter>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createPostGroupId, setCreatePostGroupId] = useState<string | undefined>(undefined);
    const [userId, setUserId] = useState<string | undefined>(undefined);
    const [schoolId, setSchoolId] = useState<string>('mock-school');
    const colors = useThemedColors();
    const { discoverFeature } = useTracking();

    useEffect(() => {
        discoverFeature('section_community');
    }, []);

    const { manifestos, endorse, unendorse } = useManifestos(schoolId, userId);

    // Filtered data for FlatList (feed only - groups tab delegated to GroupsScreen)
    const listData = useMemo(() => posts, [posts]);

    // Derived feed filter chips: "All Updates" + one chip per joined group
    const feedFilterChips = useMemo(() => {
        const chips: { label: string; value: FeedFilter }[] = [
            { label: t('community.filters.allUpdates', 'All Updates'), value: 'all' }
        ];
        groups.slice(0, 6).forEach((g: Group) => {
            chips.push({ label: g.name, value: g.id });
        });
        return chips;
    }, [groups, t]);

    // Initial data load
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                setSchoolId(user.user_metadata?.school_id || 'mock-school');
            }
        } catch (e) {
            console.error('Auth error in CommunityScreen', e);
        }
        await Promise.all([fetchGroups(), fetchPosts('all')]);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const handleOpenCreatePost = (groupId?: string) => {
        setCreatePostGroupId(groupId);
        setShowCreateModal(true);
    };

    const renderFeedFilterChips = () => (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: Theme.spacing.md, paddingBottom: Theme.spacing.sm }}
        >
            <HStack space="sm">
                {feedFilterChips.map((chip) => {
                    const isActive = activeFeedFilter === chip.value;
                    return (
                        <Pressable
                            key={chip.value}
                            onPress={() => setActiveFeedFilter(chip.value)}
                            sx={{
                                paddingHorizontal: Theme.spacing.md,
                                paddingVertical: Theme.spacing.xs,
                                backgroundColor: isActive ? Theme.colors.sanctuarySaffron : colors.secondary,
                                borderRadius: Theme.corners.full,
                                borderWidth: 1,
                                borderColor: isActive ? Theme.colors.sanctuarySaffron : colors.border,
                            }}
                        >
                            <Text
                                size="sm"
                                bold={isActive}
                                color={isActive ? Theme.colors.white : colors.textSecondary}
                            >
                                {chip.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </HStack>
        </ScrollView>
    );

    const renderTabs = () => (
        <HStack space="md" mb="$4" px="$4" py="$1" pt="$4">
            <Pressable
                onPress={() => setActiveTab('feed')}
                sx={{
                    flex: 1,
                    padding: Theme.spacing.md,
                    backgroundColor: activeTab === 'feed' ? Theme.colors.sanctuarySaffron : colors.secondary,
                    borderRadius: Theme.corners.comfortable,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: activeTab === 'feed' ? Theme.colors.sanctuarySaffron : colors.border
                }}
            >
                <HStack space="sm" alignItems="center">
                    <MessageSquare size={16} color={activeTab === 'feed' ? Theme.colors.white : colors.textSecondary} />
                    <Text color={activeTab === 'feed' ? Theme.colors.white : colors.text} bold>{t('community.feed')}</Text>
                </HStack>
            </Pressable>
            <Pressable
                onPress={() => setActiveTab('groups')}
                sx={{
                    flex: 1,
                    padding: Theme.spacing.md,
                    backgroundColor: activeTab === 'groups' ? Theme.colors.sanctuarySaffron : colors.secondary,
                    borderRadius: Theme.corners.comfortable,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: activeTab === 'groups' ? Theme.colors.sanctuarySaffron : colors.border
                }}
            >
                <HStack space="sm" alignItems="center">
                    <Users size={16} color={activeTab === 'groups' ? Theme.colors.white : colors.textSecondary} />
                    <Text color={activeTab === 'groups' ? Theme.colors.white : colors.text} bold>{t('community.groups')}</Text>
                </HStack>
            </Pressable>
        </HStack>
    );

    const renderFeedHeader = () => (
        <VStack space="md" pb="$4">
            {userId && <CommunityPresence compact={false} userVibe="planning" />}

            {!userId && (
                <PositiveInvitation
                    type="guest"
                    context="community"
                    onAction={() => { }} // TODO: Navigate to Auth
                />
            )}

            {userId && manifestos.length > 0 && (
                <VStack space="sm">
                    <Text size="sm" color={Theme.colors.mistGray} bold px="$1">
                        {t('community.sections.vision')}
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <HStack space="md">
                            {manifestos.map((m) => (
                                <Box key={m.id} w={300}>
                                    <ManifestoCard
                                        {...m}
                                        onEndorse={(mid) => {
                                            if (m.has_endorsed) unendorse(mid);
                                            else endorse({ manifestoId: mid });
                                        }}
                                    />
                                </Box>
                            ))}
                        </HStack>
                    </ScrollView>
                </VStack>
            )}

            {/* Feed Context Filter Chips */}
            {renderFeedFilterChips()}

            {posts.length > 0 && (
                <Text size="sm" color={Theme.colors.mistGray} bold px="$1" mt="$2">
                    {t('community.sections.updates')}
                </Text>
            )}
        </VStack>
    );

    const getEmptyListComponent = () => {
        if (loading && !refreshing) {
            return (
                <VStack space="md" py="$4">
                    <SkeletonCard height={80} />
                    <SkeletonCard height={200} />
                    <SkeletonCard height={200} />
                </VStack>
            );
        }

        if (posts.length === 0 && userId) {
            return (
                <PositiveInvitation
                    context="community"
                    onAction={() => handleOpenCreatePost()}
                />
            );
        }
        return null;
    };

    const renderItem = ({ item }: { item: any }) => {
        const post = item as Post;
        const postGroup = groups.find((g: Group) => g.id === post.group_id);
        const isInterSchool = postGroup?.school_id === undefined;
        const groupName = postGroup
            ? (isDemo() ? `(Sample) ${postGroup.name}` : postGroup.name)
            : undefined;
        return (
            <PostCard
                id={post.id}
                author={{
                    id: post.author_id,
                    name: isDemo() ? `(Sample) ${post.author_name}` : post.author_name,
                    avatarUrl: post.author_avatar,
                    role: post.author_role
                }}
                content={post.content}
                type={post.post_type as any}
                createdAt={post.created_at}
                groupName={groupName}
                isInterSchool={isInterSchool && !!postGroup}
                reactions={typeof post.reactions === 'number' ? post.reactions : 0}
                comments={post.comment_count || 0}
                onPress={() => console.log('Open Post', post.id)}
            />
        );
    };

    return (
        <ScreenWrapper scroll={false}>
            <GlobalHeader
                title={t('tabs.community') || 'Community'}
                subtitle={t('community.subtitle') || "Connect & Grow"}
                searchProps={{
                    value: searchQuery,
                    onChangeText: setSearchQuery,
                    placeholder: activeTab === 'feed' ? "Search posts..." : "Search groups..."
                }}
            />

            <Box sx={{ flex: 1, backgroundColor: colors.primary }}>
                {renderTabs()}

                {activeTab === 'feed' ? (
                    <FlatList
                        data={listData}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        onEndReached={() => {
                            if (hasNextPosts && !isFetchingNextPosts) {
                                fetchNextPosts();
                            }
                        }}
                        onEndReachedThreshold={0.5}
                        ListHeaderComponent={renderFeedHeader}
                        ListFooterComponent={isFetchingNextPosts ? (
                            <ActivityIndicator size="small" color={colors.action} style={{ padding: 20 }} />
                        ) : null}
                        ListEmptyComponent={getEmptyListComponent()}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor={colors.action}
                            />
                        }
                        contentContainerStyle={{ paddingHorizontal: Theme.spacing.md, paddingBottom: 100 }}
                    />
                ) : (
                    <GroupsScreen
                        userId={userId}
                        onCreatePost={handleOpenCreatePost}
                        onNavigateToGroup={(group: Group) => {
                            // TODO: Implement actual navigation to a group details screen.
                            // This placeholder preserves current behavior while wiring the prop.
                            console.log('Navigate to group requested:', group.id);
                        }}
                    />
                )}

                <LotusPetalFAB
                    currentTab="community"
                    onPress={() => handleOpenCreatePost()}
                    icon={<PenTool color={Theme.colors.white} size={24} />}
                />

                <CreatePostModal
                    isOpen={showCreateModal}
                    onClose={() => { setShowCreateModal(false); setCreatePostGroupId(undefined); }}
                    groupId={createPostGroupId}
                />
            </Box >
        </ScreenWrapper >
    );
}
