import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FounderStackParamList } from '@repo/core';
import { useTheme } from '@repo/ui';
import { FounderDashboard, FounderSchoolDashboard, SchoolCreationScreen } from '@repo/admin/founder';
import PrincipalDashboard from '@repo/classroom/screens/PrincipalDashboard';

const Stack = createNativeStackNavigator<FounderStackParamList>();

export default function FounderStackNavigator() {
    const { scene } = useTheme();

    return (
        <Stack.Navigator
            id="FounderStack"
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: scene.canvas.bg },
            }}
                    <Stack.Screen name="FounderDashboard" component={FounderDashboard} /            <Stack.Screen name="FounderSchoolDashboard" component={FounderSchoolDashboard} /            <Stack.Screen name="PrincipalDashboard" component={PrincipalDashboard} /            <Stack.Screen name="SchoolCreation" component={SchoolCreationScreen} /        </Stack.Navigator    );
}
