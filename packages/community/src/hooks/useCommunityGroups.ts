import { useMemo } from 'react';
import type { CommunityGroup } from '../types';
import { useCommunity } from './useCommunity';
 
export const GROUP_KEYS = {
  all: ['groups'] as const,
  lists: () => [...GROUP_KEYS.all, 'list'] as const,
  list: (filters: any) => [...GROUP_KEYS.lists(), { filters }] as const,
  details: (id: string) => [...GROUP_KEYS.all, 'detail', id] as const,
};

export interface UseCommunityGroupsOptions {
  schoolId?: string;
  userId?: string;
  searchQuery?: string;
  isPublicOnly?: boolean;
}

export function useCommunityGroups(options: UseCommunityGroupsOptions = {}) {
  const { searchQuery, isPublicOnly, schoolId } = options;

  const communityOptions = useMemo(
    () => ({
      searchQuery,
      isPublicOnly,
    }),
    [searchQuery, isPublicOnly],
  );

  const { groups, loading, fetchGroups, fetchNextGroups, hasNextGroups, isFetchingNextGroups } =
    useCommunity(undefined, communityOptions);

  // Fix type conflicts by ensuring we check all possible type aliases
  const classroomGroups = useMemo(
    () => (groups || []).filter((g: any) => g.type === 'class' || g.type === 'classroom'),
    [groups],
  );
  const clubGroups = useMemo(() => (groups || []).filter((g: any) => g.type === 'club'), [groups]);
  const interestGroups = useMemo(
    () => (groups || []).filter((g: any) => g.type === 'interest' || g.type === 'grade'),
    [groups],
  );

  // "My Sanctuary": school-specific joined groups (school_id matches)
  const sanctuaryGroups = useMemo(
    () =>
      ((groups as CommunityGroup[]) || []).filter(
        (g) => g.is_member && (schoolId ? g.school_id === schoolId : true),
      ),
    [groups, schoolId],
  );

  // "Global Galaxy": groups not in the user's school or not joined
  const galaxyGroups = useMemo(
    () =>
      ((groups as CommunityGroup[]) || []).filter(
        (g) => !g.is_member || (schoolId ? g.school_id !== schoolId : true),
      ),
    [groups, schoolId],
  );

  return {
    groups,
    classroomGroups,
    clubGroups,
    interestGroups,
    sanctuaryGroups,
    galaxyGroups,
    loading,
    fetchGroups,
    fetchNextGroups,
    hasNextGroups,
    isFetchingNextGroups,
  };
}
