import type { FullProfileParams } from '@repo/core/types';
import { router } from 'expo-router';
import type React from 'react';
import { createContext, useContext } from 'react';

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

  if (context) {
    return context;
  }

  return {
    openFullProfile: (profile) => {
      router.push({ pathname: '/profile/full/[id]', params: { id: profile.id } });
    },
    openSettings: () => router.push(PROFILE_SETTINGS_ROUTE),
    openPrivacyLedger: () => router.push('/profile/privacy-ledger'),
    openMuteHub: () => router.push('/profile/mute-hub'),
    openPublicProfile: (target) => {
      router.push({
        pathname: '/profile/public/[id]',
        params: { id: target.id, type: target.type },
      });
    },
    openAuth: () => router.push('/auth'),
  };
}
