import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Theme, useTheme } from '@repo/ui';
import { StackFallback } from '../components/web/WebScreenShimmer';
import { ClassroomStackParamList } from '@repo/core';

// Web-specific screens — lazy loaded for code splitting
const ClassroomScreenWeb = React.lazy(() => import('../screens/ClassroomScreen.web'));
const ClassroomDetailScreenWeb = React.lazy(() => import('../screens/ClassroomDetailScreen.web'));

// Web-native attendance and gradebook (HTML/CSS, no RN gesture handlers)
const AttendanceScreen = React.lazy(() => import('../screens/AttendanceScreen.web'));
const GradebookScreen  = React.lazy(() => import('../screens/GradebookScreen.web'));
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
const TimetableScreen = React.lazy(() =>
    import('../screens/TimetableScreen.web')
);
const SchoolForestScreen = React.lazy(() =>
    import('../screens/SchoolForestScreen.web')
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
            <Stack.Screen name="Timetable" component={TimetableScreen} />
            <Stack.Screen name="SchoolForest" component={SchoolForestScreen} />
        </Stack.Navigator>
        </React.Suspense>
    );
}