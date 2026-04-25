import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  FounderDashboard,
  FounderSchoolDashboard,
  GuardianDashboard,
  PrincipalDashboard,
  SchoolCreationScreen,
} from '@repo/admin';
import type { FounderStackParamList } from '@repo/core';
import { useTheme } from '@repo/ui';

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
