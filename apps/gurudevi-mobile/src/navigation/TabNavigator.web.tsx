import React from 'react';
import { View, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { ErrorBoundary, AchievementUnlockOverlay, useTheme } from '@repo/ui';
import { useUserRole, useRewards } from '@repo/core';
import { User, School, Heart, Users, Library, Bell, ChevronLeft, Menu, Settings } from 'lucide-react-native';

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
// In-shell overlay screens (must stay inside sidebar+topbar)
import NotificationsScreenWeb from '../screens/NotificationsScreen.web';
import AppSettingsScreenWeb from '../screens/AppSettingsScreen.web';

type SubView = 'none' | 'notifications' | 'settings';

const Tab = createBottomTabNavigator();

// ─── NAV HELPERS ──────────────────────────────────────────────────────────

const TAB_CONFIG = [
    { name: 'Self', icon: Heart, labelKey: 'tabs.self', mobileLabel: 'Self' },
    { name: 'Community', icon: Users, labelKey: 'tabs.community', mobileLabel: 'Community' },
    { name: 'Classroom', icon: School, labelKey: 'tabs.classroom', mobileLabel: 'Classroom' },
    { name: 'Library', icon: Library, labelKey: 'tabs.library', mobileLabel: 'Library' },
    { name: 'Profile', icon: User, labelKey: 'tabs.profile', mobileLabel: 'Profile' },
];

// ─── MAIN NAVIGATOR (Overlay Architecture) ─────────────────────────────────

export default function TabNavigator({ onTabChange }: { onTabChange?: (tab: string) => void }) {
    const { t } = useTranslation();
    const { role } = useUserRole();
    const { isDark } = useTheme();
    const { newAchievements } = useRewards();
    const navigation = useNavigation();

    const [isSidebarExpanded, setIsSidebarExpanded] = React.useState(true);
    // Mobile/tablet: < 1024px (aligns with CSS @media max-width: 1023px)
    const [isMobileView, setIsMobileView] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState('Self');
    const [activeSubView, setActiveSubView] = React.useState<SubView>('none');
    const [showCelebration, setShowCelebration] = React.useState(false);
    const [currentAchievement, setCurrentAchievement] = React.useState('');

    // Ref to the sidebar element — used for focus trap
    const sidebarRef = React.useRef<HTMLElement>(null);
    // Last focused element before sidebar opened — returned on close
    const preSidebarFocusRef = React.useRef<HTMLElement | null>(null);

    // Responsive design: mobile/tablet < 1024px
    React.useEffect(() => {
        const checkScreenSize = () => {
            const isCompact = window.innerWidth < 1024;
            setIsMobileView(isCompact);
            if (isCompact) setIsSidebarExpanded(false);
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

    // ── FOCUS TRAP: mobile sidebar ──────────────────────────────────────────
    // When the overlay sidebar opens, move keyboard focus inside and prevent
    // Tab from escaping to page content behind the backdrop.
    React.useEffect(() => {
        if (!isMobileView || !isSidebarExpanded) return;

        // Save the element that was focused before we opened the sidebar
        preSidebarFocusRef.current = document.activeElement as HTMLElement;

        // Move focus to the first focusable element inside the sidebar
        const sidebar = sidebarRef.current;
        if (!sidebar) return;
        const focusable = sidebar.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length > 0) focusable[0].focus();

        // Tab key handler — cycle inside the sidebar only
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                closeSidebar();
                return;
            }
            if (e.key !== 'Tab') return;
            const items = Array.from(
                sidebar.querySelectorAll<HTMLElement>(
                    'a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])'
                )
            );
            if (items.length === 0) return;
            const first = items[0];
            const last = items[items.length - 1];
            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            // Restore focus to the element that was active before the sidebar opened
            preSidebarFocusRef.current?.focus();
        };
    }, [isMobileView, isSidebarExpanded]);

    // ── DOCUMENT TITLE: update on tab/subview change ────────────────────────
    React.useEffect(() => {
        const base = 'Gurudevi Sanctuary';
        if (activeSubView === 'notifications') {
            document.title = `Notifications — ${base}`;
        } else if (activeSubView === 'settings') {
            document.title = `Settings — ${base}`;
        } else {
            document.title = activeTab ? `${activeTab} — ${base}` : base;
        }
    }, [activeTab, activeSubView]);

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

    const getMobileLabel = (route: string) => {
        if (route === 'Classroom') {
            if (role === 'principal') return 'School';
            if (role === 'founder') return 'Platform';
            return 'Class';
        }
        return TAB_CONFIG.find(c => c.name === route)?.mobileLabel ?? route;
    };

    const closeSidebar = () => setIsSidebarExpanded(false);

    return (
        <div className="vellum-app-shell">
            <div className="world-bg" />

            {/* ── TOP BAR ── */}
            <header className="top-bar">
                <div className="top-bar-left" style={{ paddingLeft: 24, display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {isMobileView && (
                        <button
                            className="mobile-menu-toggle"
                            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                            aria-label="Toggle navigation"
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Menu size={24} />
                        </button>
                    )}
                    <span className="brand-lotus">🪷</span>
                    <span className="brand-name">Gurudevi Sanctuary</span>
                </div>
                <div className="top-bar-right" />
            </header>

            <div className="shell-body-core">
                {/* ── MOBILE SIDEBAR OVERLAY ── */}
                {isMobileView && isSidebarExpanded && (
                    <div
                        className="sidebar-overlay visible"
                        onClick={closeSidebar}
                        aria-hidden="true"
                    />
                )}

                {/* ── SIDEBAR ── */}
                <aside
                    ref={sidebarRef}
                    className={`sidebar ${isSidebarExpanded ? 'open expanded' : 'collapsed'}`}
                    aria-hidden={isMobileView && !isSidebarExpanded}
                    style={{
                        zIndex: isMobileView ? 1000 : 10,
                        position: isMobileView ? 'fixed' : 'relative',
                        height: isMobileView ? '100%' : 'auto',
                        top: isMobileView ? 0 : undefined,
                        left: isMobileView ? 0 : undefined,
                        width: isMobileView
                            ? '280px'
                            : (isSidebarExpanded ? '240px' : '60px'),
                        boxShadow: isMobileView && isSidebarExpanded
                            ? '4px 0 40px rgba(107,100,128,0.2)'
                            : 'none',
                    }}
                >
                    <div className="sidebar-header" style={{ display: 'flex' }}>
                        {isMobileView ? (
                            <button
                                className="sidebar-toggle"
                                onClick={closeSidebar}
                                aria-label="Close navigation"
                            >
                                <ChevronLeft size={16} />
                            </button>
                        ) : (
                            <button
                                className="sidebar-toggle"
                                onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                                aria-label={isSidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
                            >
                                {isSidebarExpanded ? <ChevronLeft size={16} /> : <Menu size={16} />}
                            </button>
                        )}
                        {(isSidebarExpanded || isMobileView) && (
                            <span className="sidebar-group-label" style={{ marginLeft: '12px' }}>Navigate</span>
                        )}
                    </div>

                    <nav className="sidebar-nav" aria-label="Main navigation">
                        {TAB_CONFIG.map((conf) => {
                            const isActive = activeTab === conf.name && activeSubView === 'none';
                            const Icon = conf.icon;
                            return (
                                <button
                                    key={conf.name}
                                    className={`sidebar-item ${isActive ? 'active' : ''}`}
                                    onClick={() => {
                                        setActiveSubView('none');
                                        (navigation.navigate as any)('Main', { screen: conf.name });
                                        if (isMobileView) closeSidebar();
                                    }}
                                    title={getLabel(conf.name, conf.labelKey)}
                                    aria-current={isActive ? 'page' : undefined}
                                >
                                    <Icon size={20} color={isActive ? 'var(--water)' : 'var(--ink-ghost)'} />
                                    {(isSidebarExpanded || isMobileView) && (
                                        <span className="sidebar-label">{getLabel(conf.name, conf.labelKey)}</span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    <div className="sidebar-footer">
                        <div className="sidebar-divider" />
                        <button
                            className={`sidebar-item ${activeSubView === 'notifications' ? 'active' : ''}`}
                            title={t('common.notifications', 'Notifications')}
                            onClick={() => {
                                setActiveSubView(activeSubView === 'notifications' ? 'none' : 'notifications');
                                if (isMobileView) closeSidebar();
                            }}
                        >
                            <div style={{ position: 'relative' }}>
                                <Bell size={20} color={activeSubView === 'notifications' ? 'var(--water)' : 'var(--ink-ghost)'} />
                                <div className="bell-dot" />
                            </div>
                            {(isSidebarExpanded || isMobileView) && (
                                <span className="sidebar-label">Notifications</span>
                            )}
                        </button>

                        <button
                            className={`sidebar-profile-btn ${activeSubView === 'settings' ? 'active' : ''}`}
                            title={t('common.settings', 'Settings')}
                            onClick={() => {
                                setActiveSubView(activeSubView === 'settings' ? 'none' : 'settings');
                                if (isMobileView) closeSidebar();
                            }}
                        >
                            <div className="profile-gem">
                                <Settings size={16} color="var(--ink-ghost)" />
                            </div>
                            {(isSidebarExpanded || isMobileView) && (
                                <div className="profile-info">
                                    <span className="profile-nm">{role?.split('_').join(' ') || 'Guest'}</span>
                                    <span className="profile-status">{t('common.settings', 'Settings')}</span>
                                </div>
                            )}
                        </button>
                    </div>
                </aside>

                {/* ── MAIN CONTENT CANVAS ── */}
                <main className="main-content-canvas">
                    {activeSubView === 'notifications' && <NotificationsScreenWeb />}
                    {activeSubView === 'settings' && <AppSettingsScreenWeb />}
                    <div style={{ display: activeSubView === 'none' ? 'contents' : 'none' }}>
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
                            screenOptions={{ headerShown: false }}
                        >
                            <Tab.Screen name="Self">
                                {() => <ErrorBoundary name="Self"><SelfStackNavigatorWeb /></ErrorBoundary>}
                            </Tab.Screen>
                            <Tab.Screen name="Community">
                                {() => <ErrorBoundary name="Community"><CommunityStackNavigatorWeb /></ErrorBoundary>}
                            </Tab.Screen>
                            <Tab.Screen name="Classroom">
                                {() => <ErrorBoundary name="Classroom"><ClassroomStackNavigatorWeb /></ErrorBoundary>}
                            </Tab.Screen>
                            <Tab.Screen name="Library">
                                {() => <ErrorBoundary name="Library"><LibraryStackNavigatorWeb /></ErrorBoundary>}
                            </Tab.Screen>
                            <Tab.Screen name="Profile">
                                {() => <ErrorBoundary name="Profile"><ProfileStackNavigatorWeb /></ErrorBoundary>}
                            </Tab.Screen>
                        </Tab.Navigator>
                    </div>
                </main>
            </div>

            {/* ── MOBILE BOTTOM NAV (< 1024px) ── */}
            {isMobileView && activeSubView === 'none' && (
                <nav className="mobile-bottom-nav" aria-label="Tab navigation">
                    {TAB_CONFIG.map((conf) => {
                        const isActive = activeTab === conf.name;
                        const Icon = conf.icon;
                        return (
                            <button
                                key={conf.name}
                                className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveSubView('none');
                                    (navigation.navigate as any)('Main', { screen: conf.name });
                                }}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                <Icon
                                    size={22}
                                    color={isActive ? 'var(--water)' : 'var(--ink-ghost)'}
                                />
                                <span className="mobile-nav-label">
                                    {getMobileLabel(conf.name)}
                                </span>
                            </button>
                        );
                    })}
                    <button
                        className={`mobile-nav-item ${activeSubView === 'notifications' ? 'active' : ''}`}
                        onClick={() => setActiveSubView(activeSubView === 'notifications' ? 'none' : 'notifications')}
                    >
                        <div style={{ position: 'relative' }}>
                            <Bell size={22} color={activeSubView === 'notifications' ? 'var(--water)' : 'var(--ink-ghost)'} />
                            <div className="bell-dot" />
                        </div>
                        <span className="mobile-nav-label">Alerts</span>
                    </button>
                </nav>
            )}

            <AchievementUnlockOverlay
                title={currentAchievement}
                visible={showCelebration}
                onHide={() => setShowCelebration(false)}
            />
        </div>
    );
}
