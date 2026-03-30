import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { useTheme } from '@repo/ui';
const AppSettingsScreenWeb = React.lazy(
    () => import('@repo/ui/screens/AppSettingsScreen.web')
);
import { MuteHubScreen } from '@repo/profile';
import { ProfileStackParamList, type FullProfileParams } from '@repo/core';
import { FullProfileScreenWeb, ProfileNavigationProvider, ProfileScreenWeb } from '@repo/profile';
import { UserPublicProfileScreen } from '@repo/community';
import PrivacyLedgerScreen from '@repo/self/screens/PrivacyLedgerScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

function withProfileNavigationCapabilities(element: React.ReactNode) {
    return <ProfileStackCapabilities>{element}</ProfileStackCapabilities>;
}

function ProfileStackCapabilities({ children }: { children: React.ReactNode }) {
    const navigation = useNavigation<NavigationProp<ProfileStackParamList>>();

    return (
        <ProfileNavigationProvider>
            value={{
                openFullProfile: (profile: FullProfileParams) => navigation.navigate('FullProfile', { profile }),
                openSettings: () => navigation.navigate('AppSettings'),
                openPrivacyLedger: () => navigation.navigate('PrivacyLedger'),
                openMuteHub: () => navigation.navigate('MuteHub'),
                openPublicProfile: (target) => navigation.navigate('PublicProfile', target),
                // @ts-expect-error - Auth is in RootNavigator but not in local param list
                openAuth: () => navigation.navigate('Auth'),
                goBack: () => navigation.goBack(),
            }}
                    {children}
        </ProfileNavigationProvider    >);
}

export default function ProfileStackNavigatorWeb() {
    const { scene } = useTheme();

    return (
        <Stack.Navigator>
            id="ProfileStack"
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: scene.canvas.bg },
                animation: 'slide_from_right',
            }}
                    <Stack.Screen name="ProfileMain"                {() => withProfileNavigationCapabilities(<ProfileScreenWeb />)}
            </Stack.Screen            ><Stack.Screen name="FullProfile"                {() => withProfileNavigationCapabilities(<FullProfileScreenWeb />)}
            </Stack.Screen            <Stack.Screen name="AppSettings" component={AppSettingsScreenWeb} /            ><Stack.Screen name="PrivacyLedger" component={PrivacyLedgerScreen} /            ><Stack.Screen name="PublicProfile" component={UserPublicProfileScreen} /            ><Stack.Screen name="MuteHub" component={MuteHubScreen} /        ></Stack.Navigator    );
}
