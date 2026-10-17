'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import styles from './reader.module.css';

interface PDFReaderFloorProps {
  bookId: string;
  displayName: string;
  capacity?: string;
}

export function PDFReaderFloor({ bookId, displayName, capacity }: Readonly<PDFReaderFloorProps>) {
  const [bookmarked, setBookmarked] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const documentTitle =
    bookId === 'mangroves'
      ? 'Field Guide to Sri Lankan Mangrove Ecosystems'
      : bookId === 'classical-verse'
        ? 'Anthology of Classical Sinhala & Tamil Epics'
        : `Educational Circular & Curriculum Specification (${bookId})`;

  const samplePdfUrl = '/sample-curriculum.pdf';

  const toggleBookmark = () => {
    const next = !bookmarked;
    setBookmarked(next);
    setNotice(
      next ? 'Document saved to your personal reading list' : 'Document removed from reading list',
    );
    setTimeout(() => setNotice(null), 3000);
  };

  const openExternal = () => {
    window.open(samplePdfUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={styles.container}>
      <header className={styles.readerHeader}>
        <div className={styles.titleArea}>
          <div style={{ marginBottom: '0.25rem' }}>
            <Link
              href="/library"
              style={{
                fontSize: '0.75rem',
                fontWeight: 650,
                color: 'var(--color-action, #a85022)',
                textDecoration: 'none',
              }}
            >
              ← Back to Library
            </Link>
          </div>
          <h1>{documentTitle}</h1>
          <p>Official Department of Educational Publications Edition • Verified Curriculum</p>
        </div>

        <div className={styles.controls}>
          {notice && (
            <span style={{ fontSize: '0.75rem', color: '#2e5d32', fontWeight: 700 }}>
              ✓ {notice}
            </span>
          )}
          <button
            type="button"
            className={styles.ctrlBtn}
            onClick={toggleBookmark}
            aria-pressed={bookmarked}
          >
            {bookmarked ? '★ Bookmarked' : '☆ Bookmark'}
          </button>
          <button type="button" className={styles.ctrlBtn} onClick={openExternal}>
            ↗ Open in New Tab
          </button>
        </div>
      </header>

      <div className={styles.viewerFrame}>
        <iframe
          src={`${samplePdfUrl}#toolbar=1&navpanes=0`}
          title={documentTitle}
          className={styles.iframe}
        />
      </div>
    </div>
  );
}
