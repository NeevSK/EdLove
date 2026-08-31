import { useNotifications, useRewards } from '@repo/core/hooks';
import { usePermissions, useStore } from '@repo/core/logic';
import { BreathGuide } from '@repo/self/wellbeing';
import AchievementUnlockOverlay from '@repo/ui/components/AchievementUnlockOverlay';
import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import GlobalHeader from '@repo/ui/components/GlobalHeader';
import { Bell, FileText, Heart, Library, School, Settings, User, Users, X } from '@repo/ui/icons';
import { Box, Modal, ModalContent, Pressable, Text } from '@repo/ui/primitives';
import { tokens } from '@repo/ui/tokens';
import { router, Tabs, usePathname } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getNativeShellConfig } from '@/lib/responsiveShell';
import { getNavigationTitle } from '@/lib/navigation/appNavigation';
import { PowerSyncProvider } from '@/providers/PowerSyncProvider';

export { RouteErrorBoundary as ErrorBoundary };

export default function TabsLayout() {
  return (
    <ErrorBoundary name="TabsLayout">
      <PowerSyncProvider>
        <TabsLayoutContent />
      </PowerSyncProvider>
    </ErrorBoundary>
  );
}

function TabsLayoutContent() {
  const pathname = usePathname();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const shell = useMemo(
    () => getNativeShellConfig(width, height, insets.bottom),
    [height, insets.bottom, width],
  );
  const { context } = usePermissions();
  const userId = context.userId;
  const { newAchievements } = useRewards();
  const { unreadCount } = useNotifications(userId);
  const user = useStore((state) => state.user);
  const displayName = user?.display_name?.split(' ')[0] || user?.email || 'Gurudevi';
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState('');
  const previousAchievementsRef = useRef<string[]>([]);
  const isBreathingOpen = useStore((state) => state.isBreathingOpen ?? false);
  const setBreathingOpen = useStore((state) => state.setBreathingOpen ?? (() => {}));

  const title = getNavigationTitle(pathname);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.title = `Gurudevi · ${title}`;
  }, [title]);

  useEffect(() => {
    if (newAchievements === previousAchievementsRef.current) return;
    previousAchievementsRef.current = newAchievements;

    if (newAchievements.length === 0 || showCelebration) return;
    const first = newAchievements[0];
    if (!first) return;

    const timer = window.setTimeout(() => {
      setCurrentAchievement(first);
      setShowCelebration(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [newAchievements, showCelebration]);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: true,
          tabBarHideOnKeyboard: true,
          tabBarShowLabel: shell.visibleChrome.tabLabels,
          tabBarStyle: {
            minHeight: shell.tabBar.minHeight,
            paddingTop: shell.tabBar.paddingTop,
            paddingBottom: shell.tabBar.paddingBottom,
            backgroundColor: tokens.semantic.surface.canvas,
            borderTopColor: tokens.semantic.border.subtle,
          },
          tabBarLabelStyle: {
            fontSize: tokens.typography.sizes.xs,
            fontWeight: '600',
          },
          header: () => (
            <GlobalHeader
              title={title}
              subtitle={shell.header.subtitleVisible ? displayName : undefined}
              rightAction={
                <Box
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: tokens.spacing.sm,
                    paddingHorizontal: shell.header.horizontalPadding - tokens.spacing.md,
                  }}
                >
                  {pathname.startsWith('/workspace') ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Open editorial workspace"
                      accessibilityHint="Write or review editorial submissions"
                      onPress={() => router.push('/workspace/editorial')}
                      style={{
                        width: tokens.interaction.minTouchTarget,
                        height: tokens.interaction.minTouchTarget,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: tokens.radii.full,
                        backgroundColor: tokens.semantic.surface.interactive,
                      }}
                    >
                      <FileText size={18} color={tokens.semantic.text.primary} />
                    </Pressable>
                  ) : null}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Open notifications"
                    accessibilityHint="Navigates to the notifications page to view updates"
                    onPress={() => router.push('/notifications')}
                    style={{
                      position: 'relative',
                      width: tokens.interaction.minTouchTarget,
                      height: tokens.interaction.minTouchTarget,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: tokens.radii.full,
                      backgroundColor: tokens.semantic.surface.interactive,
                    }}
                  >
                    <Bell size={18} color={tokens.semantic.text.primary} />
                    {unreadCount > 0 ? (
                      <Box
                        style={{
                          position: 'absolute',
                          top: 7,
                          right: 8,
                          minWidth: 16,
                          height: 16,
                          borderRadius: 8,
                          backgroundColor: tokens.colors.primary,
                          paddingHorizontal: 4,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text
                          style={{
                            color: tokens.semantic.text.inverse,
                            fontSize: tokens.typography.sizes.xs,
                            fontWeight: '800',
                          }}
                        >
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </Text>
                      </Box>
                    ) : null}
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Open settings"
                    accessibilityHint="Navigates to the settings page to configure user preferences"
                    onPress={() => router.push('/settings')}
                    style={{
                      width: tokens.interaction.minTouchTarget,
                      height: tokens.interaction.minTouchTarget,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: tokens.radii.full,
                      backgroundColor: tokens.semantic.surface.interactive,
                    }}
                  >
                    <Settings size={18} color={tokens.semantic.text.primary} />
                  </Pressable>
                </Box>
              }
            />
          ),
        }}
      >
        <Tabs.Screen
          name="self"
          options={{
            title: 'Self',
            tabBarIcon: ({ color, size }) => <Heart color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="workspace"
          options={{
            title: 'Workspace',
            tabBarIcon: ({ color, size }) => <School color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="community/index"
          options={{
            title: 'Community',
            tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: 'Library',
            tabBarIcon: ({ color, size }) => <Library color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
          }}
        />
      </Tabs>

      <AchievementUnlockOverlay
        title={currentAchievement}
        visible={showCelebration}
        onHide={() => setShowCelebration(false)}
      />

      <Modal isOpen={isBreathingOpen} onClose={() => setBreathingOpen(false)}>
        <ModalContent className="bg-phase-canvas">
          <Box
            style={{
              paddingTop: shell.modal.contentPadding,
              paddingBottom: tokens.spacing.md,
              paddingHorizontal: shell.modal.contentPadding,
              borderBottomWidth: 1,
              borderBottomColor: tokens.semantic.border.subtle,
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
                <Text
                  style={{
                    color: tokens.semantic.text.primary,
                    fontSize: tokens.typography.sizes.lg,
                    fontWeight: '700',
                  }}
                >
                  Breathing Reset
                </Text>
                <Text
                  style={{
                    color: tokens.semantic.text.secondary,
                    fontSize: tokens.typography.sizes.xs,
                  }}
                >
                  1 minute of peace
                </Text>
              </Box>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close breathing reset"
                accessibilityHint="Closes the breathing reset dialog"
                onPress={() => setBreathingOpen(false)}
                style={{
                  width: tokens.interaction.minTouchTarget,
                  height: tokens.interaction.minTouchTarget,
                  borderRadius: tokens.radii.full,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: tokens.semantic.surface.interactive,
                }}
              >
                <X size={18} color={tokens.semantic.text.primary} />
              </Pressable>
            </Box>
          </Box>
          <Box
            style={{
              padding: shell.modal.contentPadding,
              minHeight: shell.modal.minHeight,
              justifyContent: 'center',
            }}
          >
            <BreathGuide onComplete={() => setBreathingOpen(false)} />
          </Box>
        </ModalContent>
      </Modal>
    </>
  );
}
