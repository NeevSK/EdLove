import { useScopedNotifications } from '@repo/core/hooks';
import { useAuthStore } from '@repo/core/store';
import { useOfflineStatus } from '@repo/core/offline/useOfflineStatus';
import type { AppNotification } from '@repo/core/types';
import { BrandedEmptyState } from '@repo/ui/components/BrandedEmptyState';
import { BrandPulse } from '@repo/ui/components/BrandPulse';
import { ErrorState as BrandedErrorState } from '@repo/ui/components/ErrorState';
import { useResponsiveGrid } from '@repo/ui/components/layout';
import { WebScreenHeader } from '@repo/ui/components/WebScreenHeader.web';
import { Bell, CircleCheck, Info, Shield, Sparkles } from '@repo/ui/icons';
import { formatDistanceToNow } from 'date-fns';
import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

// Local fallback since WebScreenShimmer doesn't exist
const StackFallback = memo(({ variant }: { variant?: string }) => (
  <div
    style={{
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'center', padding: '8px' }}>
      <BrandPulse size={32} accessibilityLabel="Loading notifications" />
    </div>
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        style={{
          height: variant === 'list' ? '80px' : '100px',
          backgroundColor: 'var(--background-alt)',
          borderRadius: '12px',
          opacity: 0.5,
        }}
      />
    ))}
  </div>
));

const ICON_MAP: Record<string, React.ReactNode> = {
  resonance: <Bell size={18} color="var(--action)" />,
  system: <Info size={18} color="var(--water)" />,
  community: <Sparkles size={18} color="var(--moss)" />,
  security: <Shield size={18} color="var(--lotus)" />,
  achievement: <Sparkles size={18} color="var(--reward)" />,
};

function timeAgo(ts: string): string {
  try {
    return formatDistanceToNow(new Date(ts), { addSuffix: true });
  } catch {
    return '';
  }
}

const NotificationRow = memo(
  ({ notif, onRead }: { notif: AppNotification; onRead: (id: string) => Promise<void> }) => {
    const icon = ICON_MAP[notif.type] ?? ICON_MAP.system;

    return (
      <div
        role="article"
        className="sanctuary-card"
        style={{
          padding: '20px',
          borderLeft: notif.is_read ? '1px solid var(--border)' : '4px solid var(--action)',
          opacity: notif.is_read ? 0.75 : 1,
          cursor: notif.is_read ? 'default' : 'pointer',
          transition: 'opacity 0.3s ease',
        }}
      >
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          {/* Icon */}
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              flexShrink: 0,
              background: 'var(--glass-interact)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </div>

          {/* Body */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '8px',
                marginBottom: '4px',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: '15px',
                  fontWeight: '700',
                  color: 'var(--ink)',
                  lineHeight: 1.3,
                }}
              >
                {notif.title}
              </h3>
              <span
                style={{
                  fontSize: '11px',
                  color: 'var(--ink-ghost)',
                  flexShrink: 0,
                }}
              >
                {timeAgo(notif.created_at)}
              </span>
            </div>
            {notif.body && (
              <p
                style={{
                  margin: 0,
                  fontSize: '13px',
                  color: 'var(--ink-soft)',
                  lineHeight: 1.5,
                }}
              >
                {notif.body}
              </p>
            )}
            {!notif.is_read && (
              <button
                type="button"
                aria-label={`Mark ${notif.title} as read`}
                onClick={() => void onRead(notif.id)}
                className="sanctuary-button-ghost"
                style={{ marginTop: '12px', padding: '6px 10px', fontSize: '12px' }}
              >
                <CircleCheck size={14} />
                Mark read
              </button>
            )}
          </div>

          {/* Unread dot */}
          {!notif.is_read && (
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--action)',
                flexShrink: 0,
                marginTop: '6px',
              }}
            />
          )}
        </div>
      </div>
    );
  },
);

export default memo(function NotificationsScreenWeb() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const { status: networkStatus } = useOfflineStatus();
  const { gutter, maxWidth } = useResponsiveGrid();
  const {
    notifications,
    unreadCount,
    isLoading,
    isRealtimeConnected,
    error,
    markAsRead,
    markAllRead,
    refresh,
  } = useScopedNotifications(user?.id);

  const hasData = notifications.length > 0;
  const handleMarkAllRead = useCallback(() => {
    void markAllRead();
  }, [markAllRead]);

  return (
    <div className="sanctuary-screen">
      <div
        className="sanctuary-container"
        style={{
          maxWidth: typeof maxWidth === 'number' ? maxWidth : '100%',
          paddingInline: gutter,
        }}
      >
        {/* GREETING */}
        <WebScreenHeader
          title={t('notifications.title')}
          timeText={t('notifications.stream')}
          note={unreadCount > 0 ? t('notifications.unread', { count: unreadCount }) : ''}
        />

        {/* CONTENT */}
        <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          {isRealtimeConnected ? (
            <div
              style={{
                fontSize: '11px',
                color: 'var(--moss)',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--moss)',
                }}
              />
              Live Stream Active
            </div>
          ) : networkStatus !== 'offline' ? (
            <div className="notification-state notification-state-stale">
              Live updates are paused. Your saved notifications remain available.
            </div>
          ) : (
            <div className="notification-state notification-state-offline">
              You are offline. Showing the latest saved notifications.
            </div>
          )}

          {error && (
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: 'var(--warning-surface)',
                border: '1px solid var(--warning)',
                borderRadius: '16px',
                color: 'var(--warning)',
                fontSize: '13px',
                marginBottom: '20px',
              }}
            >
              {error}
            </div>
          )}
          {/* Actions bar */}
          {notifications.length > 0 && unreadCount > 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: '24px',
              }}
            >
              <button className="sanctuary-button-ghost" onClick={handleMarkAllRead}>
                <CircleCheck size={14} />
                {t('notifications.markAllRead')}
              </button>
            </div>
          )}

          {/* Loading */}
          {isLoading && !hasData && <StackFallback variant="list" />}

          {/* Empty state */}
          {!isLoading && error && !hasData && (
            <BrandedErrorState
              title={t('notifications.loadFailed', 'Notifications could not be opened')}
              message={error}
            >
              <button type="button" className="sanctuary-button" onClick={() => void refresh()}>
                {t('common.retry', 'Try again')}
              </button>
            </BrandedErrorState>
          )}

          {!isLoading && !error && notifications.length === 0 && (
            <BrandedEmptyState
              title={t('notifications.quietTitle', 'A quiet garden')}
              message={t('notifications.empty', 'There is nothing waiting for your attention.')}
            />
          )}

          {/* Notification list */}
          {!isLoading && notifications.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {notifications.map((notif: AppNotification) => (
                <NotificationRow key={notif.id} notif={notif} onRead={markAsRead} />
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`
        .notification-state {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          margin-bottom: 16px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 600;
        }
        .notification-state-stale { background: var(--action-soft); color: var(--action); }
        .notification-state-offline { background: var(--warning-surface); color: var(--warning); }
      `}</style>
    </div>
  );
});
