import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@repo/ui';
import { ProfileStackParamList } from '@repo/core';

// Static imports instead of React.lazy for stability on web
import ProfileScreenWeb from '../screens/ProfileScreen.web';
import AppSettingsScreenWeb from '../screens/AppSettingsScreen.web';
import FullProfileScreen from '../screens/profile/FullProfileScreen';
import { PrivacyLedgerScreen } from '@repo/self';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStackNavigatorWeb() {
    const { scene } = useTheme();

    return (
        <Stack.Navigator
            id="ProfileStack"
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: scene.canvas.bg },
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="ProfileMain" component={ProfileScreenWeb} />
            <Stack.Screen name="FullProfile" component={FullProfileScreen} />
            <Stack.Screen name="AppSettings" component={AppSettingsScreenWeb} />
            <Stack.Screen name="PrivacyLedger" component={PrivacyLedgerScreen} />
        </Stack.Navigator>
    );
}
