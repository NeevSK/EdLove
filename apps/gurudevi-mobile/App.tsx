import 'react-native-url-polyfill/auto';
import './src/i18n/config'; // Initialize i18n
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GluestackUIProvider, Box, Spinner, Center } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config";
import { Home, School, Users, Library, User } from 'lucide-react-native';
import { Session } from '@supabase/supabase-js';
import * as Font from 'expo-font';
import { supabase } from './src/lib/supabase';
import { Theme } from './src/constants/Theme';
import { fontAssets } from './src/constants/Fonts';

// Import screens
import AuthScreen from './src/screens/AuthScreen';
import SelfScreen from './src/screens/SelfScreen';
import ClassroomScreen from './src/screens/ClassroomScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LotusPetalFAB from './src/components/LotusPetalFAB';

const Tab = createBottomTabNavigator();

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [currentTab, setCurrentTab] = useState<'self' | 'classroom' | 'community' | 'library' | 'profile'>('self');

  // Load custom fonts
  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync(fontAssets);
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts:', error);
        // Continue anyway - app will use system fonts as fallback
        setFontsLoaded(true);
      }
    }
    loadFonts();
  }, []);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    // This handles OAuth callback when user returns from Google/Apple authentication
    // via the deep link: gurudevi://auth/callback
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleFabPress = () => {
    // TODO: Implement specific actions for each tab
    console.log(`FAB pressed in ${currentTab} tab`);
    // Example logic (can be expanded later):
    // switch (currentTab) {
    //   case 'self': router.push('/log-mood'); break;
    //   case 'classroom': router.push('/create-lesson'); break;
    //   ...
    // }
  };

  if (loading || !fontsLoaded) {
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
            screenListeners={{
              state: (e) => {
                const routeName = e.data?.state?.routes[e.data.state.index]?.name;
                if (routeName) {
                  setCurrentTab(routeName.toLowerCase() as 'self' | 'classroom' | 'community' | 'library' | 'profile');
                }
              },
            }}
          >
            <Tab.Screen name="Self" component={SelfScreen} />
            <Tab.Screen name="Classroom" component={ClassroomScreen} />
            <Tab.Screen name="Community" component={CommunityScreen} />
            <Tab.Screen name="Library" component={LibraryScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
          </Tab.Navigator>
          <LotusPetalFAB
            currentTab={currentTab}
            onPress={handleFabPress}
          />
        </NavigationContainer>
      )}
    </GluestackUIProvider>
  );
}