import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Theme, useTheme } from '@repo/ui';
import { CommunityStackParamList } from '@repo/core';

// Web-specific screens
import CommunityScreenWeb from '../screens/CommunityScreen.web';

const Stack = createNativeStackNavigator<CommunityStackParamList>();

export default function CommunityStackNavigatorWeb() {
    const { gradientNodes } = useTheme();

    return (
        <Stack.Navigator
            id="CommunityStack"
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: gradientNodes[0] },
            }}
        >
            <Stack.Screen name="CommunityMain" component={CommunityScreenWeb} />
        </Stack.Navigator>
    );
}