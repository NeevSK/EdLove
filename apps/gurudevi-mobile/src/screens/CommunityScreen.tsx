import React, { useState, useEffect, useMemo } from 'react';
import { RefreshControl, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { Box, VStack, HStack, Text, Pressable, useThemedColors, SkeletonCard, GlobalHeader, ScreenWrapper, PositiveInvitation, Theme } from '@repo/ui';
import LotusPetalFAB from '../components/shared/LotusPetalFAB';
import PostCard from '../components/community/PostCard';
import GroupCard from '../components/community/GroupCard';
import CreatePostModal from '../components/community/CreatePostModal';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Users, PenTool } from 'lucide-react-native';
import { useCommunity, Post, Group } from '@repo/community';
import { useUserRole, useTracking, supabase } from '@repo/core';
import { isDemo } from '../lib/api/demo';
import CommunityPresence from '../components/self/CommunityPresence';
import ManifestoCard from '../components/community/ManifestoCard';
import { useManifestos } from '@repo/community';

type TabType = 'feed' | 'groups';

export default function CommunityScreen() {
    const { t } = useTranslation();
    const { role } = useUserRole();
    const {
        posts,
        groups,
        loading,
        fetchPosts,
        fetchGroups,
        fetchNextPosts,
        hasNextPosts,
        isFetchingNextPosts,
        fetchNextGroups,
        hasNextGroups,
        isFetchingNextGroups
    } = useCommunity();
    const [activeTab, setActiveTab] = useState<TabType>('feed');
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [userId, setUserId] = useState<string | undefined>(undefined);
    const [schoolId, setSchoolId] = useState<string>('mock-school');
    const colors = useThemedColors();
    const { discoverFeature } = useTracking();

    useEffect(() => {
        discoverFeature('section_community');
    }, []);

    const { manifestos, endorse, unendorse } = useManifestos(schoolId, userId);

    // Filtered data for FlatList
    const listData = useMemo(() => (activeTab === 'feed' ? posts : groups), [activeTab, posts, groups]);

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

            {posts.length > 0 && (
                <Text size="sm" color={Theme.colors.mistGray} bold px="$1" mt="$2">
                    {t('community.sections.updates')}
                </Text>
            )}
        </VStack>
    );

    const renderGroupsHeader = () => (
        <VStack space="md" pb="$4">
            {!userId && (
                <PositiveInvitation
                    type="guest"
                    context="community"
                    onAction={() => { }}
                />
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

        if (activeTab === 'feed') {
            if (posts.length === 0 && userId) {
                return (
                    <PositiveInvitation
                        context="community"
                        onAction={() => setShowCreateModal(true)}
                    />
                );
            }
        } else { // groups tab
            if (groups.length === 0 && userId) {
                return (
                    <PositiveInvitation
                        context="community"
                        title={t('community.noGroups', 'No circles found')}
                        description={t('community.noGroupsDesc', 'Connect with others by joining a community group.')}
                    />
                );
            }
        }
        return null;
    };

    const renderItem = ({ item }: { item: any }) => {
        if (activeTab === 'feed') {
            const post = item as Post;
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
                    groupName={groups.find((g: Group) => g.id === post.group_id)?.name}
                    reactions={typeof post.reactions === 'number' ? post.reactions : 0}
                    comments={post.comment_count || 0}
                    onPress={() => console.log('Open Post', post.id)}
                />
            );
        } else {
            const group = item as Group;
            return (
                <GroupCard
                    id={group.id}
                    name={isDemo() ? `(Sample) ${group.name}` : group.name}
                    memberCount={group.member_count}
                    type={group.type as any}
                    description={group.description}
                    onPress={() => console.log('NAVIGATE_TO_GROUP', group.id)}
                />
            );
        }
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

                <FlatList
                    data={listData}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    onEndReached={() => {
                        if (activeTab === 'feed' && hasNextPosts && !isFetchingNextPosts) {
                            fetchNextPosts();
                        } else if (activeTab === 'groups' && hasNextGroups && !isFetchingNextGroups) {
                            fetchNextGroups();
                        }
                    }}
                    onEndReachedThreshold={0.5}
                    ListHeaderComponent={activeTab === 'feed' ? renderFeedHeader : renderGroupsHeader}
                    ListFooterComponent={(isFetchingNextPosts || isFetchingNextGroups) ? (
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

                <LotusPetalFAB
                    currentTab="community"
                    onPress={() => setShowCreateModal(true)}
                    icon={<PenTool color={Theme.colors.white} size={24} />}
                />

                <CreatePostModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                />
            </Box >
        </ScreenWrapper >
    );
}
