import 'react-native-url-polyfill/auto';
import './src/i18n/config'; // Initialize i18n
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GluestackUIProvider, Spinner, Center } from '@/ui';
import { config } from "./gluestack-ui.config";
import { Home, School, Users, Library, User } from 'lucide-react-native';
import { Session } from '@supabase/supabase-js';
import * as Font from 'expo-font';
import { supabase } from './src/lib/supabase';
import { Theme } from './src/constants/Theme';
import { fontAssets } from './src/constants/Fonts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useStore } from './src/store/useStore';
import { UserRole } from './src/types/User';
import { SchoolType } from './src/constants/SriLankanSchools';
import { EnvironmentProvider } from './src/context';

// Import screens and navigation
import WelcomeScreen from './src/screens/WelcomeScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
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
  const onboardingCompleted = useStore((state) => state.onboardingCompleted);

  // Create a helper for Supabase queries with timeout
  const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number = 5000): Promise<T> => {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
    );
    return Promise.race([promise, timeoutPromise]) as Promise<T>;
  };

  // Extract user profile fetching logic to avoid duplication
  const fetchAndSetUserProfile = async (userId: string) => {
    console.log(`🚀 Profile: Fetching for user ${userId}...`);
    try {
      const { data: userProfile, error } = await withTimeout(supabase
        .from('users')
        .select('role, school_id, onboarding_completed')
        .eq('id', userId)
        .single());

      if (error) {
        console.warn('⚠️ Profile: Table fetch returned error (maybe new user or missing table):', error.message);
        return;
      }

      if (userProfile) {
        console.log('✅ Profile: Data received', userProfile);
        const { setUserRole, setOnboardingCompleted } = useStore.getState();
        setUserRole(userProfile.role as UserRole | null);
        setOnboardingCompleted(!!userProfile.onboarding_completed);

        if (userProfile.school_id) {
          const { data: schoolData } = await withTimeout(supabase
            .from('schools')
            .select('type')
            .eq('id', userProfile.school_id)
            .single());

          if (schoolData) {
            useStore.getState().setSchoolType(schoolData.type as SchoolType | null);
          }
        } else {
          useStore.getState().setSchoolType(null);
        }
      }
    } catch (error) {
      console.warn('❌ Profile: Fetching encountered an error (continuing with defaults):', error);
    }
  };

  // Load custom fonts
  useEffect(() => {
    async function loadFonts() {
      console.log('🚀 Startup: Loading fonts...');
      try {
        await withTimeout(Font.loadAsync(fontAssets), 7000);
        console.log('✅ Startup: Fonts loaded successfully');
        setFontsLoaded(true);
      } catch (error) {
        console.warn('⚠️ Startup: Font loading failed or timed out:', error);
        setFontsLoaded(true);
      }
    }
    loadFonts();
  }, []);

  useEffect(() => {
    console.log('🚀 Startup: Initializing Auth session...');

    // Safety switch: Force loading to false after 10 seconds no matter what
    const safetyTimeout = setTimeout(() => {
      if (loading) {
        console.warn('🚨 SAFETY TIMEOUT: App initialization took too long, forcing start');
        setLoading(false);
      }
    }, 12000);

    const checkSession = async () => {
      try {
        // Initial session check with 5s timeout
        console.log('🚀 Startup: Checking getSession()...');
        const { data: { session }, error } = await withTimeout(supabase.auth.getSession(), 8000);

        if (error) throw error;

        setSession(session);
        console.log('🚀 Startup: Session check complete. Session exists:', !!session);

        if (session?.user) {
          await fetchAndSetUserProfile(session.user.id);
        } else {
          console.log('💡 Startup: No session found (New User flow)');
        }
      } catch (error) {
        console.warn('❌ Startup: Auth session check failed or timed out:', error);
      } finally {
        setLoading(false);
        clearTimeout(safetyTimeout);
        console.log('🏁 Startup: Initialization sequence finished');
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth Change:', event, !!session ? '(Session exists)' : '(No session)');
      setSession(session);

      if (session?.user) {
        await fetchAndSetUserProfile(session.user.id);
      } else {
        const { setUserRole, setSchoolType } = useStore.getState();
        setUserRole(null);
        setSchoolType(null);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimeout);
    };
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
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <EnvironmentProvider>
            <GluestackUIProvider config={config}>
              <ErrorBoundary name="App Root">
                <NavigationContainer>
                  {!session ? (
                    <ErrorBoundary name="Welcome Screen">
                      <WelcomeScreen />
                    </ErrorBoundary>
                  ) : !onboardingCompleted ? (
                    <ErrorBoundary name="Onboarding Screen">
                      <OnboardingScreen onComplete={(name: string, role: any) => {
                        console.log('Onboarding complete callback triggered in App.tsx', { name, role });
                        const store = useStore.getState();
                        store.setTeacherName(name);
                        store.setUserRole(role);
                        store.setOnboardingCompleted(true);
                        store.setJustFinishedOnboarding(true);
                        console.log('App Store updated: onboardingCompleted is now', useStore.getState().onboardingCompleted);
                      }} />
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
          </EnvironmentProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}