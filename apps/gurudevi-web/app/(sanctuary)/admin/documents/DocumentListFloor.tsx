'use client';

import { getSandboxSamples } from '@repo/core/logic/modes/sandboxDataset';
import {
  Button,
  Chip,
  Section,
  Surface,
  Text,
} from '@repo/ui/components/web';
import Link from 'next/link';
import React, { useState } from 'react';
import type { FurnitureDefinition } from '../../components/FloorStudioDrawer';
import { SanctuaryFloorCanvas } from '../../components/SanctuaryFloorCanvas';
import styles from './documents.module.css';

interface DocumentListFloorProps {
  displayName: string;
  capacity?: string;
}

type DocumentItem = Readonly<{
  id: string;
  title: string;
  documentNo: string;
  issueDate: string;
  category: 'circular' | 'curriculum' | 'policy';
  status: 'published' | 'review';
}>;

const DOCUMENTS_FURNITURE_ITEMS: readonly FurnitureDefinition[] = [
  { id: 'header', label: 'Circular Repository Header & Filters', icon: '📜' },
  { id: 'list', label: 'Official Circular Documents Ledger', icon: '📑' },
];

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
    <SanctuaryFloorCanvas domain="workspace" furnitureItems={DOCUMENTS_FURNITURE_ITEMS}>
      {({ isModuleVisible }) => (
        <div className={styles.container}>
          {isModuleVisible('header') && (
            <Surface tone="raised" className={styles.headerBar}>
              <div className={styles.titleArea}>
                <div style={{ marginBottom: '0.25rem' }}>
                  <Link href="/workspace" style={{ textDecoration: 'none' }}>
                    <Button variant="quiet" size="sm" label="← Back to Sanctuary" />
                  </Link>
                </div>
                <Text kind="title" tone="ink">Educational Circulars & Document Repository</Text>
                <Text kind="body" tone="soft">
                  Official school circulars, national curricula specifications, and governance directives.
                </Text>
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
            </Surface>
          )}

          {isModuleVisible('list') && (
            <div className={styles.docsList}>
              {filteredDocs.map((doc) => (
                <Surface key={doc.id} tone="raised" className={styles.docItem}>
                  <div className={styles.docMeta}>
                    <Text kind="title" tone="ink" className={styles.docTitle}>{doc.title}</Text>
                    <Text kind="caption" tone="soft" className={styles.docSub}>
                      {doc.documentNo} • Issued {doc.issueDate} • Category: {doc.category.toUpperCase()}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span
                      className={
                        doc.status === 'published' ? styles.statusPublished : styles.statusReview
                      }
                    >
                      {doc.status.toUpperCase()}
                    </span>
                  </div>
                </Surface>
              ))}
            </div>
          )}
        </div>
      )}
    </SanctuaryFloorCanvas>
  );
}
