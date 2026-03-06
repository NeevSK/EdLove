import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Theme, useTheme } from '@repo/ui';
import { LibraryStackParamList } from '@repo/core';

// Web-specific screens
import LibraryScreenWeb from '../screens/LibraryScreen.web';

const Stack = createNativeStackNavigator<LibraryStackParamList>();

export default function LibraryStackNavigatorWeb() {
    const { gradientNodes } = useTheme();

    return (
        <Stack.Navigator
            id="LibraryStack"
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: gradientNodes[0] },
            }}
        >
            <Stack.Screen name="LibraryHome" component={LibraryScreenWeb} />
        </Stack.Navigator>
    );
}