import { useNotifications, useRewards } from '@repo/core/hooks';
import { usePermissions, useStore } from '@repo/core/logic';
import { BreathGuide } from '@repo/self';
import { AchievementUnlockOverlay, GlobalHeader } from '@repo/ui/components';
import { Modal, ModalContent } from '@repo/ui/components/ui/modal';
import { Box, Pressable, Text } from '@repo/ui/primitives';
import { router, Tabs, usePathname } from 'expo-router';
import { Bell, Heart, Library, School, Settings, User, Users, X } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';

export default function TabsLayout() {
  const pathname = usePathname();
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

  const title = useMemo(() => {
    if (pathname.startsWith('/workspace')) return 'Workspace';
    if (pathname.startsWith('/community')) return 'Community';
    if (pathname.startsWith('/library')) return 'Library';
    if (pathname.startsWith('/profile')) return 'Profile';
    if (pathname.startsWith('/settings')) return 'Settings';
    if (pathname.startsWith('/notifications')) return 'Notifications';
    return 'Self';
  }, [pathname]);

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
          header: () => (
            <GlobalHeader
              title={title}
              subtitle={displayName}
              rightAction={
                <Box style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Open notifications"
                    accessibilityHint="Navigates to the notifications page to view updates"
                    onPress={() => router.push('/notifications')}
                    style={{
                      position: 'relative',
                      width: 40,
                      height: 40,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 999,
                      backgroundColor: 'rgba(42,35,24,0.08)',
                    }}
                  >
                    <Bell size={18} color="#2A2318" />
                    {unreadCount > 0 ? (
                      <Box
                        style={{
                          position: 'absolute',
                          top: 7,
                          right: 8,
                          minWidth: 16,
                          height: 16,
                          borderRadius: 8,
                          backgroundColor: '#D4843A',
                          paddingHorizontal: 4,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={{ color: '#fff', fontSize: 9, fontWeight: '800' }}>
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
                      width: 40,
                      height: 40,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 999,
                      backgroundColor: 'rgba(42,35,24,0.08)',
                    }}
                  >
                    <Settings size={18} color="#2A2318" />
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
          <Box className="pt-xl pb-md px-md border-b border-phase-surface/10">
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
          </Box>
          <Box style={{ padding: 16, minHeight: 400, justifyContent: 'center' }}>
            <BreathGuide onComplete={() => setBreathingOpen(false)} />
          </Box>
        </ModalContent>
      </Modal>
    </>
  );
}
