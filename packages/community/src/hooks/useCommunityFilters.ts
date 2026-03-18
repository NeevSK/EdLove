import { useMemo } from 'react';
import { Group } from '../types/Community';

export interface FeedFilterChip {
    label: string;
    value: string;
}

export function useCommunityFilters(groups: Group[], allUpdatesLabel: string): FeedFilterChip[] {
    return useMemo(() => {
        const chips: FeedFilterChip[] = [
            { label: allUpdatesLabel, value: 'all' },
            { label: 'Recommended', value: 'recommended' },
            { label: 'Sacred Mission', value: 'sacred' },
        ];
        groups.slice(0, 6).forEach((g) => {
            chips.push({ label: g.name, value: g.id });
        });
        return chips;
    }, [groups, allUpdatesLabel]);
}
