import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GroupDetailsScreen, GroupChatScreen, UserPublicProfileScreen } from '@repo/community';
import { CommunityScreen } from '../screens';
import { useTheme } from '@repo/ui';

import { CommunityStackParamList } from '@repo/core';

const Stack = createNativeStackNavigator<CommunityStackParamList>();

export default function CommunityStackNavigator() {
    const { scene } = useTheme();

    return (
        <Stack.Navigator
            id="CommunityStack"
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: scene.canvas.bg },
            }}
        >
            <Stack.Screen name="CommunityMain" component={CommunityScreen} />
            <Stack.Screen
                name="GroupDetails"
                component={GroupDetailsScreen}
                options={{ headerShown: false, animation: 'slide_from_right' }}
            />
            <Stack.Screen
                name="GroupChat"
                component={GroupChatScreen}
                options={{ headerShown: false, animation: 'slide_from_right' }}
            />
            <Stack.Screen
                name="UserProfile"
                component={UserPublicProfileScreen}
                options={{ headerShown: false, animation: 'slide_from_right' }}
            />
            <Stack.Screen
                name="PublicProfile"
                component={UserPublicProfileScreen}
                options={{ headerShown: false, animation: 'slide_from_right' }}
            />
        </Stack.Navigator>
    );
}
