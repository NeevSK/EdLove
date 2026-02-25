import 'react-native-url-polyfill/auto';
import './src/i18n/config'; // Initialize i18n
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GluestackUIProvider, Spinner, Center, VStack, Text } from '@repo/ui';
import { config } from "./gluestack-ui.config";
import { Home, School, Users, Library, User, Sparkles } from 'lucide-react-native';
import { Session } from '@supabase/supabase-js';
import * as Font from 'expo-font';
import { supabase, useStore, UserRole, SchoolType, initSentry, initPostHog, trackEvent, identifyUser } from '@repo/core';
import { Platform } from 'react-native';
import { PostHogProvider } from 'posthog-react-native';
import * as Sentry from '@sentry/react-native';
import { Theme } from '@repo/ui';
import { fontAssets } from './src/constants/Fonts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EnvironmentProvider } from '@repo/ui';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens and navigation
import WelcomeScreen from './src/screens/WelcomeScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import TabNavigator from './src/navigation/TabNavigator';
import { AIAssistantScreen, AuthScreen } from './src/screens';
import { SanctuaryToast, ToastProvider } from '@repo/ui';
import type { ActionItem } from '@repo/ui';
import ErrorBoundary from './src/components/shared/ErrorBoundary';
import NetworkStatusBanner from './src/components/shared/NetworkStatusBanner';
import SyncManager from './src/lib/sync/SyncManager';
import { LanguageUtils } from './src/utils/LanguageUtils';

// Create a client
const queryClient = new QueryClient();

// Initialize Sentry & PostHog
initSentry();
initPostHog().then(() => {
  trackEvent('app_initialized', { platform: Platform.OS });
});

// Root Stack for Modals
const RootStack = createNativeStackNavigator();

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [currentTab, setCurrentTab] = useState<'self' | 'classroom' | 'community' | 'library' | 'profile'>('self');
  const onboardingCompleted = useStore((state) => state.onboardingCompleted);
  const [showWelcome, setShowWelcome] = useState(true);
  const toast = useStore((state) => state.toast);
  const hideToast = useStore((state) => state.hideToast);

  // Create a helper for Supabase queries with timeout
  const withTimeout = async (promise: any, timeoutMs: number = 5000): Promise<any> => {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
    );
    return Promise.race([promise, timeoutPromise]);
  };

  const { i18n } = useTranslation();

  // Load saved language preference
  useEffect(() => {
    async function initLanguage() {
      await LanguageUtils.init();
    }
    initLanguage();
  }, []);

  // Sync showWelcome with session status
  useEffect(() => {
    if (session && showWelcome) {
      console.log('🔄 App: Session detected, automatically hiding WelcomeScreen');
      setShowWelcome(false);
    }
  }, [session]);

  // Extract user profile fetching logic to avoid duplication
  const fetchAndSetUserProfile = async (userId: string) => {
    console.log(`🚀 Profile: Fetching for user ${userId}...`);
    try {
      const { data: userProfile, error } = await withTimeout((supabase
        .from('users')
        .select('role, school_id, onboarding_completed')
        .eq('id', userId)
        .maybeSingle()) as any);

      if (error) {
        console.warn('⚠️ Profile: Table fetch returned error (maybe new user or missing table):', error.message);
        return;
      }

      if (userProfile) {
        console.log('✅ Profile: Data received', userProfile);
        const { setUserRole, setOnboardingCompleted } = useStore.getState();
        setUserRole(userProfile.role as UserRole | null);
        setOnboardingCompleted(!!userProfile.onboarding_completed);
        console.log('📝 Store updated:', { role: userProfile.role, onboardingCompleted: !!userProfile.onboarding_completed });

        if (userProfile.school_id) {
          const { data: schoolData } = await withTimeout((supabase
            .from('schools')
            .select('type')
            .eq('id', userProfile.school_id)
            .single()) as any);

          if (schoolData) {
            useStore.getState().setSchoolType(schoolData.type as SchoolType | null);
          }
        } else {
          useStore.getState().setSchoolType(null);
        }
      }
    } catch (error) {
      console.warn('❌ Profile: Fetching encountered an error:', error);
      const { handleAPIError } = require('@repo/core');
      handleAPIError(error);
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
        const { data: { session }, error } = await withTimeout(supabase.auth.getSession() as any, 8000);

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
    // ... rest of the existing code

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth Change:', event, !!session ? '(Session exists)' : '(No session)');
      setSession(session);

      if (session?.user) {
        await fetchAndSetUserProfile(session.user.id);
      } else {
        const { setUserRole, setSchoolType, setTeacherName, setOnboardingCompleted } = useStore.getState();
        setUserRole(null);
        setSchoolType(null);
        setTeacherName('Gurudevi');
        setOnboardingCompleted(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, []);

  // Monitor network connectivity - REMOVED redundant listener (Centralized in EnvironmentContext)

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
      <SafeAreaProvider>
        <GluestackUIProvider config={config}>
          <Center sx={{ flex: 1, backgroundColor: Theme.colors.midnightBlue }}>
            <VStack space="md" alignItems="center">
              <Spinner size="large" color={Theme.colors.sanctuarySaffron} />
              <Text sx={{ color: Theme.colors.sacredWhite, fontSize: '$sm' as any }}>
                Initializing Sanctuary...
              </Text>
            </VStack>
          </Center>
        </GluestackUIProvider>
      </SafeAreaProvider>
    );
  }

  const isNewUser = !onboardingCompleted;
  const needsWelcome = showWelcome && isNewUser;

  console.log('App: Loading finished, rendering main tree');

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <EnvironmentProvider>
            <GluestackUIProvider config={config}>
              <ToastProvider>
                <ErrorBoundary name="App Root">
                  <NavigationContainer>
                    <PostHogProvider
                      apiKey={process.env.EXPO_PUBLIC_POSTHOG_API_KEY}
                      options={{
                        host: process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
                      }}
                      autocapture={true}
                    >
                      <RootStack.Navigator screenOptions={{ headerShown: false }}>
                        {(!session || needsWelcome) ? (
                          <RootStack.Screen name="Welcome">
                            {() => (
                              <ErrorBoundary name="Welcome Screen">
                                <WelcomeScreen
                                  initialShowAuth={onboardingCompleted}
                                  onNext={() => {
                                    console.log('➡️ App: onNext called from WelcomeScreen');
                                    setShowWelcome(false);
                                  }}
                                />
                              </ErrorBoundary>
                            )}
                          </RootStack.Screen>
                        ) : !onboardingCompleted ? (
                          <RootStack.Screen name="Onboarding">
                            {() => (
                              <ErrorBoundary name="Onboarding Screen">
                                <OnboardingScreen
                                  isAnonymous={session?.user?.email?.includes('anonymous') || !session?.user?.email}
                                  onComplete={(name: string, role: any, wantsAccount?: boolean) => {
                                    console.log('🚀 App: Onboarding complete', { name, role, wantsAccount });
                                    const store = useStore.getState();
                                    if (name) store.setTeacherName(name);
                                    if (role) store.setUserRole(role);
                                    store.setOnboardingCompleted(true);
                                    store.setJustFinishedOnboarding(true);
                                  }}
                                />
                              </ErrorBoundary>
                            )}
                          </RootStack.Screen>
                        ) : (
                          <>
                            <RootStack.Screen name="Main">
                              {() => (
                                <ErrorBoundary name="Main Tabs">
                                  <TabNavigator onTabChange={(tab: any) => setCurrentTab(tab)} />
                                </ErrorBoundary>
                              )}
                            </RootStack.Screen>
                            <RootStack.Screen
                              name="AIAssistant"
                              component={AIAssistantScreen}
                              options={{
                                presentation: 'modal',
                                animation: 'slide_from_bottom'
                              }}
                            />
                            <RootStack.Screen
                              name="Auth"
                              component={AuthScreen}
                              options={{ presentation: 'modal' }}
                            />

                          </>
                        )}
                      </RootStack.Navigator>
                    </PostHogProvider>
                  </NavigationContainer>

                  <SyncManager />
                  <NetworkStatusBanner />

                  {toast.visible && (
                    <SanctuaryToast
                      message={toast.message}
                      type={toast.type}
                      visible={toast.visible}
                      onHide={hideToast}
                    />
                  )}
                </ErrorBoundary>
              </ToastProvider>
            </GluestackUIProvider>
          </EnvironmentProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView >
  );
}

export default Sentry.wrap(App);
