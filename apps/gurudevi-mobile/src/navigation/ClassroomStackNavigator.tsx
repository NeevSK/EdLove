import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ClassroomScreen, ClassroomDetailsScreen } from '../screens';
import ClassroomDashboard from '../screens/ClassroomDashboard';
import AttendanceScreen from '../screens/classroom/AttendanceScreen';
import GradebookScreen from '../screens/grading/GradebookScreen';
import { Theme } from '../constants/Theme';

import { ClassroomStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<ClassroomStackParamList>();

export default function ClassroomStackNavigator() {
    return (
        <Stack.Navigator
            id="ClassroomStack"
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Theme.colors.voidIndigo },
            }}
        >
            <Stack.Screen name="ClassroomList" component={ClassroomScreen} />
            <Stack.Screen name="ClassroomDetails" component={ClassroomDashboard} />
            <Stack.Screen name="Attendance" component={AttendanceScreen} />
            <Stack.Screen name="Gradebook" component={GradebookScreen} />
        </Stack.Navigator>
    );
}
