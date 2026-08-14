import { type AppType, createSovereignClient, SOVEREIGN_API_URL } from '@repo/core/api/base';
import type { PresenceSessionOptions } from '@repo/core/api/presenceRealtime';
import { startPresenceRealtime } from '@repo/core/api/presenceRealtime';

export interface PresenceFallbackCountOptions {
  targetCapacities: string[];
  isCumulative: boolean;
  userId?: string;
  windowMs?: number;
}

export type { PresenceSessionOptions };

const client = createSovereignClient<AppType>(SOVEREIGN_API_URL);

export async function fetchPresenceFallbackCount(
  options: PresenceFallbackCountOptions,
): Promise<number> {
  const response = await (client.api as any).presence['fallback-count'].$get({
    query: {
      targetCapacities: options.targetCapacities.join(','),
      cumulative: String(options.isCumulative),
      windowMs: String(options.windowMs ?? 300_000),
    },
  });
  if (!response.ok) throw new Error('Failed to fetch presence count.');
  return Number((await response.json()).count ?? 0);
}

export async function markUserPresenceSeen(_userId: string): Promise<void> {
  const response = await (client.api as any).presence.seen.$post({ json: {} });
  if (!response.ok) throw new Error('Failed to record presence.');
}

export function startPresenceSession(options: PresenceSessionOptions): () => void {
  return startPresenceRealtime(options, markUserPresenceSeen);
}

export const presenceAPI = {
  fetchPresenceFallbackCount,
  markUserPresenceSeen,
  startPresenceSession,
};
