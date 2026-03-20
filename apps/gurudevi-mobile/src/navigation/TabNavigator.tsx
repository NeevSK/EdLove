import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Theme, SanctuaryBackground, Box, VStack, HStack, Text, hapticLight } from '@repo/ui';
import { ErrorBoundary, AchievementUnlockOverlay } from '@repo/ui';
import { Modal, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';
import { BreathGuide } from '@repo/self';
import { useTheme } from '@repo/ui';

// Icons
import {
  User,
  Users,
  Library,
  Heart,
  School
} from 'lucide-react-native';

import ClassroomStackNavigator from './ClassroomStackNavigator';
import ProfileStackNavigator from './ProfileStackNavigator';
import CommunityStackNavigator from './CommunityStackNavigator';
import LibraryStackNavigator from './LibraryStackNavigator';
import { useUserRole, useRewards, useStore } from '@repo/core';

// Screens
import { SelfScreen } from '../screens';


const Tab = createBottomTabNavigator();

interface TabNavigatorProps {
  onTabChange?: (tabName: string) => void;
}

export default function TabNavigator({ onTabChange }: TabNavigatorProps) {
  const { t } = useTranslation();
  const { role } = useUserRole();
  const { scene, text, accent } = useTheme();
  const [currentTab, setCurrentTab] = React.useState<'self' | 'classroom' | 'community' | 'library' | 'profile'>('self');
  const insets = useSafeAreaInsets();
  const { newAchievements } = useRewards();
  const { isBreathingOpen, setBreathingOpen } = useStore();
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
          tabBarHideOnKeyboard: true, // Universal keyboard behavior
          tabBarStyle: {
            backgroundColor: scene.chrome.bg,
            borderTopWidth: 1,
            borderTopColor: scene.chrome.border,
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
            paddingTop: 8,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            elevation: 8,
            shadowColor: Theme.colors.shadowViolet,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.12,
            shadowRadius: 4,
          },
          tabBarActiveTintColor: accent.action,
          tabBarInactiveTintColor: text.secondary,
          tabBarLabelStyle: {
            fontSize: 12,
            fontFamily: 'Inter_500Medium',
            marginBottom: insets.bottom > 0 ? 0 : 4,
          },
          tabBarBackground: () => <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }} />,
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
            <ErrorBoundary name="Community Stack">
              <CommunityStackNavigator />
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
            <ErrorBoundary name="Library Stack">
              <LibraryStackNavigator />
            </ErrorBoundary>
          )}
        </Tab.Screen>
      </Tab.Navigator>


      <AchievementUnlockOverlay
        title={currentAchievement}
        visible={showCelebration}
        onHide={() => setShowCelebration(false)}
      />


      <Modal
        visible={isBreathingOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setBreathingOpen(false)}
      >
        <Box flex={1} sx={{ backgroundColor: scene.canvas.bg }}>
          <Box sx={{
            paddingTop: 50,
            paddingBottom: Theme.spacing.md,
            paddingHorizontal: Theme.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: scene.chrome.border
          }}>
            <HStack justifyContent="space-between" alignItems="center">
              <VStack>
                <Text color={text.onCanvas} sx={{ fontSize: '$lg' as any, fontWeight: '700' }}>
                  {t('self.breathingReset') || 'Breathing Reset'}
                </Text>
                <Text color={text.secondary} sx={{ fontSize: '$xs' as any }}>
                  1 minute of peace
                </Text>
              </VStack>
              <TouchableOpacity accessibilityRole="button"
                onPress={() => {
                  hapticLight();
                  setBreathingOpen(false);
                }}
                style={{
                  padding: 8,
                  borderRadius: Theme.corners.full,
                  backgroundColor: scene.interactive.bg,
                  borderColor: scene.interactive.border,
                  borderWidth: 1,
                }}
              >
                <X size={24} color={text.onInteractive} />
              </TouchableOpacity>
            </HStack>
          </Box>
          <Box sx={{ flex: 1, justifyContent: 'center' }}>
            <BreathGuide onComplete={() => {
              setBreathingOpen(false);
            }} />
          </Box>
        </Box>
      </Modal>
    </View>
  );
}
