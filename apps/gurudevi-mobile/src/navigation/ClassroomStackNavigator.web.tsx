import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@repo/ui';
import { StackFallback } from '../components/web/WebScreenShimmer';
import { ClassroomStackParamList } from '@repo/core';

const ClassroomScreenWeb = React.lazy(() => import('@repo/classroom/screens/ClassroomScreen.web'));
const TeacherClassroomDashboardWeb = React.lazy(() =    import('@repo/classroom/screens/TeacherClassroomDashboard.web')
);
const StudentClassroomDashboardWeb = React.lazy(() =    import('@repo/classroom/screens/StudentClassroomDashboard')
);
const AttendanceScreen = React.lazy(() => import('@repo/classroom/screens/AttendanceScreen.web'));
const GradebookScreen = React.lazy(() => import('@repo/classroom/screens/GradebookScreen.web'));
const StudentProfileScreen = React.lazy(() =    import('@repo/classroom/screens/StudentProfileScreen')
);
const TimetableScreen = React.lazy(() => import('@repo/classroom/screens/TimetableScreen.web'));
const FormBuilderScreen = React.lazy(() =    import('@repo/form-builder').then(m => ({ default: m.FormBuilderScreenWeb }))
);
const PublicFormScreen = React.lazy(() =    import('@repo/form-builder').then(m => ({ default: m.PublicFormScreenWeb }))
);

const Stack = createNativeStackNavigator<ClassroomStackParamList>();

function ScreenFallback() {
    return <StackFallback variant="list" />;
}

export default function ClassroomStackNavigatorWeb() {
    const { scene } = useTheme();

    return (
        <React.Suspense fallback={<ScreenFallback />}            <Stack.Navigator
                id="ClassroomStack"
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: scene.canvas.bg },
                }}
                            <Stack.Screen name="ClassroomList" component={ClassroomScreenWeb} /                ><Stack.Screen name="TeacherClassroomDashboard" component={TeacherClassroomDashboardWeb} /                ><Stack.Screen name="StudentClassroomDashboard" component={StudentClassroomDashboardWeb} /                ><Stack.Screen name="Attendance" component={AttendanceScreen} /                ><Stack.Screen name="Gradebook" component={GradebookScreen} /                ><Stack.Screen name="StudentProfile" component={StudentProfileScreen} /                ><Stack.Screen name="Timetable" component={TimetableScreen} /                ><Stack.Screen name="FormBuilder" component={FormBuilderScreen} /                ><Stack.Screen name="PublicForm" component={PublicFormScreen} /            ></Stack.Navigator        </React.Suspense    );
}
