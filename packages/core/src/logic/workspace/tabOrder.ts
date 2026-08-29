export const TAB_IDS = ['self', 'workspace', 'community', 'library', 'profile'] as const;

export type TabId = (typeof TAB_IDS)[number];

export type TabOrderPlatform = 'mobile' | 'web';

export const DEFAULT_TAB_ORDER_MOBILE: readonly TabId[] = [
  'profile',
  'community',
  'self',
  'workspace',
  'library',
] as const;

export const DEFAULT_TAB_ORDER_WEB: readonly TabId[] = [
  'self',
  'workspace',
  'community',
  'library',
  'profile',
] as const;

export const DEFAULT_COMMUNITY_MODE_ORDER = ['feed', 'circles', 'messages', 'announcements'] as const;

export function normalizeTabOrder(
  raw: string[] | null | undefined,
  platform: TabOrderPlatform = 'mobile',
): TabId[] {
  const fallback = platform === 'web' ? DEFAULT_TAB_ORDER_WEB : DEFAULT_TAB_ORDER_MOBILE;
  if (!raw || raw.length === 0) return [...fallback];

  const allowed = new Set<string>(TAB_IDS);
  const seen = new Set<string>();
  const normalized: TabId[] = [];

  for (const id of raw) {
    if (allowed.has(id) && !seen.has(id)) {
      normalized.push(id as TabId);
      seen.add(id);
    }
  }

  for (const id of fallback) {
    if (!seen.has(id)) normalized.push(id);
  }

  return normalized;
}

export function buildTabOrderStorageKey(userId: string, platform: TabOrderPlatform): string {
  return `tab-order:${platform}:${userId}`;
}
