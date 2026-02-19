import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LotusPetalFAB from '../components/shared/LotusPetalFAB';
import { useTranslation } from 'react-i18next';
import { Theme } from '@repo/ui';
import ErrorBoundary from '../components/shared/ErrorBoundary';

// Icons
import {
  User,
  BookOpen,
  Users,
  LayoutGrid,
  Library,
  Heart,
  School
} from 'lucide-react-native';

import ClassroomStackNavigator from './ClassroomStackNavigator';
import ProfileStackNavigator from './ProfileStackNavigator';
import { useThemedColors } from '@repo/ui';
import { useUserRole, useRewards, useTracking } from '@repo/core';
import AchievementUnlockOverlay from '../components/shared/AchievementUnlockOverlay';

// Screens
import {
  SelfScreen,
  CommunityScreen,
  LibraryScreen,
  ProfileScreen
} from '../screens';

const Tab = createBottomTabNavigator();

interface TabNavigatorProps {
  onTabChange?: (tabName: string) => void;
}

export default function TabNavigator({ onTabChange }: TabNavigatorProps) {
  const { t } = useTranslation();
  const { role } = useUserRole();
  const colors = useThemedColors();
  const [currentTab, setCurrentTab] = React.useState<'self' | 'classroom' | 'community' | 'library' | 'profile'>('self');
  const insets = useSafeAreaInsets(); // Get safe area insets
  const { newAchievements } = useRewards();
  const { exploredFeatures } = useTracking();
  const [showCelebration, setShowCelebration] = React.useState(false);
  const [currentAchievement, setCurrentAchievement] = React.useState('');

  React.useEffect(() => {
    if (newAchievements.length > 0) {
      setCurrentAchievement(newAchievements[0]);
      setShowCelebration(true);
    }
  }, [newAchievements]);

  // Dynamic Label Logic
  const getClassroomLabel = () => {
    if (role === 'principal') return t('tabs.mySchool') || 'My School';
    if (role === 'founder') return t('tabs.school');
    if (role === 'section_head') return t('tabs.section');
    if (role === 'grade_head') return t('tabs.grade') || t('tabs.classroom');
    return t('tabs.classroom');
  };

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        id="MainTabs"
        initialRouteName="Self"
        screenListeners={{
          state: (e) => {
            const state = e.data?.state;
            if (!state || state.index === undefined) return;

            const routeName = state.routes[state.index]?.name;
            if (routeName) {
              const tabName = routeName.toLowerCase() as any;
              setCurrentTab(tabName);
              if (onTabChange) {
                onTabChange(tabName);
              }
            }
          },
        }}
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.secondary, // Use secondary for a cleaner look
            borderTopColor: colors.border,
            borderTopWidth: 1,
            height: 60 + insets.bottom, // Dynamic height including safe area
            paddingBottom: insets.bottom > 0 ? insets.bottom : 8, // Adjust padding
            paddingTop: 8,
            position: 'absolute', // Floating effect if desired, but sticking to bottom for now
            bottom: 0,
            left: 0,
            right: 0,
            elevation: 0, // Remove default elevation
          },
          tabBarActiveTintColor: colors.action,
          tabBarInactiveTintColor: colors.textTertiary,
          tabBarLabelStyle: {
            fontSize: 12,
            fontFamily: 'Inter_500Medium',
            marginBottom: insets.bottom > 0 ? 0 : 4,
          },
          tabBarBackground: () => (
            // Optional: Add BlurView here for glass tab bar
            <View style={{ flex: 1, backgroundColor: colors.secondary }} />
          ),
        }}
      >
        {/* 1. Profile Tab */}
        <Tab.Screen
          name="Profile"
          options={{
            tabBarLabel: t('tabs.profile'),
            tabBarIcon: ({ color, size }) => (
              <View>
                <User color={color} size={size} fill={currentTab === 'profile' ? color : 'none'} />
              </View>
            ),
          }}
        >
          {() => (
            <ErrorBoundary name="Profile Stack">
              <ProfileStackNavigator />
            </ErrorBoundary>
          )}
        </Tab.Screen>

        {/* 2. Classroom Tab */}
        <Tab.Screen
          name="Classroom"
          options={{
            tabBarLabel: getClassroomLabel(),
            tabBarIcon: ({ color, size }) => (
              <School color={color} size={size} fill={currentTab === 'classroom' ? color : 'none'} />
            ),
          }}
        >
          {() => (
            <ErrorBoundary name="Classroom Tab">
              <ClassroomStackNavigator />
            </ErrorBoundary>
          )}
        </Tab.Screen>

        {/* 3. Self Tab (Center Anchor) */}
        <Tab.Screen
          name="Self"
          options={{
            tabBarLabel: t('tabs.self'),
            tabBarIcon: ({ color, size }) => (
              <View>
                <Heart color={color} size={size} fill={currentTab === 'self' ? color : 'none'} />
              </View>
            ),
          }}
        >
          {() => (
            <ErrorBoundary name="Self Screen">
              <SelfScreen />
            </ErrorBoundary>
          )}
        </Tab.Screen>

        {/* 4. Community Tab */}
        <Tab.Screen
          name="Community"
          options={{
            tabBarLabel: t('tabs.community'),
            tabBarIcon: ({ color, size }) => (
              <View>
                <Users color={color} size={size} fill={currentTab === 'community' ? color : 'none'} />
              </View>
            ),
          }}
        >
          {() => (
            <ErrorBoundary name="Community Screen">
              <CommunityScreen />
            </ErrorBoundary>
          )}
        </Tab.Screen>

        {/* 5. Library Tab */}
        <Tab.Screen
          name="Library"
          options={{
            tabBarLabel: t('tabs.library'),
            tabBarIcon: ({ color, size }) => (
              <View>
                <Library color={color} size={size} fill={currentTab === 'library' ? color : 'none'} />
              </View>
            ),
          }}
        >
          {() => (
            <ErrorBoundary name="Library Screen">
              <LibraryScreen />
            </ErrorBoundary>
          )}
        </Tab.Screen>
      </Tab.Navigator>


      <AchievementUnlockOverlay
        title={currentAchievement}
        visible={showCelebration}
        onHide={() => setShowCelebration(false)}
      />
    </View>
  );
}
