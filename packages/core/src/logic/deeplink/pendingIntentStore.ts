import { coreRuntime } from '@repo/core/logic/runtimeRegistry';
import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const DEFAULT_PENDING_INTENT_TTL_MS = 15 * 60 * 1000; // 15 minutes (matches DeepLinkStateGuard & OWASP standard)
export const PENDING_INTENT_STORAGE_KEY = 'gurudevi_pending_deep_link_intent';
export const LEGACY_DEFERRED_DEEP_LINK_KEY = 'deferred_deep_link';

export interface PendingDeepLinkIntent {
  /** Target internal route to navigate to (e.g. `/community?inviteCode=abc` or `/qr?payload=...`) */
  readonly targetPath: string;
  /** Semantic kind of the intent */
  readonly intentKind: 'classroomInvite' | 'qr' | 'authCallback' | 'generic';
  /** Normalized parameters extracted from the link */
  readonly params: Record<string, string>;
  /** Timestamp when the intent was captured (Date.now()) */
  readonly timestamp: number;
  /** TTL in milliseconds (defaults to 15 minutes) */
  readonly ttlMs?: number;
  /** Optional original incoming URL for audit/debug */
  readonly originalUrl?: string;
}

export interface PendingIntentStoreState {
  readonly pendingIntent: PendingDeepLinkIntent | null;
  readonly setPendingIntent: (
    intent: Omit<PendingDeepLinkIntent, 'timestamp'> & { timestamp?: number },
  ) => void;
  readonly getPendingIntent: () => PendingDeepLinkIntent | null;
  readonly drainPendingIntent: () => PendingDeepLinkIntent | null;
  readonly clearPendingIntent: () => void;
  readonly isPendingIntentActive: () => boolean;
}

export function isPendingIntentExpired(
  intent: PendingDeepLinkIntent | null,
  now: number = Date.now(),
): boolean {
  if (!intent) return true;
  const ttl = intent.ttlMs ?? DEFAULT_PENDING_INTENT_TTL_MS;
  return now - intent.timestamp > ttl;
}

export const usePendingIntentStore = create<PendingIntentStoreState>()(
  persist(
    (set, get) => ({
      pendingIntent: null,

      setPendingIntent: (intentInput) => {
        const intent: PendingDeepLinkIntent = {
          ...intentInput,
          timestamp: intentInput.timestamp ?? Date.now(),
          ttlMs: intentInput.ttlMs ?? DEFAULT_PENDING_INTENT_TTL_MS,
        };

        set({ pendingIntent: intent });

        // Maintain compatibility with legacy deferred_deep_link storage key
        try {
          if (coreRuntime.storage) {
            const raw = intent.originalUrl ?? intent.targetPath;
            void coreRuntime.storage.setItem(LEGACY_DEFERRED_DEEP_LINK_KEY, raw);
          }
        } catch {
          // Non-blocking in headless/mock test runs
        }
      },

      getPendingIntent: () => {
        const current = get().pendingIntent;
        if (!current) return null;
        if (isPendingIntentExpired(current)) {
          get().clearPendingIntent();
          return null;
        }
        return current;
      },

      drainPendingIntent: () => {
        const current = get().getPendingIntent();
        if (current) {
          get().clearPendingIntent();
        }
        return current;
      },

      clearPendingIntent: () => {
        set({ pendingIntent: null });
        try {
          if (coreRuntime.storage) {
            void coreRuntime.storage.removeItem(LEGACY_DEFERRED_DEEP_LINK_KEY);
          }
        } catch {
          // Non-blocking
        }
      },

      isPendingIntentActive: () => {
        const current = get().pendingIntent;
        return Boolean(current && !isPendingIntentExpired(current));
      },
    }),
    {
      name: PENDING_INTENT_STORAGE_KEY,
      storage: createJSONStorage(() => SafeZustandStorage),
      partialize: (state) => ({ pendingIntent: state.pendingIntent }),
    },
  ),
);

/**
 * Sovereign synchronous/direct accessor for non-React contexts.
 */
export const pendingIntentStore = {
  getState: usePendingIntentStore.getState,
  setState: usePendingIntentStore.setState,
  subscribe: usePendingIntentStore.subscribe,
};
