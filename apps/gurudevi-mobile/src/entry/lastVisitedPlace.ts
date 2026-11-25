import { storage } from '@repo/core/lib/storage.adapter';
import {
  isPrimaryPlace,
  type LastVisitedPlaceRecord,
  primaryPlaceFromPathname,
} from '@repo/core/logic/places/landingPolicy';
import { useScopeSessionStore } from '@repo/core/store/scopeSession';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { usePathname } from 'expo-router';
import { useEffect, useRef } from 'react';

const STORAGE_KEY_PREFIX = 'gurudevi:last_visited_place:';

function keyFor(accountId: string): string {
  return `${STORAGE_KEY_PREFIX}${accountId}`;
}

export async function readLastVisitedPlace(
  accountId: string | null | undefined,
): Promise<LastVisitedPlaceRecord | null> {
  if (!accountId) return null;
  try {
    const raw = await storage.getStringAsync(keyFor(accountId));
    if (typeof raw !== 'string' || raw.length === 0) return null;
    const parsed = JSON.parse(raw) as Partial<LastVisitedPlaceRecord>;
    if (
      !isPrimaryPlace(parsed.place) ||
      typeof parsed.visitedAt !== 'number' ||
      !Number.isFinite(parsed.visitedAt)
    ) {
      return null;
    }
    return {
      place: parsed.place,
      bondId: typeof parsed.bondId === 'string' ? parsed.bondId : null,
      visitedAt: parsed.visitedAt,
    };
  } catch {
    return null;
  }
}

export async function writeLastVisitedPlace(
  accountId: string,
  record: LastVisitedPlaceRecord,
): Promise<void> {
  try {
    await storage.setAsync(keyFor(accountId), JSON.stringify(record));
  } catch {
    // Persistence failure must never interrupt navigation.
  }
}

/**
 * Records the user's active top-level Place floor (scoped to accountId + bondId)
 * so cold-start dynamic landing can resume it within the configured temporal decay window.
 * Never persists modals, auth screens, settings, or transactional sub-routes.
 */
export function useTrackLastVisitedPlace(): void {
  const pathname = usePathname();
  const accountId = useAuthStore((s) => s.user?.id ?? null);
  const bondId = useScopeSessionStore((s) => s.snapshot?.activeBond?.id ?? null);
  const lastWrittenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!accountId) return;
    const place = primaryPlaceFromPathname(pathname);
    if (!place) return;
    const signature = `${accountId}:${bondId ?? ''}:${place}`;
    if (lastWrittenRef.current === signature) return;
    lastWrittenRef.current = signature;
    void writeLastVisitedPlace(accountId, {
      place,
      bondId,
      visitedAt: Date.now(),
    });
  }, [accountId, bondId, pathname]);
}
