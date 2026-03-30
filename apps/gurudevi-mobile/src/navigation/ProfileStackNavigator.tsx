import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { FullProfileScreen, ProfileNavigationProvider, ProfileScreen } from '@repo/profile';
import { UserPublicProfileScreen } from '@repo/community';
import { ProfileStackParamList, type FullProfileParams } from '@repo/core';
import PrivacyLedgerScreen from '@repo/self/screens/PrivacyLedgerScreen';
import AppSettingsScreen from '@repo/ui/screens/AppSettingsScreen';
import { useTheme } from '@repo/ui';
import { MuteHubScreen } from '@repo/profile';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

function withProfileNavigationCapabilities(element: React.ReactNode) {
    return <ProfileStackCapabilities>{element}</ProfileStackCapabilities>;
}

function ProfileStackCapabilities({ children }: { children: React.ReactNode }) {
    const navigation = useNavigation<any>();

    return (
        <ProfileNavigationProvider>
            value={{
                openFullProfile: (profile: FullProfileParams) => navigation.navigate('FullProfile', { profile }),
                openSettings: () => navigation.navigate('AppSettings'),
                openPrivacyLedger: () => navigation.navigate('PrivacyLedger'),
                openMuteHub: () => navigation.navigate('MuteHub'),
                openPublicProfile: (target) => navigation.navigate('PublicProfile', target),
                openAuth: () => navigation.navigate('Auth'),
                goBack: () => navigation.goBack(),
            }}
                    {children}
        </ProfileNavigationProvider    >);
}

export default function ProfileStackNavigator() {
    const { scene } = useTheme();

    return (
        <Stack.Navigator>
            id="ProfileStack"
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: scene.canvas.bg }, // contentStyle for native-stack
            }}
                    <Stack.Screen name="ProfileMain"                {() => withProfileNavigationCapabilities(<ProfileScreen />)}
            </Stack.Screen            ><Stack.Screen
                name="FullProfile"
                options={{
                    headerShown: false,
                    presentation: 'modal',
                    animation: 'slide_from_bottom',
                }}
                            {() => withProfileNavigationCapabilities(<FullProfileScreen />)}
            </Stack.Screen            <Stack.Screen
                name="AppSettings"
                component={AppSettingsScreen}
                options={{
                    headerShown: false,
                    presentation: 'modal',
                    animation: 'slide_from_right',
                }}
            /            ><Stack.Screen
                name="PrivacyLedger"
                component={PrivacyLedgerScreen}
                options={{
                    headerShown: false,
                    presentation: 'modal',
                    animation: 'slide_from_bottom',
                }}
            /            ><Stack.Screen
                name="PublicProfile"
                component={UserPublicProfileScreen}
                options={{
                    headerShown: false,
                    animation: 'slide_from_right',
                }}
            /            ><Stack.Screen
                name="MuteHub"
                component={MuteHubScreen}
                options={{
                    headerShown: false,
                    presentation: 'modal',
                    animation: 'slide_from_bottom',
                }}
            /        ></Stack.Navigator    );
}
