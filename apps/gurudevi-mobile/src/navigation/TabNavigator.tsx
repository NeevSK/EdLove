import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useRewards } from '@repo/core/hooks';
import { usePermissions } from '@repo/core/logic';
import { useStore } from '@repo/core/store';
import { BreathGuide } from '@repo/self';
import AchievementUnlockOverlay from '@repo/ui/components/AchievementUnlockOverlay';
import ErrorBoundary from '@repo/ui/components/ErrorBoundary';
import { SanctuaryBackground } from '@repo/ui/components/SanctuaryBackground';
import {
  Box,
  Center,
  HStack,
  hapticLight,
  Icon,
  Modal,
  ModalContent,
  Pressable,
  Spinner,
  Text,
  useTheme,
  VStack,
} from '@repo/ui/primitives';
import { WorkforceShell } from '@repo/workforce';
import { Hammer, Heart, Library, School, User, Users, X } from 'lucide-react-native';
import { lazy, Suspense, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Screens
const SelfScreen = lazy(() => import('@repo/self').then((m) => ({ default: m.SelfScreen })));

import ClassroomStackNavigator from './ClassroomStackNavigator';
import CommunityStackNavigator from './CommunityStackNavigator';
import LibraryStackNavigator from './LibraryStackNavigator';
import ProfileStackNavigator from './ProfileStackNavigator';

const Tab = createBottomTabNavigator();

interface TabNavigatorProps {
  onTabChange?: (tabName: string) => void;
}

function ProfileTabScreen() {
  return (
    <ErrorBoundary name="Profile Stack">
      <ProfileStackNavigator />
    </ErrorBoundary>
  );
}

function ClassroomTabScreen() {
  return (
    <ErrorBoundary name="Classroom Tab">
      <ClassroomStackNavigator />
    </ErrorBoundary>
  );
}

function SelfTabScreen() {
  return (
    <ErrorBoundary name="Self Screen">
      <Suspense
        fallback={
          <Center className="flex-1">
            <Spinner />
          </Center>
        }
      >
        <SelfScreen />
      </Suspense>
    </ErrorBoundary>
  );
}

function CommunityTabScreen() {
  return (
    <ErrorBoundary name="Community Stack">
      <CommunityStackNavigator />
    </ErrorBoundary>
  );
}

function LibraryTabScreen() {
  return (
    <ErrorBoundary name="Library Stack">
      <LibraryStackNavigator />
    </ErrorBoundary>
  );
}

function WorkforceTabScreen() {
  return (
    <ErrorBoundary name="Workforce Tab">
      <WorkforceShell />
    </ErrorBoundary>
  );
}

export default function TabNavigator({ onTabChange }: TabNavigatorProps) {
  const { t } = useTranslation();
  const { context, flags } = usePermissions();

  // Derive the contextual capacity for labels and navigation.
  const capacity = useMemo(
    () => context.activeBond?.capacity || context.primaryCapacity,
    [context.activeBond, context.primaryCapacity],
  );

  const colors = useTheme().scene;
  const [currentTab, setCurrentTab] = useState<
    'self' | 'classroom' | 'community' | 'library' | 'profile' | 'workforce'
  >('self');
  const insets = useSafeAreaInsets();
  const { newAchievements } = useRewards();
  const { isBreathingOpen, setBreathingOpen } = useStore();
  const [dismissedAchievement, setDismissedAchievement] = useState('');
  const currentAchievement = newAchievements[newAchievements.length - 1] ?? '';
  const showCelebration =
    currentAchievement.length > 0 && currentAchievement !== dismissedAchievement;

  // ✅ Memoized Label Logic (Referential Stability)
  const classroomLabel = useMemo(() => {
    if (capacity === 'principal') return t('tabs.mySchool') || 'My School';
    if (capacity === 'founder') return t('tabs.school');
    if (capacity === 'sectionHead') return t('tabs.section');
    if (capacity === 'gradeHead') return t('tabs.grade') || t('tabs.classroom');
    return t('tabs.classroom');
  }, [capacity, t]);

  return (
    <Box className="flex-1">
      {/* Living backdrop — renders behind all tabs */}
      <SanctuaryBackground />

      <Tab.Navigator
        id="MainTabs"
        initialRouteName="Self"
        screenListeners={{
          state: (e) => {
            const state = e.data?.state;
            if (!state || state.index === undefined) return;

            const routeName = state.routes[state.index]?.name;
            if (routeName) {
              const tabName = routeName.toLowerCase() as
                | 'self'
                | 'classroom'
                | 'community'
                | 'library'
                | 'profile'
                | 'workforce';
              setCurrentTab(tabName);
              if (onTabChange) {
                onTabChange(tabName);
              }
            }
          },
        }}
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true, // Universal keyboard behavior
          tabBarStyle: {
            backgroundColor: colors.secondary.main, // Solid color aligned with Global Header
            borderTopWidth: 1,
            borderTopColor: colors.border.base,
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
            paddingTop: 8,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          },
          tabBarActiveTintColor: colors.primary.main,
          tabBarInactiveTintColor: colors.text.muted,
          tabBarLabelStyle: {
            fontSize: 12,
            fontFamily: 'Inter_500Medium',
            marginBottom: insets.bottom > 0 ? 0 : 4,
          },
          tabBarBackground: () => <Box className="absolute inset-0" />,
        }}
      >
        {/* 1. Profile Tab */}
        <Tab.Screen
          name="Profile"
          component={ProfileTabScreen}
          options={{
            tabBarLabel: t('tabs.profile'),
            tabBarIcon: ({ color, size }) => (
              <Box>
                <Icon
                  as={User}
                  color={color}
                  size={size}
                  fill={currentTab === 'profile' ? color : 'none'}
                />
              </Box>
            ),
          }}
        />

        {/* 2. Classroom Tab */}
        <Tab.Screen
          name="Classroom"
          component={ClassroomTabScreen}
          options={{
            tabBarLabel: classroomLabel,
            tabBarIcon: ({ color, size }) => (
              <School
                color={color}
                size={size}
                fill={currentTab === 'classroom' ? color : 'none'}
              />
            ),
          }}
        />

        {/* 3. Self Tab (Center Anchor) */}
        <Tab.Screen
          name="Self"
          component={SelfTabScreen}
          options={{
            tabBarLabel: t('tabs.self'),
            tabBarIcon: ({ color, size }) => (
              <Box>
                <Heart color={color} size={size} fill={currentTab === 'self' ? color : 'none'} />
              </Box>
            ),
          }}
        />

        {/* 4. Community Tab */}
        <Tab.Screen
          name="Community"
          component={CommunityTabScreen}
          options={{
            tabBarLabel: t('tabs.community'),
            tabBarIcon: ({ color, size }) => (
              <Box>
                <Icon
                  as={Users}
                  color={color}
                  size={size}
                  fill={currentTab === 'community' ? color : 'none'}
                />
              </Box>
            ),
          }}
        />

        {/* 5. Library Tab */}
        <Tab.Screen
          name="Library"
          component={LibraryTabScreen}
          options={{
            tabBarLabel: t('tabs.library'),
            tabBarIcon: ({ color, size }) => (
              <Box>
                <Library
                  color={color}
                  size={size}
                  fill={currentTab === 'library' ? color : 'none'}
                />
              </Box>
            ),
          }}
        />

        {/* 6. Workforce Tab (Experimental) */}
        {flags.isDevelopingWorkforce && (
          <Tab.Screen
            name="Workforce"
            component={WorkforceTabScreen}
            options={{
              tabBarLabel: 'Workforce',
              tabBarIcon: ({ color, size }) => (
                <Box>
                  <Hammer
                    color={color}
                    size={size}
                    fill={currentTab === 'workforce' ? color : 'none'}
                  />
                </Box>
              ),
            }}
          />
        )}
      </Tab.Navigator>

      <AchievementUnlockOverlay
        title={currentAchievement}
        visible={showCelebration}
        onHide={() => setDismissedAchievement(currentAchievement)}
      />

      <Modal isOpen={isBreathingOpen} onClose={() => setBreathingOpen(false)}>
        <ModalContent className="bg-phase-canvas">
          <Box className="pt-xl pb-md px-md border-b border-phase-surface/10">
            <HStack className="justify-between items-center">
              <VStack>
                <Text className="text-phaseText-primary text-lg font-bold">
                  {t('self.breathingReset') || 'Breathing Reset'}
                </Text>
                <Text className="text-phaseText-secondary text-xs">1 minute of peace</Text>
              </VStack>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  hapticLight();
                  setBreathingOpen(false);
                }}
                className="p-2 rounded-full border border-border bg-phase-surface"
              >
                <Icon as={X} size={24} color={colors.text.primary} />
              </Pressable>
            </HStack>
          </Box>
          <Box className="h-[400px] justify-center p-md">
            <BreathGuide
              onComplete={() => {
                setBreathingOpen(false);
              }}
            />
          </Box>
        </ModalContent>
      </Modal>
    </Box>
  );
}
