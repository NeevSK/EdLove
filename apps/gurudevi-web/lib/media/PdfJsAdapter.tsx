'use client';

import type { DocumentAdapterProps } from '@repo/ui/theme';
import { useEffect, useRef, useState } from 'react';

export interface PdfJsAdapterExtraProps {
  /** Optional callback when the PDF finishes loading with its total page count. */
  onDocumentLoad?: (info: { numPages: number }) => void;
  /** Optional controlled page number (1-indexed). */
  page?: number;
  /** Hide internal prev/next bar when hosted inside DocumentReaderDesk's toolbar. */
  hideInternalNav?: boolean;
}

/**
 * Client-side PDF renderer powered by `pdfjs-dist`.
 * Renders each page to canvas inside the browser with zero external viewers.
 */
export function PdfJsAdapter({
  file,
  onError,
  onDocumentLoad,
  page,
  hideInternalNav = false,
}: DocumentAdapterProps & PdfJsAdapterExtraProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const onDocumentLoadRef = useRef(onDocumentLoad);
  onDocumentLoadRef.current = onDocumentLoad;
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [numPages, setNumPages] = useState<number>(0);
  const [activePage, setActivePage] = useState<number>(page ?? 1);

  useEffect(() => {
    if (typeof page === 'number' && page >= 1) {
      setActivePage(page);
    }
  }, [page]);

  useEffect(() => {
    let cancelled = false;
    let pdfDoc: { numPages: number; getPage: (n: number) => Promise<any>; cleanup?: () => Promise<void> } | null = null;

    (async () => {
      setStatus('loading');
      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url,
        ).toString();

        const cleanUri = file.uri.split('#')[0] ?? file.uri;
        const loadingTask = pdfjsLib.getDocument({ url: cleanUri });
        pdfDoc = await loadingTask.promise;
        if (cancelled || !pdfDoc) return;

        setNumPages(pdfDoc.numPages);
        onDocumentLoadRef.current?.({ numPages: pdfDoc.numPages });

        const targetPage = Math.min(Math.max(activePage, 1), pdfDoc.numPages);
        const pdfPage = await pdfDoc.getPage(targetPage);
        if (cancelled) return;

        const container = containerRef.current;
        if (!container) return;
        container.innerHTML = '';

        const viewport = pdfPage.getViewport({ scale: 1.35 });
        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
        canvas.style.display = 'block';
        canvas.style.borderRadius = '8px';

        const context = canvas.getContext('2d');
        if (!context) {
          throw new Error('Canvas 2D context unavailable');
        }
        container.appendChild(canvas);
        await pdfPage.render({ canvas, canvasContext: context, viewport }).promise;
        if (!cancelled) setStatus('ready');
      } catch {
        if (!cancelled) {
          setStatus('error');
          onErrorRef.current();
        }
      }
    })();

    return () => {
      cancelled = true;
      void pdfDoc?.cleanup?.();
    };
  }, [file.uri, activePage]);

  if (status === 'error') return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
      {!hideInternalNav && numPages > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.82rem',
            padding: '0.35rem 0.65rem',
            borderRadius: '0.5rem',
            background: 'rgba(104, 94, 85, 0.08)',
          }}
        >
          <span>
            {file.name} • Page {activePage} of {numPages}
          </span>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              type="button"
              disabled={activePage <= 1}
              onClick={() => setActivePage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <button
              type="button"
              disabled={activePage >= numPages}
              onClick={() => setActivePage((p) => Math.min(numPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      )}
      {status === 'loading' && (
        <p role="status" style={{ fontSize: '0.85rem', opacity: 0.7 }}>
          Rendering PDF…
        </p>
      )}
      <div ref={containerRef} style={{ width: '100%' }} />
    </div>
  );
}
