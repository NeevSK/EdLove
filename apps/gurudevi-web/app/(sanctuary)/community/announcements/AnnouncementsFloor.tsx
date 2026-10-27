'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import type { CommunityAnnouncement } from '../../../../lib/community/announcements-contract';
import styles from '../community.module.css';

interface AnnouncementsFloorProps {
  announcements: readonly CommunityAnnouncement[];
  displayName?: string;
  isExplore?: boolean;
}

function formatDate(iso: string): string {
  try {
    const diffMs = Date.now() - new Date(iso).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(iso).toLocaleDateString();
  } catch {
    return 'Recently';
  }
}

export function AnnouncementsFloor({
  announcements: initialAnnouncements,
  displayName = 'Seeker',
  isExplore = false,
}: Readonly<AnnouncementsFloorProps>) {
  const [announcements, setAnnouncements] = useState<readonly CommunityAnnouncement[]>(initialAnnouncements);

  const pinned = announcements.filter((a) => a.isPinned);
  const regular = announcements.filter((a) => !a.isPinned);

  return (
    <main className={styles.floor} id="main-content">
      {/* Subnav Navigation */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <Link
          href="/community"
          style={{
            padding: '0.4rem 1rem',
            borderRadius: '9999px',
            border: '1px solid var(--line)',
            background: 'var(--paper-light)',
            color: 'var(--ink-soft)',
            fontSize: '0.85rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          ← Circles & Discussions
        </Link>
        <span
          style={{
            padding: '0.4rem 1rem',
            borderRadius: '9999px',
            background: 'var(--color-action, #a85022)',
            color: '#fff',
            fontSize: '0.85rem',
            fontWeight: 700,
          }}
        >
          📢 Broadcaster Updates
        </span>
      </div>

      {/* Hero Header */}
      <section className={styles.circleStreamBanner} style={{ marginBottom: '2rem' }}>
        <div className={styles.circleStreamMeta}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '2rem' }}>📢</span>
            <div>
              <h1 className={styles.circleStreamTitle}>The Broadcaster</h1>
              <p className={styles.circleStreamDescription}>
                School-wide resonance, guidance directives, and critical updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pinned Broadcasts */}
      {pinned.length > 0 && (
        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span>📌</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--color-action, #a85022)' }}>
              Pinned to Sanctuary Top
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pinned.map((item) => (
              <article
                key={item.id}
                style={{
                  padding: '1.5rem',
                  borderRadius: '1.25rem',
                  border: '1px solid color-mix(in srgb, var(--color-action, #a85022) 30%, var(--line))',
                  background: 'color-mix(in srgb, var(--color-action, #a85022) 5%, var(--paper-light))',
                  boxShadow: '0 2px 8px color-mix(in srgb, var(--ink) 4%, transparent)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--ink)' }}>{item.authorName}</strong>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', padding: '0.15rem 0.5rem', borderRadius: '9999px', background: 'var(--color-action, #a85022)', color: '#fff' }}>
                      Authority
                    </span>
                  </div>
                  <time style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>{formatDate(item.createdAt)}</time>
                </div>
                <p style={{ margin: 0, fontSize: '1rem', lineHeight: '1.65', color: 'var(--ink)' }}>{item.content}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Recent Streams */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <span>🌐</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>
            Recent Streams & Bulletins
          </span>
        </div>

        {regular.length === 0 ? (
          <div className={styles.emptyPostState}>
            <span className={styles.emptyIcon}>🕊️</span>
            <h3>No bulletins right now</h3>
            <p>Check back when new notices or school-wide directions are published.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {regular.map((item) => (
              <article key={item.id} className={styles.postCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--ink)' }}>{item.authorName}</strong>
                    <span className={styles.authorRolePill}>Broadcast</span>
                  </div>
                  <time style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>{formatDate(item.createdAt)}</time>
                </div>
                <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--ink)' }}>{item.content}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
