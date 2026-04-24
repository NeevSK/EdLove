import React from 'react';
import { Dimensions, ScrollView } from 'react-native';
import { Box, VStack, HStack, Text, Heading, Portal, Pressable, Spinner } from '../gluestack';
import { X, Bell, Info, CheckCircle, Users, BookOpen, Check } from 'lucide-react-native';
import Animated, { SlideInLeft, SlideOutLeft, Easing } from 'react-native-reanimated';
import { hapticLight } from '../utils/haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.65;

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
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
}

function notificationIcon(type: string) {
  switch (type) {
    case 'new_submission':
      return BookOpen;
    case 'submission_graded':
      return CheckCircle;
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
  if (isNaN(ts)) return '';
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
  onMarkRead,
  onMarkAllRead,
}: NotificationDrawerProps) {
  const insets = useSafeAreaInsets();

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
            width: DRAWER_WIDTH,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          }}
          className="bg-phase-canvas border-r border-phase-surface shadow-2xl"
        >
          <VStack className="flex-1 p-6 gap-4">
            {/* Header */}
            <HStack className="justify-between items-center h-[60px]">
              <HStack className="items-center gap-2">
                <Bell size={24} color="#F6BF8C" />
                <Heading size="lg" className="text-phase-text-primary">
                  Notifications
                </Heading>
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

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              {isLoading ? (
                <Box className="items-center py-10">
                  <Spinner className="text-phase-accent" />
                </Box>
              ) : notifications.length === 0 ? (
                <VStack className="items-center py-10 gap-2">
                  <Bell size={40} color="#666" style={{ opacity: 0.3 }} />
                  <Text className="text-center text-phase-text-secondary text-sm">
                    You're all caught up ✨
                  </Text>
                </VStack>
              ) : (
                <VStack className="mt-4 gap-2">
                  {notifications.map((n) => {
                    const Icon = notificationIcon(n.type);
                    return (
                      <Pressable
                        accessibilityRole="button"
                        key={n.id}
                        onPress={() => {
                          hapticLight();
                          if (!n.is_read && onMarkRead) onMarkRead(n.id);
                        }}
                      >
                        <Box
                          className={`p-4 rounded-xl border ${
                            n.is_read
                              ? 'bg-phase-surface border-phase-surface'
                              : 'bg-phase-accent/10 border-phase-accent/30'
                          }`}
                        >
                          <HStack className="items-start gap-2">
                            <Box className="p-2 rounded-full bg-phase-surface">
                              <Icon size={16} color={n.is_read ? '#666' : '#F6BF8C'} />
                            </Box>
                            <VStack className="flex-1 gap-1">
                              <Text
                                className={`text-phase-text-primary text-sm ${n.is_read ? 'font-normal' : 'font-bold'}`}
                              >
                                {n.title}
                              </Text>
                              {n.body ? (
                                <Text
                                  className="text-phase-text-secondary text-xs"
                                  numberOfLines={2}
                                >
                                  {n.body}
                                </Text>
                              ) : null}
                              <Text className="text-phase-text-secondary text-[10px]">
                                {relativeTime(n.created_at)}
                              </Text>
                            </VStack>
                          </HStack>
                        </Box>
                      </Pressable>
                    );
                  })}
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
