/**
 * TabNavigator.web.tsx — Sidebar Navigation (Pattern A)
 *
 * On native, TabNavigator renders a bottom tab bar. On web Metro resolves
 * this file instead, replacing the bottom bar with a fixed left sidebar.
 * Every screen registration, error boundary, and role-aware label is kept
 * identical — only the chrome layer changes.
 *
 * Layout contract:
 *   ┌────────────┬────────────────────────────────┐
 *   │  Sidebar   │  Screen content (sceneStyle)   │
 *   │  220 px    │  flex: 1, marginLeft: 220      │
 *   └────────────┴────────────────────────────────┘
 *
 * The sidebar is `position: 'absolute'` so it floats over the Tab.Navigator's
 * internal column layout. `sceneStyle` adds `marginLeft` to every scene so
 * content is never hidden behind the sidebar.
 *
 * Design tokens: Vellum bg · Ink text · Saffron active · Shadow Violet shadows
 */

import React from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    useWindowDimensions,
    Platform,
    StyleProp,
    ViewStyle,
} from 'react-native';
import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { Theme, SanctuaryBackground, ErrorBoundary, AchievementUnlockOverlay } from '@repo/ui';
import { useTheme } from '@repo/ui';
import { useUserRole, useRewards } from '@repo/core';
// Icons (same set as native TabNavigator)
import { User, Heart, Users, Library, School } from 'lucide-react-native';

// Screens / stacks (same as native)
import ClassroomStackNavigator from './ClassroomStackNavigator';
import ProfileStackNavigator from './ProfileStackNavigator';
import CommunityStackNavigator from './CommunityStackNavigator';
import { SelfScreen, LibraryScreen } from '../screens';

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const SIDEBAR_WIDTH = 220;
const SIDEBAR_COLLAPSED_WIDTH = 64;

// Phase → top-accent colour (mirrors TemporalGlass palette)
const PHASE_ACCENT: Record<string, string> = {
    predawn: 'rgba(184,169,224,0.60)',
    dawn: 'rgba(212,132,58,0.80)',
    morning: 'rgba(212,132,58,0.70)',
    midday: 'rgba(125,212,192,0.70)',
    afternoon: 'rgba(212,132,58,0.75)',
    evening: 'rgba(212,132,58,0.85)',
    dusk: 'rgba(184,169,224,0.65)',
    night: 'rgba(184,169,224,0.55)',
};

// Role → display name + accent colour
const ROLE_META: Record<string, { label: string; color: string }> = {
    teacher: { label: 'Teacher', color: '#D4843A' },
    student: { label: 'Student', color: '#8BBF7A' },
    principal: { label: 'Principal', color: '#6B6480' },
    founder: { label: 'Founder', color: '#D4843A' },
    section_head: { label: 'Sec. Head', color: '#D4843A' },
    grade_head: { label: 'Grade Head', color: '#D4843A' },
    admin: { label: 'Admin', color: '#6B6480' },
    guest: { label: 'Guest', color: '#8C8273' },
};

// ─── Keyboard shortcut label per tab (matches Cmd+1-5) ────────────────────────
const TAB_SHORTCUTS: Record<string, string> = {
    Profile:   '⌘1',
    Classroom: '⌘2',
    Self:      '⌘3',
    Community: '⌘4',
    Library:   '⌘5',
};
interface WebSidebarProps extends BottomTabBarProps {
    onTabChange?: (tab: string) => void;
    phase: string;
    isDark: boolean;
    role: string | null;
    collapsed: boolean;
    onToggle: () => void;
}

const TAB_ICONS: Record<string, typeof Heart> = {
    Profile: User,
    Classroom: School,
    Self: Heart,
    Community: Users,
    Library: Library,
};

function WebSidebar({
    state,
    descriptors,
    navigation,
    onTabChange,
    phase,
    isDark,
    role,
    collapsed,
    onToggle,
}: WebSidebarProps) {
    const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

    const bg = isDark ? Theme.colors.shroud : Theme.colors.vellum;
    const border = isDark
        ? 'rgba(252,249,242,0.08)'
        : 'rgba(42,35,24,0.07)';
    const accentLine = PHASE_ACCENT[phase] ?? PHASE_ACCENT.morning;
    const roleMeta = ROLE_META[role ?? 'guest'] ?? ROLE_META.guest;
    const width = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

    return (
        <View
            accessibilityRole="navigation"
            accessibilityLabel="Main navigation sidebar"
            style={[
                styles.sidebar,
                {
                    width,
                    backgroundColor: bg,
                    borderRightColor: border,
                    shadowColor: Theme.colors.shadowViolet,
                },
            ]}
        >
            {/* Phase accent line at the very top */}
            <View style={[styles.phaseAccent, { backgroundColor: accentLine }]} />

            {/* Logo + collapse toggle */}
            <Pressable
                onPress={onToggle}
                style={styles.logoRow}
                accessibilityLabel={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
                <View style={styles.logoCircle}>
                    <Text style={styles.logoGlyph}>🪷</Text>
                </View>
                {!collapsed && (
                    <Text
                        style={[
                            styles.logoText,
                            { color: isDark ? Theme.colors.sacredWhite : Theme.colors.inkTruth },
                        ]}
                        numberOfLines={1}
                    >
                        Gurudevi
                    </Text>
                )}
            </Pressable>

            {/* Role badge */}
            {!collapsed && (
                <View style={[styles.roleBadge, { borderColor: roleMeta.color + '40' }]}>
                    <View
                        style={[styles.roleDot, { backgroundColor: roleMeta.color }]}
                    />
                    <Text style={[styles.roleLabel, { color: roleMeta.color }]}>
                        {roleMeta.label}
                    </Text>
                </View>
            )}

            {/* Divider */}
            <View style={[styles.divider, { backgroundColor: border }]} />

            {/* Tab items */}
            <View style={styles.tabList}>
                {state.routes.map((route, index) => {
                    const isActive = state.index === index;
                    const isHovered = hoveredIndex === index;
                    const { options } = descriptors[route.key];
                    const label = options.tabBarLabel as string ?? route.name;
                    const IconComponent = TAB_ICONS[route.name] ?? Heart;
                    const activeColor = Theme.colors.sanctuarySaffron;
                    const inactiveColor = isDark
                        ? Theme.colors.starlightGray
                        : Theme.colors.willow;
                    const iconColor = isActive ? activeColor : inactiveColor;

                    return (
                        <Pressable
                            key={route.key}
                            onPress={() => {
                                navigation.navigate(route.name);
                                onTabChange?.(route.name.toLowerCase());
                            }}
                            onHoverIn={() => setHoveredIndex(index)}
                            onHoverOut={() => setHoveredIndex(null)}
                            accessibilityRole="tab"
                            accessibilityState={{ selected: isActive }}
                            style={[
                                styles.tabItem,
                                collapsed && styles.tabItemCollapsed,
                                isActive && [
                                    styles.tabItemActive,
                                    {
                                        backgroundColor: isDark
                                            ? 'rgba(212,132,58,0.12)'
                                            : 'rgba(212,132,58,0.08)',
                                    },
                                ],
                                !isActive && isHovered && {
                                    backgroundColor: isDark
                                        ? 'rgba(252,249,242,0.05)'
                                        : 'rgba(42,35,24,0.04)',
                                },
                            ]}
                        >
                            {/* Active left accent bar */}
                            <View
                                style={[
                                    styles.activeBar,
                                    { opacity: isActive ? 1 : 0 },
                                ]}
                            />

                            <View
                                style={[
                                    styles.iconWrap,
                                    isActive && { transform: [{ scale: 1.08 }] },
                                ]}
                            >
                                <IconComponent
                                    size={20}
                                    color={iconColor}
                                    fill={isActive ? iconColor : 'none'}
                                />
                            </View>

                            {!collapsed && (
                                <Text
                                    style={[
                                        styles.tabLabel,
                                        {
                                            color: isActive ? activeColor : inactiveColor,
                                            fontWeight: isActive ? '700' : '500',
                                        },
                                    ]}
                                    numberOfLines={1}
                                >
                                    {label}
                                </Text>
                            )}

                            {/* Shortcut hint — visible on hover when expanded */}
                            {!collapsed && isHovered && !isActive && TAB_SHORTCUTS[route.name] && (
                                <View style={[styles.shortcutHint, { borderColor: isDark ? 'rgba(252,249,242,0.12)' : 'rgba(42,35,24,0.10)' }]}>
                                    <Text style={[styles.shortcutText, { color: inactiveColor }]}>
                                        {TAB_SHORTCUTS[route.name]}
                                    </Text>
                                </View>
                            )}
                        </Pressable>
                    );
                })}
            </View>

            {/* Footer */}
            <View style={styles.sidebarFooter}>
                <View style={[styles.divider, { backgroundColor: border, marginBottom: 12 }]} />
                {!collapsed && (
                    <Text
                        style={[
                            styles.footerText,
                            { color: isDark ? Theme.colors.mistGray : Theme.colors.willow },
                        ]}
                    >
                        app.gurudevi.edlove.org
                    </Text>
                )}
            </View>
        </View>
    );
}

// ─────────────────────────────────────────────
// Main Navigator
// ─────────────────────────────────────────────
const Tab = createBottomTabNavigator();

interface TabNavigatorProps {
    onTabChange?: (tabName: string) => void;
}

export default function TabNavigator({ onTabChange }: TabNavigatorProps) {
    const { t } = useTranslation();
    const { role } = useUserRole();
    const { phase, isDark } = useTheme();
    const { width } = useWindowDimensions();
    const { newAchievements } = useRewards();
    const [collapsed, setCollapsed] = React.useState(width < 960);
    const [showCelebration, setShowCelebration] = React.useState(false);
    const [currentAchievement, setCurrentAchievement] = React.useState('');

    // Auto-collapse on narrow screens
    React.useEffect(() => {
        setCollapsed(width < 960);
    }, [width]);

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

    const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

    const renderTabBar = (props: BottomTabBarProps) => (
        <WebSidebar
            {...props}
            onTabChange={(tab) => {
                onTabChange?.(tab);
            }}
            phase={phase}
            isDark={isDark}
            role={role}
            collapsed={collapsed}
            onToggle={() => setCollapsed((c) => !c)}
        />
    );

    return (
        <View style={{ flex: 1 }}>
            <SanctuaryBackground />

            <Tab.Navigator
                id="MainTabs"
                initialRouteName="Self"
                tabBar={renderTabBar}
                screenListeners={{
                    state: (e) => {
                        const s = (e.data as any)?.state;
                        if (!s || s.index === undefined) return;
                        const routeName = s.routes[s.index]?.name;
                        if (routeName) {
                            const tab = routeName.toLowerCase();
                            onTabChange?.(tab);
                        }
                    },
                }}
                screenOptions={{
                    headerShown: false,
                    // Push every scene right so content is never behind the sidebar
                    sceneStyle: { marginLeft: sidebarWidth },
                }}
            >
                <Tab.Screen
                    name="Profile"
                    options={{ tabBarLabel: t('tabs.profile') }}
                >
                    {() => (
                        <ErrorBoundary name="Profile Stack">
                            <ProfileStackNavigator />
                        </ErrorBoundary>
                    )}
                </Tab.Screen>

                <Tab.Screen
                    name="Classroom"
                    options={{ tabBarLabel: getClassroomLabel() }}
                >
                    {() => (
                        <ErrorBoundary name="Classroom Tab">
                            <ClassroomStackNavigator />
                        </ErrorBoundary>
                    )}
                </Tab.Screen>

                <Tab.Screen
                    name="Self"
                    options={{ tabBarLabel: t('tabs.self') }}
                >
                    {() => (
                        <ErrorBoundary name="Self Screen">
                            <SelfScreen />
                        </ErrorBoundary>
                    )}
                </Tab.Screen>

                <Tab.Screen
                    name="Community"
                    options={{ tabBarLabel: t('tabs.community') }}
                >
                    {() => (
                        <ErrorBoundary name="Community Stack">
                            <CommunityStackNavigator />
                        </ErrorBoundary>
                    )}
                </Tab.Screen>

                <Tab.Screen
                    name="Library"
                    options={{ tabBarLabel: t('tabs.library') }}
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

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
    sidebar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
        borderRightWidth: 1,
        shadowOpacity: 0.12,
        shadowRadius: 20,
        shadowOffset: { width: 4, height: 0 },
        elevation: 8,
        overflow: 'hidden',
    },
    phaseAccent: {
        height: 3,
        width: '100%',
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 12,
        gap: 10,
    },
    logoCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(212,132,58,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    logoGlyph: {
        fontSize: 18,
    },
    logoText: {
        fontSize: 17,
        fontWeight: '800',
        letterSpacing: -0.3,
        flexShrink: 1,
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 14,
        marginBottom: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        borderWidth: 1,
        gap: 6,
        alignSelf: 'flex-start',
    },
    roleDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    roleLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    divider: {
        height: 1,
        marginHorizontal: 14,
        marginVertical: 4,
    },
    tabList: {
        flex: 1,
        paddingVertical: 8,
        gap: 2,
    },
    tabItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 8,
        paddingHorizontal: 10,
        paddingVertical: 11,
        borderRadius: 12,
        gap: 12,
        position: 'relative',
    },
    tabItemCollapsed: {
        justifyContent: 'center',
        paddingHorizontal: 0,
        marginHorizontal: 10,
    },
    tabItemActive: {
        borderRadius: 12,
    },
    activeBar: {
        position: 'absolute',
        left: 0,
        top: '20%',
        bottom: '20%',
        width: 3,
        borderRadius: 2,
        backgroundColor: Theme.colors.sanctuarySaffron,
    },
    iconWrap: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    tabLabel: {
        fontSize: 14,
        letterSpacing: 0.1,
        flexShrink: 1,
    },
    shortcutHint: {
        marginLeft: 'auto',
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: 6,
        borderWidth: 1,
    },
    shortcutText: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    sidebarFooter: {
        paddingHorizontal: 14,
        paddingBottom: 20,
    },
    footerText: {
        fontSize: 10,
        letterSpacing: 0.3,
        textAlign: 'center',
    },
});
