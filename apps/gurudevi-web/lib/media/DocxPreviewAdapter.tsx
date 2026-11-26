'use client';

import type { DocumentAdapterProps } from '@repo/ui/theme';
import { useEffect, useRef, useState } from 'react';

/**
 * Client-side `.docx` renderer powered by `docx-preview`.
 * Renders Word documents directly into the DOM with zero external viewer APIs.
 */
export function DocxPreviewAdapter({ file, onError }: DocumentAdapterProps) {
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
        const { renderAsync } = await import('docx-preview');
        if (cancelled || !hostRef.current) return;
        hostRef.current.innerHTML = '';
        await renderAsync(buffer, hostRef.current, undefined, {
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: true,
          breakPages: true,
          renderHeaders: true,
          renderFooters: true,
        });
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
          Rendering Word document…
        </p>
      )}
      <div
        ref={hostRef}
        style={{
          width: '100%',
          overflowX: 'auto',
          borderRadius: '0.5rem',
        }}
      />
    </div>
  );
}
