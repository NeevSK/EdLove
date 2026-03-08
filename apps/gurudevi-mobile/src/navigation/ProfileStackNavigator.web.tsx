import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Theme, useTheme } from '@repo/ui';
import { StackFallback } from '../components/web/WebScreenShimmer';
import { ProfileStackParamList } from '@repo/core';

// Web-specific screens — lazy loaded for code splitting
const ProfileScreenWeb = React.lazy(() => import('../screens/ProfileScreen.web'));
const AppSettingsScreenWeb = React.lazy(() => import('../screens/AppSettingsScreen.web'));
const FullProfileScreen = React.lazy(() => import('../screens/profile/FullProfileScreen'));

const Stack = createNativeStackNavigator<ProfileStackParamList>();

function ScreenFallback() {
    return <StackFallback variant="profile" />;
}

export default function ProfileStackNavigatorWeb() {
    const { gradientNodes } = useTheme();

    return (
        <React.Suspense fallback={<ScreenFallback />}>
        <Stack.Navigator
            id="ProfileStack"
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: gradientNodes[0] },
            }}
        >
            <Stack.Screen name="ProfileMain" component={ProfileScreenWeb} />
            <Stack.Screen name="AppSettings" component={AppSettingsScreenWeb} />
            <Stack.Screen name="FullProfile" component={FullProfileScreen} />
        </Stack.Navigator>
        </React.Suspense>
    );
}