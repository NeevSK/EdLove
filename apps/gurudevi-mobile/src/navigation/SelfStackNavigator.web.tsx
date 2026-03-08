import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Theme, useTheme } from '@repo/ui';
import { StackFallback } from '../components/web/WebScreenShimmer';
import { SelfStackParamList } from '@repo/core';

// Web-specific screens — lazy loaded for code splitting
const SelfScreenWeb = React.lazy(() => import('../screens/SelfScreen.web'));
// AI Assistant screen — accessible from the Self stack on web
// (navigating cross-navigator from Tab → Root silently fails on web)
const AIAssistantScreen = React.lazy(() => import('../screens/AIAssistantScreen'));

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
            <Stack.Screen
                name="AIAssistant"
                component={AIAssistantScreen}
                options={{
                    presentation: 'modal',
                    animation: 'slide_from_bottom',
                }}
            />
        </Stack.Navigator>
        </React.Suspense>
    );
}