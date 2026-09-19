export type CommunityGroup = Readonly<{
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
}>;

export type CommunityGroupsResult =
  | Readonly<{ kind: 'ready'; groups: readonly CommunityGroup[]; hasMore: boolean }>
  | Readonly<{ kind: 'denied' }>
  | Readonly<{ kind: 'unavailable' }>;

export type CommunityGroupsQuery = Readonly<{
  limit: number;
  offset: number;
  search?: string;
}>;

export const COMMUNITY_GROUP_PAGE_SIZE = 30;
export const COMMUNITY_GROUP_MAX_PAGE_SIZE = 50;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function parseCommunityGroups(value: unknown): readonly CommunityGroup[] | null {
  if (!Array.isArray(value)) return null;
  const groups: CommunityGroup[] = [];
  for (const valueItem of value) {
    const item = asRecord(valueItem);
    if (!item || typeof item.id !== 'string' || typeof item.name !== 'string') return null;
    groups.push({
      id: item.id,
      name: item.name,
      description: typeof item.description === 'string' ? item.description : null,
      memberCount:
        typeof item.member_count === 'number' &&
        Number.isFinite(item.member_count) &&
        item.member_count >= 0
          ? item.member_count
          : 0,
    });
  }
  return groups;
}

export function parseCommunityGroupsResult(value: unknown): CommunityGroupsResult | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return null;
  const result = value as Record<string, unknown>;
  const groups = parseCommunityGroups(result.groups);
  if (!groups || typeof result.hasMore !== 'boolean') return null;
  return { kind: 'ready', groups, hasMore: result.hasMore };
}
