import { useNotifications, useRewards } from '@repo/core/hooks';
import { usePermissions, useStore } from '@repo/core/logic';
import { BreathGuide } from '@repo/self';
import type { LucideIcon } from '@repo/ui/icons';
import { AchievementUnlockOverlay } from '@repo/ui/components';
import { Box, Pressable, Text, View, VStack } from '@repo/ui/primitives';
import { router, Slot, usePathname } from 'expo-router';
import { Bell, Heart, Library, Menu, School, Settings, User, Users, X } from '@repo/ui/icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, useWindowDimensions, type ViewStyle } from 'react-native';
import { resolveResponsiveShellMode } from '../../src/lib/responsiveShell';

type NavItem = {
  href: string;
  icon: LucideIcon;
  label: string;
  group?: 'primary' | 'utility';
  badge?: number;
};

const PRIMARY_NAV: NavItem[] = [
  { href: '/self', icon: Heart, label: 'Self' },
  { href: '/workspace', icon: School, label: 'Workspace' },
  { href: '/community', icon: Users, label: 'Community' },
  { href: '/library', icon: Library, label: 'Library' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export default function WebTabsLayout() {
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
  const isCompact = mode === 'webCompact' || mode === 'webTabletCompact';
  const isTabletLike = mode === 'webTabletCompact';

  const navItems = useMemo<NavItem[]>(
    () => [
      ...PRIMARY_NAV,
      {
        href: '/notifications',
        icon: Bell,
        label: 'Notifications',
        group: 'utility',
        badge: unreadCount,
      },
      { href: '/settings', icon: Settings, label: 'Settings', group: 'utility' },
    ],
    [unreadCount],
  );

  const shellStyle: ViewStyle = {
    flex: 1,
    flexDirection: isCompact ? 'column' : 'row',
    backgroundColor: '#0F131C',
  };

  const handleToggleRail = useCallback(() => {
    setRailExpanded((value) => !value);
  }, []);

  const handleNavigate = useCallback((href: string) => {
    router.push(href);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.title = `Gurudevi · ${getPageTitle(pathname)}`;
  }, [pathname]);

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
    <Box style={shellStyle}>
      <Box
        style={{
          width: isCompact ? '100%' : railExpanded ? (isTabletLike ? 320 : 288) : 92,
          backgroundColor: '#131A26',
          borderRightWidth: isCompact ? 0 : 1,
          borderRightColor: 'rgba(255,255,255,0.08)',
          borderBottomWidth: isCompact ? 1 : 0,
          borderBottomColor: 'rgba(255,255,255,0.08)',
          paddingHorizontal: 16,
          paddingVertical: 16,
          gap: 16,
        }}
      >
        <Box
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <Box>
            <Text style={{ color: '#F8F5EA', fontSize: 18, fontWeight: '800' }}>Gurudevi</Text>
            {!isCompact && (
              <Text style={{ color: 'rgba(248,245,234,0.72)', fontSize: 12 }}>
                {isTabletLike ? 'Tablet web shell' : 'Desktop sanctuary shell'}
              </Text>
            )}
          </Box>

          {!isCompact && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={railExpanded ? 'Collapse navigation' : 'Expand navigation'}
              accessibilityHint="Toggles the web navigation rail between compact and expanded modes"
              onPress={handleToggleRail}
              style={{
                width: 36,
                height: 36,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 12,
                backgroundColor: 'rgba(255,255,255,0.06)',
              }}
            >
              <Menu size={18} color="#F8F5EA" />
            </Pressable>
          )}
        </Box>

        <VStack style={{ gap: 8 }}>
          {navItems
            .filter((item) => item.group !== 'utility')
            .map((item) => {
              const active = pathname === item.href;
              return (
                <WebNavItemButton
                  key={item.href}
                  active={active}
                  expanded={railExpanded}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  onNavigate={handleNavigate}
                />
              );
            })}
        </VStack>

        <Box
          style={{
            marginTop: 'auto',
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: 'rgba(255,255,255,0.08)',
            gap: 8,
          }}
        >
          {navItems
            .filter((item) => item.group === 'utility')
            .map((item) => {
              const active = pathname === item.href;
              return (
                <WebNavItemButton
                  key={item.href}
                  active={active}
                  badge={item.badge}
                  expanded={railExpanded}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  onNavigate={handleNavigate}
                />
              );
            })}

          {railExpanded && (
            <Box
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 18,
                backgroundColor: 'rgba(255,255,255,0.04)',
              }}
            >
              <Text style={{ color: '#F8F5EA', fontSize: 12, fontWeight: '700' }}>
                {user?.display_name || user?.email || 'Guest'}
              </Text>
              <Text style={{ color: 'rgba(248,245,234,0.72)', fontSize: 11, marginTop: 4 }}>
                {isCompact ? 'Compact web shell' : 'Desktop web shell'}
              </Text>
            </Box>
          )}
        </Box>
      </Box>

      <Box
        style={{
          flex: 1,
          backgroundColor: '#F5EDD6',
          padding: isCompact ? 16 : 24,
          gap: 16,
          minHeight: 0,
        }}
      >
        <Box
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            paddingVertical: 4,
          }}
        >
          <Box>
            <Text style={{ color: '#2A2318', fontSize: 12, fontWeight: '700', letterSpacing: 1.2 }}>
              WEB {mode === 'webCompact' ? 'COMPACT' : isTabletLike ? 'TABLET' : 'DESKTOP'}
            </Text>
            <Text style={{ color: '#2A2318', fontSize: isCompact ? 24 : 30, fontWeight: '800' }}>
              {getPageTitle(pathname)}
            </Text>
          </Box>
          <Box
            style={{
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 999,
              backgroundColor: 'rgba(42,35,24,0.08)',
            }}
          >
            <Text style={{ color: '#2A2318', fontSize: 12, fontWeight: '700' }}>
              {isCompact ? 'Compact web' : 'Desktop web'}
            </Text>
          </Box>
        </Box>

        <Box
          style={{
            flex: 1,
            borderRadius: 28,
            backgroundColor: '#FAF7ED',
            overflow: 'hidden',
            padding: isCompact ? 16 : 24,
            minHeight: 0,
          }}
        >
          <Slot />
        </Box>
      </Box>

      <AchievementUnlockOverlay
        title={currentAchievement}
        visible={showCelebration}
        onHide={() => setShowCelebration(false)}
      />

      {isBreathingOpen && (
        <View
          style={{
            position: 'absolute',
            inset: 0,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.6)',
          }}
        >
          <Box
            style={{
              width: '100%',
              maxWidth: 500,
              borderRadius: 24,
              backgroundColor: '#FAF7ED',
              overflow: 'hidden',
              padding: 16,
              gap: 12,
            }}
          >
            <Box
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box>
                <Text style={{ color: '#2A2318', fontSize: 18, fontWeight: '700' }}>
                  Breathing Reset
                </Text>
                <Text style={{ color: '#74685A', fontSize: 12 }}>1 minute of peace</Text>
              </Box>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close breathing reset"
                accessibilityHint="Closes the breathing reset dialog"
                onPress={() => setBreathingOpen(false)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 999,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(42,35,24,0.08)',
                }}
              >
                <X size={18} color="#2A2318" />
              </Pressable>
            </Box>
            <Box style={{ minHeight: 400, justifyContent: 'center' }}>
              <BreathGuide onComplete={() => setBreathingOpen(false)} />
            </Box>
          </Box>
        </View>
      )}
    </Box>
  );
}

function getPageTitle(pathname: string) {
  if (pathname.startsWith('/notifications')) return 'Notifications';
  if (pathname.startsWith('/settings')) return 'Settings';
  if (pathname.startsWith('/community')) return 'Community';
  if (pathname.startsWith('/workspace')) return 'Workspace';
  if (pathname.startsWith('/library')) return 'Library';
  if (pathname.startsWith('/profile')) return 'Profile';
  return 'Self';
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
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={useCallback(() => onNavigate(href), [href, onNavigate])}
      style={{
        minHeight: 48,
        borderRadius: 18,
        paddingHorizontal: expanded ? 16 : 0,
        alignItems: 'center',
        justifyContent: expanded ? 'flex-start' : 'center',
        flexDirection: 'row',
        gap: expanded ? 12 : 0,
        backgroundColor: active ? 'rgba(141,191,122,0.18)' : 'transparent',
        borderWidth: active ? 1 : 0,
        borderColor: active ? 'rgba(141,191,122,0.42)' : 'transparent',
      }}
    >
      <Box style={{ position: 'relative' }}>
        <Icon size={20} color={active ? '#F8F5EA' : 'rgba(248,245,234,0.7)'} />
        {badge ? (
          <Box
            style={{
              position: 'absolute',
              top: -6,
              right: -10,
              minWidth: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: '#FDD925',
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 4,
            }}
          >
            <Text style={{ color: '#1A1A1A', fontSize: 10, fontWeight: '800' }}>
              {badge > 99 ? '99+' : badge}
            </Text>
          </Box>
        ) : null}
      </Box>
      {expanded && (
        <Text style={{ color: active ? '#F8F5EA' : 'rgba(248,245,234,0.82)' }}>{label}</Text>
      )}
    </Pressable>
  );
}
