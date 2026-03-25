import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
    ClassroomScreen,
    AttendanceScreen,
    GradebookScreen,
    FounderDashboard,
    FounderSchoolDashboard,
    TeacherClassroomDashboard,
    StudentClassroomDashboard
} from '@repo/classroom';
import { useTheme } from '@repo/ui';
import { ClassroomStackParamList } from '@repo/core';
import { SchoolCreationScreen } from '../screens'; // Added

const Stack = createNativeStackNavigator<ClassroomStackParamList>();

export default function ClassroomStackNavigator() {
    const { scene } = useTheme();

    return (
        <Stack.Navigator
            id="ClassroomStack"
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: scene.canvas.bg },
            }}
        >
            <Stack.Screen name="ClassroomList" component={ClassroomScreen} />
            <Stack.Screen name="TeacherClassroomDashboard" component={TeacherClassroomDashboard} />
            <Stack.Screen name="StudentClassroomDashboard" component={StudentClassroomDashboard} />
            <Stack.Screen name="Attendance" component={AttendanceScreen} />
            <Stack.Screen name="Gradebook" component={GradebookScreen} />
            <Stack.Screen name="SchoolCreation" component={SchoolCreationScreen} />
            <Stack.Screen name="FounderDashboard" component={FounderDashboard} />
            <Stack.Screen name="FounderSchoolDashboard" component={FounderSchoolDashboard} />
        </Stack.Navigator>
    );
}
