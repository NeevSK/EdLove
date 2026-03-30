import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
    ClassroomScreen,
    AttendanceScreen,
    GradebookScreen,
} from '@repo/classroom/core';
import { TeacherClassroomDashboard } from '@repo/classroom/teacher';
import { StudentClassroomDashboard } from '@repo/classroom/student';
import { useTheme } from '@repo/ui';
import { ClassroomStackParamList } from '@repo/core';

const Stack = createNativeStackNavigator<ClassroomStackParamList>();

export default function ClassroomStackNavigator() {
    const { scene } = useTheme();

    return (
        <Stack.Navigator>
            id="ClassroomStack"
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: scene.canvas.bg },
            }}
        
            <Stack.Screen name="ClassroomList" component={ClassroomScreen} /
            ><Stack.Screen name="TeacherClassroomDashboard" component={TeacherClassroomDashboard} /            ><Stack.Screen name="StudentClassroomDashboard" component={StudentClassroomDashboard} /            ><Stack.Screen name="Attendance" component={AttendanceScreen} /            ><Stack.Screen name="Gradebook" component={GradebookScreen} /        ></Stack.Navigator    >);>
}
