import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Theme, useTheme } from '@repo/ui';
import { StackFallback } from '../components/web/WebScreenShimmer';
import { CommunityStackParamList } from '@repo/core';

// Web-specific screens — lazy loaded for code splitting
const CommunityScreenWeb = React.lazy(() => import('../screens/CommunityScreen.web'));

const Stack = createNativeStackNavigator<CommunityStackParamList>();

function ScreenFallback() {
    return <StackFallback variant="cards" />;
}

export default function CommunityStackNavigatorWeb() {
    const { gradientNodes } = useTheme();

    return (
        <React.Suspense fallback={<ScreenFallback />}>
        <Stack.Navigator
            id="CommunityStack"
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: gradientNodes[0] },
            }}
        >
            <Stack.Screen name="CommunityMain" component={CommunityScreenWeb} />
        </Stack.Navigator>
        </React.Suspense>
    );
}