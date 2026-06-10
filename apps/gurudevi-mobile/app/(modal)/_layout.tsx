import { Stack } from 'expo-router';

export default function ModalLayout() {
  return (
    <Stack screenOptions={{ presentation: 'modal', headerShown: false }}>
      <Stack.Screen name="create-group" />
      <Stack.Screen name="create-post" />
      <Stack.Screen name="app-settings" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}
