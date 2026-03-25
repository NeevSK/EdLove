import 'react-native-url-polyfill/auto';
import './src/i18n/config'; // Initialize i18n
import React, { useState, useEffect, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './src/navigation/navigationRef';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GluestackUIProvider, Spinner, Center, VStack, Text, SanctuaryGlobalStyles, FABProvider, LotusPetalFAB, ExternalLinkProvider, SanctuaryToast, ToastProvider, ErrorBoundary, NetworkStatusBanner, Theme } from '@repo/ui';
import { config } from "./gluestack-ui.config";
import { Home, School, Users, Library, User, Sparkles } from 'lucide-react-native';
import { Session } from '@supabase/supabase-js';
import * as Font from 'expo-font';
import { bootCoreCapabilities } from '@repo/core';
import { registerPeopleVows } from '@repo/people';
import { registerAdminVows, registerAdminCapabilities } from '@repo/admin';
import { registerClassroomVows, registerClassroomCapabilities } from '@repo/classroom';
import { registerSelfVows } from '@repo/self';

// Initialize core capabilities & POA Vows
bootCoreCapabilities();
registerAdminCapabilities();
registerClassroomCapabilities();

registerPeopleVows();
registerAdminVows();
registerClassroomVows();
registerSelfVows();
import { AnalyticsProvider } from '@repo/analytics/components';
import { Platform, StyleSheet, View } from 'react-native';
import ReactDOM from 'react-dom';
import * as Linking from 'expo-linking';

// Initialize axe-core for web accessibility auditing in development
if (Platform.OS === 'web' && process.env.NODE_ENV === 'development') {
  const axe = require('@axe-core/react');
  axe(React, ReactDOM, 1000);
}

import { fontAssets } from './src/constants/Fonts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EnvironmentProvider } from '@repo/ui';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@repo/ui';

// Import screens and navigation
import WelcomeScreen from './src/screens/WelcomeScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import TabNavigator from './src/navigation/TabNavigator';
import { AIAssistantScreen, AuthScreen, AppSettingsScreen, NotificationsScreen } from './src/screens';
import QRHandlerScreen from './src/screens/QRHandlerScreen';
import ThuthimalClaimScreen from './src/screens/ThuthimalClaimScreen';
import InvitationWelcomeScreen from './src/screens/InvitationWelcomeScreen';
import { useQRDeepLink } from '@repo/ui';
import { LanguageUtils } from './src/utils/LanguageUtils';
import CommandPalette from './src/components/web/CommandPalette';
import { updateWebPageTitle } from './src/utils/useWebPageTitle';
import { PWAInstallBanner } from './src/components/web/PWAInstallBanner';

// Lazy load PublicFormScreen as it's web-only and large
const PublicFormScreen = React.lazy(() => import('./src/screens/classroom/PublicFormScreen.web'));

// Create a client
const queryClient = new QueryClient();

// Root Stack for Modals
const RootStack = createNativeStackNavigator();

// Module-level so AppContent can call it without prop-drilling.
const fetchAndSetUserProfile = async (internalUserId: string, onComplete?: () => void) => {
  try {
    const { data: userProfile, error } = await supabase
      .from('users')
      .select('id, role, school_id, onboarding_completed, full_name, email, avatar_url, is_anonymous, profile_completed')
      .eq('id', internalUserId)
      .maybeSingle();

    if (error) {
      console.warn('⚠️ Profile: Table fetch returned error:', error.message);
      if (onComplete) onComplete();
      return;
    }

    if (userProfile) {
      const store = useStore.getState();
      const normalizedRole = (userProfile.role === 'guest' ? null : userProfile.role) as UserRole | null;

      if (normalizedRole || !store.onboardingCompleted) {
        store.setUser({ ...userProfile, role: normalizedRole } as any);
        store.setUserRole(normalizedRole);
      }

      const isEffectivelyOnboarded = !!userProfile.onboarding_completed && !!normalizedRole;

      if (isEffectivelyOnboarded) {
        if (!store.onboardingCompleted) {
          store.setOnboardingCompleted(true);
        }
      }

      if (!isEffectivelyOnboarded && navigationRef.isReady()) {
        const rootState = navigationRef.current?.getRootState();
        const currentRoute = rootState?.routes?.[rootState?.index ?? -1]?.name;
        if (currentRoute === 'Welcome') {
          navigationRef.navigate('Onboarding' as never);
        }
      }

      if (userProfile.school_id) {
        const { data: schoolData } = await supabase
          .from('schools')
          .select('type')
          .eq('id', userProfile.school_id)
          .single();

        if (schoolData) {
          store.setSchoolType(schoolData.type as SchoolType | null);
        }
      } else {
        store.setSchoolType(null);
      }
    }
  } catch (error) {
    console.warn('❌ Profile: Fetching encountered an error:', error);
  } finally {
    if (onComplete) onComplete();
  }
};

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [currentTab, setCurrentTab] = useState<'self' | 'classroom' | 'community' | 'library' | 'profile'>('self');
  const onboardingCompleted = useStore((state) => state.onboardingCompleted);
  const currentUser = useStore((state) => state.user);
  const [showWelcome, setShowWelcome] = useState(true);
  const toast = useStore((state) => state.toast);
  const hideToast = useStore((state) => state.hideToast);

  useEffect(() => {
    initSentry();
    initPostHog().then(() => {
      trackEvent('app_initialized', { platform: Platform.OS });
    });
  }, []);

  useEffect(() => {
    LanguageUtils.init();
  }, []);

  useEffect(() => {
    if (!currentUser?.id) {
      clearSentryUser();
      return;
    }

    setSentryUser({
      id: currentUser.id,
      email: currentUser.email ?? undefined,
      username: currentUser.full_name ?? undefined,
    });

    identifyUser(currentUser.id, {
      email: currentUser.email ?? undefined,
      full_name: currentUser.full_name ?? undefined,
      role: currentUser.role ?? undefined,
      school_id: currentUser.school_id ?? undefined,
    });
  }, [currentUser?.id, currentUser?.email, currentUser?.full_name, currentUser?.role, currentUser?.school_id]);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync(fontAssets);
        setFontsLoaded(true);
      } catch (error) {
        setFontsLoaded(true);
      }
    }
    loadFonts();
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await authAPI.getSession();
        setSession(session);
        useStore.getState().setAuthSession(session);
        if (session) {
          setShowWelcome(false);
          if (session.user) {
            setIsProfileLoading(true);
            identityAPI.getMyInternalId()
              .then((internalId) => {
                if (internalId) {
                  fetchAndSetUserProfile(internalId, () => setIsProfileLoading(false));
                } else {
                  setIsProfileLoading(false);
                }
              })
              .catch(() => {
                setIsProfileLoading(false);
              });
          }
        }
      } catch (error) {
        if (error instanceof APIError) {
          if (error.message?.includes('Refresh Token') || (error as any).status === 400) {
            await supabase.auth.signOut({ scope: 'local' });
            setSession(null);
            useStore.getState().setAuthSession(null);
          }
        }
      } finally {
        setLoading(false);
        useStore.getState().setAuthSessionResolved(true);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      useStore.getState().setAuthSession(session);
      useStore.getState().setAuthSessionResolved(true);

      if (session?.user) {
        setIsProfileLoading(true);
        identityAPI.getMyInternalId()
          .then((internalId) => {
            if (internalId) {
              fetchAndSetUserProfile(internalId, () => setIsProfileLoading(false));
            } else {
              setIsProfileLoading(false);
            }
          })
          .catch(() => {
            setIsProfileLoading(false);
          });
      } else if (event === 'SIGNED_OUT') {
        setIsProfileLoading(false);
        identityAPI.clearCache();
        const store = useStore.getState();
        store.setUser(null);
        store.setUserRole(null);
        store.setSchoolType(null);
        store.setOnboardingCompleted(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const handleDeepLink = async (url: string) => {
      if (url.includes('auth/callback')) {
        const getParam = (name: string) => {
          const match = url.match(new RegExp(`[#?&]${name}=([^&]*)`));
          return match ? match[1] : null;
        };

        const access_token = getParam('access_token');
        const refresh_token = getParam('refresh_token');

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (error && (error.message?.includes('Refresh Token') || (error as any).status === 400)) {
            await supabase.auth.signOut({ scope: 'local' });
          }
        }
      }
    };

    const subscription = Linking.addEventListener('url', (event) => handleDeepLink(event.url));
    Linking.getInitialURL().then((url) => { if (url) handleDeepLink(url); });
    return () => subscription.remove();
  }, []);

  useQRDeepLink((payload) => {
    if (navigationRef.isReady() && session) {
      navigationRef.navigate('QRHandler', { payload });
    }
  });

  if (loading || !fontsLoaded) {
    return (
      <SafeAreaProvider>
        <GluestackUIProvider config={config}>
          <Center sx={{ flex: 1, backgroundColor: Theme.colors.obsidian }}>
            <Spinner size="large" color={Theme.colors.sanctuarySaffron} />
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
          <SanctuaryGlobalStyles />
          <FABProvider>
            <View style={{ flex: 1 }}>
              <AppContent
                currentTab={currentTab}
                setCurrentTab={setCurrentTab}
                session={session}
                needsWelcome={needsWelcome}
                onboardingCompleted={onboardingCompleted}
                isProfileLoading={isProfileLoading}
                showWelcome={showWelcome}
                setShowWelcome={setShowWelcome}
                toast={toast}
                hideToast={hideToast}
              />
            </View>
          </FABProvider>
        </GluestackUIProvider>
      </EnvironmentProvider>
    </QueryClientProvider>
  );
}

function OnboardingWrapper({ session }: { session: any }) {
  const storeUser = useStore((state) => state.user);
  return (
    <OnboardingScreen
      isAnonymous={
        storeUser?.is_anonymous === true ||
        session?.user?.is_anonymous === true ||
        !session?.user?.email
      }
      onComplete={(name: string, role: any) => {
        const store = useStore.getState();
        if (name) store.setTeacherName(name);
        if (role) store.setUserRole(role);
        store.setOnboardingCompleted(true);
        identityAPI.getMyInternalId()
          .then((internalId) => { if (internalId) fetchAndSetUserProfile(internalId); });
      }}
    />
  );
}

function AppContent({ setCurrentTab, session, onboardingCompleted, isProfileLoading, toast, hideToast }: any) {
  const handleTabChange = React.useCallback((tab: string) => {
    setCurrentTab(tab as any);
  }, [setCurrentTab]);

  useEffect(() => {
    if (Platform.OS === 'web' && navigationRef.isReady()) {
      const state = navigationRef.current?.getRootState();
      const currentRoute = state?.routes?.[state?.index ?? -1]?.name;
      const allowedRoutes = ['Welcome', 'Onboarding', 'Auth', 'QRHandler', 'InvitationWelcome', 'PublicForm'];
      const hasValidSession = !!session;

      if (!hasValidSession && !onboardingCompleted && !allowedRoutes.includes(currentRoute || '')) {
        navigationRef.current?.reset({
          index: 0,
          routes: [{ name: 'Welcome' }],
        });
      }
    }
  }, [onboardingCompleted, session]);

  useEffect(() => {
    if (isProfileLoading) return;
    if (!session || onboardingCompleted || !navigationRef.isReady()) return;
    const rootState = navigationRef.current?.getRootState();
    const currentRoute = rootState?.routes?.[rootState?.index ?? -1]?.name;
    if (currentRoute === 'Welcome') {
      navigationRef.navigate('Onboarding' as never);
    }
  }, [session, onboardingCompleted, isProfileLoading]);

  return (
    <SafeAreaProvider>
      <ToastProvider>
        <ExternalLinkProvider>
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
                prefixes: ['gurudevi://', 'https://platform.gurudevi.edlove.org', 'http://localhost:4000'],
                config: {
                  screens: {
                    Welcome: '',
                    Onboarding: 'onboarding',
                    Auth: 'auth',
                    AIAssistant: 'ai',
                    QRHandler: 'qr',
                    ThuthimalClaim: 'thuthimal',
                    InvitationWelcome: 'invite',
                    Main: {
                      path: 'app',
                      screens: {
                        Self: 'self',
                        Profile: 'profile',
                        Classroom: 'classroom',
                        Community: 'community',
                        Library: 'library',
                        NotificationsPanel: 'notifications',
                        SettingsPanel: 'settings',
                        },
                     },
                    PublicForm: 'f/:slug',
                  },
                },
              }}
            >
              <AnalyticsProvider
                apiKey={process.env.EXPO_PUBLIC_POSTHOG_API_KEY}
                options={{
                  host: process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
                }}
              >
                <RootStack.Navigator
                  screenOptions={{ headerShown: false }}
                  initialRouteName={onboardingCompleted ? 'Main' : 'Welcome'}
                >
                  {!onboardingCompleted ? (
                    <>
                      <RootStack.Screen name="Welcome">
                        {() => (
                          <ErrorBoundary name="Welcome Screen">
                            <WelcomeScreen
                              onLogin={() => navigationRef.isReady() && navigationRef.navigate('Auth' as never)}
                              onGuest={() => navigationRef.isReady() && navigationRef.navigate('Onboarding' as never)}
                            />
                          </ErrorBoundary>
                        )}
                      </RootStack.Screen>
                      <RootStack.Screen name="Auth" options={{ presentation: 'card' }}>
                        {(props: any) => (
                          <AuthScreen
                            onSuccess={() => {
                              identityAPI.getMyInternalId().then((id) => { if (id) fetchAndSetUserProfile(id); });
                              if (navigationRef.isReady()) navigationRef.navigate('Onboarding' as never);
                            }}
                            onBack={() => props.navigation.goBack()}
                          />
                        )}
                      </RootStack.Screen>
                      <RootStack.Screen name="Onboarding">
                        {() => (
                          <ErrorBoundary name="Onboarding Screen">
                            <OnboardingWrapper session={session} />
                          </ErrorBoundary>
                        )}
                      </RootStack.Screen>
                      <RootStack.Screen name="InvitationWelcome" component={InvitationWelcomeScreen} options={{ presentation: 'modal' }} />
                      <RootStack.Screen name="PublicForm" options={{ headerShown: false }}>
                        {() => (
                          <Suspense fallback={<Center style={{flex:1}}><Spinner/></Center>}>
                            <PublicFormScreen />
                          </Suspense>
                        )}
                      </RootStack.Screen>
                    </>
                  ) : (
                    <>
                      <RootStack.Screen name="Main">
                        {() => (
                          <ErrorBoundary name="Main Tabs">
                            <TabNavigator onTabChange={handleTabChange} />
                          </ErrorBoundary>
                        )}
                      </RootStack.Screen>
                      <RootStack.Screen name="AIAssistant" component={AIAssistantScreen} options={{ presentation: 'modal' }} />
                      <RootStack.Screen name="Auth" options={{ presentation: 'modal' }}>
                        {(props: any) => (
                          <AuthScreen
                            onSuccess={() => {
                              identityAPI.getMyInternalId().then((id) => { if (id) fetchAndSetUserProfile(id); });
                              props.navigation.goBack();
                            }}
                          />
                        )}
                      </RootStack.Screen>
                      <RootStack.Screen name="QRHandler" component={QRHandlerScreen} options={{ presentation: 'modal' }} />
                      <RootStack.Screen name="AppSettings" component={AppSettingsScreen} options={{ presentation: 'modal' }} />
                      <RootStack.Screen name="Notifications" component={NotificationsScreen} options={{ presentation: 'modal' }} />
                      <RootStack.Screen name="ThuthimalClaim" component={ThuthimalClaimScreen} options={{ presentation: 'modal' }} />
                      <RootStack.Screen name="InvitationWelcome" component={InvitationWelcomeScreen} options={{ presentation: 'modal' }} />
                      <RootStack.Screen name="PublicForm" options={{ headerShown: false }}>
                        {() => (
                          <Suspense fallback={<Center style={{flex:1}}><Spinner/></Center>}>
                            <PublicFormScreen />
                          </Suspense>
                        )}
                      </RootStack.Screen>
                    </>
                  )}
                </RootStack.Navigator>
              </AnalyticsProvider>
            </NavigationContainer>
            <SyncManager />
            <NetworkStatusBanner />
            {Platform.OS === 'web' && <CommandPalette />}
            {Platform.OS === 'web' && <PWAInstallBanner />}
            {toast && (
              <SanctuaryToast
                visible={!!toast}
                message={toast.message}
                type={toast.type}
                duration={toast.duration}
                onHide={hideToast}
              />
            )}
          </ErrorBoundary>
        </ExternalLinkProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}

export default App;
