import 'react-native-url-polyfill/auto';
import './src/i18n/config'; // Initialize i18n
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, type LinkingOptions } from '@react-navigation/native';
import { navigationRef } from './src/navigation/navigationRef';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GluestackUIProvider, Spinner, Center, VStack, Text } from '@repo/ui';
import { config } from "./gluestack-ui.config";
import { Home, School, Users, Library, User, Sparkles } from 'lucide-react-native';
import { Session } from '@supabase/supabase-js';
import * as Font from 'expo-font';
import { supabase, useStore, UserRole, SchoolType, initSentry, initPostHog, trackEvent, identifyUser } from '@repo/core';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
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
import CommandPalette from './src/components/web/CommandPalette';
import { updateWebPageTitle } from './src/utils/useWebPageTitle';
import { PWAInstallBanner } from './src/components/web/PWAInstallBanner';

// Create a client
const queryClient = new QueryClient();

// Navigation ref for imperative navigation outside React tree (deep links, auth callbacks)
export { navigationRef } from './src/navigation/navigationRef';

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
      try {
        await Font.loadAsync(fontAssets);
        setFontsLoaded(true);
      } catch (error) {
        console.warn('⚠️ Startup: Font loading failed:', error);
        setFontsLoaded(true); // Proceed anyway
      }
    }
    loadFonts();
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Initial session check - non-blocking for fonts/UI
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        setSession(session);
        if (session) {
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

  // Handle native deep links (especially for Supabase Auth callback)
  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      console.log('🔗 Deep Link received:', url);

      // Supabase OAuth/Linking callback usually contains access_token in a fragment (#) or query (?)
      if (url.includes('auth/callback')) {
        // Simple parser for access_token and refresh_token
        const getParam = (name: string) => {
          const match = url.match(new RegExp(`[#?&]${name}=([^&]*)`));
          return match ? match[1] : null;
        };

        const access_token = getParam('access_token');
        const refresh_token = getParam('refresh_token');

        if (access_token && refresh_token) {
          console.log('🔄 App: Recovering session from deep link...');
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (error) {
            console.error('❌ App: Failed to set session from deep link:', error.message);
          } else {
            console.log('✅ App: Session recovered from deep link');
          }
        }
      }
    };

    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    return () => {
      subscription.remove();
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
            label: 'My Classrooms',
            onPress: () => navigationRef.isReady() && navigationRef.navigate('Main', { screen: 'Classroom' }),
            icon: School
          },
          {
            label: 'Mark Attendance',
            onPress: () => navigationRef.isReady() && navigationRef.navigate('Main', { screen: 'Classroom' }),
            icon: School
          },
        ];
      case 'community':
        return [
          {
            label: 'New Post',
            onPress: () => navigationRef.isReady() && navigationRef.navigate('Main', { screen: 'Community' }),
            icon: Users
          },
          {
            label: 'Find Groups',
            onPress: () => navigationRef.isReady() && navigationRef.navigate('Main', { screen: 'Community' }),
            icon: Users
          },
          {
            label: 'Share Resource',
            onPress: () => navigationRef.isReady() && navigationRef.navigate('Main', { screen: 'Community' }),
            icon: Users
          },
        ];
      case 'library':
        return [
          {
            label: 'Add Resource',
            onPress: () => navigationRef.isReady() && navigationRef.navigate('Main', { screen: 'Library' }),
            icon: Library
          },
          {
            label: 'Browse Library',
            onPress: () => navigationRef.isReady() && navigationRef.navigate('Main', { screen: 'Library' }),
            icon: Library
          },
        ];
      case 'profile':
        return [
          {
            label: 'Edit Profile',
            onPress: () => navigationRef.isReady() && navigationRef.navigate('Main', { screen: 'Profile' }),
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
  return (

    <SafeAreaProvider>
      <ToastProvider>
        <ErrorBoundary name="App Root">
          <NavigationContainer
            ref={navigationRef}
            onReady={() => {
              if (navigationRef.isReady()) {
                updateWebPageTitle(navigationRef.current?.getRootState());
              }
            }}
            onStateChange={(state) => {
              updateWebPageTitle(state);
            }}
            linking={{
              prefixes: ['gurudevi://', 'https://app.gurudevi.edlove.org', 'http://localhost:4000'],
              config: {
                screens: {
                  Welcome: '',
                  Onboarding: 'onboarding',
                  Auth: 'auth',
                  AIAssistant: 'ai',
                  QRHandler: 'qr',
                  ThuthimalClaim: 'thuthimal',
                  Main: {
                    path: 'app',
                    screens: {
                      Self: 'self',
                      Profile: {
                        path: 'profile',
                        screens: {
                          ProfileMain: '',
                          FullProfile: 'full',
                        },
                      },
                      Classroom: {
                        path: 'classroom',
                        screens: {
                          ClassroomList: '',
                          SchoolCreation: 'new',
                          ClassroomDetails: {
                            path: ':classroomId',
                            screens: {
                              Attendance: 'attendance',
                              Gradebook: 'gradebook',
                            },
                          },
                        },
                      },
                      Community: {
                        path: 'community',
                        screens: {
                          CommunityMain: '',
                          GroupDetails: 'group/:groupId',
                          GroupChat: 'group/:groupId/chat',
                          UserProfile: 'user/:userId',
                        },
                      },
                      Library: 'library',
                    },
                  },
                },
              },
            }}
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

          {/* Command Palette — web-only power feature (Cmd+K) */}
          {Platform.OS === 'web' && (
            <CommandPalette
              onOpenAI={() => navigationRef.navigate('AIAssistant' as never)}
            />
          )}

          {/* PWA Install Banner — web-only; hook guards against native/installed/dismissed */}
          <PWAInstallBanner />

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
  );
}

export default Sentry.wrap(App);
