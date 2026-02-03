import 'react-native-url-polyfill/auto';
import './src/i18n/config'; // Initialize i18n
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GluestackUIProvider, Box, Spinner, Center } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config";
import { Home, School, Users, Library, User } from 'lucide-react-native';
import { Session } from '@supabase/supabase-js';
import { supabase } from './src/lib/supabase';
import { Theme } from './src/constants/Theme';

// Import screens
import AuthScreen from './src/screens/AuthScreen';
import SelfScreen from './src/screens/SelfScreen';
import ClassroomScreen from './src/screens/ClassroomScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AssistivePresence from './src/components/AssistivePresence';

const Tab = createBottomTabNavigator();

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <GluestackUIProvider config={config}>
        <Center sx={{ flex: 1, backgroundColor: Theme.colors.voidIndigo }}>
          <Spinner size="large" color={Theme.colors.sanctuarySaffron} />
        </Center>
      </GluestackUIProvider>
    );
  }

  return (
    <GluestackUIProvider config={config}>
      {!session ? (
        <AuthScreen />
      ) : (
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarStyle: {
                backgroundColor: Theme.colors.voidIndigo,
                borderTopWidth: 0,
                height: 70,
                paddingBottom: 10,
                paddingTop: 10,
              },
              tabBarActiveTintColor: Theme.colors.sanctuarySaffron,
              tabBarInactiveTintColor: Theme.colors.dimGray,
              tabBarIcon: ({ color, size }) => {
                if (route.name === 'Self') return <Home color={color} size={size} />;
                if (route.name === 'Classroom') return <School color={color} size={size} />;
                if (route.name === 'Community') return <Users color={color} size={size} />;
                if (route.name === 'Library') return <Library color={color} size={size} />;
                if (route.name === 'Profile') return <User color={color} size={size} />;
                return null;
              },
            })}
          >
            <Tab.Screen name="Self" component={SelfScreen} />
            <Tab.Screen name="Classroom" component={ClassroomScreen} />
            <Tab.Screen name="Community" component={CommunityScreen} />
            <Tab.Screen name="Library" component={LibraryScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
          </Tab.Navigator>
          <AssistivePresence />
        </NavigationContainer>
      )}
    </GluestackUIProvider>
  );
}