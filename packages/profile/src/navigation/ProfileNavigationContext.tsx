import React, { createContext, useContext } from 'react';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import type { FullProfileParams, ProfileStackParamList } from '@repo/core';

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
        <ProfileNavigationContext.Provider value={value}            {children}
        </ProfileNavigationContext.Provider    );
}

export function useProfileNavigation(): ProfileNavigationCapabilities {
    const capabilities = useContext(ProfileNavigationContext);
    const navigation = useNavigation<NavigationProp<ProfileStackParamList>>();

    if (capabilities) {
        return capabilities;
    }

    return {
        openFullProfile: (profile) => navigation.navigate('FullProfile', { profile }),
        openSettings: () => navigation.navigate('AppSettings'),
        openPrivacyLedger: () => navigation.navigate('PrivacyLedger'),
        openMuteHub: () => navigation.navigate('MuteHub'),
        openPublicProfile: (target) => navigation.navigate('PublicProfile', target),
        // @ts-expect-error - Auth is in RootNavigator but not in ProfileStackParamList
        openAuth: () => navigation.navigate('Auth'),
        goBack: () => navigation.goBack(),
    };
}
