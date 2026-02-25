import { useMemo } from 'react';
import { useCommunity } from './useCommunity';
import type { Group, CommunityGroup } from '../types';

export interface UseCommunityGroupsOptions {
    schoolId?: string;
    userId?: string;
}

export function useCommunityGroups(options: UseCommunityGroupsOptions = {}) {
    const {
        groups,
        loading,
        fetchGroups,
        fetchNextGroups,
        hasNextGroups,
        isFetchingNextGroups
    } = useCommunity();

    // Fix type conflicts by ensuring we check all possible type aliases
    const classroomGroups = useMemo(() =>
        (groups || []).filter((g: any) => g.type === 'class' || g.type === 'classroom'),
        [groups]
    );
    const clubGroups = useMemo(() =>
        (groups || []).filter((g: any) => g.type === 'club'),
        [groups]
    );
    const interestGroups = useMemo(() =>
        (groups || []).filter((g: any) => g.type === 'interest' || g.type === 'grade'),
        [groups]
    );

    // "My Sanctuary": school-specific joined groups (school_id matches)
    const sanctuaryGroups = useMemo(
        () => (groups as CommunityGroup[] || []).filter((g) => g.is_member && g.school_id === options.schoolId),
        [groups, options.schoolId]
    );

    // "Global Galaxy": groups not in the user's school or not joined
    const galaxyGroups = useMemo(
        () => (groups as CommunityGroup[] || []).filter((g) => !g.is_member || g.school_id !== options.schoolId),
        [groups, options.schoolId]
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
        isFetchingNextGroups
    };
}
