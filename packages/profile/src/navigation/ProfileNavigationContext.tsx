import { type NavigationProp, useNavigation } from '@react-navigation/native';
import { FullProfileParams, ProfileStackParamList } from '@repo/core/types';
import type React from 'react';
import { createContext, useContext } from 'react';

type PublicProfileTargetType = 'user' | 'school' | 'classroom' | 'community';

export interface ProfileNavigationCapabilities {
  openFullProfile: (profile: FullProfileParams) => void;
  openSettings?: () => void;
  openPrivacyLedger?: () => void;
  openMuteHub?: () => void;
  openPublicProfile?: (target: { id: string; type: PublicProfileTargetType }) => void;
  openAuth?: () => void;
  goBack?: () => void;
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
  const navigation = useNavigation<NavigationProp<ProfileStackParamList>>();

  if (context) {
    return context;
  }

  return {
    openFullProfile: (profile) => navigation.navigate('FullProfile', { profile }),
    openSettings: () => navigation.navigate('AppSettings'),
    openPrivacyLedger: () => navigation.navigate('PrivacyLedger'),
    openMuteHub: () => navigation.navigate('MuteHub'),
    openPublicProfile: (target) => navigation.navigate('PublicProfile', target),
    openAuth: () => navigation.navigate('Auth' as any),
    goBack: () => navigation.goBack(),
  };
}
