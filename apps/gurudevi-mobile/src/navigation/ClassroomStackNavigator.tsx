import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
    ClassroomScreen,
    ClassroomDashboard,
    AttendanceScreen,
    GradebookScreen,
    FounderDashboard,
    FounderSchoolView
} from '@repo/classroom';
import { Theme, useTheme } from '@repo/ui';
import { ClassroomStackParamList } from '@repo/core';
import { SchoolCreationScreen } from '../screens'; // Added

const Stack = createNativeStackNavigator<ClassroomStackParamList>();

export default function ClassroomStackNavigator() {
    const { gradientNodes } = useTheme();

    return (
        <Stack.Navigator
            id="ClassroomStack"
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: gradientNodes[0] },
            }}
        >
            <Stack.Screen name="ClassroomList" component={ClassroomScreen} />
            <Stack.Screen name="ClassroomDetails" component={ClassroomDashboard} />
            <Stack.Screen name="Attendance" component={AttendanceScreen} />
            <Stack.Screen name="Gradebook" component={GradebookScreen} />
            <Stack.Screen name="SchoolCreation" component={SchoolCreationScreen} />
            <Stack.Screen name="FounderDashboard" component={FounderDashboard} />
            <Stack.Screen name="FounderSchoolView" component={FounderSchoolView} />
        </Stack.Navigator>
    );
}
