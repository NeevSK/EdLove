import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Theme, useTheme } from '@repo/ui';
import { StackFallback } from '../components/web/WebScreenShimmer';
import { LibraryStackParamList } from '@repo/core';

// Web-specific screens — lazy loaded for code splitting
const LibraryScreenWeb = React.lazy(() => import('../screens/LibraryScreen.web'));

const Stack = createNativeStackNavigator<LibraryStackParamList>();

function ScreenFallback() {
    return <StackFallback variant="cards" />;
}

export default function LibraryStackNavigatorWeb() {
    const { gradientNodes } = useTheme();

    return (
        <React.Suspense fallback={<ScreenFallback />}>
        <Stack.Navigator
            id="LibraryStack"
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: gradientNodes[0] },
            }}
        >
            <Stack.Screen name="LibraryHome" component={LibraryScreenWeb} />
        </Stack.Navigator>
        </React.Suspense>
    );
}