'use client';

import type { DocumentAdapterProps } from '@repo/ui/theme';
import { useEffect, useRef, useState } from 'react';

/**
 * Client-side `.pptx` presentation renderer powered by `pptx-preview`.
 * Parses and renders PowerPoint slides directly in the browser.
 */
export function PptxPreviewAdapter({ file, onError }: DocumentAdapterProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(file.uri);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buffer = await res.arrayBuffer();
        const { init } = await import('pptx-preview');
        if (cancelled || !hostRef.current) return;
        hostRef.current.innerHTML = '';
        const width = Math.max(hostRef.current.clientWidth || 800, 320);
        const height = Math.round((width * 9) / 16);
        const previewer = init(hostRef.current, { width, height });
        await previewer.preview(buffer);
        if (!cancelled) setLoading(false);
      } catch {
        if (!cancelled) onError();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [file.uri, onError]);

  return (
    <div style={{ width: '100%' }}>
      {loading && (
        <p role="status" style={{ fontSize: '0.85rem', opacity: 0.7 }}>
          Rendering PowerPoint slides…
        </p>
      )}
      <div
        ref={hostRef}
        style={{
          width: '100%',
          minHeight: '360px',
          overflow: 'auto',
          borderRadius: '0.5rem',
        }}
      />
    </div>
  );
}
