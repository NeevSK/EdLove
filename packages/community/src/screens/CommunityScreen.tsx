import React, { useState, useEffect, useMemo } from 'react';
import { RefreshControl, FlatList, ActivityIndicator } from 'react-native';
import { Box, VStack, HStack, Text, Pressable, useThemedColors, SkeletonCard, GlobalHeader, ScreenWrapper, PositiveInvitation, Theme, useBottomTabPadding, LotusPetalFAB, FadeInDown, HorizontalChipRow } from '@repo/ui';
import Animated from 'react-native-reanimated';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import ReportPostModal from '../components/ReportPostModal';
import GroupsScreen from './GroupsScreen';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Users, PenTool } from 'lucide-react-native';
import { useCommunity, Post, Group, useCommunityFilters } from '@repo/community';
import { useUserRole, useTracking, supabase, isDemo } from '@repo/core';
import { CommunityPresence } from '@repo/self';
import ManifestoCard from '../components/ManifestoCard';
import CommunityHearth from '../components/CommunityHearth';
import { useManifestos } from '@repo/community';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommunityStackParamList } from '@repo/core';

type TabType = 'feed' | 'groups';

type FeedFilter = 'all' | string;

export default function CommunityScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<NativeStackNavigationProp<CommunityStackParamList>>();
    const { role: userRole, schoolId, userId, isGuest } = useUserRole();
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
    const [reportPostId, setReportPostId] = useState<string | undefined>(undefined);
    const [showReportModal, setShowReportModal] = useState(false);
    const colors = useThemedColors();
    const { discoverFeature } = useTracking();
    const bottomPadding = useBottomTabPadding();

    useEffect(() => {
        discoverFeature('section_community');
    }, []);

    const { manifestos, endorse, unendorse } = useManifestos(schoolId, userId ?? undefined);

    // Filtered data for FlatList
    const listData = useMemo(() => posts, [posts]);

    // Derived feed filter chips via shared hook
    const feedFilterChips = useCommunityFilters(groups, t('community.filters.allUpdates', 'All Updates'));

    // Initial data load
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
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
        <Animated.View entering={FadeInDown.delay(300).springify()}>
            <HorizontalChipRow
                chips={feedFilterChips}
                selectedValue={activeFeedFilter}
                onSelect={(value) => {
                    setActiveFeedFilter(value);
                    fetchPosts(value);
                }}
            />
        </Animated.View>
    );

    const renderCommunityHearth = () => {
        return (
            <Box mt="$4">
                <CommunityHearth
                    manifestos={manifestos}
                    userRole={userRole}
                    userId={userId || 'guest'}
                    onPressSpotlight={(postId) => {
                        // Spotlight usually leads to a specific post view or group
                        console.log('Spotlight pressed:', postId);
                    }}
                />
            </Box>
        );
    };

    return (
        <ScreenWrapper scroll={false}>
            <Box sx={{ flex: 1, backgroundColor: colors.secondary }}>
                <GlobalHeader title={t('community.title', 'Heal & Bloom')} />

                {/* Sub-Tabs */}
                <Animated.View entering={FadeInDown.delay(150).springify()}>
                    <HStack
                        sx={{
                            paddingHorizontal: Theme.spacing.md,
                            paddingVertical: Theme.spacing.sm,
                            gap: Theme.spacing.md,
                        }}
                    >
                        <Pressable
                            onPress={() => setActiveTab('feed')}
                            sx={{
                                borderBottomWidth: activeTab === 'feed' ? 2 : 0,
                                borderBottomColor: Theme.colors.sanctuarySaffron,
                                paddingBottom: 4,
                            }}
                        >
                            <HStack space="xs" alignItems="center">
                                <MessageSquare
                                    size={18}
                                    color={activeTab === 'feed' ? Theme.colors.sanctuarySaffron : colors.textTertiary}
                                />
                                <Text
                                    bold={activeTab === 'feed'}
                                    color={activeTab === 'feed' ? colors.textPrimary : colors.textTertiary}
                                >
                                    {t('community.tabs.resonantFeed', 'Resonant Feed')}
                                </Text>
                            </HStack>
                        </Pressable>

                        <Pressable
                            onPress={() => setActiveTab('groups')}
                            sx={{
                                borderBottomWidth: activeTab === 'groups' ? 2 : 0,
                                borderBottomColor: Theme.colors.gurudeviViolet,
                                paddingBottom: 4,
                            }}
                        >
                            <HStack space="xs" alignItems="center">
                                <Users
                                    size={18}
                                    color={activeTab === 'groups' ? Theme.colors.gurudeviViolet : colors.textTertiary}
                                />
                                <Text
                                    bold={activeTab === 'groups'}
                                    color={activeTab === 'groups' ? colors.textPrimary : colors.textTertiary}
                                >
                                    {t('community.tabs.infiniteGalaxy', 'Infinite Galaxy')}
                                </Text>
                            </HStack>
                        </Pressable>
                    </HStack>
                </Animated.View>

                {activeTab === 'feed' ? (
                    <FlatList
                        data={listData}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item, index }) => (
                            <Animated.View entering={FadeInDown.duration(400).delay(index * 150).springify()}>
                                <PostCard
                                    post={item}
                                    onPress={() => { }}
                                    onReport={() => {
                                        setReportPostId(item.id);
                                        setShowReportModal(true);
                                    }}
                                    isSample={item.id.startsWith('stub-') || item.id.startsWith('mock-')}
                                    currentUserId={userId ?? undefined}
                                />
                            </Animated.View>
                        )}
                        ListHeaderComponent={
                            <VStack space="md" sx={{ paddingVertical: Theme.spacing.md }}>
                                {renderCommunityHearth()}
                                {renderFeedFilterChips()}
                            </VStack>
                        }
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.sanctuarySaffron} />
                        }
                        onEndReached={() => hasNextPosts && fetchNextPosts()}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={
                            isFetchingNextPosts ? (
                                <ActivityIndicator style={{ marginVertical: 20 }} color={Theme.colors.sanctuarySaffron} />
                            ) : null
                        }
                        contentContainerStyle={{ paddingBottom: bottomPadding + 80 }}
                        ListEmptyComponent={
                            !loading ? (
                                <Box alignItems="center" justifyContent="center" py="$20">
                                    <Text color={colors.textTertiary}>{t('community.feed.empty', 'No updates in this layer yet.')}</Text>
                                </Box>
                            ) : null
                        }
                    />
                ) : (
                    <GroupsScreen
                        userId={userId ?? undefined}
                        schoolId={schoolId}
                        onCreatePost={handleOpenCreatePost}
                        onNavigateToGroup={(groupId: string) => {
                            navigation.navigate('GroupDetails', { groupId });
                        }}
                    />
                )}

                {userId && (
                    <LotusPetalFAB
                        currentTab="community"
                        onPress={() => handleOpenCreatePost()}
                    />
                )}

                <CreatePostModal
                    isOpen={showCreateModal}
                    onClose={() => { setShowCreateModal(false); setCreatePostGroupId(undefined); }}
                    groupId={createPostGroupId}
                />

                <ReportPostModal
                    isOpen={showReportModal}
                    onClose={() => { setShowReportModal(false); setReportPostId(undefined); }}
                    postId={reportPostId}
                    reporterId={userId || ''}
                />
            </Box >
        </ScreenWrapper >
    );
}
