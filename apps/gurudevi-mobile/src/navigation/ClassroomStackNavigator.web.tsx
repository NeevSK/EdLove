import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Theme, useTheme } from '@repo/ui';
import { StackFallback } from '../components/web/WebScreenShimmer';
import { ClassroomStackParamList } from '@repo/core';

// Web-specific screens — lazy loaded for code splitting
const ClassroomScreenWeb = React.lazy(() => import('../screens/ClassroomScreen.web'));
const ClassroomDetailScreenWeb = React.lazy(() => import('../screens/ClassroomDetailScreen.web'));

// Package classroom screens (Metro resolves .web.tsx automatically where available)
const AttendanceScreen = React.lazy(() =>
    import('@repo/classroom').then(m => ({ default: m.AttendanceScreen }))
);
const GradebookScreen = React.lazy(() =>
    import('@repo/classroom').then(m => ({ default: m.GradebookScreen }))
);
const StudentProfileScreen = React.lazy(() =>
    import('@repo/classroom').then(m => ({ default: m.StudentProfileScreen }))
);
const FounderDashboard = React.lazy(() =>
    import('@repo/classroom').then(m => ({ default: m.FounderDashboard }))
);
const FounderSchoolView = React.lazy(() =>
    import('@repo/classroom').then(m => ({ default: m.FounderSchoolView }))
);
const SchoolCreationScreen = React.lazy(() =>
    import('../screens/SchoolCreationScreen')
);

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
            <Stack.Screen name="ClassroomDetails" component={ClassroomDetailScreenWeb} />
            <Stack.Screen name="Attendance" component={AttendanceScreen} />
            <Stack.Screen name="Gradebook" component={GradebookScreen} />
            <Stack.Screen name="StudentProfile" component={StudentProfileScreen} />
            <Stack.Screen name="FounderDashboard" component={FounderDashboard} />
            <Stack.Screen name="FounderSchoolView" component={FounderSchoolView} />
            <Stack.Screen name="SchoolCreation" component={SchoolCreationScreen} />
        </Stack.Navigator>
        </React.Suspense>
    );
}