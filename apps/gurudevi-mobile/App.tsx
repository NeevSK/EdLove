import 'react-native-url-polyfill/auto';
import './src/i18n/config'; // Initialize i18n
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GluestackUIProvider, Spinner, Center, VStack, Text } from '@repo/ui';
import { config } from "./gluestack-ui.config";
import { Home, School, Users, Library, User, Sparkles } from 'lucide-react-native';
import { Session } from '@supabase/supabase-js';
import * as Font from 'expo-font';
import { supabase, useStore, UserRole, SchoolType, initSentry, initPostHog, trackEvent, identifyUser } from '@repo/core';
import { Platform, type LinkingOptions } from 'react-native';
import { PostHogProvider } from 'posthog-react-native';
import * as Sentry from '@sentry/react-native';
import { Theme } from '@repo/ui';
import { fontAssets } from './src/constants/Fonts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EnvironmentProvider } from '@repo/ui';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@repo/ui';
// Import screens and navigation
import WelcomeScreen from './src/screens/WelcomeScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import TabNavigator from './src/navigation/TabNavigator';
import { AIAssistantScreen, AuthScreen } from './src/screens';
import QRHandlerScreen from './src/screens/QRHandlerScreen';
import ThuthimalClaimScreen from './src/screens/ThuthimalClaimScreen';
import { useQRDeepLink, redeemPendingQRAction } from '@repo/ui';
import { SanctuaryToast, ToastProvider } from '@repo/ui';
import type { ActionItem } from '@repo/ui';
import { ErrorBoundary, NetworkStatusBanner } from '@repo/ui';
import { SyncManager } from '@repo/core';
import { LanguageUtils } from './src/utils/LanguageUtils';

// Create a client
const queryClient = new QueryClient();

// Navigation ref for imperative navigation outside React tree (deep links, auth callbacks)
export const navigationRef = createNavigationContainerRef<any>();

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

  // Initialize analytics inside App component to avoid HMRClient setup issues at startup
  useEffect(() => {
    initSentry();
    initPostHog().then(() => {
      trackEvent('app_initialized', { platform: Platform.OS });
    });
  }, []);

  const { i18n } = useTranslation();

  // Load saved language preference
  useEffect(() => {
    LanguageUtils.init();
  }, []);

  // Extract user profile fetching logic
  const fetchAndSetUserProfile = async (userId: string) => {
    console.log(`🚀 Profile: Fetching for user ${userId}...`);
    try {
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('role, school_id, onboarding_completed')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('⚠️ Profile: Table fetch returned error:', error.message);
        return;
      }

      if (userProfile) {
        console.log('✅ Profile: Data received', userProfile);
        const { setUserRole, setOnboardingCompleted } = useStore.getState();
        setUserRole(userProfile.role as UserRole | null);
        setOnboardingCompleted(!!userProfile.onboarding_completed);

        if (userProfile.school_id) {
          const { data: schoolData } = await supabase
            .from('schools')
            .select('type')
            .eq('id', userProfile.school_id)
            .single();

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
        await Font.loadAsync(fontAssets);
        console.log('✅ Startup: Fonts loaded');
        setFontsLoaded(true);
      } catch (error) {
        console.warn('⚠️ Startup: Font loading failed:', error);
        setFontsLoaded(true); // Proceed anyway
      }
    }
    loadFonts();
  }, []);

  useEffect(() => {
    console.log('🚀 Startup: Initializing Auth session...');

    const checkSession = async () => {
      try {
        // Initial session check - non-blocking for fonts/UI
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        setSession(session);
        if (session) {
          console.log('🔄 App: Session detected during init, hiding WelcomeScreen');
          setShowWelcome(false);
        }
        if (session?.user) {
          fetchAndSetUserProfile(session.user.id); // Fire and forget background sync
        }
      } catch (error) {
        console.warn('❌ Startup: Auth session check failed:', error);
      } finally {
        // Unblock UI as soon as we have an initial answer (or error)
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth Change:', event, !!session ? '(Session exists)' : '(No session)');
      setSession(session);

      if (session?.user) {
        fetchAndSetUserProfile(session.user.id);
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
    };
  }, []);

  // Monitor network connectivity - REMOVED redundant listener (Centralized in EnvironmentContext)

  // QR deep link listener — routes incoming gurudevi://qr?... links to QRHandlerScreen
  useQRDeepLink((payload) => {
    if (navigationRef.isReady() && session) {
      navigationRef.navigate('QRHandler', { payload });
    }
    // If not ready/authenticated, useQRDeepLink already stores in AsyncStorage as fallback
  });

  const handleFabPress = () => {
    // FAB actions are context-aware; individual action items handle navigation
  };

  // Define context-aware actions for each tab
  const getFabActions = (): ActionItem[] => {
    switch (currentTab) {
      case 'self':
        return [
          {
            label: 'Log Mood',
            onPress: () => navigationRef.isReady() && navigationRef.navigate('Main', { screen: 'Self' }),
            icon: Home
          },
          {
            label: 'Journal Entry',
            onPress: () => navigationRef.isReady() && navigationRef.navigate('Main', { screen: 'Self' }),
            icon: Home
          },
        ];
      case 'classroom':
        return [
          {
            label: 'Create Lesson',
            onPress: () => navigationRef.isReady() && navigationRef.navigate('CreateLesson'),
            icon: School
          },
          {
            label: 'Add Assignment',
            onPress: () => navigationRef.isReady() && navigationRef.navigate('CreateAssignment'),
            icon: School
          },
        ];
      case 'community':
        return [
          {
            label: 'New Post',
            onPress: () => navigationRef.isReady() && navigationRef.navigate('CreatePost'),
            icon: Users
          },
          {
            label: 'Share Resource',
            onPress: () => navigationRef.isReady() && navigationRef.navigate('CreatePost'),
            icon: Users
          },
        ];
      case 'library':
        return [
          {
            label: 'Add Resource',
            onPress: () => navigationRef.isReady() && navigationRef.navigate('AddLibraryResource'),
            icon: Library
          },
          {
            label: 'Add Bookmark',
            onPress: () => navigationRef.isReady() && navigationRef.navigate('AddLibraryResource'),
            icon: Library
          },
        ];
      case 'profile':
        return [
          {
            label: 'Edit Profile',
            onPress: () => navigationRef.isReady() && navigationRef.navigate('EditProfile'),
            icon: User
          },
        ];
      default:
        return [];
    }
  };

  if (loading || !fontsLoaded) {
    return (
      <SafeAreaProvider>
        <GluestackUIProvider config={config}>
          <Center sx={{ flex: 1, backgroundColor: Theme.colors.obsidian }}>
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
    <QueryClientProvider client={queryClient}>
      <EnvironmentProvider>
        <GluestackUIProvider config={config}>
          <AppContent
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            session={session}
            needsWelcome={needsWelcome}
            onboardingCompleted={onboardingCompleted}
            showWelcome={showWelcome}
            setShowWelcome={setShowWelcome}
            toast={toast}
            hideToast={hideToast}
          />
        </GluestackUIProvider>
      </EnvironmentProvider>
    </QueryClientProvider>
  );
}

// Main Content Component to access Theme/Context
function AppContent({ currentTab, setCurrentTab, session, needsWelcome, onboardingCompleted, showWelcome, setShowWelcome, toast, hideToast }: any) {
  const { phase } = useTheme();
  const isWarmPhase = ['morning', 'afternoon', 'evening'].includes(phase);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ToastProvider>
          <ErrorBoundary name="App Root">
            <NavigationContainer
              ref={navigationRef}
              linking={Platform.OS === 'web' ? ({
                prefixes: ['https://app.gurudevi.edlove.org', 'http://localhost:4000'],
                config: {
                  screens: {
                    Welcome: '',
                    Onboarding: 'onboarding',
                    Main: 'app',
                    Auth: 'auth',
                    AIAssistant: 'ai',
                    QRHandler: 'qr',
                    ThuthimalClaim: 'thuthimal',
                  },
                },
              } as LinkingOptions<any>) : undefined}
            >
              <PostHogProvider
                apiKey={process.env.EXPO_PUBLIC_POSTHOG_API_KEY}
                options={{
                  host: process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
                }}
                autocapture={false}
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
                      <RootStack.Screen
                        name="QRHandler"
                        component={QRHandlerScreen}
                        options={{
                          presentation: 'modal',
                          animation: 'fade_from_bottom',
                        }}
                      />
                      <RootStack.Screen
                        name="ThuthimalClaim"
                        component={ThuthimalClaimScreen}
                        options={{
                          presentation: 'modal',
                          animation: 'fade_from_bottom',
                        }}
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

            {/* Skia Grain Overlay (Temporarily disabled due to Android black screen issue)
            <NoiseOverlay
              opacity={0.03}
              warm={isWarmPhase}
              frequency={phase === 'night' ? 0.45 : 0.65}
            />
            */}
          </ErrorBoundary>
        </ToastProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView >
  );
}

export default Sentry.wrap(App);
