import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Theme, useTheme } from '@repo/ui';
import { SelfStackParamList } from '@repo/core';

// Web-specific screens
import SelfScreenWeb from '../screens/SelfScreen.web';

const Stack = createNativeStackNavigator<SelfStackParamList>();

export default function SelfStackNavigatorWeb() {
    const { gradientNodes } = useTheme();

    return (
        <Stack.Navigator
            id="SelfStack"
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: gradientNodes[0] },
            }}
        >
            <Stack.Screen name="SelfMain" component={SelfScreenWeb} />
        </Stack.Navigator>
    );
}