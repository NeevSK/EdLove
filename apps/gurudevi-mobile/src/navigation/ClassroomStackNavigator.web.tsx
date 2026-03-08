import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Theme, useTheme } from '@repo/ui';
import { StackFallback } from '../components/web/WebScreenShimmer';
import { ClassroomStackParamList } from '@repo/core';

// Web-specific screens — lazy loaded for code splitting
const ClassroomScreenWeb = React.lazy(() => import('../screens/ClassroomScreen.web'));

const Stack = createNativeStackNavigator<ClassroomStackParamList>();

function ScreenFallback() {
    return <StackFallback variant="list" />;
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