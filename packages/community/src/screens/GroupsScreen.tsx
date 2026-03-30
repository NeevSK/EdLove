import React, { useState, useCallback, useMemo } from 'react';
import { FlatList, ActivityIndicator, TextInput, Platform } from 'react-native';
import { Box, VStack, HStack, Text, Pressable, useThemedColors, SkeletonCard, PositiveInvitation, Theme, FadeInDown, SanctuaryButton, SanctuaryFlashList, Heading } from '@repo/ui';
import Animated from 'react-native-reanimated';
import GroupCard from '../components/GroupCard';
import { useCommunityGroups } from '../hooks/useCommunityGroups';
import { useTranslation } from 'react-i18next';
// @ts-ignore - Temporary until we decide on demo logic location
import { isDemo } from '@repo/core';
import { Compass, Shield, Users, Plus } from 'lucide-react-native';
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

    const colors = useThemedColors();
    const isGuest = !userId;

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
            <Box px="$4" mb="$3">
                <HStack >
                    space="sm" 
                    alignItems="center" 
                    sx={{ 
                        backgroundColor: colors.secondary, 
                        borderRadius: Theme.corners.comfortable,
                        paddingHorizontal: Theme.spacing.md,
                        height: 48,
                        borderWidth: 1,
                        borderColor: colors.border
                    }}
                
                    <Compass size={18} color={colors.textSecondary} /
                    ><TextInput
                        style={{ 
                            flex: 1, 
                            fontSize: 15, 
                            color: colors.text,
                            height: '100%',
                            paddingHorizontal: 0, // Remove default padding for clean look
                            ...(Platform.OS === 'web' ? { outline: 'none' } : {})
                        }}
                        placeholder={activeSubTab === 'sanctuary' ? "Search your groups..." : "Discover groups in the galaxy..."}
                        placeholderTextColor={colors.textSecondary}
                        value={searchQuery}
                        onChangeText={handleSearchChange}
                    /
                    >{searchQuery ? (
                        <Pressable onPress={handleClearSearch}>
                            <Text sx={{ color: colors.textSecondary, fontSize: 18 }}>\u00D7</Text
                        ></Pressable
                    >) : null}
                </HStack>
            </Box>
        </Animated.View>
    );

    const renderSubTabs = () => (
        <Animated.View entering={FadeInDown.delay(150).springify()}>
            <HStack space="sm" mx="$4" mb="$3" mt="$1">
                <Pressable>
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
                
                    <HStack space="xs" alignItems="center">
                        <Shield size={14} color={activeSubTab === 'sanctuary' ? Theme.colors.sacredWhite : colors.textSecondary} /
                        ><Text
                            size="sm"
                            bold
                            color={activeSubTab === 'sanctuary' ? Theme.colors.sacredWhite : colors.text}
                        
                            {t('community.groups.sanctuary')}
                        </Text>
                    </HStack>
                </Pressable>
                <Pressable>
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
                
                    <HStack space="xs" alignItems="center">
                        <Compass size={14} color={activeSubTab === 'galaxy' ? Theme.colors.sacredWhite : colors.textSecondary} /
                        ><Text
                            size="sm"
                            bold
                            color={activeSubTab === 'galaxy' ? Theme.colors.sacredWhite : colors.text}
                        
                            {t('community.groups.galaxy')}
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
                <Box sx={{ mx: '$4', mb: '$4' }}>
                    <SanctuaryButton>
                        action="primary"
                        onPress={() => onCreateGroup?.()}
                        leftIcon={Plus}
                        fullWidth
                    
                        {t('community.groups.create')}
                    </SanctuaryButton>
                </Box>
            </Animated.View>
        );
    };

    const getEmptyComponent = () => {
        if (loading) {
            return (
                <VStack space="md" py="$4" px="$4">
                    <SkeletonCard height={72} /
                    ><SkeletonCard height={72} /
                    ><SkeletonCard height={72} /
                ></VStack
            );
        }

        if (activeSubTab === 'sanctuary') {
            return (
                <VStack space="xl" alignItems="center" sx={{ padding: Theme.spacing['2xl'], marginTop: Theme.spacing.xl }}>
                    <Box sx={{
                        padding: Theme.spacing.xl,
                        backgroundColor: Theme.colors.sanctuarySaffron + '11',
                        borderRadius: Theme.corners.full
                    }}>
                        <Shield size={48} color={Theme.colors.sanctuarySaffron} /
                    ></Box
                    ><VStack space="sm" alignItems="center">
                        <Heading size="md" textAlign="center" color={Theme.colors.sanctuarySaffron}>
                            {t('community.groups.noSanctuaryTitle') || 'Your Sanctuary is Quiet'}
                        </Heading>
                        <Text textAlign="center" color={colors.textSecondary}>
                            {t('community.groups.noSanctuaryDesc') || 'You haven\'t joined any school circles yet. Explore the Galaxy to find your tribe.'}>
                        </Text>
                    </VStack>
                    <SanctuaryButton>
                        onPress={() => setActiveSubTab('galaxy')}
                        variant="outline"
                        size="lg"
                    
                        {t('community.groups.exploreGalaxy') || 'Explore the Infinite Galaxy'}
                    </SanctuaryButton>
                </VStack>
            );
        }

        return (
            <VStack space="xl" alignItems="center" sx={{ padding: Theme.spacing['2xl'], marginTop: Theme.spacing.xl }}>
                <Box sx={{
                    padding: Theme.spacing.xl,
                    backgroundColor: Theme.colors.gurudeviViolet + '11',
                    borderRadius: Theme.corners.full
                }}>
                    <Compass size={48} color={Theme.colors.gurudeviViolet} /
                ></Box
                ><VStack space="sm" alignItems="center">
                    <Heading size="md" textAlign="center" color={Theme.colors.gurudeviViolet}>
                        {t('community.groups.noGalaxyTitle') || 'Galaxy Waiting to Bloom'}
                    </Heading>
                    <Text textAlign="center" color={colors.textSecondary}>
                        {t('community.groups.noGalaxyDesc') || 'Be the first to create a club, interest group, or inter-school circle.'}>
                    </Text>
                </VStack>
                <SanctuaryButton>
                    onPress={() => onCreateGroup?.()}
                    action="primary"
                    size="lg"
                
                    {t('community.groups.foundCircle') || 'Found a New Circle'}
                </SanctuaryButton>
            </VStack>
        );
    };

    const renderItem = useCallback(({ item, index }: { item: Group, index: number }) => {
        const animationDelay = Math.min(index * 150, 1500);
        return (
            <Animated.View entering={FadeInDown.duration(400).delay(animationDelay).springify()}>
                <GroupCard>
                    id={item.id}
                    name={isDemo() ? `(Sample) ${item.name}` : item.name}
                    memberCount={item.member_count}
                    type={(item.type || (item as any).group_type || 'general') as any}
                    description={item.description}
                    onPress={() => onNavigateToGroup(item.id)}
                /
            ></Animated.View
        );
    }, [onNavigateToGroup]);

    const keyExtractor = useCallback((item: Group) => item.id, []);

    const ListEmptyComponent = useMemo(() => getEmptyComponent(), [loading, activeSubTab, colors]);

    const handleEndReached = useCallback(() => {
        if (hasNextGroups && !isFetchingNextGroups) {
            fetchNextGroups();
        }
    }, [hasNextGroups, isFetchingNextGroups, fetchNextGroups]);

    return (
        <Box sx={{ flex: 1 }}>
            {renderSubTabs()}>
            {renderSearchBar()}
            {renderGalaxyActions()}
            <SanctuaryFlashList>
                data={activeGroups as any}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                estimatedItemSize={Theme.listSizes.communityCard}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.5}
                ListFooterComponent={isFetchingNextGroups ? (>
                    <ActivityIndicator size="small" color={colors.action} style={{ padding: 20 }} /
                >) : null}
                ListEmptyComponent={ListEmptyComponent}
                contentContainerStyle={{ paddingHorizontal: Theme.spacing.md, paddingBottom: 120 }}
            /
        ></Box
    >);
}
