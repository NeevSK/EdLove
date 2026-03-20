import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@repo/ui';
import { StackFallback } from '../components/web/WebScreenShimmer';
import { SelfStackParamList } from '@repo/core';

// Web-specific screens — lazy loaded for code splitting
const SelfScreenWeb = React.lazy(() => import('../screens/SelfScreen.web'));
// AI Assistant screen — web override with CSS message list (no FlatList)
const AIAssistantScreen = React.lazy(() => import('../screens/AIAssistantScreen.web'));

const Stack = createNativeStackNavigator<SelfStackParamList>();

function ScreenFallback() {
    return <StackFallback variant="full" />;
}

export default function SelfStackNavigatorWeb() {
    const { scene } = useTheme();

    return (
        <React.Suspense fallback={<ScreenFallback />}>
        <Stack.Navigator
            id="SelfStack"
            screenOptions={{
                headerShown: false,
                contentStyle: {
                    backgroundColor: scene.canvas.bg,
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
