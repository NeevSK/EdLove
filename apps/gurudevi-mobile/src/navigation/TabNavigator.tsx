import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { 
  SanctuaryBackground, 
  Box, 
  VStack, 
  HStack, 
  Text, 
  hapticLight, 
  Icon, 
  ErrorBoundary, 
  AchievementUnlockOverlay,
  useTheme
} from '@repo/ui';
import { 
  X, 
  User, 
  Users, 
  Library, 
  Heart, 
  School, 
  Hammer 
} from 'lucide-react-native';

import ClassroomStackNavigator from './ClassroomStackNavigator';
import ProfileStackNavigator from './ProfileStackNavigator';
import CommunityStackNavigator from './CommunityStackNavigator';
import LibraryStackNavigator from './LibraryStackNavigator';
import { BreathGuide } from '@repo/self';
import { useThemedColors } from '@repo/ui';
import { usePermissions, useRewards, useTracking, useStore } from '@repo/core';
import { WorkforceShell } from '@repo/workforce';

// Screens
import {
  SelfScreen
} from '../screens';
// Assuming this is a local component, not a screen


const Tab = createBottomTabNavigator();

interface TabNavigatorProps {
  onTabChange?: (tabName: string) => void;
}

export default function TabNavigator({ onTabChange }: TabNavigatorProps) {
  const { t } = useTranslation();
  const { context, flags } = usePermissions();
  const role = context.roles[0];
  const colors = useTheme().scene;
  const { phase } = useTheme();
  const [currentTab, setCurrentTab] = React.useState<'self' | 'classroom' | 'community' | 'library' | 'profile' | 'workforce'>('self');
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
    if (role === 'sectionHead') return t('tabs.section');
    if (role === 'gradeHead') return t('tabs.grade') || t('tabs.classroom');
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
          }}}
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
            shadowRadius: 4},
          tabBarActiveTintColor: colors.primary.main,
          tabBarInactiveTintColor: colors.text.muted,
          tabBarLabelStyle: {
            fontSize: 12,
            fontFamily: 'Inter_500Medium',
            marginBottom: insets.bottom > 0 ? 0 : 4},
          tabBarBackground: () => <View style={StyleSheet.absoluteFill} />}}>
        {/* 1. Profile Tab */}
        <Tab.Screen
          name="Profile"
          options={{
            tabBarLabel: t('tabs.profile'),
            tabBarIcon: ({ color, size }) => (
              <View>
                <Icon as={User} color={color} size={size} fill={currentTab === 'profile' ? color : 'none'} />
              </View>
            )}}>
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
            )}}>
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
            )}}>
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
                <Icon as={Users} color={color} size={size} fill={currentTab === 'community' ? color : 'none'} />
              </View>
            )}}>
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
            )}}
        >
          {() => (
            <ErrorBoundary name="Library Stack">
              <LibraryStackNavigator />
            </ErrorBoundary>
          )}
        </Tab.Screen>

        {/* 6. Workforce Tab (Experimental) */}
        {flags.isDevelopingWorkforce && (
          <Tab.Screen
            name="Workforce"
            options={{
              tabBarLabel: 'Workforce',
              tabBarIcon: ({ color, size }) => (
                <View>
                  <Hammer color={color} size={size} fill={currentTab === 'workforce' ? color : 'none'} />
                </View>
              )}}
          >
            {() => (
              <ErrorBoundary name="Workforce Tab">
                <WorkforceShell />
              </ErrorBoundary>
            )}
          </Tab.Screen>
        )}
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
        onRequestClose={() => setBreathingOpen(false)}>
        <Box className="flex-1 bg-phase-canvas">
          <Box className="pt-[50px] pb-md px-md border-b border-phase-surface/10">
            <HStack className="justify-between items-center">
              <VStack>
                <Text className="text-phaseText-primary text-lg font-bold">
                  {t('self.breathingReset') || 'Breathing Reset'}
                </Text>
                <Text className="text-phaseText-secondary text-xs">
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
                  borderRadius: 9999,
                  backgroundColor: colors.primary.muted,
                  borderColor: colors.border.base,
                  borderWidth: 1}}>
                <Icon as={X} size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </HStack>
          </Box>
          <Box className="flex-1 justify-center">
            <BreathGuide onComplete={() => {
              setBreathingOpen(false);
            }} />
          </Box>
        </Box>
      </Modal>
    </View>
  );
}
