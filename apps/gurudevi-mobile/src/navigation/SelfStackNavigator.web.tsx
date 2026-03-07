import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Theme, useTheme } from '@repo/ui';
import { SelfStackParamList } from '@repo/core';

// Web-specific screens — lazy loaded for code splitting
const SelfScreenWeb = React.lazy(() => import('../screens/SelfScreen.web'));

const Stack = createNativeStackNavigator<SelfStackParamList>();

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

export default function SelfStackNavigatorWeb() {
    const { gradientNodes } = useTheme();

    return (
        <React.Suspense fallback={<ScreenFallback />}>
        <Stack.Navigator
            id="SelfStack"
            screenOptions={{
                headerShown: false,
                contentStyle: {
                    backgroundColor: gradientNodes[0],
                    overflow: 'visible',
                    minHeight: '100%',
                },
            }}
        >
            <Stack.Screen name="SelfMain" component={SelfScreenWeb} />
        </Stack.Navigator>
        </React.Suspense>
    );
}