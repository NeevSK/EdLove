import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ClassroomStackParamList } from '@repo/core/types';
import { useTheme } from '@repo/ui/primitives';

import React from 'react';
import { StackFallback } from '../components/web/WebScreenShimmer';

// Web-specific screens — lazy loaded for code splitting
// Web-specific screens — lazy loaded for code splitting
const ClassroomScreenWeb = React.lazy(() =>
  import('@repo/classroom').then((module) => ({ default: module.ClassroomScreenWeb })),
);
const ClassroomDetailScreenWeb = React.lazy(() =>
  import('@repo/classroom').then((module) => ({
    default: module.ClassroomDetailScreenWeb,
  })),
);

// Web-native attendance and gradebook
const AttendanceScreen = React.lazy(() =>
  import('@repo/classroom').then((module) => ({ default: module.AttendanceScreenWeb })),
);
const GradebookScreen = React.lazy(() =>
  import('@repo/classroom').then((module) => ({ default: module.GradebookScreenWeb })),
);
const StudentProfileScreen = React.lazy(() =>
  import('@repo/classroom').then((module) => ({ default: module.StudentProfileScreen })),
);
const FounderDashboard = React.lazy(() => import('@repo/admin/screens/FounderDashboard.web'));
const FounderSchoolView = React.lazy(() => import('@repo/admin/screens/FounderSchoolDashboard'));
const SchoolCreationScreen = React.lazy(() => import('@repo/admin/screens/SchoolCreationScreen'));
const TimetableScreen = React.lazy(() =>
  import('@repo/classroom').then((module) => ({ default: module.TimetableScreen })),
);
const SchoolForestScreen = React.lazy(() => import('@repo/admin/screens/SchoolForestScreen.web'));

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
        <Stack.Screen name="FounderSchoolView" component={FounderSchoolView as any} />
        <Stack.Screen name="SchoolCreation" component={SchoolCreationScreen} />
        <Stack.Screen name="Timetable" component={TimetableScreen} />
        <Stack.Screen name="SchoolForest" component={SchoolForestScreen} />
      </Stack.Navigator>
    </React.Suspense>
  );
}
