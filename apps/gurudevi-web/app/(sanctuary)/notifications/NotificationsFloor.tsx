'use client';

import { useState } from 'react';
import styles from './notifications.module.css';

type NotificationCategory = 'all' | 'classrooms' | 'mentors' | 'system' | 'achievements';

type NotificationItem = {
  id: string;
  category: 'classrooms' | 'mentors' | 'system' | 'achievements';
  title: string;
  message: string;
  time: string;
  unread: boolean;
  symbol: string;
};

const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    category: 'classrooms',
    title: 'Attendance marked for Forest Learning Circle',
    message: 'All 3 students have been marked present for today’s integrated morning circle.',
    time: '10m ago',
    unread: true,
    symbol: '◇',
  },
  {
    id: 'notif-2',
    category: 'mentors',
    title: 'Pedagogical feedback on Gradebook assessment',
    message: 'Mrs. Perera published updated competencies for Integrated Mathematics Unit 3.',
    time: '1h ago',
    unread: true,
    symbol: '📊',
  },
  {
    id: 'notif-3',
    category: 'achievements',
    title: 'Mindfulness streak milestone reached',
    message:
      'Your classroom circle maintained a 5-day continuous morning breath reflection streak.',
    time: 'Yesterday',
    unread: false,
    symbol: '♥',
  },
  {
    id: 'notif-4',
    category: 'system',
    title: 'Diurnal rhythm sync: Night atmosphere',
    message:
      'Sanctuary floor has shifted to Night appearance with high-contrast APCA charcoal mode.',
    time: '2d ago',
    unread: false,
    symbol: '⚙',
  },
];

interface NotificationsFloorProps {
  displayName: string;
}

export function NotificationsFloor({ displayName }: NotificationsFloorProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>('all');

  const filtered = notifications.filter(
    (n) => activeCategory === 'all' || n.category === activeCategory,
  );

  const unreadCount = notifications.filter((n) => n.unread).length;

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }

  function dismissNotification(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <div className={styles.container}>
      {/* Header bar */}
      <div className={styles.headerBar}>
        <div className={styles.titleArea}>
          <h1>Notifications Center</h1>
          <p>
            {unreadCount > 0
              ? `${unreadCount} unread announcements and learning circle notices for ${displayName}.`
              : `You are up to date on all sanctuary communications, ${displayName}.`}
          </p>
        </div>
        {unreadCount > 0 && (
          <div className={styles.actionsArea}>
            <button type="button" onClick={markAllRead} className={styles.markAllButton}>
              Mark all as read
            </button>
          </div>
        )}
      </div>

      {/* Category filters */}
      <nav aria-label="Notification Categories" className={styles.filterTabs}>
        {(
          [
            ['all', 'All'],
            ['classrooms', 'Classrooms'],
            ['mentors', 'Mentors'],
            ['achievements', 'Achievements'],
            ['system', 'System'],
          ] as const
        ).map(([cat, label]) => {
          const isSelected = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setActiveCategory(cat)}
              className={styles.filterTab}
            >
              {label}
            </button>
          );
        })}
      </nav>

      {/* Notifications list */}
      {filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon} aria-hidden="true">
            ♢
          </span>
          <h2 className={styles.emptyTitle}>No notices in this category</h2>
          <p className={styles.emptyText}>
            When educational bonds or system updates emit alerts, they will appear here.
          </p>
        </div>
      ) : (
        <ul className={styles.notificationsList}>
          {filtered.map((item) => (
            <li key={item.id} className={styles.notificationCard} data-unread={item.unread}>
              <div className={styles.iconContainer} aria-hidden="true">
                {item.symbol}
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardTop}>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <time className={styles.cardTime}>{item.time}</time>
                </div>
                <p className={styles.cardMessage}>{item.message}</p>
              </div>
              <button
                type="button"
                aria-label={`Dismiss notice: ${item.title}`}
                onClick={() => dismissNotification(item.id)}
                className={styles.dismissButton}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
