import React, { useState, useEffect } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { Box, VStack, HStack, Text, Pressable, Spinner, useToast, Toast, ToastTitle } from "@gluestack-ui/themed";
import GlobalHeader from '../components/shared/GlobalHeader';
import LotusPetalFAB from '../components/shared/LotusPetalFAB';
import PostCard from '../components/community/PostCard';
import GroupCard from '../components/community/GroupCard';
import CreatePostModal from '../components/community/CreatePostModal';
import SanctuaryInput from '../components/shared/SanctuaryInput';
import { Theme } from '../constants/Theme';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Users, PenTool, Search } from 'lucide-react-native';
import { useCommunity, Group, Post } from '../hooks/useCommunity';

type TabType = 'feed' | 'groups';

export default function CommunityScreen() {
    const { t } = useTranslation();
    const { groups, posts, fetchGroups, fetchPosts, loading, error } = useCommunity();
    const [activeTab, setActiveTab] = useState<TabType>('feed');
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Initial data load
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        await Promise.all([fetchGroups(), fetchPosts('all')]); // 'all' or specific feed logic
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const renderTabs = () => (
        <HStack space="md" mb="$4" px="$4">
            <Pressable
                onPress={() => setActiveTab('feed')}
                sx={{
                    flex: 1,
                    padding: Theme.spacing.md,
                    backgroundColor: activeTab === 'feed' ? Theme.colors.sanctuarySaffron : Theme.colors.deepIndigo,
                    borderRadius: Theme.corners.comfortable,
                    alignItems: 'center'
                }}
            >
                <HStack space="sm" alignItems="center">
                    <MessageSquare size={16} color={activeTab === 'feed' ? Theme.colors.white : Theme.colors.mistGray} />
                    <Text color={activeTab === 'feed' ? Theme.colors.white : Theme.colors.mistGray} bold>Feed</Text>
                </HStack>
            </Pressable>
            <Pressable
                onPress={() => setActiveTab('groups')}
                sx={{
                    flex: 1,
                    padding: Theme.spacing.md,
                    backgroundColor: activeTab === 'groups' ? Theme.colors.sanctuarySaffron : Theme.colors.deepIndigo,
                    borderRadius: Theme.corners.comfortable,
                    alignItems: 'center'
                }}
            >
                <HStack space="sm" alignItems="center">
                    <Users size={16} color={activeTab === 'groups' ? Theme.colors.white : Theme.colors.mistGray} />
                    <Text color={activeTab === 'groups' ? Theme.colors.white : Theme.colors.mistGray} bold>Groups</Text>
                </HStack>
            </Pressable>
        </HStack>
    );

    return (
        <Box sx={{ flex: 1, backgroundColor: Theme.colors.voidIndigo }}>
            <GlobalHeader
                title={t('tabs.community') || 'Community'}
                subtitle="Connect & Grow"
            />

            {renderTabs()}

            <Box px="$4" mb="$4">
                <SanctuaryInput
                    placeholder={activeTab === 'feed' ? "Search posts..." : "Search groups..."}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    leftIcon={Search}
                />
            </Box>

            <ScrollView
                contentContainerStyle={{ paddingHorizontal: Theme.spacing.md, paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.sanctuarySaffron} />
                }
            >
                {loading && !refreshing ? (
                    <Box py="$10">
                        <Spinner color={Theme.colors.sanctuarySaffron} />
                    </Box>
                ) : activeTab === 'feed' ? (
                    <VStack space="md">
                        {posts.map((post: Post) => (
                            <PostCard
                                key={post.id}
                                id={post.id}
                                content={post.content}
                                type={post.type}
                                author={{
                                    id: post.author_id,
                                    name: post.author_name,
                                    avatarUrl: post.author_avatar,
                                }}
                                createdAt={post.created_at}
                                groupName={groups.find((g: Group) => g.id === post.group_id)?.name}
                                reactions={Object.values(post.reactions || {}).reduce((a, b) => a + b, 0)}
                                comments={0}
                                onPress={() => console.log('Open Post', post.id)}
                            />
                        ))}
                    </VStack>
                ) : (
                    <VStack space="md">
                        {groups.map((group: Group) => (
                            <GroupCard
                                key={group.id}
                                {...group}
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
    );
}
