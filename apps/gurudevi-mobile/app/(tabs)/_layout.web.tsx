import { supabaseClient } from '@repo/core/adapters/supabaseClient';
import { createSupabaseGuardianRepository } from '@repo/core/adapters/supabase/guardianRepository';
import { createSupabaseTuitionBatchRepository } from '@repo/core/adapters/supabase/tuitionBatchRepository';
import { useNotifications, useRewards } from '@repo/core/hooks';
import { usePermissions, usePerspectiveSwitch, useStore } from '@repo/core/logic';
import { BreathGuide } from '@repo/self/wellbeing';
import AchievementUnlockOverlay from '@repo/ui/components/AchievementUnlockOverlay';
import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import type { LucideIcon } from '@repo/ui/icons';
import {
  Bell,
  FileText,
  Heart,
  Library,
  PanelLeftClose,
  PanelLeftOpen,
  School,
  Settings,
  Sparkles,
  User,
  Users,
  X,
} from '@repo/ui/icons';
import {
  Box,
  HStack,
  Modal,
  ModalContent,
  Pressable,
  ScrollView,
  Text,
  useTheme,
  VStack,
} from '@repo/ui/primitives';
import { colors, corners, typography } from '@repo/ui/theme';
import { router, Slot, usePathname } from 'expo-router';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, type TextStyle, useWindowDimensions, type ViewStyle } from 'react-native';

export { RouteErrorBoundary as ErrorBoundary };
import {
  getResponsiveShellConfig,
  resolveResponsiveShellMode,
  webShellTokens,
} from '@/lib/responsiveShell';
import {
  appNavigation,
  getNavigationTitle,
  isNavigationRouteActive,
  type NavigationIconKey,
} from '@/lib/navigation/appNavigation';
import { PowerSyncProvider } from '@/providers/PowerSyncProvider';

type NavItem = (typeof appNavigation)[number] & { badge?: number };

const navigationIcons: Record<NavigationIconKey, LucideIcon> = {
  heart: Heart,
  school: School,
  'file-text': FileText,
  users: Users,
  library: Library,
  user: User,
  sparkles: Sparkles,
  bell: Bell,
  settings: Settings,
};

export default function WebTabsLayout() {
  return (
    <ErrorBoundary name="WebTabsLayout">
      <PowerSyncProvider>
        <WebTabsLayoutContent />
      </PowerSyncProvider>
    </ErrorBoundary>
  );
}

function WebTabsLayoutContent() {
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const { context } = usePermissions();
  const userId = context.userId;
  const { newAchievements } = useRewards();
  const { unreadCount } = useNotifications(userId);
  const user = useStore((state) => state.user);
  const { isDark, accent, text: themeText } = useTheme();

  // Multi-Perspective State & Hydration
  const { hydratePerspectivesFromDatabase } = usePerspectiveSwitch();

  useEffect(() => {
    if (!user?.id) return;

    void hydratePerspectivesFromDatabase(user.id, {
      getCommercialBatches: async () => {
        try {
          const repo = createSupabaseTuitionBatchRepository(supabaseClient);
          return await repo.getMyBatches(user.id);
        } catch (e) {
          console.warn('[WebTabsLayout] getCommercialBatches error:', e);
          return [];
        }
      },
      getGuardianBonds: async () => {
        try {
          const repo = createSupabaseGuardianRepository(supabaseClient);
          const relationships = await repo.getGuardianRelationships(user.id);
          return relationships.map((rel: any) => ({
            id: rel.id || `ward-${rel.student_id}`,
            kind: 'guardian' as const,
            displayName: rel.wardName || `Student ${String(rel.student_id).slice(-4).toUpperCase()}`,
            wardUserId: rel.student_id,
            wardName: rel.wardName || `Student ${String(rel.student_id).slice(-4).toUpperCase()}`,
            schoolId: rel.school_id,
          }));
        } catch (e) {
          console.warn('[WebTabsLayout] getGuardianBonds error:', e);
          return [];
        }
      },
    });
  }, [hydratePerspectivesFromDatabase, user?.id]);

  const [railExpanded, setRailExpanded] = useState(true);
  const [iconMode, setIconMode] = useState<'emoji' | 'vector'>('emoji');
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState('');
  const previousAchievementsRef = useRef<string[]>([]);
  const isBreathingOpen = useStore((state) => state.isBreathingOpen ?? false);
  const setBreathingOpen = useStore((state) => state.setBreathingOpen ?? (() => {}));

  // Restore stored icon mode preference on web
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem('gurudevi_icon_mode');
      if (stored === 'emoji' || stored === 'vector') {
        setIconMode(stored);
      }
    }
  }, []);

  const handleToggleIconMode = useCallback(() => {
    setIconMode((prev) => {
      const next = prev === 'emoji' ? 'vector' : 'emoji';
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('gurudevi_icon_mode', next);
      }
      return next;
    });
  }, []);

  const mode = resolveResponsiveShellMode(Platform.OS, width);
  const shell = getResponsiveShellConfig(mode, railExpanded);

  const navItems = useMemo<NavItem[]>(
    () => [
      ...appNavigation.map((item) =>
        item.id === 'notifications' ? { ...item, badge: unreadCount } : item,
      ),
    ],
    [unreadCount],
  );

  const handleToggleRail = useCallback(() => {
    setRailExpanded((value) => !value);
  }, []);

  const handleNavigate = useCallback((href: string) => {
    router.push(href);
  }, []);

  const pageTitle = getNavigationTitle(pathname);
  const userLabel = user?.display_name || user?.email || 'Neev';
  const userAvatarInitial = userLabel.charAt(0).toUpperCase();

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.title = `Gurudevi · ${pageTitle}`;
  }, [pageTitle]);

  useEffect(() => {
    if (newAchievements === previousAchievementsRef.current) return;
    previousAchievementsRef.current = newAchievements;

    if (newAchievements.length === 0 || showCelebration) {
      return;
    }
    const first = newAchievements[0];
    if (!first) return;

    const timer = window.setTimeout(() => {
      setCurrentAchievement(first);
      setShowCelebration(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [newAchievements, showCelebration]);

  return (
    <Box
      accessibilityLabel="Gurudevi sanctuary"
      accessibilityHint="Contains Gurudevi navigation and the current route"
      style={[
        styles.shell,
        {
          flexDirection: shell.navigation.layout === 'topbar' ? 'column' : 'row',
          backgroundColor: isDark ? colors.obsidian : colors.vellum,
        },
      ]}
    >
      <WebNavigation
        items={navItems}
        pathname={pathname}
        railExpanded={railExpanded}
        shell={shell}
        userLabel={userLabel}
        userAvatarInitial={userAvatarInitial}
        iconMode={iconMode}
        isDark={isDark}
        accentColor={accent.action}
        onNavigate={handleNavigate}
        onToggleRail={handleToggleRail}
        onToggleIconMode={handleToggleIconMode}
      />

      <Box style={[styles.canvas, getCanvasStyle(mode, isDark)]}>
        <Box
          style={{
            flex: 1,
            width: '100%',
            maxWidth: shell.content.maxWidth,
            alignSelf: 'center',
            padding: shell.content.outerPadding,
            gap: shell.content.gap,
          }}
        >
          <Box
            accessibilityRole="header"
            style={{
              minHeight: shell.isCompact
                ? webShellTokens.size.control
                : webShellTokens.size.navItem,
              justifyContent: 'center',
              paddingHorizontal: shell.isCompact ? 0 : webShellTokens.space.navGap,
            }}
          >
            <Text style={[styles.kicker, { color: isDark ? colors.starlightGray : colors.bark }]}>
              GURUDEVI
            </Text>
            <Text
              style={[
                styles.pageTitle,
                {
                  fontSize: shell.content.titleSize,
                  color: isDark ? colors.sacredWhite : colors.inkTruth,
                },
              ]}
            >
              {pageTitle}
            </Text>
          </Box>

          <Box
            style={{
              flex: 1,
              width: '100%',
              minHeight: 0,
            }}
          >
            <Slot />
          </Box>
        </Box>
      </Box>

      <AchievementUnlockOverlay
        title={currentAchievement}
        visible={showCelebration}
        onHide={() => setShowCelebration(false)}
      />

      <Modal
        isOpen={isBreathingOpen}
        onClose={() => setBreathingOpen(false)}
        accessibilityLabel="Breathing reset dialog"
      >
        <ModalContent>
          <Box
            style={[
              styles.breathingCard,
              {
                backgroundColor: isDark ? colors.ink : colors.silk,
                borderColor: isDark ? 'rgba(252, 249, 242, 0.1)' : 'rgba(84, 74, 61, 0.12)',
              },
            ]}
          >
            <Box style={styles.breathingHeader}>
              <Box>
                <Text
                  style={[
                    styles.breathingTitle,
                    { color: isDark ? colors.sacredWhite : colors.inkTruth },
                  ]}
                >
                  Breathing Reset
                </Text>
                <Text
                  style={[
                    styles.breathingSubtitle,
                    { color: isDark ? colors.starlightGray : colors.bark },
                  ]}
                >
                  1 minute of peace
                </Text>
              </Box>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close breathing reset"
                accessibilityHint="Closes the breathing reset dialog"
                onPress={() => setBreathingOpen(false)}
                style={styles.closeButton}
              >
                <X size={18} color={isDark ? colors.sacredWhite : colors.inkTruth} />
              </Pressable>
            </Box>
            <Box style={styles.breathingGuide}>
              <BreathGuide onComplete={() => setBreathingOpen(false)} />
            </Box>
          </Box>
        </ModalContent>
      </Modal>
    </Box>
  );
}

type WebNavigationProps = {
  items: NavItem[];
  pathname: string;
  railExpanded: boolean;
  shell: ReturnType<typeof getResponsiveShellConfig>;
  userLabel: string;
  userAvatarInitial: string;
  iconMode: 'emoji' | 'vector';
  isDark: boolean;
  accentColor: string;
  onNavigate: (href: string) => void;
  onToggleRail: () => void;
  onToggleIconMode: () => void;
};

function WebNavigation({
  items,
  pathname,
  railExpanded,
  shell,
  userLabel,
  userAvatarInitial,
  iconMode,
  isDark,
  accentColor,
  onNavigate,
  onToggleRail,
  onToggleIconMode,
}: WebNavigationProps) {
  const labelsVisible = shell.navigation.labelsVisible;
  const isCompact = shell.navigation.layout === 'topbar';
  const primaryItems = items.filter((item) => item.surface === 'tab' && item.id !== 'profile');
  const utilityItems = items.filter((item) => item.surface === 'utility' && item.id !== 'profile');
  const isProfileActive = pathname === '/profile' || pathname.startsWith('/profile/');

  const navBg = isDark ? colors.ink : 'rgba(250, 247, 237, 0.95)';
  const navBorder = isDark ? 'rgba(252, 249, 242, 0.08)' : 'rgba(84, 74, 61, 0.12)';
  const textColor = isDark ? colors.sacredWhite : colors.inkTruth;
  const textMutedColor = isDark ? colors.starlightGray : colors.bark;

  const renderItem = (item: NavItem) => (
    <WebNavItemButton
      key={item.href}
      active={isNavigationRouteActive(pathname, item.href)}
      badge={item.badge}
      expanded={isCompact || labelsVisible}
      href={item.href}
      emoji={item.emoji}
      icon={navigationIcons[item.iconKey]}
      label={item.title}
      iconMode={iconMode}
      isDark={isDark}
      onNavigate={onNavigate}
    />
  );

  return (
    <Box
      accessibilityRole="toolbar"
      accessibilityLabel="Gurudevi navigation"
      accessibilityHint="Use these controls to move between Gurudevi spaces"
      style={[
        styles.navigation,
        {
          width: shell.navigation.railWidth,
          padding: isCompact ? webShellTokens.space.compactOuter : webShellTokens.space.navGap,
          borderRightWidth: isCompact ? 0 : 1,
          borderBottomWidth: isCompact ? 1 : 0,
          borderColor: navBorder,
          backgroundColor: navBg,
        },
      ]}
    >
      {/* Header section: Brand & Collapse Toggle */}
      <Box
        style={[
          styles.navigationHeader,
          {
            justifyContent: isCompact || labelsVisible ? 'space-between' : 'center',
            paddingHorizontal: labelsVisible ? 4 : 0,
          },
        ]}
      >
        {isCompact || labelsVisible ? (
          <>
            <Box
              accessibilityLabel="Gurudevi sanctuary home"
              accessibilityHint="Identifies the current Gurudevi sanctuary shell"
              style={styles.brand}
            >
              <HStack style={{ alignItems: 'center', gap: 6 }}>
                <Text style={[styles.brandMark, { color: textColor }]}>Gurudevi</Text>
                <Text style={[styles.brandCaption, { color: textMutedColor }]}>Sanctuary</Text>
              </HStack>
            </Box>

            {shell.navigation.canToggleRail && (
              <NavigationControl
                accessibilityRole="button"
                accessibilityLabel="Collapse sidebar"
                accessibilityHint="Toggles between full sidebar and compact icon rail"
                onPress={onToggleRail}
                style={[
                  styles.navigationToggle,
                  {
                    backgroundColor: isDark
                      ? 'rgba(252, 249, 242, 0.08)'
                      : 'rgba(84, 74, 61, 0.07)',
                  },
                ]}
              >
                <PanelLeftClose size={16} color={textMutedColor} />
              </NavigationControl>
            )}
          </>
        ) : (
          shell.navigation.canToggleRail && (
            <NavigationControl
              accessibilityRole="button"
              accessibilityLabel="Expand sidebar"
              accessibilityHint="Toggles between full sidebar and compact icon rail"
              onPress={onToggleRail}
              style={[
                styles.navigationToggle,
                {
                  width: webShellTokens.size.control,
                  height: webShellTokens.size.control,
                  backgroundColor: isDark
                    ? 'rgba(252, 249, 242, 0.08)'
                    : 'rgba(84, 74, 61, 0.07)',
                },
              ]}
            >
              <PanelLeftOpen size={18} color={textMutedColor} />
            </NavigationControl>
          )
        )}
      </Box>

      {isCompact ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.compactNavContent}
          accessibilityLabel="Primary and utility navigation"
          accessibilityHint="Scroll horizontally to reach every route"
        >
          {items.filter((item) => item.id !== 'profile').map(renderItem)}
        </ScrollView>
      ) : (
        <>
          {/* Primary Navigation Tabs */}
          <VStack style={styles.navigationGroup}>{primaryItems.map(renderItem)}</VStack>

          {/* Utility Group + A/B Switcher + User Profile Card */}
          <Box
            style={[
              styles.utilityGroup,
              {
                borderTopColor: navBorder,
              },
            ]}
          >
            {utilityItems.map(renderItem)}

            {/* A/B Icon Strategy Mode Switcher */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Switch to ${iconMode === 'emoji' ? 'Vector icons' : 'Soulful emojis'}`}
              accessibilityHint="A/B test toggle between emoji and vector navigation icons"
              onPress={onToggleIconMode}
              style={[
                styles.abToggle,
                {
                  justifyContent: labelsVisible ? 'flex-start' : 'center',
                  backgroundColor: isDark
                    ? 'rgba(252, 249, 242, 0.05)'
                    : 'rgba(84, 74, 61, 0.05)',
                  paddingHorizontal: labelsVisible ? 10 : 0,
                },
              ]}
            >
              <Text style={{ fontSize: 16 }}>{iconMode === 'emoji' ? '🎨' : '✨'}</Text>
              {labelsVisible && (
                <VStack style={{ marginLeft: 8, flex: 1 }}>
                  <Text style={[styles.abToggleLabel, { color: textColor }]}>
                    {iconMode === 'emoji' ? 'Emoji Mode' : 'Vector Mode'}
                  </Text>
                  <Text style={[styles.abToggleSub, { color: textMutedColor }]}>
                    Click to switch style
                  </Text>
                </VStack>
              )}
            </Pressable>

            {/* Bottom User Card / Profile Destination */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Account profile: ${userLabel}`}
              accessibilityHint="Navigates to your profile and settings"
              accessibilityState={{ selected: isProfileActive }}
              onPress={() => onNavigate('/profile')}
              style={[
                styles.userCard,
                {
                  justifyContent: labelsVisible ? 'flex-start' : 'center',
                  paddingHorizontal: labelsVisible ? 10 : 0,
                  backgroundColor: isProfileActive
                    ? isDark
                      ? 'rgba(125, 212, 192, 0.16)'
                      : 'rgba(139, 191, 122, 0.2)'
                    : isDark
                      ? 'rgba(252, 249, 242, 0.06)'
                      : 'rgba(84, 74, 61, 0.06)',
                  borderColor: isProfileActive
                    ? isDark
                      ? colors.gurudeviBlue
                      : colors.sageGreen
                    : 'transparent',
                  borderWidth: isProfileActive ? 1 : 0,
                },
              ]}
            >
              <Box style={styles.avatarWrap}>
                <Box
                  style={[
                    styles.avatarCircle,
                    {
                      backgroundColor: isProfileActive
                        ? isDark
                          ? colors.gurudeviBlue
                          : colors.sageGreen
                        : isDark
                          ? colors.shroud
                          : colors.linen,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.avatarText,
                      {
                        color: isProfileActive
                          ? isDark
                            ? colors.ink
                            : colors.sacredWhite
                          : textColor,
                      },
                    ]}
                  >
                    {userAvatarInitial}
                  </Text>
                </Box>
                <Box
                  style={[
                    styles.profileBadge,
                    {
                      backgroundColor: isDark ? colors.ink : colors.silk,
                      borderColor: isDark
                        ? 'rgba(252, 249, 242, 0.15)'
                        : 'rgba(84, 74, 61, 0.18)',
                    },
                  ]}
                >
                  {iconMode === 'emoji' ? (
                    <Text style={{ fontSize: 9, lineHeight: 11 }}>🪪</Text>
                  ) : (
                    <User
                      size={9}
                      color={isDark ? colors.sacredWhite : colors.inkTruth}
                      strokeWidth={2.4}
                    />
                  )}
                </Box>
              </Box>

              {labelsVisible && (
                <VStack style={{ marginLeft: 8, flex: 1 }}>
                  <Text numberOfLines={1} style={[styles.userName, { color: textColor }]}>
                    {userLabel}
                  </Text>
                  <HStack style={{ alignItems: 'center', gap: 4, marginTop: 1 }}>
                    {iconMode === 'emoji' ? (
                      <Text style={{ fontSize: 10 }}>🪪</Text>
                    ) : (
                      <User size={10} color={textMutedColor} strokeWidth={2} />
                    )}
                    <Text style={[styles.userRole, { color: textMutedColor }]}>
                      Account & Profile
                    </Text>
                  </HStack>
                </VStack>
              )}
            </Pressable>
          </Box>
        </>
      )}
    </Box>
  );
}

function NavigationControl({ children, ...props }: React.ComponentProps<typeof Pressable>) {
  const [focused, setFocused] = useState(false);
  const { style: controlStyle, ...pressableProps } = props;

  return (
    <Pressable
      {...pressableProps}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={(state) => [
        typeof controlStyle === 'function' ? controlStyle(state) : controlStyle,
        focused && styles.focusRing,
      ]}
    >
      {children}
    </Pressable>
  );
}

type WebNavItemButtonProps = {
  active: boolean;
  badge?: number;
  expanded: boolean;
  href: string;
  emoji?: string;
  icon: LucideIcon;
  label: string;
  iconMode: 'emoji' | 'vector';
  isDark: boolean;
  onNavigate: (href: string) => void;
};

function WebNavItemButton({
  active,
  badge,
  expanded,
  href,
  emoji,
  icon: Icon,
  label,
  iconMode,
  isDark,
  onNavigate,
}: WebNavItemButtonProps) {
  const [focused, setFocused] = useState(false);
  const handlePress = useCallback(() => onNavigate(href), [href, onNavigate]);
  const accessibleLabel = badge ? `${label}, ${badge > 99 ? 'more than 99' : badge} unread` : label;

  const activeBg = isDark ? 'rgba(125, 212, 192, 0.16)' : 'rgba(139, 191, 122, 0.18)';
  const activeBorder = isDark ? 'rgba(125, 212, 192, 0.45)' : 'rgba(139, 191, 122, 0.5)';
  const activeTextColor = isDark ? colors.sacredWhite : colors.inkTruth;
  const inactiveTextColor = isDark ? colors.starlightGray : colors.bark;
  const iconColor = active
    ? isDark
      ? colors.gurudeviBlue
      : colors.sageGreen
    : inactiveTextColor;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibleLabel}
      accessibilityHint={`Navigates to ${label}`}
      accessibilityState={{ selected: active }}
      onPress={handlePress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      testID={`web-nav-${href.replace('/', '') || 'self'}`}
      style={[
        styles.navItem,
        {
          minHeight: webShellTokens.size.navItem,
          width: expanded ? '100%' : webShellTokens.size.control + 8,
          alignSelf: expanded ? 'stretch' : 'center',
          paddingHorizontal: expanded ? 10 : 0,
          justifyContent: expanded ? 'flex-start' : 'center',
          backgroundColor: active ? activeBg : 'transparent',
          borderColor: focused ? colors.sanctuarySaffron : active ? activeBorder : 'transparent',
          borderWidth: focused ? 2 : active ? 1 : 0,
        },
      ]}
    >
      <Box style={styles.iconWrap}>
        {iconMode === 'emoji' && emoji ? (
          <Text
            style={{
              fontSize: 18,
              lineHeight: 22,
              opacity: active ? 1 : 0.8,
              transform: active ? [{ scale: 1.08 }] : [{ scale: 1 }],
            }}
          >
            {emoji}
          </Text>
        ) : (
          <Icon size={20} color={iconColor} strokeWidth={active ? 2.3 : 1.8} />
        )}
        {badge ? (
          <Box style={styles.badge}>
            <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
          </Box>
        ) : null}
      </Box>
      {expanded && (
        <Text
          numberOfLines={1}
          style={[
            styles.navLabel,
            {
              color: active ? activeTextColor : inactiveTextColor,
              fontWeight: active ? typography.fontWeight.bold : typography.fontWeight.medium,
            },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

function getCanvasStyle(
  mode: ReturnType<typeof resolveResponsiveShellMode>,
  isDark: boolean,
): ViewStyle {
  if (isDark) {
    return {
      backgroundColor: colors.obsidian,
      ...(mode === 'webCompact'
        ? {}
        : {
            backgroundImage: `radial-gradient(circle at 18% 0%, ${colors.ink} 0%, ${colors.obsidian} 55%)`,
          }),
    } as ViewStyle;
  }

  const atmosphere = mode === 'webDesktop' ? colors.dawnWhite : colors.vellum;
  return {
    backgroundColor: colors.vellum,
    ...(mode === 'webCompact'
      ? {}
      : {
          backgroundImage: `radial-gradient(circle at 18% 0%, ${atmosphere} 0%, ${colors.vellum} 42%, ${colors.linen} 100%)`,
        }),
  } as ViewStyle;
}

const styles = {
  shell: {
    flex: 1,
  } satisfies ViewStyle,
  navigation: {
    gap: webShellTokens.space.navGap,
    minHeight: 0,
  } satisfies ViewStyle,
  navigationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: webShellTokens.size.control,
    marginBottom: 4,
  } satisfies ViewStyle,
  brand: {
    justifyContent: 'center',
    minHeight: webShellTokens.size.control,
  } satisfies ViewStyle,
  brandMark: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.tight,
  } satisfies TextStyle,
  brandMarkCollapsed: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.tight,
    textAlign: 'center',
    width: webShellTokens.size.control,
  } satisfies TextStyle,
  brandCaption: {
    fontSize: typography.fontSize.xs,
    letterSpacing: typography.letterSpacing.wide,
    textTransform: 'uppercase',
    fontWeight: typography.fontWeight.semibold,
  } satisfies TextStyle,
  navigationToggle: {
    width: 32,
    height: 32,
    borderRadius: corners.small,
    alignItems: 'center',
    justifyContent: 'center',
  } satisfies ViewStyle,
  focusRing: {
    borderWidth: 2,
    borderColor: colors.sanctuarySaffron,
    shadowColor: colors.sanctuarySaffron,
    shadowOpacity: 0.35,
    shadowRadius: 4,
  } satisfies ViewStyle,
  compactNavContent: {
    alignItems: 'center',
    gap: webShellTokens.space.navGap,
  } satisfies ViewStyle,
  navigationGroup: {
    gap: 4,
  } satisfies ViewStyle,
  utilityGroup: {
    marginTop: 'auto',
    paddingTop: webShellTokens.space.navGap,
    borderTopWidth: 1,
    gap: 6,
  } satisfies ViewStyle,
  abToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 38,
    borderRadius: corners.comfortable,
    marginVertical: 2,
  } satisfies ViewStyle,
  abToggleLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  } satisfies TextStyle,
  abToggleSub: {
    fontSize: 10,
  } satisfies TextStyle,
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 46,
    borderRadius: corners.comfortable,
    marginVertical: 2,
  } satisfies ViewStyle,
  avatarWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  } satisfies ViewStyle,
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  } satisfies ViewStyle,
  profileBadge: {
    position: 'absolute',
    bottom: -2,
    right: -3,
    width: 15,
    height: 15,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  } satisfies ViewStyle,
  avatarText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  } satisfies TextStyle,
  userName: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  } satisfies TextStyle,
  userRole: {
    fontSize: 10,
  } satisfies TextStyle,
  canvas: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
  } satisfies ViewStyle,
  kicker: {
    fontSize: webShellTokens.type.caption,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.wide,
  } satisfies TextStyle,
  pageTitle: {
    fontWeight: typography.fontWeight.bold,
    marginTop: 2,
  } satisfies TextStyle,
  contentSurface: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    borderWidth: 1,
  } satisfies ViewStyle,
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: corners.comfortable,
  } satisfies ViewStyle,
  iconWrap: {
    position: 'relative',
    width: webShellTokens.size.control,
    height: webShellTokens.size.control,
    alignItems: 'center',
    justifyContent: 'center',
  } satisfies ViewStyle,
  navLabel: {
    fontSize: typography.fontSize.sm,
    marginLeft: 4,
  } satisfies TextStyle,
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: corners.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.templeGold,
  } satisfies ViewStyle,
  badgeText: {
    color: colors.ink,
    fontSize: 9,
    fontWeight: typography.fontWeight.bold,
  } satisfies TextStyle,
  breathingCard: {
    width: '100%',
    maxWidth: webShellTokens.size.modalMaxWidth,
    borderRadius: webShellTokens.radius.surface,
    overflow: 'hidden',
    borderWidth: 1,
  } satisfies ViewStyle,
  breathingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: webShellTokens.space.navGap,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(84, 74, 61, 0.1)',
  } satisfies ViewStyle,
  breathingTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  } satisfies TextStyle,
  breathingSubtitle: {
    fontSize: webShellTokens.type.caption,
    marginTop: 2,
  } satisfies TextStyle,
  closeButton: {
    width: webShellTokens.size.control,
    height: webShellTokens.size.control,
    borderRadius: webShellTokens.radius.control,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(84, 74, 61, 0.08)',
  } satisfies ViewStyle,
  breathingGuide: {
    minHeight: webShellTokens.size.modalMinHeight,
    padding: webShellTokens.space.navGap,
    justifyContent: 'center',
  } satisfies ViewStyle,
};
