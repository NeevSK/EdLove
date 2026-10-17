'use client';

import { planBridgeAPI } from '@repo/core/api/planBridge';
import type { PlanNotice } from '@repo/core/api/planBridge.orpc.contract';
import { DEFAULT_SCHOOL_TIMEZONE, formatLocal } from '@repo/core/logic/modes/schedule';
import React, { useEffect, useState } from 'react';
import styles from './notices.module.css';

interface NoticesFloorProps {
  displayName: string;
  initialCapacity?: string | null;
}

export function NoticesFloor({ displayName, initialCapacity }: Readonly<NoticesFloorProps>) {
  const [notices, setNotices] = useState<PlanNotice[]>([]);
  const [filter, setFilter] = useState<'all' | 'sent' | 'scheduled'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNotices() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await planBridgeAPI.listNotices({});
        setNotices(data);
      } catch (err: any) {
        setError(err?.message || 'Could not load school notices.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchNotices();
  }, []);

  const filteredNotices = notices.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'sent') return n.status === 'sent';
    if (filter === 'scheduled') return n.status === 'scheduled';
    return true;
  });

  return (
    <div className={styles.container}>
      <header className={styles.headerBar}>
        <div className={styles.titleArea}>
          <h1>School Circulars & Notices</h1>
          <p>
            Institutional announcements and grade class communications delivered during calm waking
            hours.
          </p>
        </div>

        <div className={styles.filterTabs}>
          <button
            type="button"
            className={styles.filterTab}
            aria-selected={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            All Notices ({notices.length})
          </button>
          <button
            type="button"
            className={styles.filterTab}
            aria-selected={filter === 'sent'}
            onClick={() => setFilter('sent')}
          >
            Released ({notices.filter((n) => n.status === 'sent').length})
          </button>
          <button
            type="button"
            className={styles.filterTab}
            aria-selected={filter === 'scheduled'}
            onClick={() => setFilter('scheduled')}
          >
            Scheduled ({notices.filter((n) => n.status === 'scheduled').length})
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className={styles.emptyState}>Loading notices…</div>
      ) : error ? (
        <div className={styles.emptyState} style={{ color: '#dc2626' }}>
          {error}
        </div>
      ) : filteredNotices.length === 0 ? (
        <div className={styles.emptyState}>No notices found in this view.</div>
      ) : (
        <div className={styles.feedList}>
          {filteredNotices.map((n) => {
            const timeLabel = n.sent_at
              ? formatLocal(new Date(n.sent_at), DEFAULT_SCHOOL_TIMEZONE)
              : n.send_at
                ? `Releasing ${formatLocal(new Date(n.send_at), DEFAULT_SCHOOL_TIMEZONE)}`
                : 'Draft';

            return (
              <article key={n.id} className={styles.noticeCard}>
                <div className={styles.noticeHeader}>
                  <h2 className={styles.noticeTitle}>{n.title}</h2>
                  <div className={styles.noticeMeta}>
                    {n.override_reason ? (
                      <span className={`${styles.badge} ${styles.emergencyBadge}`}>
                        Priority Broadcast
                      </span>
                    ) : null}
                    <span className={styles.badge}>{n.grade_class_name || 'School Notice'}</span>
                  </div>
                </div>

                <p className={styles.noticeContent}>{n.body}</p>

                <footer className={styles.noticeFooter}>
                  <span>{timeLabel}</span>
                  {n.recipient_count ? (
                    <span>
                      Delivered to {n.recipient_count}{' '}
                      {n.recipient_count === 1 ? 'guardian' : 'guardians'}
                    </span>
                  ) : (
                    <span>Status: {n.status}</span>
                  )}
                </footer>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
