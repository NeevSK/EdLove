import { Bell, BookOpen, Check, CircleCheck, Info, Users, X } from '@repo/ui/icons';
import { useStore } from '@repo/core/logic';
import { useWindowDimensions } from 'react-native';
import Animated, { Easing, SlideInLeft, SlideOutLeft } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Box, Heading, HStack, Portal, Pressable, Text, VStack } from '@repo/ui/gluestack';
import { ScrollView } from '@repo/ui/primitives';
import { hapticLight } from '@repo/ui/utils/haptics';
import { SkeletonAvatar, SkeletonTextLine } from '@repo/ui/components/SkeletonLoader';

interface NotificationDrawerProps {
  isVisible: boolean;
  onClose: () => void;
  notifications?: Array<{
    id: string;
    type: string;
    title: string;
    body: string | null;
    is_read: boolean;
    created_at: string;
  }>;
  unreadCount?: number;
  isLoading?: boolean;
  isRealtimeConnected?: boolean;
  error?: string | null;
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
}

function notificationIcon(type: string) {
  switch (type) {
    case 'new_submission':
      return BookOpen;
    case 'submission_graded':
      return CircleCheck;
    case 'new_post':
      return Users;
    case 'group_joined':
      return Users;
    case 'school_circular':
      return Bell;
    case 'system':
      return Info;
    default:
      return Info;
  }
}

function relativeTime(dateStr: string): string {
  const ts = new Date(dateStr).getTime();
  if (Number.isNaN(ts)) return '';
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationDrawer({
  isVisible,
  onClose,
  notifications = [],
  unreadCount = 0,
  isLoading = false,
  isRealtimeConnected = false,
  error = null,
  onMarkRead,
  onMarkAllRead,
}: NotificationDrawerProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const isOnline = useStore((state) => state.isOnline);
  const drawerWidth = Math.min(windowWidth * 0.82, 420);

  if (!isVisible) return null;

  return (
    <Portal>
      <Box className="flex-1 bg-black/40">
        <Pressable
          accessibilityRole="button"
          className="absolute inset-0"
          onPress={() => {
            hapticLight();
            onClose();
          }}
        />

        <Animated.View
          entering={SlideInLeft.duration(800).easing(Easing.out(Easing.exp))}
          exiting={SlideOutLeft.duration(500)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: drawerWidth,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          }}
          className="bg-phase-canvas border-r border-phase-surface shadow-2xl"
        >
          <VStack className="flex-1 p-6 gap-4">
            {/* Header */}
            <HStack className="justify-between items-center h-[60px]">
              <HStack className="items-center gap-2">
                <Box className="relative">
                  <Bell size={24} color="#F6BF8C" />
                  {isRealtimeConnected && (
                    <Box className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-500 border border-phase-canvas" />
                  )}
                </Box>
                <VStack className="gap-0">
                  <Heading size="lg" className="text-phase-text-primary">
                    Notifications
                  </Heading>
                  {isRealtimeConnected ? (
                    <Text className="text-[10px] text-green-500 font-bold uppercase tracking-wider">
                      Live • Connected
                    </Text>
                  ) : isOnline ? (
                    <Text className="text-[10px] text-phase-text-secondary font-bold uppercase tracking-wider">
                      Saved view • Live updates paused
                    </Text>
                  ) : (
                    <Text className="text-[10px] text-phase-text-secondary font-bold uppercase tracking-wider">
                      Offline • Showing saved updates
                    </Text>
                  )}
                </VStack>
                {unreadCount > 0 && (
                  <Box className="bg-phase-accent rounded-full min-w-[20px] h-5 items-center justify-center px-1">
                    <Text className="text-white text-[11px] font-bold">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                  </Box>
                )}
              </HStack>
              <HStack className="items-center gap-2">
                {unreadCount > 0 && onMarkAllRead && (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      hapticLight();
                      onMarkAllRead();
                    }}
                    hitSlop={10}
                  >
                    <Check size={18} color="#F6BF8C" />
                  </Pressable>
                )}
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    hapticLight();
                    onClose();
                  }}
                  hitSlop={10}
                >
                  <X size={28} className="text-phase-text-secondary" />
                </Pressable>
              </HStack>
            </HStack>

            {error && (
              <Box className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                <Text className="text-red-500 text-xs text-center font-medium">{error}</Text>
              </Box>
            )}

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              {isLoading ? (
                <VStack className="mt-4 gap-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Box
                      key={i}
                      className="p-4 rounded-xl border border-phase-surface bg-phase-surface/30"
                    >
                      <HStack className="items-start gap-3">
                        <SkeletonAvatar size={36} />
                        <VStack className="flex-1 gap-2">
                          <SkeletonTextLine width="60%" />
                          <SkeletonTextLine width="90%" />
                          <SkeletonTextLine width="30%" />
                        </VStack>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              ) : notifications.length === 0 ? (
                <VStack className="items-center py-20 gap-6">
                  <Box className="w-16 h-16 rounded-full bg-phase-surface/30 items-center justify-center">
                    <Bell size={32} color="#F6BF8C" style={{ opacity: 0.5 }} />
                  </Box>
                  <VStack className="items-center gap-3 px-6">
                    <Text className="text-center text-phase-text-primary font-bold text-lg">
                      Quietude Achieved
                    </Text>
                    <Text className="text-center text-phase-text-secondary text-sm italic leading-relaxed">
                      "In the garden of the mind, peace is the most beautiful flower that blooms."
                    </Text>
                  </VStack>
                  <Box className="w-8 h-[1px] bg-phase-accent/20" />
                </VStack>
              ) : (
                <VStack className="mt-4 gap-6">
                  {(() => {
                    const groups: Record<string, typeof notifications> = {
                      Today: [],
                      Yesterday: [],
                      Earlier: [],
                    };

                    notifications.forEach((n) => {
                      const date = new Date(n.created_at);
                      const now = new Date();
                      const diff = now.getTime() - date.getTime();
                      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

                      if (days === 0) groups.Today?.push(n);
                      else if (days === 1) groups.Yesterday?.push(n);
                      else groups.Earlier?.push(n);
                    });

                    return Object.entries(groups).map(([title, items]) => {
                      if (items.length === 0) return null;
                      return (
                        <VStack key={title} className="gap-3">
                          <Text className="text-[10px] font-bold tracking-[2px] uppercase text-phase-text-secondary opacity-60 ml-1">
                            {title}
                          </Text>
                          {items.map((n) => {
                            const Icon = notificationIcon(n.type);
                            const accentColor =
                              n.type === 'resonance'
                                ? '#F6BF8C'
                                : n.type === 'community'
                                  ? '#10b981'
                                  : n.type === 'achievement'
                                    ? '#8b5cf6'
                                    : '#94a3b8';

                            return (
                              <Box key={n.id}>
                                <Box
                                  className={`p-4 rounded-2xl border transition-all duration-300 ${
                                    n.is_read
                                      ? 'bg-phase-surface/40 border-phase-surface'
                                      : 'bg-phase-accent/5 border-phase-accent/20 shadow-sm'
                                  }`}
                                  style={{
                                    borderLeftWidth: n.is_read ? 1 : 4,
                                    borderLeftColor: accentColor,
                                  }}
                                >
                                  <HStack className="items-start gap-3">
                                    <Box
                                      className="p-2.5 rounded-xl bg-phase-canvas border border-phase-surface"
                                      style={{
                                        shadowColor: accentColor,
                                        shadowOffset: { width: 0, height: 0 },
                                        shadowOpacity: n.is_read ? 0 : 0.4,
                                        shadowRadius: 4,
                                      }}
                                    >
                                      <Icon size={18} color={accentColor} />
                                    </Box>
                                    <VStack className="flex-1 gap-1">
                                      <Text
                                        className={`text-phase-text-primary text-sm leading-tight ${n.is_read ? 'font-medium' : 'font-bold'}`}
                                      >
                                        {n.title}
                                      </Text>
                                      {n.body ? (
                                        <Text
                                          className="text-phase-text-secondary text-xs leading-relaxed"
                                          numberOfLines={3}
                                        >
                                          {n.body}
                                        </Text>
                                      ) : null}
                                      <HStack className="items-center gap-1.5 mt-1">
                                        <Text className="text-phase-text-secondary text-[10px] font-medium uppercase tracking-wider">
                                          {relativeTime(n.created_at)}
                                        </Text>
                                        {!n.is_read && (
                                          <Box className="w-1 h-1 rounded-full bg-phase-accent" />
                                        )}
                                      </HStack>
                                      {!n.is_read && onMarkRead && (
                                        <Pressable
                                          accessibilityRole="button"
                                          accessibilityLabel={`Mark ${n.title} as read`}
                                          accessibilityHint="Marks only this notification as read"
                                          className="self-start flex-row items-center gap-1.5 mt-2 px-2.5 py-1.5 rounded-lg bg-phase-surface"
                                          onPress={() => {
                                            hapticLight();
                                            onMarkRead(n.id);
                                          }}
                                        >
                                          <Check size={14} color="#F6BF8C" />
                                          <Text className="text-[10px] text-phase-text-primary font-semibold">
                                            Mark read
                                          </Text>
                                        </Pressable>
                                      )}
                                    </VStack>
                                  </HStack>
                                </Box>
                              </Box>
                            );
                          })}
                        </VStack>
                      );
                    });
                  })()}
                </VStack>
              )}
            </ScrollView>

            <Text className="text-phase-text-secondary text-center text-xs italic mb-4">
              Your sanctuary stays updated.
            </Text>
          </VStack>
        </Animated.View>
      </Box>
    </Portal>
  );
}
