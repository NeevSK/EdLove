import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LotusPetalFAB from '../components/LotusPetalFAB';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@gluestack-style/react';
import { Theme } from '../constants/Theme';

// Icons
import {
  User,
  BookOpen,
  Users,
  LayoutGrid,
  Library
} from 'lucide-react-native';

// Screens
import SelfScreen from '../screens/SelfScreen';
import ClassroomScreen from '../screens/ClassroomScreen';
import CommunityScreen from '../screens/CommunityScreen';
import LibraryScreen from '../screens/LibraryScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

// Role Hook (Placeholder until implemented)
const useUserRole = () => {
  // TODO: Connect to Store
  // Returns 'principal' | 'section_head' | 'teacher' | 'student'
  return { role: 'teacher' as string };
};

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
          component={SelfScreen}
          options={{
            tabBarLabel: t('tabs.self'),
            tabBarIcon: ({ color, size }) => (
              <User color={color} size={size} />
            ),
          }}
        />

        {/* 2. Classroom Tab (Dynamic Name) */}
        <Tab.Screen
          name="Classroom"
          component={ClassroomScreen}
          options={{
            tabBarLabel: getClassroomLabel(),
            tabBarIcon: ({ color, size }) => (
              role === 'principal'
                ? <LayoutGrid color={color} size={size} />
                : <BookOpen color={color} size={size} />
            ),
          }}
        />

        {/* 3. Community Tab */}
        <Tab.Screen
          name="Community"
          component={CommunityScreen}
          options={{
            tabBarLabel: t('tabs.community'),
            tabBarIcon: ({ color, size }) => (
              <Users color={color} size={size} />
            ),
          }}
        />

        {/* 4. Library Tab */}
        <Tab.Screen
          name="Library"
          component={LibraryScreen}
          options={{
            tabBarLabel: t('tabs.library'),
            tabBarIcon: ({ color, size }) => (
              <Library color={color} size={size} />
            ),
          }}
        />

        {/* 5. Profile Tab */}
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarLabel: t('tabs.profile'),
            tabBarIcon: ({ color, size }) => (
              <User color={color} size={size} />
            ),
          }}
        />
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
