import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LotusPetalFAB from '../components/shared/LotusPetalFAB';
import { useTranslation } from 'react-i18next';
import { Theme } from '../constants/Theme';

// Icons
import {
  User,
  BookOpen,
  Users,
  LayoutGrid,
  Library
} from 'lucide-react-native';

import ClassroomStackNavigator from './ClassroomStackNavigator';
import { useUserRole } from '../hooks/useUserRole';

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
  const [currentTab, setCurrentTab] = React.useState<any>('self');

  // Dynamic Label Logic
  const getClassroomLabel = () => {
    if (role === 'principal') return t('tabs.school');
    if (role === 'section_head') return t('tabs.section');
    return t('tabs.classroom');
  };

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenListeners={{
          state: (e) => {
            const state = e.data?.state;
            if (!state || state.index === undefined) return;

            const routeName = state.routes[state.index]?.name;
            if (routeName) {
              const tabName = routeName.toLowerCase();
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
            backgroundColor: Theme.colors.midnightBlue,
            borderTopColor: Theme.colors.deepIndigo,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: Theme.colors.sanctuarySaffron,
          tabBarInactiveTintColor: Theme.colors.mistGray,
          tabBarLabelStyle: {
            fontSize: 12,
            fontFamily: 'Inter_500Medium',
          },
        }}
      >
        {/* 1. Self Tab */}
        <Tab.Screen
          name="Self"
          options={{
            tabBarLabel: t('tabs.self'),
            tabBarIcon: ({ color, size }) => (
              <User color={color} size={size} />
            ),
          }}
        >
          {() => (
            <ErrorBoundary name="Self Screen">
              <SelfScreen />
            </ErrorBoundary>
          )}
        </Tab.Screen>

        {/* 2. Classroom Tab (Dynamic Name) */}
        <Tab.Screen
          name="Classroom"
          component={ClassroomStackNavigator}
          options={{
            tabBarLabel: getClassroomLabel(),
            tabBarIcon: ({ color, size }) => (
              role === 'principal'
                ? <LayoutGrid color={color} size={size} />
                : <BookOpen color={color} size={size} />
            ),
          }}
        >
          {() => (
            <ErrorBoundary name="Classroom Screen">
              <ClassroomScreen />
            </ErrorBoundary>
          )}
        </Tab.Screen>

        {/* 3. Community Tab */}
        <Tab.Screen
          name="Community"
          options={{
            tabBarLabel: t('tabs.community'),
            tabBarIcon: ({ color, size }) => (
              <Users color={color} size={size} />
            ),
          }}
        >
          {() => (
            <ErrorBoundary name="Community Screen">
              <CommunityScreen />
            </ErrorBoundary>
          )}
        </Tab.Screen>

        {/* 4. Library Tab */}
        <Tab.Screen
          name="Library"
          options={{
            tabBarLabel: t('tabs.library'),
            tabBarIcon: ({ color, size }) => (
              <Library color={color} size={size} />
            ),
          }}
        >
          {() => (
            <ErrorBoundary name="Library Screen">
              <LibraryScreen />
            </ErrorBoundary>
          )}
        </Tab.Screen>

        {/* 5. Profile Tab */}
        <Tab.Screen
          name="Profile"
          options={{
            tabBarLabel: t('tabs.profile'),
            tabBarIcon: ({ color, size }) => (
              <User color={color} size={size} />
            ),
          }}
        >
          {() => (
            <ErrorBoundary name="Profile Screen">
              <ProfileScreen />
            </ErrorBoundary>
          )}
        </Tab.Screen>
      </Tab.Navigator>

      {/* Global Lotus FAB */}
      <LotusPetalFAB
        currentTab={currentTab}
        onPress={() => {
          console.log(`Lotus FAB Pressed on ${currentTab}`);
          // Future: Trigger specific actions here
        }}
      />
    </View>
  );
}
