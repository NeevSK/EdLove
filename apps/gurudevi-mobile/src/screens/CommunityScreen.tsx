import React, { useState, useEffect } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { Box, VStack, HStack, Text, Pressable, Spinner, useToast, Toast, ToastTitle } from '@repo/ui';
import { GlobalHeader } from '@repo/ui';
import LotusPetalFAB from '../components/shared/LotusPetalFAB';
import PostCard from '../components/community/PostCard';
import GroupCard from '../components/community/GroupCard';
import CreatePostModal from '../components/community/CreatePostModal';
import { SanctuaryInput } from '@repo/ui';
import { Theme, useThemedColors } from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Users, PenTool, Search } from 'lucide-react-native';
import { useCommunity, Group, Post } from '@repo/community';

import { ScreenWrapper } from '@repo/ui';
import { isDemo } from '../lib/api/demo';
import CommunityPresence from '../components/self/CommunityPresence';
import ManifestoCard from '../components/community/ManifestoCard';
import { useManifestos } from '@repo/community';
import { supabase } from '@repo/core';
import { SkeletonCard, PositiveInvitation } from '@repo/ui';

type TabType = 'feed' | 'groups';

export default function CommunityScreen() {
    const { t } = useTranslation();
    const { groups, posts, fetchGroups, fetchPosts, loading, error } = useCommunity();
    const [activeTab, setActiveTab] = useState<TabType>('feed');
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [userId, setUserId] = useState<string | undefined>(undefined);
    const [schoolId, setSchoolId] = useState<string>('mock-school');
    const colors = useThemedColors();

    const { manifestos, endorse, unendorse } = useManifestos(schoolId, userId);

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
        await Promise.all([fetchGroups(), fetchPosts('all')]); // 'all' or specific feed logic
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const renderTabs = () => (
        <HStack space="md" mb="$4" px="$4" py="$1" pt="$4" sx={{ padding: 5 }}>
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

    return (
        <ScreenWrapper>
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

                {/* Removed the search box from here, it's now in the header */}

                <ScrollView
                    contentContainerStyle={{ paddingHorizontal: Theme.spacing.md, paddingBottom: 100 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.sanctuarySaffron} />
                    }
                >
                    {loading && !refreshing ? (
                        <VStack space="md" py="$4">
                            <SkeletonCard height={80} />
                            <SkeletonCard height={200} />
                            <SkeletonCard height={200} />
                        </VStack>
                    ) : activeTab === 'feed' ? (
                        <VStack space="md">
                            {/* THE RELATIONAL WEAVER - Presence & Manifestos */}
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

                            {posts.length === 0 && userId && (
                                <PositiveInvitation
                                    context="community"
                                    onAction={() => setShowCreateModal(true)}
                                />
                            )}

                            {posts.map((post: Post) => (
                                <PostCard
                                    key={post.id}
                                    id={post.id}
                                    content={post.content}
                                    type={post.post_type as any}
                                    author={{
                                        id: post.author_id,
                                        name: isDemo() ? `(Sample) ${post.author_name}` : post.author_name,
                                        avatarUrl: post.author_avatar,
                                    }}
                                    createdAt={post.created_at}
                                    groupName={groups.find((g: Group) => g.id === post.group_id)?.name}
                                    reactions={Object.values(post.reactions || {}).reduce((a: number, b: any) => a + (typeof b === 'number' ? b : 0), 0)}
                                    comments={0}
                                    onPress={() => console.log('Open Post', post.id)}
                                />
                            ))}
                        </VStack>
                    ) : (
                        <VStack space="md">
                            {!userId && (
                                <PositiveInvitation
                                    type="guest"
                                    context="community"
                                    onAction={() => { }}
                                />
                            )}

                            {groups.length === 0 && userId && (
                                <PositiveInvitation
                                    context="community"
                                    title={t('community.noGroups', 'No circles found')}
                                    description={t('community.noGroupsDesc', 'Connect with others by joining a community group.')}
                                />
                            )}

                            {groups.map((group: Group) => (
                                <GroupCard
                                    key={group.id}
                                    {...group}
                                    name={isDemo() ? `(Sample) ${group.name}` : group.name}
                                    memberCount={group.member_count}
                                    onPress={() => console.log('NAVIGATE_TO_GROUP', group.id)}
                                    type={group.type as any}
                                />
                            ))}
                        </VStack>
                    )}
                </ScrollView>

                <LotusPetalFAB
                    currentTab="community"
                    onPress={() => setShowCreateModal(true)}
                    icon={<PenTool color={Theme.colors.white} size={24} />}
                />

                <CreatePostModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                />
            </Box>
        </ScreenWrapper>
    );
}
