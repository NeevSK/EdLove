import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Info, Shield, CheckCircle2 } from 'lucide-react-native';
import { useThemedColors } from '@repo/ui';

export default function NotificationsScreenWeb() {
    const { t } = useTranslation();
    const colors = useThemedColors();

    const mockNotifications = [
        {
            id: '1',
            type: 'resonance',
            title: 'New Resonance Insight',
            body: 'Your "Lotus Path" has reached a new stage of fidelity.',
            time: '2 hours ago',
            read: false,
            icon: <Bell size={18} color="var(--action)" />
        },
        {
            id: '2',
            type: 'system',
            title: 'Sanctuary Update',
            body: 'Gurudevi Ecosystem v4.2.0 is now live with enhanced web features.',
            time: '5 hours ago',
            read: true,
            icon: <Info size={18} color="var(--water)" />
        },
        {
            id: '3',
            type: 'community',
            title: 'Community Spark',
            body: 'Someone resonated with your recent post in the Resonant Feed.',
            time: 'Yesterday',
            read: true,
            icon: <Shield size={18} color="var(--moss)" />
        }
    ];

    return (
        <div className="sanctuary-screen">
            <div className="sanctuary-container">
                <div className="greeting">
                    <div className="greeting-time">{t('notifications.stream', 'Echoes of the Sanctuary')}</div>
                    <h1 className="greeting-main">{t('notifications.title', 'Notifications')}</h1>
                    <p className="greeting-note">{t('notifications.description', 'Stay in resonance with your community and growth')}</p>
                </div>

                <div className="notification-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '800px' }}>
                    {mockNotifications.map(notif => (
                        <div
                            key={notif.id}
                            className={`sanctuary-card ${notif.read ? 'read' : 'unread'}`}
                            style={{
                                padding: '20px',
                                borderLeft: notif.read ? '1px solid var(--border)' : '4px solid var(--action)',
                                opacity: notif.read ? 0.8 : 1
                            }}
                        >
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '12px',
                                    background: 'var(--glass-interact)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {notif.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>{notif.title}</h3>
                                        <span style={{ fontSize: '12px', color: 'var(--ink-ghost)' }}>{notif.time}</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--ink)', lineHeight: '1.4' }}>{notif.body}</p>
                                </div>
                                {!notif.read && <div style={{ width: '8px', height: '8px', borderRadius: '4px', background: 'var(--action)', marginTop: '6px' }} />}
                            </div>
                        </div>
                    ))}

                    <div style={{ textAlign: 'center', marginTop: '40px' }}>
                        <button className="sanctuary-button-ghost" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6 }}>
                            <CheckCircle2 size={14} style={{ marginRight: 8 }} /> Mark all as read
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
