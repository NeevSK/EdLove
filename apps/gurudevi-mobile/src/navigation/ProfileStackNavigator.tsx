import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import ProfileScreen from '../screens/ProfileScreen';
import TrubeLabScreen from '../screens/TrubeLabScreen';
import FullProfileScreen from '../screens/profile/FullProfileScreen';
import MuteHubScreen from '../screens/profile/MuteHubScreen';
import { PrivacyLedgerScreen } from '@repo/self';
import { useTheme } from '@repo/ui';

const Stack = createNativeStackNavigator();

export default function ProfileStackNavigator() {
    const { t } = useTranslation();
    const { scene } = useTheme();

    return (
        <Stack.Navigator
            id="ProfileStack"
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: scene.canvas.bg }, // contentStyle for native-stack
            }}
        >
            <Stack.Screen name="ProfileMain" component={ProfileScreen} />
            <Stack.Screen
                name="FullProfile"
                component={FullProfileScreen}
                options={{
                    headerShown: false,
                    presentation: 'modal',
                    animation: 'slide_from_bottom',
                }}
            />
            <Stack.Screen
                name="PrivacyLedger"
                component={PrivacyLedgerScreen}
                options={{
                    headerShown: false,
                    presentation: 'modal',
                    animation: 'slide_from_bottom',
                }}
            />
            <Stack.Screen
                name="MuteHub"
                component={MuteHubScreen}
                options={{
                    headerShown: false,
                    presentation: 'modal',
                    animation: 'slide_from_bottom',
                }}
            />
            <Stack.Screen
                name="TrubeLab"
                component={TrubeLabScreen}
                options={{
                    headerShown: false,
                    presentation: 'modal',
                    animation: 'slide_from_bottom',
                }}
            />
        </Stack.Navigator>
    );
}
