import React, { useState, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import { 
    Box, 
    VStack, 
    HStack, 
    Text, 
    Pressable, 
    SkeletonCard, 
    FadeInDown, 
    SanctuaryButton, 
    SanctuaryFlashList, 
    Heading, 
    Icon,
    InputField,
    Spinner
} from '@repo/ui';
import Animated from 'react-native-reanimated';
import GroupCard from '../components/GroupCard';
import { useCommunityGroups } from '../hooks/useCommunityGroups';
import { useTranslation } from 'react-i18next';
// @ts-ignore - Temporary until we decide on demo logic location
import { isDemo } from '@repo/core';
import { Compass, Shield, Users, Plus, X } from 'lucide-react-native';
import { Group } from '../types';

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
    const [activeSubTab, setActiveSubTab] = useState<GroupsSubTab>(userId ? 'sanctuary' : 'galaxy');
    const [searchQuery, setSearchQuery] = useState('');

    const {
        sanctuaryGroups,
        galaxyGroups,
        loading,
        fetchNextGroups,
        hasNextGroups,
        isFetchingNextGroups
    } = useCommunityGroups({ 
        schoolId, 
        userId,
        searchQuery,
        isPublicOnly: activeSubTab === 'galaxy' && !searchQuery
    });

    const activeGroups = useMemo(() => 
        activeSubTab === 'sanctuary' ? sanctuaryGroups : galaxyGroups,
    [activeSubTab, sanctuaryGroups, galaxyGroups]);

    const handleSearchChange = useCallback((text: string) => {
        setSearchQuery(text);
    }, []);

    const handleClearSearch = useCallback(() => {
        setSearchQuery('');
    }, []);

    const renderSearchBar = () => (
        <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Box className="px-4 mb-3">
                <HStack
                    className="items-center bg-phase-surface border border-border h-12 px-3 rounded-xl shadow-sm"
                >
                    <Icon as={Compass} size="sm" className="text-ink/40 mr-2" />
                    <InputField
                        className="flex-1 text-sm text-ink h-full py-0"
                        placeholder={activeSubTab === 'sanctuary' ? "Search your groups..." : "Discover groups in the galaxy..."}
                        placeholderTextColor="#94a3b8"
                        value={searchQuery}
                        onChangeText={handleSearchChange}
                        autoCapitalize="none"
                    />
                    {searchQuery ? (
                        <Pressable onPress={handleClearSearch} className="p-1">
                            <Icon as={X} size="xs" className="text-ink/60" />
                        </Pressable>
                    ) : null}
                </HStack>
            </Box>
        </Animated.View>
    );

    const renderSubTabs = () => (
        <Animated.View entering={FadeInDown.delay(150).springify()}>
            <HStack className="gap-2 mx-4 mb-3 mt-1">
                <Pressable
                    onPress={() => setActiveSubTab('sanctuary')}
                    className={`flex-1 py-2.5 rounded-xl flex-row items-center justify-center gap-2 border ${activeSubTab === 'sanctuary' ? 'bg-amber-500 border-amber-500' : 'bg-phase-surface border-border'}`}
                >
                    <Icon as={Shield} size="xs" className={activeSubTab === 'sanctuary' ? 'text-white' : 'text-ink/40'} />
                    <Text
                        className={`text-sm font-bold ${activeSubTab === 'sanctuary' ? 'text-white' : 'text-ink'}`}
                    >
                        {t('community.groups.sanctuary')}
                    </Text>
                </Pressable>
                <Pressable
                    onPress={() => setActiveSubTab('galaxy')}
                    className={`flex-1 py-2.5 rounded-xl flex-row items-center justify-center gap-2 border ${activeSubTab === 'galaxy' ? 'bg-indigo-600 border-indigo-600' : 'bg-phase-surface border-border'}`}
                >
                    <Icon as={Compass} size="xs" className={activeSubTab === 'galaxy' ? 'text-white' : 'text-ink/40'} />
                    <Text
                        className={`text-sm font-bold ${activeSubTab === 'galaxy' ? 'text-white' : 'text-ink'}`}
                    >
                        {t('community.groups.galaxy')}
                    </Text>
                </Pressable>
            </HStack>
        </Animated.View>
    );

    const renderGalaxyActions = () => {
        if (activeSubTab !== 'galaxy') return null;

        return (
            <Animated.View entering={FadeInDown.duration(600).delay(300).springify()}>
                <Box className="mx-4 mb-4">
                    <SanctuaryButton
                        onPress={() => onCreateGroup?.()}
                        leftIcon={Plus}
                        className="w-full bg-phase-interactive h-14 rounded-2xl"
                    >
                        {t('community.groups.create')}
                    </SanctuaryButton>
                </Box>
            </Animated.View>
        );
    };

    const getEmptyComponent = () => {
        if (loading) {
            return (
                <VStack className="gap-4 py-4 px-4">
                    <SkeletonCard height={72} />
                    <SkeletonCard height={72} />
                    <SkeletonCard height={72} />
                </VStack>
            );
        }

        if (activeSubTab === 'sanctuary') {
            return (
                <VStack className="gap-6 items-center p-8 mt-12">
                    <Box className="p-8 bg-amber-500/10 rounded-full">
                        <Icon as={Shield} size="xl" className="text-amber-500" />
                    </Box>
                    <VStack className="gap-2 items-center">
                        <Heading className="text-xl text-center text-amber-500 font-bold">
                            {t('community.groups.noSanctuaryTitle') || 'Your Sanctuary is Quiet'}
                        </Heading>
                        <Text className="text-center text-ink/60">
                            {t('community.groups.noSanctuaryDesc') || "You haven't joined any school circles yet. Explore the Galaxy to find your tribe."}
                        </Text>
                    </VStack>
                    <SanctuaryButton
                        onPress={() => setActiveSubTab('galaxy')}
                        className="bg-transparent border border-border h-12 rounded-xl px-6"
                    >
                        <Text className="text-ink font-bold">{t('community.groups.exploreGalaxy') || 'Explore the Infinite Galaxy'}</Text>
                    </SanctuaryButton>
                </VStack>
            );
        }
 
        return (
            <VStack className="gap-6 items-center p-8 mt-12">
                <Box className="p-8 bg-indigo-600/10 rounded-full">
                    <Icon as={Compass} size="xl" className="text-indigo-600" />
                </Box>
                <VStack className="gap-2 items-center">
                    <Heading className="text-xl text-center text-indigo-600 font-bold">
                        {t('community.groups.noGalaxyTitle') || 'Galaxy Waiting to Bloom'}
                    </Heading>
                    <Text className="text-center text-ink/60">
                        {t('community.groups.noGalaxyDesc') || 'Be the first to create a club, interest group, or inter-school circle.'}
                    </Text>
                </VStack>
                <SanctuaryButton
                    onPress={() => onCreateGroup?.()}
                    className="bg-phase-interactive h-12 rounded-xl px-6"
                >
                    <Text className="text-inverted font-bold">{t('community.groups.foundCircle') || 'Found a New Circle'}</Text>
                </SanctuaryButton>
            </VStack>
        );
    };

    const renderItem = useCallback(({ item, index }: { item: Group, index: number }) => {
        const animationDelay = Math.min(index * 150, 1500);
        return (
            <Animated.View entering={FadeInDown.duration(400).delay(animationDelay).springify()}>
                <GroupCard
                    id={item.id}
                    name={isDemo() ? `(Sample) ${item.name}` : item.name}
                    memberCount={item.member_count}
                    type={(item.type || (item as any).group_type || 'general') as any}
                    description={item.description}
                    onPress={() => onNavigateToGroup(item.id)}
                />
            </Animated.View>
        );
    }, [onNavigateToGroup]);

    const keyExtractor = useCallback((item: Group) => item.id, []);

    const ListEmptyComponent = useMemo(() => getEmptyComponent(), [loading, activeSubTab]);

    const handleEndReached = useCallback(() => {
        if (hasNextGroups && !isFetchingNextGroups) {
            fetchNextGroups();
        }
    }, [hasNextGroups, isFetchingNextGroups, fetchNextGroups]);

    return (
        <Box className="flex-1 bg-phase-canvas">
            {renderSubTabs()}
            {renderSearchBar()}
            {renderGalaxyActions()}
            <SanctuaryFlashList
                data={activeGroups as any}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                estimatedItemSize={120}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.5}
                ListFooterComponent={isFetchingNextGroups ? (
                    <Box className="py-8 items-center">
                        <Spinner />
                    </Box>
                ) : null}
                ListEmptyComponent={ListEmptyComponent}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
            />
        </Box>
    );
}
