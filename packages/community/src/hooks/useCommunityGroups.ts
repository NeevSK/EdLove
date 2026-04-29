import { useMemo } from 'react';
import type { CommunityGroup } from '../types';
import { useCommunity } from './useCommunity';

export interface UseCommunityGroupsOptions {
  schoolId?: string;
  userId?: string;
  searchQuery?: string;
  isPublicOnly?: boolean;
}

export function useCommunityGroups(options: UseCommunityGroupsOptions = {}) {
  const { searchQuery, isPublicOnly, schoolId } = options;
  const { groups, loading, fetchGroups, fetchNextGroups, hasNextGroups, isFetchingNextGroups } =
    useCommunity(undefined, { searchQuery, isPublicOnly });

  const classroomGroups = useMemo(
    () =>
      (groups || []).filter((group: any) => group.type === 'class' || group.type === 'classroom'),
    [groups],
  );
  const clubGroups = useMemo(
    () => (groups || []).filter((group: any) => group.type === 'club'),
    [groups],
  );
  const interestGroups = useMemo(
    () =>
      (groups || []).filter((group: any) => group.type === 'interest' || group.type === 'grade'),
    [groups],
  );
  const sanctuaryGroups = useMemo(
    () =>
      ((groups as CommunityGroup[]) || []).filter(
        (group) => group.is_member && (schoolId ? group.school_id === schoolId : true),
      ),
    [groups, schoolId],
  );
  const galaxyGroups = useMemo(
    () =>
      ((groups as CommunityGroup[]) || []).filter(
        (group) => !group.is_member || (schoolId ? group.school_id !== schoolId : true),
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
