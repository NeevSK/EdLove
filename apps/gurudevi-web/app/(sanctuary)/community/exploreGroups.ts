import { getSandboxSamples } from '@repo/core/api/sandboxDataset';
import '@repo/core/api/community';
import type { CommunityGroup } from '../../../lib/community/groups-contract';

export function getExploreCommunityGroups(): readonly CommunityGroup[] {
  const samples = getSandboxSamples<any[]>(
    'community',
    'getGroups',
    [],
    [],
  );
  return samples.map((g) => ({
    id: g.id,
    name: g.name,
    description: g.description ?? null,
    memberCount: typeof g.member_count === 'number' ? g.member_count : 0,
  }));
}

export const EXPLORE_COMMUNITY_GROUPS: readonly CommunityGroup[] = getExploreCommunityGroups();

