import React, { useState } from 'react';
import { FlatList, ActivityIndicator } from 'react-native';
import { Box, VStack, HStack, Text, Pressable, useThemedColors, SkeletonCard, PositiveInvitation, Theme, FadeInDown, SanctuaryButton, SanctuaryFlashList } from '@repo/ui';
import Animated from 'react-native-reanimated';
import ReportPostModal from '../components/ReportPostModal';
import GroupCard from '../components/GroupCard';
import { useCommunityGroups } from '../hooks/useCommunityGroups';
import { useTranslation } from 'react-i18next';
// @ts-ignore - Temporary until we decide on demo logic location
import { isDemo } from '@repo/core';
import { Compass, Shield, Users, Plus } from 'lucide-react-native';
import { Group } from '../index';

type GroupsSubTab = 'sanctuary' | 'galaxy';

interface GroupsScreenProps {
    userId?: string;
    schoolId?: string;
    onCreatePost?: (groupId?: string) => void;
    onCreateGroup?: () => void;
    onNavigateToGroup: (groupId: string) => void;
}

export default function GroupsScreen({ userId, schoolId, onCreatePost, onCreateGroup, onNavigateToGroup }: GroupsScreenProps) {
    const { t } = useTranslation();
    const {
        sanctuaryGroups,
        galaxyGroups,
        loading,
        fetchNextGroups,
        hasNextGroups,
        isFetchingNextGroups
    } = useCommunityGroups({ schoolId, userId });

    const colors = useThemedColors();
    const [activeSubTab, setActiveSubTab] = useState<GroupsSubTab>('sanctuary');

    const activeGroups = activeSubTab === 'sanctuary' ? sanctuaryGroups : galaxyGroups;

    const renderSubTabs = () => (
        <Animated.View entering={FadeInDown.delay(150).springify()}>
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
                        <Shield size={14} color={activeSubTab === 'sanctuary' ? Theme.colors.sacredWhite : colors.textSecondary} />
                        <Text
                            size="sm"
                            bold
                            color={activeSubTab === 'sanctuary' ? Theme.colors.sacredWhite : colors.text}
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
                        <Compass size={14} color={activeSubTab === 'galaxy' ? Theme.colors.sacredWhite : colors.textSecondary} />
                        <Text
                            size="sm"
                            bold
                            color={activeSubTab === 'galaxy' ? Theme.colors.sacredWhite : colors.text}
                        >
                            {t('community.groups.galaxy', 'Infinite Galaxy')}
                        </Text>
                    </HStack>
                </Pressable>
            </HStack>
        </Animated.View>
    );

    const renderGalaxyActions = () => {
        if (activeSubTab !== 'galaxy') return null;

        return (
            <Animated.View entering={FadeInDown.duration(600).delay(300).springify()}>
                <Box
                    sx={{
                        mx: '$4',
                        mb: '$4',
                        borderStyle: 'dashed',
                        borderWidth: 1,
                        borderColor: '$border',
                        borderRadius: '$comfortable'
                    }}
                >
                    <SanctuaryButton
                        variant="outline"
                        onPress={() => onCreateGroup?.()}
                        leftIcon={Plus}
                    >
                        {t('community.groups.create', 'Found a New Circle')}
                    </SanctuaryButton>
                </Box>
            </Animated.View>
        );
    };

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
                title={t('community.groups.noGalaxy', 'Galaxy Waiting to Bloom')}
                description={t('community.groups.noGalaxyDesc', 'Be the first to create a club, interest group, or inter-school circle.')}
                onAction={() => onCreateGroup?.()} // Triggers group creation flow
            />
        );
    };

    const renderItem = ({ item, index }: { item: Group, index: number }) => {
        const animationDelay = Math.min(index * 150, 1500);
        return (
            <Animated.View entering={FadeInDown.duration(400).delay(animationDelay).springify()}>
                <GroupCard
                    id={item.id}
                    name={isDemo() ? `(Sample) ${item.name}` : item.name}
                    memberCount={item.member_count}
                    type={item.type as any}
                    description={item.description}
                    onPress={() => onNavigateToGroup(item.id)}
                />
            </Animated.View>
        );
    };

    return (
        <Box sx={{ flex: 1 }}>
            {renderSubTabs()}
            {renderGalaxyActions()}
            <SanctuaryFlashList
                data={activeGroups as any}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                estimatedItemSize={Theme.listSizes.communityCard}
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
