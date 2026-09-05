import { useNotifications, useStore } from '@repo/core/logic';
import type { AppNotification } from '@repo/core/types';
import { BrandedEmptyState } from '@repo/ui/components/BrandedEmptyState';
import { BrandPulse } from '@repo/ui/components/BrandPulse';
import { ErrorState as BrandedErrorState } from '@repo/ui/components/ErrorState';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { useTheme } from '@repo/ui/hooks/useTheme';
import { Bell, Check, CircleAlert, Info, Sparkles } from '@repo/ui/icons';
import { Button, ButtonText, HStack, Pressable, Text, VStack } from '@repo/ui/primitives';
import { hapticLight } from '@repo/ui/utils/haptics';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, useWindowDimensions } from 'react-native';

function NotificationIcon({ type, color }: { type: string; color: string }) {
  switch (type) {
    case 'resonance':
      return <Bell size={19} color={color} />;
    case 'community':
    case 'achievement':
      return <Sparkles size={19} color={color} />;
    case 'system':
    case 'security':
    default:
      return <Info size={19} color={color} />;
  }
}

function relativeTime(dateString: string): string {
  const timestamp = new Date(dateString).getTime();
  if (Number.isNaN(timestamp)) return '';
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function NotificationRow({
  notification,
  onMarkRead,
}: {
  notification: AppNotification;
  onMarkRead: (id: string) => void;
}) {
  const { accent, text } = useTheme();
  const iconColor = notification.is_read ? text.secondary : accent.action;

  return (
    <VStack
      space="sm"
      className={`rounded-2xl border p-4 ${notification.is_read ? 'bg-phase-surface border-phase-surface' : 'bg-phase-canvas border-phase-primary'}`}
      accessibilityLabel={notification.title}
      accessibilityHint="Notification details"
    >
      <HStack space="md" className="items-start">
        <VStack className="w-10 h-10 rounded-xl bg-phase-surface items-center justify-center">
          <NotificationIcon type={notification.type} color={iconColor} />
        </VStack>
        <VStack className="flex-1 gap-1">
          <HStack className="items-start justify-between gap-2">
            <Text
              className={`flex-1 text-sm leading-tight ${notification.is_read ? 'font-medium' : 'font-bold'}`}
              style={{ color: text.primary }}
            >
              {notification.title}
            </Text>
            {!notification.is_read && (
              <VStack className="w-2 h-2 rounded-full bg-phase-primary mt-1" />
            )}
          </HStack>
          {notification.body ? (
            <Text className="text-xs leading-relaxed" style={{ color: text.secondary }}>
              {notification.body}
            </Text>
          ) : null}
          <Text className="text-[10px] uppercase tracking-wider" style={{ color: text.secondary }}>
            {relativeTime(notification.created_at)}
          </Text>
        </VStack>
      </HStack>
      {!notification.is_read && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Mark ${notification.title} as read`}
          accessibilityHint="Marks only this notification as read"
          className="self-end flex-row items-center gap-1.5 px-3 py-2 rounded-xl bg-phase-surface"
          onPress={() => {
            hapticLight();
            onMarkRead(notification.id);
          }}
        >
          <Check size={15} color={accent.action} />
          <Text className="text-xs font-semibold" style={{ color: accent.action }}>
            Mark read
          </Text>
        </Pressable>
      )}
    </VStack>
  );
}

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const { accent, text } = useTheme();
  const { width } = useWindowDimensions();
  const user = useStore((state) => state.user);
  const isOnline = useStore((state) => state.isOnline);
  const {
    notifications,
    unreadCount,
    isLoading,
    isRealtimeConnected,
    error,
    markAsRead,
    markAllRead,
    refresh,
  } = useNotifications(user?.id);

  const hasData = notifications.length > 0;
  const isOffline = !isOnline;
  const isStale = hasData && (isOffline || Boolean(error) || !isRealtimeConnected);

  return (
    <ScreenWrapper scroll={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          width: '100%',
          maxWidth: Math.min(width, 720),
          alignSelf: 'center',
          padding: 16,
          paddingBottom: 120,
        }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => void refresh()} />}
      >
        <VStack space="lg">
          <HStack className="items-start justify-between gap-4">
            <VStack className="flex-1 gap-1">
              <Text className="text-xs uppercase tracking-[2px]" style={{ color: accent.action }}>
                {t('notifications.stream') || 'Your stream'}
              </Text>
              <Text className="text-2xl font-bold" style={{ color: text.primary }}>
                {t('notifications.title') || 'Notifications'}
              </Text>
              <Text className="text-sm" style={{ color: text.secondary }}>
                {unreadCount > 0
                  ? t('notifications.unread', { count: unreadCount })
                  : t('notifications.empty') || 'Your sanctuary is quiet.'}
              </Text>
            </VStack>
            <Bell size={26} color={accent.action} />
          </HStack>

          {isOffline ? (
            <HStack className="items-center gap-2 rounded-xl bg-phase-surface px-3 py-2">
              <CircleAlert size={15} color={accent.action} />
              <Text className="flex-1 text-xs" style={{ color: text.secondary }}>
                Showing the latest saved notifications while you are offline.
              </Text>
            </HStack>
          ) : isStale ? (
            <HStack className="items-center gap-2 rounded-xl bg-phase-surface px-3 py-2">
              <CircleAlert size={15} color={accent.action} />
              <Text className="flex-1 text-xs" style={{ color: text.secondary }}>
                Live updates are paused. Pull to refresh when you are ready.
              </Text>
            </HStack>
          ) : null}

          {error && hasData ? (
            <Text className="text-xs" style={{ color: accent.action }} accessibilityRole="alert">
              {error}
            </Text>
          ) : null}

          {hasData && unreadCount > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onPress={() => {
                hapticLight();
                void markAllRead();
              }}
              accessibilityLabel="Mark all notifications as read"
              accessibilityHint="Marks every unread notification as read"
              className="self-start rounded-xl"
            >
              <ButtonText>Mark all read</ButtonText>
            </Button>
          ) : null}

          {isLoading && !hasData ? (
            <VStack className="items-center py-16 gap-4">
              <BrandPulse
                size={42}
                tintColor={accent.action}
                accessibilityLabel="Loading notifications"
              />
              <Text className="text-sm" style={{ color: text.secondary }}>
                {t('common.loading') || 'Gathering your latest updates…'}
              </Text>
            </VStack>
          ) : error && !hasData ? (
            <BrandedErrorState
              title={t('notifications.loadFailed', 'Notifications could not be opened')}
              message={error}
            >
              <Button
                size="sm"
                onPress={() => void refresh()}
                accessibilityLabel="Retry loading notifications"
              >
                <ButtonText>{t('common.retry', 'Try again')}</ButtonText>
              </Button>
            </BrandedErrorState>
          ) : !hasData ? (
            <BrandedEmptyState
              title={t('notifications.quietTitle', 'A quiet garden')}
              message={t('notifications.empty', 'There is nothing waiting for your attention.')}
            />
          ) : (
            <VStack space="sm">
              {notifications.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  onMarkRead={(id) => void markAsRead(id)}
                />
              ))}
            </VStack>
          )}
        </VStack>
      </ScrollView>
    </ScreenWrapper>
  );
}
