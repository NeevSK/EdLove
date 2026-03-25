import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@repo/ui';
import { StackFallback } from '../components/web/WebScreenShimmer';
import { ClassroomStackParamList } from '@repo/core';

// Web-specific screens — lazy loaded for code splitting
const ClassroomScreenWeb = React.lazy(() => import('../screens/ClassroomScreen.web'));
const TeacherClassroomDashboardWeb = React.lazy(() =>
    import('@repo/classroom').then(m => ({ default: m.TeacherClassroomDashboard }))
);
const StudentClassroomDashboardWeb = React.lazy(() =>
    import('@repo/classroom').then(m => ({ default: m.StudentClassroomDashboard }))
);

// Web-native attendance and gradebook (HTML/CSS, no RN gesture handlers)
const AttendanceScreen = React.lazy(() => import('../screens/AttendanceScreen.web'));
const GradebookScreen  = React.lazy(() => import('../screens/GradebookScreen.web'));
const StudentProfileScreen = React.lazy(() =>
    import('@repo/classroom').then(m => ({ default: m.StudentProfileScreen }))
);
const FounderDashboard = React.lazy(() =>
    import('@repo/classroom').then(m => ({ default: m.FounderDashboard }))
);
const FounderSchoolDashboard = React.lazy(() =>
    import('@repo/classroom').then(m => ({ default: m.FounderSchoolDashboard }))
);
const SchoolCreationScreen = React.lazy(() =>
    import('../screens/SchoolCreationScreen')
);
const TimetableScreen = React.lazy(() =>
    import('../screens/TimetableScreen.web')
);
const SchoolForestScreen = React.lazy(() =>
    import('../screens/SchoolForestScreen.web')
);
const FormBuilderScreen = React.lazy(() =>
    import('../screens/classroom/FormBuilderScreen.web')
);
const PublicFormScreen = React.lazy(() =>
    import('../screens/classroom/PublicFormScreen.web')
);

const Stack = createNativeStackNavigator<ClassroomStackParamList>();

function ScreenFallback() {
    return <StackFallback variant="list" />;
}

export default function ClassroomStackNavigatorWeb() {
    const { scene } = useTheme();

    return (
        <React.Suspense fallback={<ScreenFallback />}>
        <Stack.Navigator
            id="ClassroomStack"
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: scene.canvas.bg },
            }}
        >
            <Stack.Screen name="ClassroomList" component={ClassroomScreenWeb} />
            <Stack.Screen name="TeacherClassroomDashboard" component={TeacherClassroomDashboardWeb} />
            <Stack.Screen name="StudentClassroomDashboard" component={StudentClassroomDashboardWeb} />
            <Stack.Screen name="Attendance" component={AttendanceScreen} />
            <Stack.Screen name="Gradebook" component={GradebookScreen} />
            <Stack.Screen name="StudentProfile" component={StudentProfileScreen} />
            <Stack.Screen name="FounderDashboard" component={FounderDashboard} />
            <Stack.Screen name="FounderSchoolDashboard" component={FounderSchoolDashboard} />
            <Stack.Screen name="SchoolCreation" component={SchoolCreationScreen} />
            <Stack.Screen name="Timetable" component={TimetableScreen} />
            <Stack.Screen name="SchoolForest" component={SchoolForestScreen} />
            <Stack.Screen name="FormBuilder" component={FormBuilderScreen} />
            <Stack.Screen name="PublicForm" component={PublicFormScreen} />
        </Stack.Navigator>
        </React.Suspense>
    );
}
