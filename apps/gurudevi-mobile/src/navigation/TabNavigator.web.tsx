import React from 'react';
import { View, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
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

// ─── MAIN NAVIGATOR (Overlay Architecture) ─────────────────────────────────

export default function TabNavigator({ onTabChange }: { onTabChange?: (tab: string) => void }) {
    const { t } = useTranslation();
    const { role } = useUserRole();
    const { isDark } = useTheme();
    const { newAchievements } = useRewards();
    const navigation = useNavigation();

    const [isSidebarExpanded, setIsSidebarExpanded] = React.useState(true);
    const [isMobileView, setIsMobileView] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState('Self');
    const [showCelebration, setShowCelebration] = React.useState(false);
    const [currentAchievement, setCurrentAchievement] = React.useState('');

    // Responsive design: detect mobile view
    React.useEffect(() => {
        const checkScreenSize = () => {
            const isMobile = window.innerWidth < 768;
            setIsMobileView(isMobile);
            if (isMobile) setIsSidebarExpanded(false);
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    React.useEffect(() => {
        if (newAchievements.length > 0) {
            setCurrentAchievement(newAchievements[0]);
            setShowCelebration(true);
        }
    }, [newAchievements]);

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

    const sidebarWidth = isMobileView ? 0 : (isSidebarExpanded ? 240 : 60);

    return (
        <div className="vellum-app-shell" style={{ ...({ '--dynamic-sidebar-w': `${sidebarWidth}px` } as any) }}>
            <div className="world-bg" />

            {/* ── TOP BAR (Header Flex Item) ── */}
            <header className="top-bar">
                <div
                    className="top-bar-left"
                    style={{
                        paddingLeft: 24, // Stabilized branding
                    }}
                >
                    <span className="brand-lotus">🪷</span>
                    <span className="brand-name">Gurudevi Sanctuary</span>
                </div>
                <div className="top-bar-right" />
            </header>

            <div className="shell-body-core">
                {/* ── SIDEBAR (Inside Body Flex Row) ── */}
                <aside className={`sidebar ${isSidebarExpanded ? 'expanded' : 'collapsed'} ${isMobileView ? 'mobile' : ''}`}>
                    <div className="sidebar-header">
                        <button
                            className="sidebar-toggle"
                            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                        >
                            {isSidebarExpanded ? <ChevronLeft size={16} /> : <Menu size={16} />}
                        </button>
                        {isSidebarExpanded && <span className="sidebar-group-label" style={{ marginLeft: '12px' }}>Navigate</span>}
                    </div>

                    <nav className="sidebar-nav">
                        {TAB_CONFIG.map((conf) => {
                            const isActive = activeTab === conf.name;
                            const Icon = conf.icon;
                            return (
                                <button
                                    key={conf.name}
                                    className={`sidebar-item ${isActive ? 'active' : ''}`}
                                    onClick={() => {
                                        (navigation.navigate as any)('Main', { screen: conf.name });
                                        if (isMobileView) setIsSidebarExpanded(false);
                                    }}
                                    title={getLabel(conf.name, conf.labelKey)}
                                >
                                    <Icon size={20} color={isActive ? 'var(--water)' : 'var(--ink-ghost)'} />
                                    {isSidebarExpanded && (
                                        <span className="sidebar-label">{getLabel(conf.name, conf.labelKey)}</span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    <div className="sidebar-footer">
                        <div className="sidebar-divider" />
                        <button className="sidebar-item" title="Notifications">
                            <div style={{ position: 'relative' }}>
                                <Bell size={20} color="var(--ink-ghost)" />
                                <div className="bell-dot" />
                            </div>
                            {isSidebarExpanded && <span className="sidebar-label">Notifications</span>}
                        </button>

                        <button className="sidebar-profile-btn" title="Profile Settings">
                            <div className="profile-gem">
                                {role?.[0]?.toUpperCase() || 'G'}
                            </div>
                            {isSidebarExpanded && (
                                <div className="profile-info">
                                    <span className="profile-nm">{role?.split('_').join(' ') || 'Guest'}</span>
                                    <span className="profile-status">Online</span>
                                </div>
                            )}
                        </button>
                    </div>
                </aside>

                {/* ── MAIN CONTENT CANVAS (Filling Remaining Body Flex) ── */}
                <main className="main-content-canvas">
                    <Tab.Navigator
                        id="MainTabs"
                        initialRouteName="Self"
                        tabBar={() => null}
                        // @ts-ignore
                        sceneContainerStyle={{
                            backgroundColor: 'transparent',
                            minHeight: '100%',
                            overflow: 'visible',
                        }}
                        screenListeners={{
                            state: (e) => {
                                const s = (e.data as any)?.state;
                                if (!s || s.index === undefined) return;
                                const routeName = s.routes[s.index]?.name;
                                if (routeName) {
                                    setActiveTab(routeName);
                                    onTabChange?.(routeName.toLowerCase());
                                }
                            },
                        }}
                        screenOptions={{
                            headerShown: false,
                        }}
                    >
                        <Tab.Screen name="Profile">
                            {() => <ErrorBoundary name="Profile"><ProfileStackNavigatorWeb /></ErrorBoundary>}
                        </Tab.Screen>
                        <Tab.Screen name="Classroom">
                            {() => <ErrorBoundary name="Classroom"><ClassroomStackNavigatorWeb /></ErrorBoundary>}
                        </Tab.Screen>
                        <Tab.Screen name="Self">
                            {() => <ErrorBoundary name="Self"><SelfStackNavigatorWeb /></ErrorBoundary>}
                        </Tab.Screen>
                        <Tab.Screen name="Community">
                            {() => <ErrorBoundary name="Community"><CommunityStackNavigatorWeb /></ErrorBoundary>}
                        </Tab.Screen>
                        <Tab.Screen name="Library">
                            {() => <ErrorBoundary name="Library"><LibraryStackNavigatorWeb /></ErrorBoundary>}
                        </Tab.Screen>
                    </Tab.Navigator>
                </main>
            </div>

            <AchievementUnlockOverlay
                title={currentAchievement}
                visible={showCelebration}
                onHide={() => setShowCelebration(false)}
            />
        </div>
    );
}

