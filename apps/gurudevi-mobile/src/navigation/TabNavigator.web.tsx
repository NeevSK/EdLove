import React from 'react';
import { View, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { ErrorBoundary, AchievementUnlockOverlay, useTheme } from '@repo/ui';
import { useUserRole, useRewards } from '@repo/core';
import { User, School, Heart, Users, Library, Bell, ChevronLeft, Menu } from 'lucide-react-native';

// Screens / stacks
import ClassroomStackNavigator from './ClassroomStackNavigator';
import ProfileStackNavigator from './ProfileStackNavigator';
import CommunityStackNavigator from './CommunityStackNavigator';
// Web-specific stack navigators
import ClassroomStackNavigatorWeb from './ClassroomStackNavigator.web';
import ProfileStackNavigatorWeb from './ProfileStackNavigator.web';
import CommunityStackNavigatorWeb from './CommunityStackNavigator.web';
import SelfStackNavigatorWeb from './SelfStackNavigator.web';
import LibraryStackNavigatorWeb from './LibraryStackNavigator.web';

const Tab = createBottomTabNavigator();

// ─── NAV HELPERS ──────────────────────────────────────────────────────────

const TAB_CONFIG = [
    { name: 'Profile', icon: User, labelKey: 'tabs.profile' },
    { name: 'Classroom', icon: School, labelKey: 'tabs.classroom' },
    { name: 'Self', icon: Heart, labelKey: 'tabs.self' },
    { name: 'Community', icon: Users, labelKey: 'tabs.community' },
    { name: 'Library', icon: Library, labelKey: 'tabs.library' },
];

// ─── WEB SHELL COMPONENTS ─────────────────────────────────────────────────

function WebShell({ state, navigation, role, children }: any) {
    const { t } = useTranslation();
    const [isSidebarExpanded, setIsSidebarExpanded] = React.useState(true);
    const [isMobileView, setIsMobileView] = React.useState(false);

    // Responsive design: detect mobile view
    React.useEffect(() => {
        const checkScreenSize = () => {
            const isMobile = window.innerWidth < 768;
            setIsMobileView(isMobile);
            // Auto-collapse sidebar on mobile
            if (isMobile) {
                setIsSidebarExpanded(false);
            }
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const getClassroomLabel = () => {
        if (role === 'principal') return t('tabs.mySchool') || 'My School';
        if (role === 'founder') return t('tabs.school');
        if (role === 'section_head') return t('tabs.section');
        if (role === 'grade_head') return t('tabs.grade') || t('tabs.classroom');
        return t('tabs.classroom');
    };

    const getLabel = (route: string, labelKey: string) => {
        if (route === 'Classroom') return getClassroomLabel();
        return t(labelKey);
    };

    const activeIndex = state.index;
    const currentRouteName = state.routes[activeIndex].name;

    const toggleSidebar = () => {
        setIsSidebarExpanded(!isSidebarExpanded);
    };

    return (
        <div className="web-shell">
            <div className="world-bg" />

            {/* ── TOP BAR ── */}
            <header className="top-bar">
                <div className="top-bar-left">
                    <span className="brand-lotus">🪷</span>
                    <span className="brand-name">Gurudevi</span>
                </div>

                {/* Navigation moved to sidebar - only notifications and profile remain in top bar */}

                <div className="top-bar-right">
                    <button className="bell-btn">
                        <Bell size={16} />
                        <div className="bell-dot" />
                    </button>
                    <div className="profile-chip">
                        <div className="profile-gem">
                            {role?.[0]?.toUpperCase() || 'G'}
                        </div>
                        <span className="profile-nm">
                            {role?.split('_').join(' ') || 'Guest'}
                        </span>
                    </div>
                </div>
            </header>

            <div className="web-body">
                {/* ── SIDEBAR ── */}
                <aside className={`sidebar ${isSidebarExpanded ? 'expanded' : 'collapsed'} ${isMobileView ? 'mobile' : ''}`}>
                    {/* Sidebar Toggle Button */}
                    <button 
                        className="sidebar-toggle"
                        onClick={toggleSidebar}
                        aria-label={isSidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
                    >
                        {isSidebarExpanded ? (
                            <ChevronLeft size={16} />
                        ) : (
                            <Menu size={16} />
                        )}
                    </button>

                    <nav className="sidebar-nav">
                        {TAB_CONFIG.map((conf) => {
                            const isActive = currentRouteName === conf.name;
                            const Icon = conf.icon;
                            return (
                                <button
                                    key={conf.name}
                                    className={`sidebar-item ${isActive ? 'active' : ''}`}
                                    onClick={() => {
                                        navigation.navigate(conf.name);
                                        // Auto-close sidebar on mobile after navigation
                                        if (isMobileView) {
                                            setIsSidebarExpanded(false);
                                        }
                                    }}
                                    title={getLabel(conf.name, conf.labelKey)}
                                >
                                    <Icon size={18} color={isActive ? 'var(--water)' : 'var(--ink-ghost)'} />
                                    {isSidebarExpanded && (
                                        <span className="sidebar-label">{getLabel(conf.name, conf.labelKey)}</span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                {/* ── MAIN CONTENT ── */}
                <main className={`screen-content ${isSidebarExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
                    <div className="sanctuary-screen">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

// ─── MAIN NAVIGATOR ────────────────────────────────────────────────────────

export default function TabNavigator({ onTabChange }: { onTabChange?: (tab: string) => void }) {
    const { t } = useTranslation();
    const { role } = useUserRole();
    const { isDark } = useTheme();
    const { newAchievements } = useRewards();
    const [showCelebration, setShowCelebration] = React.useState(false);
    const [currentAchievement, setCurrentAchievement] = React.useState('');

    React.useEffect(() => {
        if (newAchievements.length > 0) {
            setCurrentAchievement(newAchievements[0]);
            setShowCelebration(true);
        }
    }, [newAchievements]);

    return (
        <View style={{ flex: 1 }}>
            <Tab.Navigator
                id="MainTabs"
                initialRouteName="Self"
                tabBar={(props) => (
                    <WebShell
                        {...props}
                        role={role}
                        isDark={isDark}
                    />
                )}
                screenListeners={{
                    state: (e) => {
                        const s = (e.data as any)?.state;
                        if (!s || s.index === undefined) return;
                        const routeName = s.routes[s.index]?.name;
                        if (routeName) {
                            onTabChange?.(routeName.toLowerCase());
                        }
                    },
                }}
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Tab.Screen name="Profile" options={{ tabBarLabel: t('tabs.profile') }}>
                    {() => <ErrorBoundary name="Profile"><ProfileStackNavigatorWeb /></ErrorBoundary>}
                </Tab.Screen>
                <Tab.Screen name="Classroom" options={{ tabBarLabel: t('tabs.classroom') }}>
                    {() => <ErrorBoundary name="Classroom"><ClassroomStackNavigatorWeb /></ErrorBoundary>}
                </Tab.Screen>
                <Tab.Screen name="Self" options={{ tabBarLabel: t('tabs.self') }}>
                    {() => <ErrorBoundary name="Self"><SelfStackNavigatorWeb /></ErrorBoundary>}
                </Tab.Screen>
                <Tab.Screen name="Community" options={{ tabBarLabel: t('tabs.community') }}>
                    {() => <ErrorBoundary name="Community"><CommunityStackNavigatorWeb /></ErrorBoundary>}
                </Tab.Screen>
                <Tab.Screen name="Library" options={{ tabBarLabel: t('tabs.library') }}>
                    {() => <ErrorBoundary name="Library"><LibraryStackNavigatorWeb /></ErrorBoundary>}
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
