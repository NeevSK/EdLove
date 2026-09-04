import { orpcClient } from '@repo/core/api/orpcClient';
import {
  type PresenceSessionOptions,
  startPresenceRealtime,
} from '@repo/core/api/presenceRealtime';

export interface PresenceFallbackCountOptions {
  targetCapacities: string[];
  isCumulative: boolean;
  userId?: string;
  windowMs?: number;
}

export type { PresenceSessionOptions };

export async function fetchPresenceFallbackCount(
  options: PresenceFallbackCountOptions,
): Promise<number> {
  const response = await orpcClient.presence.getFallbackCount({
    query: {
      targetCapacities: options.targetCapacities.join(','),
      cumulative: options.isCumulative,
      windowMs: options.windowMs ?? 300_000,
    },
  });
  return Number(response.count ?? 0);
}

export async function markUserPresenceSeen(_userId: string): Promise<void> {
  await orpcClient.presence.markSeen({ body: {} });
}

export function startPresenceSession(options: PresenceSessionOptions): () => void {
  return startPresenceRealtime(options, markUserPresenceSeen);
}

export const presenceAPI = {
  fetchPresenceFallbackCount,
  markUserPresenceSeen,
  startPresenceSession,
};
