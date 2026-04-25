import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  AdminAuditLog,
  AdminAuthorityRepair,
  AdminDashboard,
  AdminIncidentQueue,
  AdminJobControl,
  AdminReleaseControl,
  AdminTenantDetail,
  FounderDashboard,
  FounderSchoolDashboard,
  PrincipalDashboard,
  SchoolCreationScreen,
} from '@repo/admin';
import type { FounderStackParamList } from '@repo/core';
import { useTheme } from '@repo/ui';

const Stack = createNativeStackNavigator<FounderStackParamList>();

export default function FounderStackNavigator() {
  const { scene } = useTheme();

  return (
    <Stack.Navigator
      id="FounderStack"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: scene.canvas.bg },
      }}
    >
      <Stack.Screen name="FounderDashboard" component={FounderDashboard} />
      <Stack.Screen name="FounderSchoolDashboard" component={FounderSchoolDashboard} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      <Stack.Screen name="AdminIncidentQueue" component={AdminIncidentQueue} />
      <Stack.Screen name="AdminTenantDetail" component={AdminTenantDetail} />
      <Stack.Screen name="AdminAuthorityRepair" component={AdminAuthorityRepair} />
      <Stack.Screen name="AdminJobControl" component={AdminJobControl} />
      <Stack.Screen name="AdminAuditLog" component={AdminAuditLog} />
      <Stack.Screen name="AdminReleaseControl" component={AdminReleaseControl} />
      <Stack.Screen name="PrincipalDashboard" component={PrincipalDashboard} />
      <Stack.Screen name="SchoolCreation" component={SchoolCreationScreen} />
    </Stack.Navigator>
  );
}
