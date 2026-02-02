import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const [session, setSession] = useState<any>(null);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // 1. Check if user is already logged in when app starts
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialized(true);
    });

    // 2. Listen for live changes (Login, Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!initialized) return;

    // 3. THE UPDATED SECURITY CHECK (Relaxed)
    
    // Check if the user is currently on the login screen
    const inAuthGroup = segments[0] === 'login';

    if (session && inAuthGroup) {
      // Scenario A: User is Logged In, but trying to see Login Page
      // Action: Send them to Dashboard
      router.replace('/(tabs)');
    } else if (!session && !inAuthGroup) {
      // Scenario B: User is NOT Logged In, but trying to see App Pages (Tabs, Chat, etc.)
      // Action: Send them to Login
      router.replace('/login');
    }
    
    // Scenario C: User is Logged In and on Group Chat (which is !inAuthGroup)
    // Action: Do nothing. Allow them to stay there!
    
  }, [session, initialized, segments]);

  if (!initialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="login" />
      {/* We add this line so the Group Chat has a nice back button header */}
      <Stack.Screen name="group_chat" options={{ headerShown: true, title: 'Chat' }} /> 
    </Stack>
  );
}