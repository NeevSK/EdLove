import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Theme, useTheme } from '@repo/ui';
import { ClassroomStackParamList } from '@repo/core';

// Web-specific screens — lazy loaded for code splitting
const ClassroomScreenWeb = React.lazy(() => import('../screens/ClassroomScreen.web'));

const Stack = createNativeStackNavigator<ClassroomStackParamList>();

function ScreenFallback() {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: '200px', color: 'var(--ink-ghost)', fontSize: '14px',
            fontFamily: 'var(--font-body)',
        }}>
            <span style={{ fontStyle: 'italic' }}>Loading...</span>
        </div>
    );
}

export default function ClassroomStackNavigatorWeb() {
    const { gradientNodes } = useTheme();

    return (
        <React.Suspense fallback={<ScreenFallback />}>
        <Stack.Navigator
            id="ClassroomStack"
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: gradientNodes[0] },
            }}
        >
            <Stack.Screen name="ClassroomList" component={ClassroomScreenWeb} />
        </Stack.Navigator>
        </React.Suspense>
    );
}