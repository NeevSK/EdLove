'use client';

import { useState } from 'react';
import { SanctuaryFloorCanvas } from '../components/SanctuaryFloorCanvas';
import type { FurnitureDefinition } from '../components/FloorStudioDrawer';
import styles from './notifications.module.css';

const NOTIFICATIONS_FURNITURE_ITEMS: readonly FurnitureDefinition[] = [
  { id: 'notif-header', label: 'Announcements Overview', icon: '📢' },
  { id: 'notif-filters', label: 'Category Filter Tabs', icon: '🏷️' },
  { id: 'notif-feed', label: 'Live Notification Stream', icon: '🔔' },
];

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

const guestNotifications: NotificationItem[] = [
  {
    id: 'guest-1',
    category: 'system',
    title: 'Welcome to Gurudevi Guest House',
    message:
      'Explore contemplative learning circles, the wisdom library, and personal journal sandbox with zero registration.',
    time: 'Just now',
    unread: true,
    symbol: '🪷',
  },
  {
    id: 'guest-2',
    category: 'system',
    title: 'Local-First PDPA Privacy Invariant',
    message:
      'Under Sri Lanka PDPA No. 9 of 2022, all guest exploration entries and reflections remain strictly in your browser.',
    time: '5m ago',
    unread: true,
    symbol: '🛡️',
  },
  {
    id: 'guest-3',
    category: 'classrooms',
    title: 'Attendance marked for Forest Learning Circle',
    message:
      'All 3 students have been marked present for today’s integrated morning circle in your local sandbox.',
    time: '12m ago',
    unread: true,
    symbol: '◇',
  },
  {
    id: 'guest-4',
    category: 'classrooms',
    title: 'Gradebook competencies ready for review',
    message:
      'Integrated Science Unit 2 contemplative inquiry rubrics have been populated with sample marks.',
    time: '45m ago',
    unread: true,
    symbol: '▥',
  },
  {
    id: 'guest-5',
    category: 'mentors',
    title: 'Pedagogical inquiry from Elder Somaratne',
    message:
      '“Notice how the children settle when the morning bell sounds twice instead of once.”',
    time: '2h ago',
    unread: true,
    symbol: '📊',
  },
  {
    id: 'guest-6',
    category: 'mentors',
    title: 'Mentorship circle gathering at Dawn',
    message:
      'Weekly reflection on balancing quiet focus with playful exploration in primary classrooms.',
    time: 'Yesterday',
    unread: false,
    symbol: '🧭',
  },
  {
    id: 'guest-7',
    category: 'achievements',
    title: 'Mindfulness streak milestone reached',
    message:
      'Your classroom circle maintained a 5-day continuous morning breath reflection streak.',
    time: 'Yesterday',
    unread: false,
    symbol: '♥',
  },
  {
    id: 'guest-8',
    category: 'achievements',
    title: 'Sanctuary Gateway Ready',
    message:
      'Ready to join live accredited classroom circles with synchronized records? Enter Sanctuary anytime.',
    time: '1h ago',
    unread: false,
    symbol: '🎓',
  },
];

interface NotificationsFloorProps {
  displayName: string;
  isExplore?: boolean;
}

export function NotificationsFloor({ displayName, isExplore = false }: NotificationsFloorProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    isExplore ? guestNotifications : initialNotifications,
  );
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
    <SanctuaryFloorCanvas
      domain="notifications"
      titleId="notifications-title"
      furnitureItems={NOTIFICATIONS_FURNITURE_ITEMS}
    >
      {({ isModuleVisible }) => (
        <div className={styles.container}>
          {/* Header bar */}
          {isModuleVisible('notif-header') && (
            <div className={styles.headerBar}>
              <div className={styles.titleArea}>
                <h1 id="notifications-title">Notifications Center</h1>
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
          )}

          {/* Category filters */}
          {isModuleVisible('notif-filters') && (
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
          )}

          {/* Notifications list */}
          {isModuleVisible('notif-feed') &&
            (filtered.length === 0 ? (
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
            ))}
        </div>
      )}
    </SanctuaryFloorCanvas>
  );
}
