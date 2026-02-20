import React, { useState, useMemo } from 'react';
import { FlatList, ActivityIndicator } from 'react-native';
import { Box, VStack, HStack, Text, Pressable, useThemedColors, SkeletonCard, PositiveInvitation, Theme } from '@repo/ui';
import GroupCard from '../../components/community/GroupCard';
import { useCommunity, Group } from '@repo/community';
import { useTranslation } from 'react-i18next';
import { isDemo } from '../../lib/api/demo';
import { Compass, Shield } from 'lucide-react-native';

type GroupsSubTab = 'sanctuary' | 'galaxy';

interface GroupsScreenProps {
    userId?: string;
    onCreatePost?: (groupId?: string) => void;
    onNavigateToGroup?: (groupId: string) => void;
}

export default function GroupsScreen({ userId, onCreatePost, onNavigateToGroup }: GroupsScreenProps) {
    const { t } = useTranslation();
    const { groups, loading, fetchNextGroups, hasNextGroups, isFetchingNextGroups } = useCommunity();
    const colors = useThemedColors();
    const [activeSubTab, setActiveSubTab] = useState<GroupsSubTab>('sanctuary');

    // "My Sanctuary": school-specific joined groups (school_id is set)
    const sanctuaryGroups = useMemo(
        () => groups.filter((g: Group) => g.is_member && g.school_id),
        [groups]
    );

    // "Galaxy": discoverable inter-school or groups not yet joined (school_id absent or not joined)
    const galaxyGroups = useMemo(
        () => groups.filter((g: Group) => !g.is_member || !g.school_id),
        [groups]
    );

    const activeGroups = activeSubTab === 'sanctuary' ? sanctuaryGroups : galaxyGroups;

    const renderSubTabs = () => (
        <HStack space="sm" mx="$4" mb="$3" mt="$1">
            <Pressable
                onPress={() => setActiveSubTab('sanctuary')}
                sx={{
                    flex: 1,
                    paddingVertical: Theme.spacing.sm,
                    backgroundColor: activeSubTab === 'sanctuary' ? Theme.colors.sanctuarySaffron : colors.secondary,
                    borderRadius: Theme.corners.comfortable,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: activeSubTab === 'sanctuary' ? Theme.colors.sanctuarySaffron : colors.border,
                }}
            >
                <HStack space="xs" alignItems="center">
                    <Shield size={14} color={activeSubTab === 'sanctuary' ? Theme.colors.white : colors.textSecondary} />
                    <Text
                        size="sm"
                        bold
                        color={activeSubTab === 'sanctuary' ? Theme.colors.white : colors.text}
                    >
                        {t('community.groups.sanctuary', 'My Sanctuary')}
                    </Text>
                </HStack>
            </Pressable>
            <Pressable
                onPress={() => setActiveSubTab('galaxy')}
                sx={{
                    flex: 1,
                    paddingVertical: Theme.spacing.sm,
                    backgroundColor: activeSubTab === 'galaxy' ? Theme.colors.gurudeviViolet : colors.secondary,
                    borderRadius: Theme.corners.comfortable,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: activeSubTab === 'galaxy' ? Theme.colors.gurudeviViolet : colors.border,
                }}
            >
                <HStack space="xs" alignItems="center">
                    <Compass size={14} color={activeSubTab === 'galaxy' ? Theme.colors.white : colors.textSecondary} />
                    <Text
                        size="sm"
                        bold
                        color={activeSubTab === 'galaxy' ? Theme.colors.white : colors.text}
                    >
                        {t('community.groups.galaxy', 'Galaxy')}
                    </Text>
                </HStack>
            </Pressable>
        </HStack>
    );

    const getEmptyComponent = () => {
        if (loading) {
            return (
                <VStack space="md" py="$4" px="$4">
                    <SkeletonCard height={72} />
                    <SkeletonCard height={72} />
                    <SkeletonCard height={72} />
                </VStack>
            );
        }

        if (activeSubTab === 'sanctuary') {
            return (
                <PositiveInvitation
                    context="community"
                    title={t('community.noGroups', 'No circles found')}
                    description={t('community.noGroupsDesc', 'Connect with others by joining a community group.')}
                />
            );
        }

        return (
            <PositiveInvitation
                context="community"
                title={t('community.groups.noGalaxy', 'No groups to discover')}
                description={t('community.groups.noGalaxyDesc', 'Check back later for new inter-school groups and clubs.')}
            />
        );
    };

    const renderItem = ({ item }: { item: Group }) => (
        <GroupCard
            id={item.id}
            name={isDemo() ? `(Sample) ${item.name}` : item.name}
            memberCount={item.member_count}
            type={item.type as any}
            description={item.description}
            onPress={() => onNavigateToGroup?.(item.id)}
        />
    );

    return (
        <Box sx={{ flex: 1 }}>
            {renderSubTabs()}
            <FlatList
                data={activeGroups}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                onEndReached={() => {
                    if (hasNextGroups && !isFetchingNextGroups) {
                        fetchNextGroups();
                    }
                }}
                onEndReachedThreshold={0.5}
                ListFooterComponent={isFetchingNextGroups ? (
                    <ActivityIndicator size="small" color={colors.action} style={{ padding: 20 }} />
                ) : null}
                ListEmptyComponent={getEmptyComponent()}
                contentContainerStyle={{ paddingHorizontal: Theme.spacing.md, paddingBottom: 120 }}
            />
        </Box>
    );
}
