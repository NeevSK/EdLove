import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { GuardianStackParamList } from '@repo/core';
import { useTheme } from '@repo/ui/primitives';

import React from 'react';
import { StackFallback } from '../components/web/WebScreenShimmer';

const FounderDashboard = React.lazy(() => import('@repo/admin/screens/FounderDashboard.web'));
const FounderSchoolDashboard = React.lazy(
  () => import('@repo/admin/screens/FounderSchoolDashboard'),
);
const GuardianDashboard = React.lazy(() => import('@repo/admin/screens/GuardianDashboard'));
const GuardianStudentsScreen = React.lazy(() => import('@repo/admin/screens/GuardianStudentsScreen'));
const GuardianStudentDetailScreen = React.lazy(() => import('@repo/admin/screens/GuardianStudentDetailScreen'));
const GuardianNotificationsScreen = React.lazy(() => import('@repo/admin/screens/GuardianNotificationsScreen'));
const GuardianEventsScreen = React.lazy(() => import('@repo/admin/screens/GuardianEventsScreen'));
const GuardianCommunicationBridgeScreen = React.lazy(() => import('@repo/admin/screens/GuardianCommunicationBridgeScreen'));
const PrincipalDashboardWeb = React.lazy(
  () => import('@repo/admin/screens/PrincipalDashboard.web'),
);
const SchoolCreationScreen = React.lazy(() => import('@repo/admin/screens/SchoolCreationScreen'));

const Stack = createNativeStackNavigator<GuardianStackParamList>();

function ScreenFallback() {
  return <StackFallback variant="list" />;
}

export default function GuardianStackNavigatorWeb() {
  const { scene } = useTheme();
  return (
    <React.Suspense fallback={<ScreenFallback />}>
      <Stack.Navigator
        id="GuardianStack"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: scene.canvas.bg },
        }}
      >
        <Stack.Screen name="GuardianDashboard" component={GuardianDashboard} />
        <Stack.Screen name="GuardianStudents" component={GuardianStudentsScreen} />
        <Stack.Screen name="GuardianStudentDetail" component={GuardianStudentDetailScreen} />
        <Stack.Screen name="GuardianNotifications" component={GuardianNotificationsScreen} />
        <Stack.Screen name="GuardianEvents" component={GuardianEventsScreen} />
        <Stack.Screen
          name="GuardianCommunicationBridge"
          component={GuardianCommunicationBridgeScreen}
        />
        <Stack.Screen name="PrincipalDashboard" component={PrincipalDashboardWeb} />
        <Stack.Screen name="FounderDashboard" component={FounderDashboard} />
        <Stack.Screen name="FounderSchoolDashboard" component={FounderSchoolDashboard} />
        <Stack.Screen name="SchoolCreation" component={SchoolCreationScreen} />
      </Stack.Navigator>
    </React.Suspense>
  );
}
