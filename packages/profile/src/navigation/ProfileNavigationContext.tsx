import type { FullProfileParams } from '@repo/core/types';
import type React from 'react';
import { createContext, useContext } from 'react';
import { buildHref } from '@repo/core/routing/internalHref';
import { useNavigator } from '@repo/ui/components/native/navigation';

type PublicProfileTargetType = 'user' | 'school' | 'classroom' | 'community';

/** Canonical app-wide settings destination. The profile route remains a compatibility alias. */
export const PROFILE_SETTINGS_ROUTE = '/settings' as const;

export interface ProfileNavigationCapabilities {
  openFullProfile: (profile: FullProfileParams) => void;
  openSettings?: () => void;
  openPrivacyLedger?: () => void;
  openMuteHub?: () => void;
  openPublicProfile?: (target: { id: string; type: PublicProfileTargetType }) => void;
  openAuth?: () => void;
}

const ProfileNavigationContext = createContext<ProfileNavigationCapabilities | null>(null);

export function ProfileNavigationProvider({
  value,
  children,
}: {
  value: ProfileNavigationCapabilities;
  children: React.ReactNode;
}) {
  return (
    <ProfileNavigationContext.Provider value={value}>{children}</ProfileNavigationContext.Provider>
  );
}

export function useProfileNavigation(): ProfileNavigationCapabilities {
  const context = useContext(ProfileNavigationContext);
  const router = useNavigator();

  if (context) {
    return context;
  }

  return {
    openFullProfile: (profile) => {
      // No mobile screen for these yet: `follow` refuses and reports them instead of opening an
      // unmatched route. Each becomes a typed `push` once its screen exists.
      router.follow(buildHref('/profile/full/[id]', { id: profile.id }), 'profile');
    },
    openSettings: () => router.push(PROFILE_SETTINGS_ROUTE),
    openPrivacyLedger: () => router.follow('/profile/privacy-ledger', 'profile'),
    openMuteHub: () => router.follow('/profile/mute-hub', 'profile'),
    openPublicProfile: (target) => {
      router.follow(buildHref('/profile/public/[id]', { id: target.id, type: target.type }), 'profile');
    },
    openAuth: () => router.push('/auth'),
  };
}
