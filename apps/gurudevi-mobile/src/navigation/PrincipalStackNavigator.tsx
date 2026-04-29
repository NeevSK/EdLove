import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FounderDashboard from '@repo/admin/screens/FounderDashboard';
import FounderSchoolDashboard from '@repo/admin/screens/FounderSchoolDashboard';
import GuardianDashboard from '@repo/admin/screens/GuardianDashboard';
import PrincipalDashboard from '@repo/admin/screens/PrincipalDashboard';
import SchoolCreationScreen from '@repo/admin/screens/SchoolCreationScreen';
import type { FounderStackParamList } from '@repo/core';
import { useTheme } from '@repo/ui/primitives';

const Stack = createNativeStackNavigator<FounderStackParamList>();

export default function PrincipalStackNavigator() {
  const { scene } = useTheme();
  return (
    <Stack.Navigator
      id="PrincipalStack"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: scene.canvas.bg },
      }}
    >
      <Stack.Screen name="PrincipalDashboard" component={PrincipalDashboard} />
      <Stack.Screen name="GuardianDashboard" component={GuardianDashboard} />
      <Stack.Screen name="FounderDashboard" component={FounderDashboard} />
      <Stack.Screen name="FounderSchoolDashboard" component={FounderSchoolDashboard} />
      <Stack.Screen name="SchoolCreation" component={SchoolCreationScreen} />
    </Stack.Navigator>
  );
}
