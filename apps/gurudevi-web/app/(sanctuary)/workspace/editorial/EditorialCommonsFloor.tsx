'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  CANONICAL_EDITORIAL_DRAFTS,
} from '../../../../lib/domain/adapters/editorial/editorialHexagonalService';
import type { EditorialContentKind, SchoolEditorialDraft } from '../../../../lib/domain/ports/editorial.port';
import styles from './editorial.module.css';

type EditorialCommonsFloorProps = Readonly<{
  mode: 'account' | 'explore';
  subjectId?: string;
}>;

export function EditorialCommonsFloor({ mode }: EditorialCommonsFloorProps) {
  const [filter, setFilter] = useState<string>('all');
  const [articles] = useState<readonly SchoolEditorialDraft[]>(CANONICAL_EDITORIAL_DRAFTS);

  const filtered = filter === 'all'
    ? articles
    : articles.filter((a) => a.kind === filter);

  return (
    <article className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Editorial Commons</h1>
          <Link href="/workspace" className={styles.backLink}>
            ← Workspace
          </Link>
        </div>
        <p className={styles.subtitle}>
          Sovereign student journalism, society chronicles, and co-curricular media.
          Every published article is linked to the student reporter&apos;s verified scholarly dossier.
        </p>
      </header>

      <nav className={styles.filterBar} aria-label="Editorial filter">
        {[
          { id: 'all', label: 'All Chronicles' },
          { id: 'match_report', label: '🏏 Match Reports' },
          { id: 'honors', label: '🏆 Honors & Olympiads' },
          { id: 'society_journal', label: '🔬 Society Journals' },
          { id: 'original', label: '✍️ Original Essays' },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            className={`${styles.filterPill} ${filter === f.id ? styles.filterPillActive : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </nav>

      <section className={styles.grid} aria-label="Articles list">
        {filtered.map((article) => {
          const statusClass =
            article.status === 'published'
              ? styles.statusPublished
              : article.status === 'approved'
                ? styles.statusApproved
                : styles.statusInReview;

          return (
            <div key={article.id} className={styles.articleCard}>
              <div className={styles.articleMeta}>
                <div className={styles.cardHeader}>
                  <span className={styles.kindTag}>{article.kind.replace('_', ' ')}</span>
                  <span className={`${styles.statusTag} ${statusClass}`}>
                    {article.status}
                  </span>
                </div>
                <h2 className={styles.articleTitle}>{article.title}</h2>
                <p className={styles.articleSummary}>{article.summary}</p>
              </div>

              <div className={styles.authorRow}>
                <div className={styles.authorInfo}>
                  <span className={styles.authorName}>✒️ {article.authorName}</span>
                  <span className={styles.subEntity}>{article.subEntityName}</span>
                </div>
                <span className={styles.dateText}>
                  {new Date(article.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          );
        })}
      </section>
    </article>
  );
}
