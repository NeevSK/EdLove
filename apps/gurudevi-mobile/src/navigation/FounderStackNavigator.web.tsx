import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FounderStackParamList } from '@repo/core';
import { useTheme } from '@repo/ui';
import { StackFallback } from '../components/web/WebScreenShimmer';

const FounderDashboard = React.lazy(() => import('@repo/admin/screens/FounderDashboard'));
const FounderSchoolDashboard = React.lazy(() => import('@repo/admin/screens/FounderSchoolDashboard'));
const SchoolCreationScreen = React.lazy(() => import('@repo/admin/screens/SchoolCreationScreen'));
const SchoolForestScreen = React.lazy(() => import('@repo/admin/screens/SchoolForestScreen.web'));
const PrincipalDashboardWeb = React.lazy(() => import('@repo/classroom/screens/PrincipalDashboard.web'));

const Stack = createNativeStackNavigator<FounderStackParamList>();

function ScreenFallback() {
    return <StackFallback variant="list" />;
}

export default function FounderStackNavigatorWeb() {
    const { scene } = useTheme();

    return (
        <React.Suspense fallback={<ScreenFallback />}            <Stack.Navigator
                id="FounderStack"
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: scene.canvas.bg },
                }}
                            <Stack.Screen name="FounderDashboard" component={FounderDashboard} /                <Stack.Screen name="FounderSchoolDashboard" component={FounderSchoolDashboard} /                <Stack.Screen name="PrincipalDashboard" component={PrincipalDashboardWeb} /                <Stack.Screen name="SchoolCreation" component={SchoolCreationScreen} /                <Stack.Screen name="SchoolForest" component={SchoolForestScreen} /            </Stack.Navigator        </React.Suspense    );
}
