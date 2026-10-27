'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { getSandboxSamples } from '@repo/core/api/sandboxDataset';
import type { MockOfficialCircularDoc as DocumentItem } from '@repo/core/api/formTemplates';
import styles from './documents.module.css';

interface DocumentListFloorProps {
  displayName: string;
  capacity?: string;
}

export function DocumentListFloor({ displayName, capacity }: Readonly<DocumentListFloorProps>) {
  const [filter, setFilter] = useState<'all' | 'circular' | 'curriculum' | 'policy'>('all');
  const [documents] = useState<readonly DocumentItem[]>(() =>
    getSandboxSamples<DocumentItem[]>('documents', 'getOfficialCirculars', [], []),
  );

  const filteredDocs = documents.filter((d) => {
    if (filter === 'all') return true;
    return d.category === filter;
  });

  return (
    <div className={styles.container}>
      <header className={styles.headerBar}>
        <div className={styles.titleArea}>
          <div style={{ marginBottom: '0.25rem' }}>
            <Link
              href="/workspace"
              style={{
                fontSize: '0.75rem',
                fontWeight: 650,
                color: 'var(--color-action, #a85022)',
                textDecoration: 'none',
              }}
            >
              ← Back to Sanctuary
            </Link>
          </div>
          <h1>Educational Circulars & Document Repository</h1>
          <p>
            Official school circulars, national curricula specifications, and governance directives.
          </p>
        </div>

        <div className={styles.filterBar}>
          {(['all', 'circular', 'curriculum', 'policy'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              className={styles.filterBtn}
              data-active={filter === cat}
              onClick={() => setFilter(cat)}
            >
              {cat === 'all' ? 'All Documents' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </header>

      <div className={styles.docsList}>
        {filteredDocs.map((doc) => (
          <div key={doc.id} className={styles.docItem}>
            <div className={styles.docMeta}>
              <span className={styles.docTitle}>{doc.title}</span>
              <span className={styles.docSub}>
                {doc.documentNo} • Issued {doc.issueDate} • Category: {doc.category.toUpperCase()}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span
                className={
                  doc.status === 'published' ? styles.statusPublished : styles.statusReview
                }
              >
                {doc.status.toUpperCase()}
              </span>
              <Link
                href="/library/reader/mangroves"
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 650,
                  color: 'var(--color-action, #a85022)',
                  textDecoration: 'none',
                }}
              >
                View PDF ↗
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
