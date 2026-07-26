import { useAuthStore } from '@/store/useAuthStore';

/**
 * useIsGuest — returns true if the current user is anonymous/not logged in.
 * Replacement for useFeatureAccess().isGuest / isAnonymous.
 */
export function useIsGuest(): boolean {
  return useAuthStore((s) => !s.user);
}
