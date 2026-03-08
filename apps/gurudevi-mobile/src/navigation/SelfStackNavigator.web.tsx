import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Theme, useTheme } from '@repo/ui';
import { StackFallback } from '../components/web/WebScreenShimmer';
import { SelfStackParamList } from '@repo/core';

// Web-specific screens — lazy loaded for code splitting
const SelfScreenWeb = React.lazy(() => import('../screens/SelfScreen.web'));

const Stack = createNativeStackNavigator<SelfStackParamList>();

function ScreenFallback() {
    return <StackFallback variant="full" />;
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