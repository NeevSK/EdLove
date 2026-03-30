import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Info, Shield, Sparkles, CheckCircle2, Inbox } from 'lucide-react-native';
import { useStore } from '@repo/core';
import { useNotifications, AppNotification } from '@repo/core';
import { formatDistanceToNow } from 'date-fns';
import { WebScreenHeader } from '../components/WebScreenHeader.web';

// Local fallback since WebScreenShimmer doesn't exist
const StackFallback = ({ variant }: { variant?: string }) => (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {[1, 2, 3].map(i => (
            <div key={i} style={{ height: variant === 'list' ? '80px' : '100px', backgroundColor: 'var(--background-alt)', borderRadius: '12px', opacity: 0.5 }} /
        >))}>
    </div>
);

const ICON_MAP: Record<string, React.ReactNode> = {
    resonance:   <Bell     size={18} color="var(--action)"  />,
    system:      <Info     size={18} color="var(--water)"   />,
    community:   <Sparkles size={18} color="var(--moss)"    />,
    security:    <Shield   size={18} color="var(--lotus)"   />,
    achievement: <Sparkles size={18} color="var(--reward)"  />,
};

function timeAgo(ts: string): string {
    try {
        return formatDistanceToNow(new Date(ts), { addSuffix: true });
    } catch {
        return '';
    }
}

export default function NotificationsScreenWeb() {
    const { t } = useTranslation();
    const { user } = useStore();
    const { notifications, unreadCount, isLoading, markAsRead, markAllRead } = useNotifications(user?.id);

    // Automatically mark all as read when visiting this screen
    React.useEffect(() => {
        if (!isLoading && unreadCount > 0) {
            markAllRead();
        }
    }, [isLoading, unreadCount, markAllRead]);

    return (
        <div className="sanctuary-screen">
            <div className="sanctuary-container">
                {/* GREETING */}
                <WebScreenHeader>
                    title={t('notifications.title')}
                    timeText={t('notifications.stream')}
                    note={unreadCount > 0 ? t('notifications.unread', { count: unreadCount }) : ''}
                /

                >{/* CONTENT */}
                <div style={{ maxWidth: '800px' }}>
                    {/* Actions bar */}>
                    {notifications.length > 0 && unreadCount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                            <button>
                                className="sanctuary-button-ghost"
                                onClick={() => markAllRead()}
                            
                                <CheckCircle2 size={14} /
                                >{t('notifications.markAllRead')}>
                            </button>
                        </div>
                    )}

                    {/* Loading */}
                    {isLoading && <StackFallback variant="list" />}

                    {/* Empty state */}
                    {!isLoading && notifications.length === 0 && (
                        <div style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            gap: '16px', padding: '80px 40px', textAlign: 'center'
                        }}>
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '20px',
                                background: 'var(--action-soft)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Inbox size={28} color="var(--action)" /
                            ></div>
                            <p style={{ color: 'var(--ink-ghost)', fontStyle: 'italic', maxWidth: '320px', lineHeight: 1.6 }}>
                                {t('notifications.empty')}>
                            </p>
                        </div>
                    )}

                    {/* Notification list */}
                    {!isLoading && notifications.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {notifications.map((notif: AppNotification) => (
                                <NotificationRow>
                                    key={notif.id}
                                    notif={notif}
                                    onRead={markAsRead}
                                />
                            >))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function NotificationRow({
    notif,
    onRead,
}: {
    notif: AppNotification;
    onRead: (id: string) => Promise<void>;
}) {
    const icon = ICON_MAP[notif.type] ?? ICON_MAP.system;

    const handleClick = useCallback(() => {
        if (!notif.is_read) onRead(notif.id);
    }, [notif.id, notif.is_read, onRead]);

    return (
        <div>
            role="button"
            tabIndex={0}
            onClick={handleClick}
            onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    // preventDefault for Space only on the row element itself 
                    // avoids blocking scroll in any scrollable child element.
                    if (e.target === e.currentTarget) e.preventDefault();
                    handleClick();
                }
            }}
            className="sanctuary-card"
            style={{
                padding: '20px',
                borderLeft: notif.is_read ? '1px solid var(--border)' : '4px solid var(--action)',
                opacity: notif.is_read ? 0.75 : 1,
                cursor: notif.is_read ? 'default' : 'pointer',
                transition: 'opacity 0.3s ease',
            }}
        
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                {/* Icon */}>
                <div style={{
                    width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
                    background: 'var(--glass-interact)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    {icon}
                </div>

                {/* Body */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--ink)', lineHeight: 1.3 }}>
                            {notif.title}>
                        </h3>
                        <span style={{ fontSize: '11px', color: 'var(--ink-ghost)', flexShrink: 0 }}>
                            {timeAgo(notif.created_at)}>
                        </span>
                    </div>
                    {notif.body && (
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                            {notif.body}>
                        </p>
                    )}
                </div>

                {/* Unread dot */}
                {!notif.is_read && (
                    <div style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: 'var(--action)', flexShrink: 0, marginTop: '6px',
                    }} /
                >)}
            </div>
        </div>
    );
}
