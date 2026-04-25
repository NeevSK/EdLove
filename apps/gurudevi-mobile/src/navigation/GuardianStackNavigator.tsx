import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  FounderDashboard,
  FounderSchoolDashboard,
  GuardianCommunicationBridgeScreen,
  GuardianDashboard,
  GuardianEventsScreen,
  GuardianNotificationsScreen,
  GuardianStudentDetailScreen,
  GuardianStudentsScreen,
  PrincipalDashboard,
  SchoolCreationScreen,
} from '@repo/admin';
import type { GuardianStackParamList } from '@repo/core';
import { useTheme } from '@repo/ui';

const Stack = createNativeStackNavigator<GuardianStackParamList>();

export default function GuardianStackNavigator() {
  const { scene } = useTheme();
  return (
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
      <Stack.Screen name="PrincipalDashboard" component={PrincipalDashboard} />
      <Stack.Screen name="FounderDashboard" component={FounderDashboard} />
      <Stack.Screen name="FounderSchoolDashboard" component={FounderSchoolDashboard} />
      <Stack.Screen name="SchoolCreation" component={SchoolCreationScreen} />
    </Stack.Navigator>
  );
}
