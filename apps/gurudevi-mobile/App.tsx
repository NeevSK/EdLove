import 'react-native-url-polyfill/auto';
import './src/i18n/config'; // Initialize i18n
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { GluestackUIProvider, Box, Spinner, Center } from "@gluestack-ui/themed";
import { config } from "./gluestack-ui.config";
import { Home, School, Users, Library, User } from 'lucide-react-native';
import { Session } from '@supabase/supabase-js';
import * as Font from 'expo-font';
import { supabase } from './src/lib/supabase';
import { Theme } from './src/constants/Theme';
import { fontAssets } from './src/constants/Fonts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import screens and navigation
import AuthScreen from './src/screens/AuthScreen';
import TabNavigator from './src/navigation/TabNavigator';
import LotusPetalFAB, { ActionItem } from './src/components/shared/LotusPetalFAB';
import ErrorBoundary from './src/components/shared/ErrorBoundary';

// Create a client
const queryClient = new QueryClient();

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
  };

  // Define context-aware actions for each tab
  const getFabActions = (): ActionItem[] => {
    switch (currentTab) {
      case 'self':
        return [
          { label: 'Log Mood', onPress: () => console.log('Log mood'), icon: Home },
          { label: 'Journal Entry', onPress: () => console.log('Journal'), icon: Home },
          { label: 'Set Goal', onPress: () => console.log('Set goal'), icon: Home },
        ];
      case 'classroom':
        return [
          { label: 'Create Lesson', onPress: () => console.log('Create lesson'), icon: School },
          { label: 'Add Assignment', onPress: () => console.log('Add assignment'), icon: School },
          { label: 'Schedule Class', onPress: () => console.log('Schedule class'), icon: School },
        ];
      case 'community':
        return [
          { label: 'New Post', onPress: () => console.log('New post'), icon: Users },
          { label: 'Share Resource', onPress: () => console.log('Share resource'), icon: Users },
          { label: 'Start Discussion', onPress: () => console.log('Start discussion'), icon: Users },
        ];
      case 'library':
        return [
          { label: 'Upload File', onPress: () => console.log('Upload file'), icon: Library },
          { label: 'Create Collection', onPress: () => console.log('Create collection'), icon: Library },
          { label: 'Add Bookmark', onPress: () => console.log('Add bookmark'), icon: Library },
        ];
      case 'profile':
        return [
          { label: 'Edit Profile', onPress: () => console.log('Edit profile'), icon: User },
          { label: 'Change Avatar', onPress: () => console.log('Change avatar'), icon: User },
          { label: 'Update Bio', onPress: () => console.log('Update bio'), icon: User },
        ];
      default:
        return [];
    }
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <GluestackUIProvider config={config}>
          <ErrorBoundary name="App Root">
            <NavigationContainer>
              {!session ? (
                <ErrorBoundary name="Auth Screen">
                  <AuthScreen />
                </ErrorBoundary>
              ) : (
                <ErrorBoundary name="Main App">
                  <>
                    <TabNavigator
                      onTabChange={(tabName: any) => {
                        setCurrentTab(tabName as 'self' | 'classroom' | 'community' | 'library' | 'profile');
                      }}
                    />
                    <LotusPetalFAB
                      currentTab={currentTab}
                      onPress={handleFabPress}
                      actions={getFabActions()}
                    />
                  </>
                </ErrorBoundary>
              )}
            </NavigationContainer>
          </ErrorBoundary>
        </GluestackUIProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}