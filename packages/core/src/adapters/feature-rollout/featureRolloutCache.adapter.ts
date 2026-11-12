import { storage } from '@repo/core/lib/storage.adapter';
import type { FeatureRolloutSnapshot } from '@repo/core/logic/ports/featureRollout.port';
import { z } from 'zod';

/**
 * The last flag evaluation, kept per account or guest so flags are ready before the SDK answers.
 * What comes back from storage is untrusted, so it is checked here, at the boundary, and the store
 * only ever receives a typed snapshot.
 */
const SavedRollout = z.object({
  version: z.literal(2),
  context: z.string(),
  snapshot: z.object({
    flags: z.record(z.string(), z.union([z.boolean(), z.string()])),
    source: z.enum(['cache', 'remote', 'computed']),
    refreshedAt: z.string(),
  }),
});

export const featureRolloutCache = {
  /** The saved snapshot for this evaluation context, or null if there is none or it doesn't match. */
  async read(key: string, context: string): Promise<FeatureRolloutSnapshot | null> {
    const raw = await storage.getStringAsync(key);
    if (!raw) return null;
    const saved = SavedRollout.parse(JSON.parse(raw));
    return saved.context === context ? { ...saved.snapshot, source: 'cache' } : null;
  },
  write(key: string, context: string, snapshot: FeatureRolloutSnapshot): Promise<void> {
    return Promise.resolve(
      storage.setAsync(key, JSON.stringify({ version: 2, context, snapshot })),
    ).then(() => undefined);
  },
};
