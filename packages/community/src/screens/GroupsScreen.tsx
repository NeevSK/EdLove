import { isDemo } from '@repo/core/api/demo';
import { useDomainRollout } from '@repo/core/hooks';
import { usePermissions } from '@repo/core/logic';
import { SanctuaryButton } from '@repo/ui/components/SanctuaryButton';
import SanctuaryFlashList from '@repo/ui/components/SanctuaryFlashList';
import { BrandPulse } from '@repo/ui/components/BrandPulse';
import { Compass, Globe, Plus, Shield, X } from '@repo/ui/icons';
import {
  AnimatedView,
  Box,
  Heading,
  HStack,
  Icon,
  InputField,
  Pressable,
  SkeletonCard,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FadeInDown } from 'react-native-reanimated';
import GroupCard from '@repo/community/components/GroupCard';
import { useCommunityGroups } from '@repo/community/hooks/useCommunityGroups';
import type { Group } from '@repo/community/types';

type GroupsSubTab = 'sanctuary' | 'galaxy';

interface GroupsScreenProps {
  userId?: string;
  schoolId?: string;
  onCreatePost?: (groupId?: string) => void;
  onCreateGroup?: () => void;
  onNavigateToGroup: (groupId: string) => void;
}

export default function GroupsScreen({
  userId,
  schoolId,
  onCreateGroup,
  onNavigateToGroup,
}: GroupsScreenProps) {
  const { t } = useTranslation();
  const { can } = usePermissions();
  const isCommunityEnabled = useDomainRollout('hearth');
  const [activeSubTab, setActiveSubTab] = useState<GroupsSubTab>(userId ? 'sanctuary' : 'galaxy');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    sanctuaryGroups,
    galaxyGroups,
    loading,
    fetchNextGroups,
    hasNextGroups,
    isFetchingNextGroups,
  } = useCommunityGroups({
    schoolId,
    userId,
    searchQuery,
    isPublicOnly: activeSubTab === 'galaxy' && !searchQuery,
  });

  const handleSanctuaryTabPress = useCallback(() => setActiveSubTab('sanctuary'), []);
  const handleGalaxyTabPress = useCallback(() => setActiveSubTab('galaxy'), []);
  const handleCreateGroupPress = useCallback(() => onCreateGroup?.(), [onCreateGroup]);

  const activeGroups = useMemo(
    () => (activeSubTab === 'sanctuary' ? sanctuaryGroups : galaxyGroups),
    [activeSubTab, sanctuaryGroups, galaxyGroups],
  );

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const renderSearchBar = () => (
    <AnimatedView entering={FadeInDown.delay(100).springify()}>
      <Box className="px-5 mb-4">
        <HStack className="items-center bg-phase-surface border border-border h-14 px-4 rounded-[20px] shadow-sm">
          <Icon as={Compass} size="sm" className="text-ink/30 mr-2" />
          <InputField
            className="flex-1 text-base text-ink h-full py-0 font-medium"
            placeholder={
              activeSubTab === 'sanctuary'
                ? 'Search school circles...'
                : 'Discover the wider galaxy...'
            }
            placeholderTextColor="rgba(var(--ink), 0.3)"
            value={searchQuery}
            onChangeText={handleSearchChange}
            autoCapitalize="none"
            accessibilityLabel={
              activeSubTab === 'sanctuary' ? 'Search sanctuary circles' : 'Search galaxy circles'
            }
            accessibilityHint="Filters the circles shown below"
          />
          {searchQuery ? (
            <Pressable
              onPress={handleClearSearch}
              className="w-8 h-8 rounded-full bg-ink/5 items-center justify-center"
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Icon as={X} size="xs" className="text-ink/60" />
            </Pressable>
          ) : null}
        </HStack>
      </Box>
    </AnimatedView>
  );

  const renderSubTabs = () => (
    <AnimatedView entering={FadeInDown.delay(150).springify()}>
      <HStack className="gap-2 mx-5 mb-4 mt-2 bg-phase-surface p-1 rounded-2xl border border-border">
        <Pressable
          onPress={handleSanctuaryTabPress}
          className={`flex-1 py-3 rounded-xl flex-row items-center justify-center gap-2 ${activeSubTab === 'sanctuary' ? 'bg-phase-interactive shadow-sm' : 'bg-transparent'}`}
          accessibilityRole="tab"
          accessibilityLabel="Sanctuary tab"
          accessibilityState={{ selected: activeSubTab === 'sanctuary' }}
        >
          <Icon
            as={Shield}
            size="xs"
            className={activeSubTab === 'sanctuary' ? 'text-white' : 'text-ink/40'}
          />
          <Text
            className={`text-sm font-black uppercase tracking-wider ${activeSubTab === 'sanctuary' ? 'text-white' : 'text-ink/40'}`}
          >
            {t('community.groups.sanctuary')}
          </Text>
        </Pressable>
        <Pressable
          onPress={handleGalaxyTabPress}
          className={`flex-1 py-3 rounded-xl flex-row items-center justify-center gap-2 ${activeSubTab === 'galaxy' ? 'bg-phase-interactive shadow-sm' : 'bg-transparent'}`}
          accessibilityRole="tab"
          accessibilityLabel="Galaxy tab"
          accessibilityState={{ selected: activeSubTab === 'galaxy' }}
        >
          <Icon
            as={Globe}
            size="xs"
            className={activeSubTab === 'galaxy' ? 'text-white' : 'text-ink/40'}
          />
          <Text
            className={`text-sm font-black uppercase tracking-wider ${activeSubTab === 'galaxy' ? 'text-white' : 'text-ink/40'}`}
          >
            {t('community.groups.galaxy')}
          </Text>
        </Pressable>
      </HStack>
    </AnimatedView>
  );

  const renderGalaxyActions = () => {
    if (activeSubTab !== 'galaxy') return null;
    if (!isCommunityEnabled || !can('create', 'Group')) return null;

    return (
      <AnimatedView entering={FadeInDown.duration(600).delay(300).springify()}>
        <Box className="mx-5 mb-5">
          <SanctuaryButton
            onPress={handleCreateGroupPress}
            action="primary"
            className="w-full h-14 rounded-2xl"
          >
            <HStack className="items-center gap-2">
              <Icon as={Plus} size="sm" className="text-white" />
              <Text className="text-white font-black">{t('community.groups.create')}</Text>
            </HStack>
          </SanctuaryButton>
        </Box>
      </AnimatedView>
    );
  };

  const getEmptyComponent = useCallback(() => {
    if (loading) {
      return (
        <VStack className="gap-5 py-4 px-5">
          <SkeletonCard height={80} />
          <SkeletonCard height={80} />
          <SkeletonCard height={80} />
        </VStack>
      );
    }

    if (activeSubTab === 'sanctuary') {
      return (
        <VStack className="gap-6 items-center p-10 mt-10">
          <Box className="w-24 h-24 bg-phase-interactive/10 rounded-full items-center justify-center">
            <Icon as={Shield} size="xl" className="text-phase-interactive" />
          </Box>
          <VStack className="gap-2 items-center">
            <Heading className="text-2xl text-center text-ink font-black">
              {t('community.groups.noSanctuaryTitle') || 'Your Sanctuary is Quiet'}
            </Heading>
            <Text className="text-center text-ink/60 font-medium leading-relaxed px-4">
              {t('community.groups.noSanctuaryDesc') ||
                "You haven't joined any school circles yet. Explore the Galaxy to find your tribe."}
            </Text>
          </VStack>
          <SanctuaryButton
            action="secondary"
            onPress={handleGalaxyTabPress}
            className="border-border bg-transparent h-14 rounded-2xl px-10"
          >
            <Text className="text-ink font-bold">
              {t('community.groups.exploreGalaxy') || 'Explore the Infinite Galaxy'}
            </Text>
          </SanctuaryButton>
        </VStack>
      );
    }

    return (
      <VStack className="gap-6 items-center p-10 mt-10">
        <Box className="w-24 h-24 bg-ink/5 rounded-full items-center justify-center">
          <Icon as={Globe} size="xl" className="text-ink/20" />
        </Box>
        <VStack className="gap-2 items-center">
          <Heading className="text-2xl text-center text-ink font-black">
            {t('community.groups.noGalaxyTitle') || 'Galaxy Waiting to Bloom'}
          </Heading>
          <Text className="text-center text-ink/60 font-medium leading-relaxed px-4">
            {t('community.groups.noGalaxyDesc') ||
              'Be the first to create a club, interest group, or inter-school circle.'}
          </Text>
        </VStack>
        <SanctuaryButton
          action="primary"
          onPress={handleCreateGroupPress}
          className="h-14 rounded-2xl px-10"
          isDisabled={!isCommunityEnabled || !can('create', 'Group')}
        >
          <Text className="text-white font-black">
            {t('community.groups.foundCircle') || 'Found a New Circle'}
          </Text>
        </SanctuaryButton>
      </VStack>
    );
  }, [
    loading,
    activeSubTab,
    handleGalaxyTabPress,
    handleCreateGroupPress,
    t,
    isCommunityEnabled,
    can,
  ]);

  const renderItem = useCallback(
    ({ item, index }: { item: Group; index: number }) => {
      const animationDelay = Math.min(index * 150, 1500);
      return (
        <AnimatedView entering={FadeInDown.duration(400).delay(animationDelay).springify()}>
          <Box className="mb-4">
            <GroupCard
              id={item.id}
              name={isDemo() ? `(Sample) ${item.name}` : item.name}
              memberCount={item.member_count}
              type={item.type || 'general'}
              description={item.description}
              onPress={() => onNavigateToGroup(item.id)}
            />
          </Box>
        </AnimatedView>
      );
    },
    [onNavigateToGroup],
  );

  const keyExtractor = useCallback((item: Group) => item.id, []);

  const ListEmptyComponent = useMemo(() => getEmptyComponent(), [getEmptyComponent]);

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
        data={activeGroups}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextGroups ? (
            <Box className="py-8 items-center">
              <BrandPulse size={28} accessibilityLabel="Loading more circles" />
            </Box>
          ) : null
        }
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={{ paddingHorizontal: 0, paddingBottom: 120 }}
      />
    </Box>
  );
}
