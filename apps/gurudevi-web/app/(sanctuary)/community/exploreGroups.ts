import { getSandboxSamples } from '@repo/core/api/sandboxDataset';
import type { CommunityGroup } from '../../../lib/community/groups-contract';

export const EXPLORE_COMMUNITY_GROUPS: readonly CommunityGroup[] = getSandboxSamples<any[]>(
  'community',
  'getGroups',
  [],
  [],
).map((g) => ({
  id: g.id,
  name: g.name,
  description: g.description ?? null,
  memberCount: typeof g.member_count === 'number' ? g.member_count : 0,
}));
