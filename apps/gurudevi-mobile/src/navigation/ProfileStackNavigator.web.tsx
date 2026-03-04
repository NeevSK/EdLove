import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Theme, useTheme } from '@repo/ui';
import { ProfileStackParamList } from '@repo/core';

// Web-specific screens
import ProfileScreenWeb from '../screens/ProfileScreen.web';

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
        </Stack.Navigator>
    );
}