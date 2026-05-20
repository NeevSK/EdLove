import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FounderDashboard from '@repo/admin/screens/FounderDashboard';
import FounderSchoolDashboard from '@repo/admin/screens/FounderSchoolDashboard';
import GuardianCommunicationBridgeScreen from '@repo/admin/screens/GuardianCommunicationBridgeScreen';
import GuardianDashboard from '@repo/admin/screens/GuardianDashboard';
import GuardianEventsScreen from '@repo/admin/screens/GuardianEventsScreen';
import GuardianNotificationsScreen from '@repo/admin/screens/GuardianNotificationsScreen';
import GuardianStudentDetailScreen from '@repo/admin/screens/GuardianStudentDetailScreen';
import GuardianStudentsScreen from '@repo/admin/screens/GuardianStudentsScreen';
import PrincipalDashboard from '@repo/admin/screens/PrincipalDashboard';
import SchoolCreationScreen from '@repo/admin/screens/SchoolCreationScreen';
import type { GuardianStackParamList } from '@repo/core/types';
import { useTheme } from '@repo/ui/primitives';

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
      <Stack.Screen name="PrincipalDashboard" component={PrincipalDashboard as any} />
      <Stack.Screen name="FounderDashboard" component={FounderDashboard} />
      <Stack.Screen name="FounderSchoolDashboard" component={FounderSchoolDashboard as any} />
      <Stack.Screen name="SchoolCreation" component={SchoolCreationScreen} />
    </Stack.Navigator>
  );
}
