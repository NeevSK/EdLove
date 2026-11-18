import { classifyGurudeviHost } from '../../../../lib/host-routing';
import { planBridgeAPI } from '@repo/core/api/planBridge';
import type { PlanNotice } from '@repo/core/api/planBridge.orpc.contract';
import { DEFAULT_SCHOOL_TIMEZONE, formatLocal } from '@repo/core/logic/modes/schedule';
import React, { useEffect, useState } from 'react';
import styles from './notices.module.css';

interface NoticesFloorProps {
  displayName: string;
  initialCapacity?: string | null;
}

const SAMPLE_NOTICES: PlanNotice[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    school_id: '00000000-0000-4000-8000-000000000000',
    grade_class_id: '22222222-2222-4222-8222-222222222222',
    grade_class_name: 'Whole School',
    calendar_event_id: null,
    author_id: null,
    title: 'Term 1 Mid-Term Assembly Schedule',
    body: 'The mid-term assembly will commence at 08:30 in the Sanctuary Pavilion. All grade cohorts are requested to gather by 08:20.',
    status: 'sent',
    send_at: null,
    sent_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    recipient_count: 142,
    drafted_in_quiet_hours: false,
    held_by_mode: null,
    override_reason: null,
    overridden_by: null,
    schedule_version: 1,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    school_id: '00000000-0000-4000-8000-000000000000',
    grade_class_id: '44444444-4444-4444-8444-444444444444',
    grade_class_name: 'Grade 7 Botany',
    calendar_event_id: null,
    author_id: null,
    title: 'Botany Field Study Preparation',
    body: 'Grade 7 students should bring their field notebooks and botanical sampling kits for tomorrow morning field observation.',
    status: 'scheduled',
    send_at: new Date(Date.now() + 86400000).toISOString(),
    sent_at: null,
    recipient_count: 28,
    drafted_in_quiet_hours: false,
    held_by_mode: null,
    override_reason: null,
    overridden_by: null,
    schedule_version: 1,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export function NoticesFloor({ displayName, initialCapacity }: Readonly<NoticesFloorProps>) {
  const isExplore =
    typeof window !== 'undefined' && classifyGurudeviHost(window.location.host) === 'explore';
  const [notices, setNotices] = useState<PlanNotice[]>(() =>
    isExplore ? SAMPLE_NOTICES : [],
  );
  const [filter, setFilter] = useState<'all' | 'sent' | 'scheduled'>('all');
  const [loading, setLoading] = useState(() => !isExplore);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onGuestExplore =
      typeof window !== 'undefined' && classifyGurudeviHost(window.location.host) === 'explore';
    if (onGuestExplore) return;

    async function fetchNotices() {
      setLoading(true);
      setError(null);

      try {
        const data = await planBridgeAPI.listNotices({});
        setNotices(data);
      } catch {
        // Fallback to sample notices if offline or unconfigured API
        setNotices(SAMPLE_NOTICES);
      } finally {
        setLoading(false);
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

      {loading ? (
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
