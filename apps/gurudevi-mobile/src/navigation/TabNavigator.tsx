/**
 * TabNavigator Component
 * 
 * Role-aware bottom tab navigation
 * Dynamically adjusts tab labels based on user role
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, School, Users, Library, User } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Theme } from '../constants/Theme';
import { useUserRole } from '../hooks/useUserRole';

// Import screens
import SelfScreen from '../screens/SelfScreen';
import ClassroomScreen from '../screens/ClassroomScreen';
import CommunityScreen from '../screens/CommunityScreen';
import LibraryScreen from '../screens/LibraryScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

interface TabNavigatorProps {
    onTabChange?: (tabName: string) => void;
}

export default function TabNavigator({ onTabChange }: TabNavigatorProps) {
    const { role } = useUserRole();
    const { t } = useTranslation();

    // Get dynamic tab label based on role
    const getClassroomTabLabel = (): string => {
        switch (role) {
            case 'principal':
                return t('tabs.school') || 'School';
            case 'section_head':
                return t('tabs.section') || 'Section';
            case 'grade_head':
                return t('tabs.grade') || 'Grade';
            case 'teacher':
            case 'student':
            default:
                return t('tabs.classroom') || 'Classroom';
        }
    };

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: Theme.colors.voidIndigo,
                    borderTopWidth: 0,
                    height: 70,
                    paddingBottom: 10,
                    paddingTop: 10,
                },
                tabBarActiveTintColor: Theme.colors.sanctuarySaffron,
                tabBarInactiveTintColor: Theme.colors.dimGray,
                tabBarIcon: ({ color, size }) => {
                    if (route.name === 'Self') return <Home color={color} size={size} />;
                    if (route.name === 'Classroom') return <School color={color} size={size} />;
                    if (route.name === 'Community') return <Users color={color} size={size} />;
                    if (route.name === 'Library') return <Library color={color} size={size} />;
                    if (route.name === 'Profile') return <User color={color} size={size} />;
                    return null;
                },
            })}
            screenListeners={{
                state: (e) => {
                    const state = e.data?.state;
                    if (!state || state.index === undefined) return;
                    
                    const routeName = state.routes[state.index]?.name;
                    if (!routeName) return;
                    
                    const tabName = routeName.toLowerCase();
                    const validTabs = ['self', 'classroom', 'community', 'library', 'profile'];
                    if (validTabs.includes(tabName) && onTabChange) {
                        onTabChange(tabName);
                    }
                },
            }}
        >
            <Tab.Screen name="Self" component={SelfScreen} />
            <Tab.Screen 
                name="Classroom" 
                component={ClassroomScreen}
                options={{
                    tabBarLabel: getClassroomTabLabel(),
                }}
            />
            <Tab.Screen name="Community" component={CommunityScreen} />
            <Tab.Screen name="Library" component={LibraryScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}
