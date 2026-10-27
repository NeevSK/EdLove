'use client';

import { getSandboxSamples } from '@repo/core/api/sandboxDataset';
import type { MockDocumentOutlineItem as DocumentOutlineItem } from '@repo/core/api/library';
import { orpcClient } from '@repo/core/api/orpcClient';
import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';
import styles from './reader.module.css';

interface PDFReaderFloorProps {
  bookId: string;
  displayName: string;
  capacity?: string;
}

type ReadingTheme = 'vellum' | 'sepia' | 'midnight';



interface ReaderAnnotation {
  id: string;
  page: number;
  text: string;
  timestamp: string;
}

export function PDFReaderFloor({ bookId, displayName, capacity }: Readonly<PDFReaderFloorProps>) {
  // Reading state
  const [theme, setTheme] = useState<ReadingTheme>('vellum');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(24);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [zenMode, setZenMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<'contents' | 'notes'>('contents');
  const [bookmarked, setBookmarked] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<ReaderAnnotation[]>([]);
  const [newAnnotation, setNewAnnotation] = useState('');

  // Load persisted reader desk settings on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`gurudevi_reader_${bookId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.page && typeof parsed.page === 'number') setCurrentPage(parsed.page);
        if (parsed.theme && ['vellum', 'sepia', 'midnight'].includes(parsed.theme)) setTheme(parsed.theme);
        if (parsed.zoomLevel && typeof parsed.zoomLevel === 'number') setZoomLevel(parsed.zoomLevel);
        if (Array.isArray(parsed.annotations)) setAnnotations(parsed.annotations);
      }
    } catch {
      // Storage read fallback
    }
  }, [bookId]);

  // Persist reading position & settings
  useEffect(() => {
    try {
      localStorage.setItem(
        `gurudevi_reader_${bookId}`,
        JSON.stringify({
          page: currentPage,
          theme,
          zoomLevel,
          annotations,
        })
      );
    } catch {
      // Storage fallback
    }
  }, [bookId, currentPage, theme, zoomLevel, annotations]);

  // Document metadata state
  const demoResource = getSandboxSamples<any[]>('library', 'getResources', [], []).find((r) => r.id === bookId);
  const [documentTitle, setDocumentTitle] = useState(
    demoResource?.title ?? `Educational Circular & Curriculum Specification (${bookId})`
  );
  const [documentUrl, setDocumentUrl] = useState(demoResource?.url ?? '/sample-curriculum.pdf');
  const [documentDescription, setDocumentDescription] = useState(
    demoResource?.description ?? 'Official Department of Educational Publications Edition • Verified Curriculum'
  );
  const [isVerified, setIsVerified] = useState(true);

  // Document outline from registered sandbox dataset
  const outline: DocumentOutlineItem[] = getSandboxSamples<DocumentOutlineItem[]>('library', 'getDocumentOutlines', [], []);

  // Fetch document details from live oRPC
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await orpcClient.library.getResource({ params: { id: bookId } });
        if (!active || !res) return;
        if (res.title) setDocumentTitle(res.title);
        if (res.description) setDocumentDescription(res.description);
        if (res.url) setDocumentUrl(res.url);
        if (typeof res.verified === 'boolean') setIsVerified(res.verified);
        if (typeof (res as any).has_bookmarked === 'boolean') {
          setBookmarked((res as any).has_bookmarked);
        }

        // Record authentic reading engagement
        void orpcClient.library.engage({
          params: { id: bookId },
          body: { engagement_type: 'use' },
        }).catch(() => {});
      } catch {
        // Fall back gracefully to defaults for offline / explore mode
      }
    })();
    return () => {
      active = false;
    };
  }, [bookId]);

  // Keyboard navigation for page flipping & zen mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
      } else if (e.key.toLowerCase() === 'z') {
        setZenMode((prev) => !prev);
      } else if (e.key === 'Escape' && zenMode) {
        setZenMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalPages, zenMode]);

  const toggleBookmark = async () => {
    const next = !bookmarked;
    setBookmarked(next);
    setNotice(
      next ? 'Document saved to your personal reading list' : 'Document removed from reading list'
    );
    try {
      await orpcClient.library.engage({
        params: { id: bookId },
        body: { engagement_type: 'bookmark', toggle: true },
      });
    } catch {
      // Local state preserved
    }
    setTimeout(() => setNotice(null), 3000);
  };

  const jumpToPage = (target: number) => {
    if (!Number.isFinite(target)) return;
    const clamped = Math.min(Math.max(Math.floor(target), 1), Math.max(totalPages, 1));
    setCurrentPage(clamped);
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(Math.max(prev + delta, 50), 250));
  };

  const openNativeWindow = () => {
    window.open(documentUrl, '_blank', 'noopener,noreferrer');
  };

  const themeClass =
    theme === 'sepia'
      ? styles.themeSepia
      : theme === 'midnight'
        ? styles.themeMidnight
        : styles.themeVellum;

  return (
    <article
      aria-label="Document Reading Area"
      className={`${styles.readerShell} ${themeClass}`}
      role="region"
    >
      {/* Top Desk Controls */}
      {!zenMode && (
        <header className={styles.readingDesk}>
          <div className={styles.titleArea}>
            <Link className={styles.backLink} href="/library">
              ← Back to Sanctuary Library
            </Link>
            <h1 className={styles.documentHeading}>{documentTitle}</h1>
            <p className={styles.documentSub}>
              {documentDescription}
              {isVerified && <span className={styles.verifiedBadge}>✓ Verified Curriculum</span>}
            </p>
          </div>

          <div className={styles.toolbarRow}>
            {/* Outline Toggle */}
            <div className={styles.toolGroup}>
              <button
                aria-expanded={sidebarOpen}
                aria-label="Toggle Table of Contents"
                className={`${styles.actionBtn} ${sidebarOpen ? styles.actionBtnActive : ''}`}
                onClick={() => setSidebarOpen((prev) => !prev)}
                type="button"
              >
                📑 <span>Outline</span>
              </button>
            </div>

            {/* Page Navigation */}
            <div aria-label="Page navigation" className={styles.toolGroup} role="group">
              <button
                aria-label="Previous page"
                className={styles.actionBtn}
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                type="button"
              >
                ‹
              </button>
              <span aria-live="polite" className={styles.pagePill}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                aria-label="Next page"
                className={styles.actionBtn}
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                type="button"
              >
                ›
              </button>
            </div>

            {/* Zoom Controls */}
            <div aria-label="Zoom controls" className={styles.toolGroup} role="group">
              <button
                aria-label="Zoom out"
                className={styles.actionBtn}
                disabled={zoomLevel <= 60}
                onClick={() => handleZoom(-15)}
                type="button"
              >
                −
              </button>
              <span className={styles.pagePill}>{zoomLevel}%</span>
              <button
                aria-label="Zoom in"
                className={styles.actionBtn}
                disabled={zoomLevel >= 200}
                onClick={() => handleZoom(15)}
                type="button"
              >
                +
              </button>
              <button
                aria-label="Reset zoom to 100%"
                className={styles.actionBtn}
                onClick={() => setZoomLevel(100)}
                title="Fit Width"
                type="button"
              >
                Fit
              </button>
            </div>

            {/* Reading Theme Selector */}
            <div aria-label="Reading atmosphere" className={styles.toolGroup} role="group">
              <button
                aria-label="Vellum paper day mode"
                className={`${styles.actionBtn} ${theme === 'vellum' ? styles.actionBtnActive : ''}`}
                onClick={() => setTheme('vellum')}
                title="Day Paper (Vellum)"
                type="button"
              >
                ☀️
              </button>
              <button
                aria-label="Sepia candlelight mode"
                className={`${styles.actionBtn} ${theme === 'sepia' ? styles.actionBtnActive : ''}`}
                onClick={() => setTheme('sepia')}
                title="Candlelight (Sepia)"
                type="button"
              >
                🕯️
              </button>
              <button
                aria-label="Midnight charcoal mode"
                className={`${styles.actionBtn} ${theme === 'midnight' ? styles.actionBtnActive : ''}`}
                onClick={() => setTheme('midnight')}
                title="Midnight (Charcoal)"
                type="button"
              >
                🌙
              </button>
            </div>

            {/* Bookmark & Actions */}
            <div className={styles.toolGroup}>
              <button
                aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this document'}
                aria-pressed={bookmarked}
                className={`${styles.actionBtn} ${bookmarked ? styles.actionBtnActive : ''}`}
                onClick={toggleBookmark}
                type="button"
              >
                {bookmarked ? '★ Bookmarked' : '☆ Bookmark'}
              </button>
              <button
                aria-label="Distraction-free zen reading mode"
                className={styles.actionBtn}
                onClick={() => setZenMode(true)}
                title="Zen Mode (Press Z)"
                type="button"
              >
                ⛶ Zen
              </button>
              <button
                aria-label="Open in external native tab or downloader"
                className={styles.actionBtn}
                onClick={openNativeWindow}
                type="button"
              >
                ↗ External
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Floating Zen Exit Bar */}
      {zenMode && (
        <div style={{ position: 'absolute', top: '1rem', right: '1.5rem', zIndex: 100 }}>
          <button
            aria-label="Exit Zen Mode (Press Esc)"
            className={`${styles.actionBtn} ${styles.actionBtnActive}`}
            onClick={() => setZenMode(false)}
            style={{ borderRadius: '999px', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}
            type="button"
          >
            ✕ Exit Zen Mode (Esc)
          </button>
        </div>
      )}

      {/* Main Stage */}
      <div className={styles.readerStage}>
        {/* Table of Contents Drawer */}
        {sidebarOpen && !zenMode && (
          <aside aria-label="Study Companion" className={styles.studySidebar}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid rgba(104, 94, 85, 0.15)', paddingBottom: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setSidebarTab('contents')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: sidebarTab === 'contents' ? 'var(--color-action, #a85022)' : 'inherit',
                  borderBottom: sidebarTab === 'contents' ? '2px solid var(--color-action, #a85022)' : 'none',
                  paddingBottom: '0.25rem',
                }}
              >
                📑 Contents
              </button>
              <button
                type="button"
                onClick={() => setSidebarTab('notes')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: sidebarTab === 'notes' ? 'var(--color-action, #a85022)' : 'inherit',
                  borderBottom: sidebarTab === 'notes' ? '2px solid var(--color-action, #a85022)' : 'none',
                  paddingBottom: '0.25rem',
                }}
              >
                ✏️ Notes Desk ({annotations.length})
              </button>
            </div>

            {sidebarTab === 'contents' ? (
              <nav className={styles.chapterNav}>
                {outline.map((item) => (
                  <button
                    key={item.id}
                    className={`${styles.chapterBtn} ${
                      currentPage >= item.page && currentPage < item.page + 6
                        ? styles.chapterBtnActive
                        : ''
                    }`}
                    onClick={() => jumpToPage(item.page)}
                    type="button"
                  >
                    {item.title}
                  </button>
                ))}
              </nav>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const trimmed = newAnnotation.trim();
                    if (!trimmed || trimmed.length > 2000) return;
                    const item: ReaderAnnotation = {
                      id: String(Date.now()),
                      page: currentPage,
                      text: trimmed,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    };
                    setAnnotations((prev) => [...prev, item]);
                    setNewAnnotation('');
                    void orpcClient.library.engage({
                      params: { id: bookId },
                      body: { engagement_type: 'use' },
                    }).catch(() => {});
                  }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}
                >
                  <input
                    type="text"
                    maxLength={1000}
                    placeholder={`Annotation on page ${currentPage}…`}
                    value={newAnnotation}
                    onChange={(e) => setNewAnnotation(e.target.value)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: '0.4rem',
                      border: '1px solid rgba(104, 94, 85, 0.2)',
                      background: 'var(--color-paper, #f7f2e8)',
                      fontSize: '0.8rem',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: '0.4rem',
                      borderRadius: '0.4rem',
                      background: 'var(--color-action, #a85022)',
                      color: '#fff',
                      border: 'none',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Pin Note to Page {currentPage}
                  </button>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '240px', overflowY: 'auto' }}>
                  {annotations.length === 0 ? (
                    <p style={{ fontSize: '0.75rem', opacity: 0.6, margin: 0 }}>
                      No annotations yet. Write reflections as you study!
                    </p>
                  ) : (
                    annotations.map((ann) => (
                      <div
                        key={ann.id}
                        onClick={() => setCurrentPage(ann.page)}
                        style={{
                          padding: '0.5rem 0.65rem',
                          borderRadius: '0.4rem',
                          background: 'rgba(104, 94, 85, 0.08)',
                          fontSize: '0.775rem',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                        }}
                      >
                        <div>
                          <strong style={{ color: 'var(--color-action, #a85022)', display: 'block', marginBottom: '0.2rem' }}>
                            Page {ann.page}
                          </strong>
                          <span>{ann.text}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAnnotations((prev) => prev.filter((a) => a.id !== ann.id));
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#888',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            padding: '0 0.2rem',
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(104, 94, 85, 0.12)' }}>
              <p style={{ fontSize: '0.75rem', opacity: 0.7, margin: 0, lineHeight: 1.4 }}>
                💡 Tip: Use <kbd style={{ padding: '0.1rem 0.3rem', borderRadius: '3px', background: 'rgba(104,94,85,0.15)' }}>←</kbd> and <kbd style={{ padding: '0.1rem 0.3rem', borderRadius: '3px', background: 'rgba(104,94,85,0.15)' }}>→</kbd> keys to flip pages smoothly.
              </p>
            </div>
          </aside>
        )}

        {/* Document Canvas */}
        <div className={styles.canvasArea}>
          <div
            className={styles.documentIframeWrapper}
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center',
            }}
          >
            <iframe
              className={styles.documentIframe}
              src={`${documentUrl}#page=${currentPage}&toolbar=0&navpanes=0`}
              title={`${documentTitle} - Page ${currentPage}`}
            />
          </div>
        </div>
      </div>

      {/* Toast Announcement */}
      {notice && (
        <div aria-live="polite" className={styles.toastNotice} role="status">
          ✓ {notice}
        </div>
      )}
    </article>
  );
}
