import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Theme, useTheme } from '@repo/ui';
import { ProfileStackParamList } from '@repo/core';

// Web-specific screens
import ProfileScreenWeb from '../screens/ProfileScreen.web';
import AppSettingsScreenWeb from '../screens/AppSettingsScreen.web';
import FullProfileScreen from '../screens/profile/FullProfileScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStackNavigatorWeb() {
    const { gradientNodes } = useTheme();

    return (
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
    );
}