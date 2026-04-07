import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useThemedColors } from '@repo/ui';
import { ProfileStackParamList } from '@repo/core';

// Static imports instead of React.lazy for stability on web
// Direct imports for stability on web, avoiding barrel file bloat
import ProfileScreenWeb from '@repo/profile/screens/ProfileScreen.web';
import FullProfileScreen from '@repo/profile/screens/FullProfileScreen.web';
import AppSettingsScreenWeb from '@repo/ui/screens/AppSettingsScreen.web';
import PrivacyLedgerScreen from '@repo/self/screens/PrivacyLedgerScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStackNavigatorWeb() {
    const colors = useThemedColors();

    return (
        <Stack.Navigator
            id="ProfileStack"
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.primary },
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