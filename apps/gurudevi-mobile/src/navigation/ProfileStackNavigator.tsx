import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PrivacyLedgerScreen } from '@repo/self';
import { useTheme } from '@repo/ui/primitives';

import { FullProfileScreen, ProfileScreen } from '@repo/profile';

const Stack = createNativeStackNavigator();

export default function ProfileStackNavigator() {
  const { scene } = useTheme();

  return (
    <Stack.Navigator
      id="ProfileStack"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: scene.surface.bg }, // contentStyle for native-stack
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen
        name="FullProfile"
        component={FullProfileScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="PrivacyLedger"
        component={PrivacyLedgerScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
}
