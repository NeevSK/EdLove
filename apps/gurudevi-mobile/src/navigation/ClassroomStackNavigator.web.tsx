import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Theme, useTheme } from '@repo/ui';
import { ClassroomStackParamList } from '@repo/core';

// Web-specific screens
import ClassroomScreenWeb from '../screens/ClassroomScreen.web';

const Stack = createNativeStackNavigator<ClassroomStackParamList>();

export default function ClassroomStackNavigatorWeb() {
    const { gradientNodes } = useTheme();

    return (
        <Stack.Navigator
            id="ClassroomStack"
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: gradientNodes[0] },
            }}
        >
            <Stack.Screen name="ClassroomList" component={ClassroomScreenWeb} />
        </Stack.Navigator>
    );
}