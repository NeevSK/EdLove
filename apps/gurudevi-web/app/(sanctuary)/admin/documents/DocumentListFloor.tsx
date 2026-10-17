'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import styles from './documents.module.css';

interface DocumentItem {
  id: string;
  title: string;
  category: 'circular' | 'curriculum' | 'administrative' | 'policy';
  issueDate: string;
  status: 'published' | 'review';
  documentNo: string;
}

const initialDocs: DocumentItem[] = [
  {
    id: 'doc-1',
    title: 'National Guidelines for Mindfulness & Contemplative Education in Schools',
    category: 'policy',
    issueDate: '2026-09-15',
    status: 'published',
    documentNo: 'MOE/CIRC/2026/41',
  },
  {
    id: 'doc-2',
    title: 'Grade 10 Ecology & Biological Diversity Curricular Specification',
    category: 'curriculum',
    issueDate: '2026-08-20',
    status: 'published',
    documentNo: 'NIE/SYLL/BIO/G10',
  },
  {
    id: 'doc-3',
    title: 'Inter-School Learning Forest & Community Exchange Protocols',
    category: 'administrative',
    issueDate: '2026-10-01',
    status: 'published',
    documentNo: 'SANCT/ADMIN/2026/08',
  },
  {
    id: 'doc-4',
    title: 'Draft: Student Voice Journal Privacy & PDPA Compliance Directives',
    category: 'policy',
    issueDate: '2026-10-05',
    status: 'review',
    documentNo: 'SANCT/LEGAL/PDPA/DRAFT',
  },
];

interface DocumentListFloorProps {
  displayName: string;
  capacity?: string;
}

export function DocumentListFloor({ displayName, capacity }: Readonly<DocumentListFloorProps>) {
  const [filter, setFilter] = useState<'all' | 'circular' | 'curriculum' | 'policy'>('all');

  const filteredDocs = initialDocs.filter((d) => {
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
