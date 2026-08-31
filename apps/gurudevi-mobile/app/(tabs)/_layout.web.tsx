import { useNotifications, useRewards } from '@repo/core/hooks';
import { usePermissions, useStore } from '@repo/core/logic';
import { BreathGuide } from '@repo/self/wellbeing';
import AchievementUnlockOverlay from '@repo/ui/components/AchievementUnlockOverlay';
import type { LucideIcon } from '@repo/ui/icons';
import {
  Bell,
  FileText,
  Heart,
  Library,
  Menu,
  School,
  Settings,
  Sparkles,
  User,
  Users,
  X,
} from '@repo/ui/icons';
import { Box, Modal, ModalContent, Pressable, ScrollView, Text, VStack } from '@repo/ui/primitives';
import { colors, corners, typography } from '@repo/ui/theme';
import { router, Slot, usePathname } from 'expo-router';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, type TextStyle, useWindowDimensions, type ViewStyle } from 'react-native';
import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';

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
  const [railExpanded, setRailExpanded] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState('');
  const previousAchievementsRef = useRef<string[]>([]);
  const isBreathingOpen = useStore((state) => state.isBreathingOpen ?? false);
  const setBreathingOpen = useStore((state) => state.setBreathingOpen ?? (() => {}));

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
  const userLabel = user?.display_name || user?.email || 'Guest';

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
        },
      ]}
    >
      <WebNavigation
        items={navItems}
        pathname={pathname}
        railExpanded={railExpanded}
        shell={shell}
        userLabel={userLabel}
        onNavigate={handleNavigate}
        onToggleRail={handleToggleRail}
      />

      <Box style={[styles.canvas, getCanvasStyle(mode)]}>
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
            <Text style={styles.kicker}>GURUDEVI</Text>
            <Text style={[styles.pageTitle, { fontSize: shell.content.titleSize }]}>
              {pageTitle}
            </Text>
          </Box>

          <Box
            style={[
              styles.contentSurface,
              {
                padding: shell.content.surfacePadding,
                borderRadius: shell.content.surfaceRadius,
                backgroundColor: shell.content.surfaceBackground,
              },
            ]}
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
          <Box style={styles.breathingCard}>
            <Box style={styles.breathingHeader}>
              <Box>
                <Text style={styles.breathingTitle}>Breathing Reset</Text>
                <Text style={styles.breathingSubtitle}>1 minute of peace</Text>
              </Box>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close breathing reset"
                accessibilityHint="Closes the breathing reset dialog"
                onPress={() => setBreathingOpen(false)}
                style={styles.closeButton}
              >
                <X size={18} color={webShellTokens.color.text} />
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
  onNavigate: (href: string) => void;
  onToggleRail: () => void;
};

function WebNavigation({
  items,
  pathname,
  railExpanded,
  shell,
  userLabel,
  onNavigate,
  onToggleRail,
}: WebNavigationProps) {
  const labelsVisible = shell.navigation.labelsVisible;
  const isCompact = shell.navigation.layout === 'topbar';
  const primaryItems = items.filter((item) => item.surface === 'tab');
  const utilityItems = items.filter((item) => item.surface === 'utility');

  const renderItem = (item: NavItem) => (
    <WebNavItemButton
      key={item.href}
      active={isNavigationRouteActive(pathname, item.href)}
      badge={item.badge}
      expanded={isCompact || labelsVisible}
      href={item.href}
      icon={navigationIcons[item.iconKey]}
      label={item.title}
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
          borderColor: webShellTokens.color.chromeBorder,
        },
      ]}
    >
      <Box style={styles.navigationHeader}>
        <Box
          accessibilityLabel="Gurudevi sanctuary home"
          accessibilityHint="Identifies the current Gurudevi sanctuary shell"
          style={[
            styles.brand,
            {
              flex: isCompact || labelsVisible ? 1 : 0,
              minWidth: isCompact || labelsVisible ? undefined : webShellTokens.size.control,
            },
          ]}
        >
          <Text style={styles.brandMark}>{isCompact || labelsVisible ? 'Gurudevi' : 'G'}</Text>
          {labelsVisible && <Text style={styles.brandCaption}>Sanctuary</Text>}
        </Box>

        {shell.navigation.canToggleRail && (
          <NavigationControl
            accessibilityRole="button"
            accessibilityLabel={railExpanded ? 'Collapse navigation' : 'Expand navigation'}
            accessibilityHint="Toggles the desktop navigation rail labels"
            onPress={onToggleRail}
            style={styles.navigationToggle}
          >
            <Menu size={18} color={webShellTokens.color.chromeText} />
          </NavigationControl>
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
          {items.map(renderItem)}
        </ScrollView>
      ) : (
        <>
          <VStack style={styles.navigationGroup}>{primaryItems.map(renderItem)}</VStack>
          <Box style={styles.utilityGroup}>
            {utilityItems.map(renderItem)}
            {labelsVisible && (
              <Box
                accessibilityLabel={`Signed in as ${userLabel}`}
                accessibilityHint="Shows the current account"
                style={styles.userPanel}
              >
                <Text numberOfLines={1} style={styles.userName}>
                  {userLabel}
                </Text>
              </Box>
            )}
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
  icon: LucideIcon;
  label: string;
  onNavigate: (href: string) => void;
};

function WebNavItemButton({
  active,
  badge,
  expanded,
  href,
  icon: Icon,
  label,
  onNavigate,
}: WebNavItemButtonProps) {
  const [focused, setFocused] = useState(false);
  const handlePress = useCallback(() => onNavigate(href), [href, onNavigate]);
  const accessibleLabel = badge ? `${label}, ${badge > 99 ? 'more than 99' : badge} unread` : label;

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
          minWidth: expanded ? undefined : webShellTokens.size.control,
          paddingHorizontal: expanded ? webShellTokens.space.navGap : webShellTokens.space.navGap,
          marginRight: expanded ? undefined : webShellTokens.space.navGap,
          justifyContent: expanded ? 'flex-start' : 'center',
          backgroundColor: active
            ? webShellTokens.color.activeSurface
            : webShellTokens.color.transparent,
          borderColor: focused
            ? webShellTokens.color.focusRing
            : active
              ? webShellTokens.color.activeBorder
              : webShellTokens.color.transparent,
          borderWidth: focused ? 2 : active ? 1 : 0,
        },
      ]}
    >
      <Box style={styles.iconWrap}>
        <Icon
          size={20}
          color={active ? webShellTokens.color.chromeText : webShellTokens.color.chromeTextMuted}
        />
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
              color: active
                ? webShellTokens.color.chromeText
                : webShellTokens.color.chromeTextMuted,
            },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

function getCanvasStyle(mode: ReturnType<typeof resolveResponsiveShellMode>): ViewStyle {
  const atmosphere =
    mode === 'webDesktop' ? webShellTokens.color.canvasWarm : webShellTokens.color.canvas;
  return {
    backgroundColor: webShellTokens.color.canvas,
    ...(mode === 'webCompact'
      ? {}
      : {
          backgroundImage: `radial-gradient(circle at 18% 0%, ${atmosphere} 0%, ${webShellTokens.color.canvas} 42%, ${colors.linen} 100%)`,
        }),
  } as ViewStyle;
}

const styles = {
  shell: {
    flex: 1,
    backgroundColor: webShellTokens.color.canvas,
  } satisfies ViewStyle,
  navigation: {
    backgroundColor: webShellTokens.color.chrome,
    borderColor: webShellTokens.color.chromeBorder,
    gap: webShellTokens.space.navGap,
    minHeight: 0,
  } satisfies ViewStyle,
  navigationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: webShellTokens.space.navGap,
    minHeight: webShellTokens.size.control,
  } satisfies ViewStyle,
  brand: {
    justifyContent: 'center',
    minHeight: webShellTokens.size.control,
  } satisfies ViewStyle,
  brandMark: {
    color: webShellTokens.color.chromeText,
    fontSize: webShellTokens.type.brand,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.tight,
  } satisfies TextStyle,
  brandCaption: {
    color: webShellTokens.color.chromeTextMuted,
    fontSize: webShellTokens.type.caption,
    letterSpacing: typography.letterSpacing.wide,
    marginTop: 2,
  } satisfies TextStyle,
  navigationToggle: {
    width: webShellTokens.size.control,
    height: webShellTokens.size.control,
    borderRadius: webShellTokens.radius.control,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: webShellTokens.color.chromeRaised,
  } satisfies ViewStyle,
  focusRing: {
    borderWidth: 2,
    borderColor: webShellTokens.color.focusRing,
    shadowColor: webShellTokens.color.focusRing,
    shadowOpacity: 0.35,
    shadowRadius: 4,
  } satisfies ViewStyle,
  compactNavContent: {
    alignItems: 'center',
    gap: webShellTokens.space.navGap,
  } satisfies ViewStyle,
  navigationGroup: {
    gap: webShellTokens.space.navGap,
  } satisfies ViewStyle,
  utilityGroup: {
    marginTop: 'auto',
    paddingTop: webShellTokens.space.navGap,
    borderTopWidth: 1,
    borderTopColor: webShellTokens.color.chromeBorder,
    gap: webShellTokens.space.navGap,
  } satisfies ViewStyle,
  userPanel: {
    marginTop: webShellTokens.space.navGap,
    padding: webShellTokens.space.navGap,
    borderRadius: webShellTokens.radius.navItem,
    backgroundColor: webShellTokens.color.chromeRaised,
  } satisfies ViewStyle,
  userName: {
    color: webShellTokens.color.chromeText,
    fontSize: webShellTokens.type.navLabel,
    fontWeight: typography.fontWeight.semibold,
  } satisfies TextStyle,
  canvas: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
  } satisfies ViewStyle,
  kicker: {
    color: webShellTokens.color.textSecondary,
    fontSize: webShellTokens.type.caption,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.wide,
  } satisfies TextStyle,
  pageTitle: {
    color: webShellTokens.color.text,
    fontWeight: typography.fontWeight.bold,
    marginTop: 2,
  } satisfies TextStyle,
  contentSurface: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: webShellTokens.color.surfaceBorder,
  } satisfies ViewStyle,
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: webShellTokens.radius.navItem,
    gap: webShellTokens.space.navGap,
  } satisfies ViewStyle,
  iconWrap: {
    position: 'relative',
    width: webShellTokens.size.control,
    height: webShellTokens.size.control,
    alignItems: 'center',
    justifyContent: 'center',
  } satisfies ViewStyle,
  navLabel: {
    fontSize: webShellTokens.type.navLabel,
    fontWeight: typography.fontWeight.semibold,
  } satisfies TextStyle,
  badge: {
    position: 'absolute',
    top: 0,
    right: -4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: corners.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: webShellTokens.color.badge,
  } satisfies ViewStyle,
  badgeText: {
    color: webShellTokens.color.badgeText,
    fontSize: webShellTokens.type.caption,
    fontWeight: typography.fontWeight.bold,
  } satisfies TextStyle,
  breathingCard: {
    width: '100%',
    maxWidth: webShellTokens.size.modalMaxWidth,
    borderRadius: webShellTokens.radius.surface,
    backgroundColor: webShellTokens.color.surfaceWarm,
    overflow: 'hidden',
  } satisfies ViewStyle,
  breathingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: webShellTokens.space.navGap,
    borderBottomWidth: 1,
    borderBottomColor: webShellTokens.color.surfaceBorder,
  } satisfies ViewStyle,
  breathingTitle: {
    color: webShellTokens.color.text,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  } satisfies TextStyle,
  breathingSubtitle: {
    color: webShellTokens.color.textSecondary,
    fontSize: webShellTokens.type.caption,
    marginTop: 2,
  } satisfies TextStyle,
  closeButton: {
    width: webShellTokens.size.control,
    height: webShellTokens.size.control,
    borderRadius: webShellTokens.radius.control,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: webShellTokens.color.controlSurface,
  } satisfies ViewStyle,
  breathingGuide: {
    minHeight: webShellTokens.size.modalMinHeight,
    padding: webShellTokens.space.navGap,
    justifyContent: 'center',
  } satisfies ViewStyle,
};
