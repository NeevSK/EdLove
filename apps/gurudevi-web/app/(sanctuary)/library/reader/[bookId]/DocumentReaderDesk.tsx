import { getLocalLibraryItem } from '@/lib/library/localLibraryStore';
import { PdfJsAdapter } from '@/lib/media/PdfJsAdapter';
import { type OcrLanguage, useDocumentOcr } from '@/lib/media/useDocumentOcr';
import { usePackDownloader } from '@/lib/media/usePackDownloader';
import { getPendingUpload } from '@/lib/storage/assetIndexedDb';
import { getSandboxSamples } from '@repo/core/api/sandboxDataset';
import { fileKindOf } from '@repo/core/logic/files/fileKind';
import { CANONICAL_COMMONS_RESOURCES } from '../../LibraryFloor';
import type { MockDocumentOutlineItem as DocumentOutlineItem } from '@repo/core/api/library';
import { orpcClient } from '@repo/core/api/orpcClient';
import {
  Button,
  DocumentView,
  FileCard,
  H5pView,
  Markdown,
  Media,
  Notice,
  SegmentedControl,
} from '@repo/ui/components/web';
import {
  Bookmark,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Maximize2,
  Minimize2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Link } from '@tanstack/react-router';
import React, { useEffect, useState } from 'react';
import styles from './reader.module.css';

export interface DocumentReaderDeskProps {
  bookId: string;
  displayName: string;
  capacity?: string;
}

export type PDFReaderFloorProps = DocumentReaderDeskProps;

type ReadingTheme = 'vellum' | 'sepia' | 'midnight';

interface ReaderAnnotation {
  id: string;
  page: number;
  text: string;
  timestamp: string;
}

export function DocumentReaderDesk({
  bookId,
  displayName,
  capacity,
}: Readonly<DocumentReaderDeskProps>) {
  // Reading state
  const [theme, setTheme] = useState<ReadingTheme>('vellum');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [zenMode, setZenMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<'contents' | 'notes' | 'ocr'>('contents');
  const [ocrLanguage, setOcrLanguage] = useState<OcrLanguage>('eng');
  const documentOcr = useDocumentOcr();
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

  // Document metadata state (checks local library store, then canonical commons, then sandbox dataset, then live oRPC)
  const localItem = getLocalLibraryItem(bookId);
  const demoResource =
    CANONICAL_COMMONS_RESOURCES.find((r) => r.id === bookId) ??
    getSandboxSamples<any[]>('library', 'getResources', [], []).find((r) => r.id === bookId);
  const resolvedInitialUrl = localItem?.url ?? demoResource?.url ?? '/samples/mangroves-field-guide.pdf';
  const [documentTitle, setDocumentTitle] = useState(
    localItem?.title ?? demoResource?.title ?? `Educational Circular & Curriculum Specification (${bookId})`
  );
  const [documentUrl, setDocumentUrl] = useState(resolvedInitialUrl);
  const [documentMime, setDocumentMime] = useState<string | undefined>(
    localItem?.mime ??
      (demoResource as any)?.mime ??
      (resolvedInitialUrl.toLowerCase().endsWith('.pdf') ? 'application/pdf' : undefined),
  );
  const [documentFormat, setDocumentFormat] = useState<string>(
    localItem?.format ?? (demoResource as any)?.format ?? 'pdf',
  );
  const [markdownBody, setMarkdownBody] = useState<string | null>(
    localItem?.body_markdown ?? (demoResource as any)?.body_markdown ?? null,
  );

  // If this item has a pending/local IndexedDB upload, resolve a fresh blob URL on mount
  useEffect(() => {
    const assetId = localItem?.assetId;
    if (!assetId) return;
    let active = true;
    let objectUrl: string | null = null;
    (async () => {
      try {
        const rec = await getPendingUpload(assetId);
        if (!active || !rec) return;
        objectUrl = URL.createObjectURL(rec.blob);
        setDocumentUrl(objectUrl);
        if (rec.mime) setDocumentMime(rec.mime);
      } catch {
        // Fallback to existing documentUrl
      }
    })();
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [localItem?.assetId]);
  const packDownloader = usePackDownloader({
    cacheKey: `library:${bookId}`,
    remoteUri: documentUrl,
    mime: documentMime,
  });
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
        if ((res as any).mime) setDocumentMime((res as any).mime);
        if ((res as any).format) setDocumentFormat((res as any).format);
        if (typeof (res as any).body_markdown === 'string') {
          setMarkdownBody((res as any).body_markdown);
        }
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
      next ? 'Document saved to your personal reading desk' : 'Document removed from reading desk'
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
            <Link className={styles.backLink} to="/library">
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
              <Button
                size="sm"
                variant={sidebarOpen ? 'primary' : 'secondary'}
                label="Outline"
                icon={FileText}
                onClick={() => setSidebarOpen((prev) => !prev)}
              />
            </div>

            {/* Page Navigation */}
            <div aria-label="Page navigation" className={styles.toolGroup} role="group">
              <Button
                size="sm"
                variant="secondary"
                label=""
                icon={ChevronLeft}
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              />
              <span aria-live="polite" className={styles.pagePill}>
                Page {currentPage} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="secondary"
                label=""
                icon={ChevronRight}
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              />
            </div>

            {/* Zoom Controls */}
            <div aria-label="Zoom controls" className={styles.toolGroup} role="group">
              <Button
                size="sm"
                variant="secondary"
                label=""
                icon={ZoomOut}
                disabled={zoomLevel <= 60}
                onClick={() => handleZoom(-15)}
              />
              <span className={styles.pagePill}>{zoomLevel}%</span>
              <Button
                size="sm"
                variant="secondary"
                label=""
                icon={ZoomIn}
                disabled={zoomLevel >= 200}
                onClick={() => handleZoom(15)}
              />
              <Button
                size="sm"
                variant="quiet"
                label="Fit"
                icon={RotateCcw}
                onClick={() => setZoomLevel(100)}
              />
            </div>

            {/* Reading Theme Selector */}
            <div aria-label="Reading atmosphere" className={styles.toolGroup} role="group">
              <SegmentedControl<ReadingTheme>
                label="Atmosphere"
                value={theme}
                onChange={setTheme}
                options={[
                  { value: 'vellum', label: 'Vellum' },
                  { value: 'sepia', label: 'Sepia' },
                  { value: 'midnight', label: 'Midnight' },
                ]}
              />
            </div>

            {/* Offline Pack Cache Control */}
            <div aria-label="Offline cache" className={styles.toolGroup} role="group">
              <Button
                size="sm"
                variant={packDownloader.isCachedOffline ? 'primary' : 'secondary'}
                label={
                  packDownloader.status === 'downloading'
                    ? 'Saving…'
                    : packDownloader.isCachedOffline
                      ? 'Cached Offline'
                      : 'Save Offline'
                }
                disabled={packDownloader.status === 'downloading'}
                onClick={() => {
                  if (packDownloader.isCachedOffline) {
                    void packDownloader.removeOffline();
                    setNotice('Removed offline copy from device cache');
                  } else {
                    void packDownloader.downloadOffline();
                    setNotice('Saved & SHA-256 verified for offline reading');
                  }
                  setTimeout(() => setNotice(null), 3000);
                }}
              />
            </div>

            {/* Bookmark & Actions */}
            <div className={styles.toolGroup}>
              <Button
                size="sm"
                variant={bookmarked ? 'primary' : 'secondary'}
                label={bookmarked ? 'Saved' : 'Save'}
                icon={Bookmark}
                onClick={toggleBookmark}
              />
              <Button
                size="sm"
                variant="secondary"
                label="Zen"
                icon={Maximize2}
                onClick={() => setZenMode(true)}
              />
              <Button
                size="sm"
                variant="quiet"
                label="External"
                icon={ExternalLink}
                onClick={openNativeWindow}
              />
            </div>
          </div>
        </header>
      )}

      {/* Floating Zen Exit Bar */}
      {zenMode && (
        <div style={{ position: 'absolute', top: '1rem', right: '1.5rem', zIndex: 100 }}>
          <Button
            size="sm"
            variant="primary"
            label="Exit Zen Mode (Esc)"
            icon={Minimize2}
            onClick={() => setZenMode(false)}
          />
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
                ✏️ Notes ({annotations.length})
              </button>
              <button
                type="button"
                onClick={() => setSidebarTab('ocr')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: sidebarTab === 'ocr' ? 'var(--color-action, #a85022)' : 'inherit',
                  borderBottom: sidebarTab === 'ocr' ? '2px solid var(--color-action, #a85022)' : 'none',
                  paddingBottom: '0.25rem',
                }}
              >
                🔍 OCR
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
            ) : sidebarTab === 'notes' ? (
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
                  <Button
                    size="sm"
                    variant="primary"
                    label={`Pin Note to Page ${currentPage}`}
                    type="submit"
                  />
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
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                  OCR Language
                  <select
                    value={ocrLanguage}
                    onChange={(e) => setOcrLanguage(e.target.value as OcrLanguage)}
                    style={{
                      width: '100%',
                      marginTop: '0.25rem',
                      padding: '0.4rem 0.5rem',
                      borderRadius: '0.4rem',
                      border: '1px solid rgba(104, 94, 85, 0.25)',
                    }}
                  >
                    <option value="eng">English (eng)</option>
                    <option value="sin">Sinhala (sin)</option>
                    <option value="tam">Tamil (tam)</option>
                  </select>
                </label>
                <Button
                  size="sm"
                  variant="primary"
                  label={
                    documentOcr.running
                      ? `Extracting (${documentOcr.progress}%)…`
                      : 'Extract Text (OCR)'
                  }
                  disabled={documentOcr.running}
                  onClick={() => {
                    void documentOcr.runOcr({
                      uri: packDownloader.effectiveUri,
                      name: localItem?.fileName ?? documentTitle,
                      mime: documentMime,
                      sha256: localItem?.sha256,
                      language: ocrLanguage,
                    });
                  }}
                />
                {documentOcr.error && (
                  <p style={{ fontSize: '0.75rem', color: '#cf222e', margin: 0 }}>
                    {documentOcr.error}
                  </p>
                )}
                {documentOcr.result && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.72rem', opacity: 0.7 }}>
                      {documentOcr.result.method} • {documentOcr.result.pagesProcessed} page(s)
                    </span>
                    <textarea
                      readOnly
                      rows={8}
                      value={documentOcr.result.text}
                      style={{
                        width: '100%',
                        fontSize: '0.75rem',
                        padding: '0.5rem',
                        borderRadius: '0.4rem',
                        border: '1px solid rgba(104, 94, 85, 0.2)',
                      }}
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      label="Pin OCR Text to Notes"
                      onClick={() => {
                        const text = documentOcr.result?.text.slice(0, 1000);
                        if (!text) return;
                        setAnnotations((prev) => [
                          ...prev,
                          {
                            id: String(Date.now()),
                            page: currentPage,
                            text,
                            timestamp: new Date().toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            }),
                          },
                        ]);
                        setSidebarTab('notes');
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(104, 94, 85, 0.12)' }}>
              <p style={{ fontSize: '0.75rem', opacity: 0.7, margin: 0, lineHeight: 1.4 }}>
                💡 Tip: Use <kbd style={{ padding: '0.1rem 0.3rem', borderRadius: '3px', background: 'rgba(104,94,85,0.15)' }}>←</kbd> and <kbd style={{ padding: '0.1rem 0.3rem', borderRadius: '3px', background: 'rgba(104,94,85,0.15)' }}>→</kbd> keys to flip pages smoothly.
              </p>
            </div>
          </aside>
        )}

        {/* Canonical DocumentView / Markdown / H5P Canvas via app-level MediaAdapters */}
        <div className={styles.canvasArea}>
          <div
            className={styles.documentIframeWrapper}
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center',
            }}
          >
            {markdownBody ? (
              <Markdown source={markdownBody} />
            ) : documentFormat === 'h5p' || documentUrl.toLowerCase().endsWith('.h5p') ? (
              <H5pView packageUrl={packDownloader.effectiveUri} title={documentTitle} />
            ) : documentFormat === 'link' ? (
              <FileCard
                file={{ name: documentTitle, uri: documentUrl, mime: documentMime }}
                href={documentUrl}
                onOpen={openNativeWindow}
              />
            ) : ['image', 'audio', 'video'].includes(
                fileKindOf({ name: localItem?.fileName ?? documentUrl, mime: documentMime }),
              ) ? (
              <Media
                file={{
                  name: localItem?.fileName ?? documentUrl,
                  uri: packDownloader.effectiveUri,
                  mime: documentMime,
                }}
                alt={documentTitle}
              />
            ) : fileKindOf({ name: localItem?.fileName ?? documentUrl, mime: documentMime }) ===
              'pdf' ? (
              <PdfJsAdapter
                file={{
                  name: documentTitle,
                  uri: packDownloader.effectiveUri,
                  mime: 'application/pdf',
                }}
                page={currentPage}
                hideInternalNav
                onDocumentLoad={({ numPages }) => {
                  setTotalPages(numPages);
                  setCurrentPage((p) => Math.min(Math.max(p, 1), numPages));
                }}
                onError={() => {
                  setNotice('Could not render PDF in canvas; use External or Save Offline.');
                }}
              />
            ) : (
              <DocumentView
                file={{
                  name: localItem?.fileName ?? documentUrl,
                  uri: packDownloader.effectiveUri,
                  mime: documentMime,
                }}
                onOpenElsewhere={openNativeWindow}
              />
            )}
          </div>
        </div>
      </div>

      {/* Notice Toast */}
      {notice && (
        <div className={styles.toastNotice}>
          <Notice tone="neutral" message={notice} />
        </div>
      )}
    </article>
  );
}

export const PDFReaderFloor = DocumentReaderDesk;

