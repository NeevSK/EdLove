import { storage } from '@repo/core/native/storage';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { useCallback, useState } from 'react';

const VISITOR_FIRST_SEEN_KEY = 'sanctuary.visitor.first_seen';
const VISITOR_LAST_SEEN_KEY = 'sanctuary.visitor.last_seen';

export interface SanctuaryVisitorState {
  /** True if this device has never initialized a sanctuary session or completed onboarding */
  isFirstTime: boolean;
  /** True if an active authenticated or anonymous session is cached in memory/storage */
  hasPreviousSession: boolean;
  /** True if the user has previously completed the onboarding journey */
  onboardingCompleted: boolean;
  /** Epoch timestamp of the last recorded app interaction on this device */
  lastVisitedTimestamp: number | null;
  /** Commits the current interaction timestamp to persistent storage */
  markVisited: () => void;
}

/**
 * Reusable visitor lifecycle hook.
 *
 * Automatically detects whether the current device is a first-time explorer,
 * a returning guest, or an existing account holder.
 */
export function useSanctuaryVisitor(): SanctuaryVisitorState {
  const authSession = useAuthStore((state) => state.authSession);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);

  const [isFirstTime, setIsFirstTime] = useState<boolean>(() => {
    try {
      const firstSeen = storage.getString(VISITOR_FIRST_SEEN_KEY);
      return !firstSeen && !authSession && !onboardingCompleted;
    } catch {
      return !authSession && !onboardingCompleted;
    }
  });

  const [lastVisitedTimestamp, setLastVisitedTimestamp] = useState<number | null>(() => {
    try {
      const last = storage.getNumber(VISITOR_LAST_SEEN_KEY);
      return typeof last === 'number' ? last : null;
    } catch {
      return null;
    }
  });

  const markVisited = useCallback(() => {
    try {
      const now = Date.now();
      storage.set(VISITOR_LAST_SEEN_KEY, now);
      if (storage.getString(VISITOR_FIRST_SEEN_KEY) == null) {
        storage.set(VISITOR_FIRST_SEEN_KEY, String(now));
      }
      setIsFirstTime(false);
      setLastVisitedTimestamp(now);
    } catch {
      // Storage failure must never crash UX
    }
  }, []);

  return {
    isFirstTime,
    hasPreviousSession: Boolean(authSession),
    onboardingCompleted,
    lastVisitedTimestamp,
    markVisited,
  };
}
