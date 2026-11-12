'use client';

import { useState } from 'react';
import type { FurnitureDefinition } from '../components/FloorStudioDrawer';
import { SanctuaryFloorCanvas } from '../components/SanctuaryFloorCanvas';
import type { NotificationItem } from './notificationFeed';
import styles from './notifications.module.css';

const NOTIFICATIONS_FURNITURE_ITEMS: readonly FurnitureDefinition[] = [
  { id: 'notif-header', label: 'Announcements Overview', icon: '📢' },
  { id: 'notif-filters', label: 'Category Filter Tabs', icon: '🏷️' },
  { id: 'notif-feed', label: 'Live Notification Stream', icon: '🔔' },
];

type NotificationCategory = 'all' | 'classrooms' | 'mentors' | 'system' | 'achievements';

interface NotificationsFloorProps {
  displayName: string;
  notifications: readonly NotificationItem[];
}

export function NotificationsFloor({ displayName, notifications: feed }: NotificationsFloorProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => [...feed]);
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
