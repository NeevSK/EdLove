/**
 * @deprecated Legacy React Native Web screen.
 * In accordance with AGENTS.md, all modern web experiences are built in `apps/gurudevi-web`.
 * For modern web reading and annotation, use `apps/gurudevi-web/app/(sanctuary)/library/reader/[bookId]`.
 * Retained solely as a backward-compatible source and historical reference.
 *
 * PDFViewerScreen.web.tsx  Pattern A: full web replacement
 *
 * On native, PDFViewerScreen uses expo-file-system + expo-sharing to download
 * and open PDFs via the device's native viewer.
 */

import { Bookmark, ExternalLink, RefreshCw } from '@repo/ui/icons';
import { Box, HStack, useTheme } from '@repo/ui/primitives';
import { safeBack } from '@repo/ui/utils/navigation';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

export default function PDFViewerScreen() {
  const { title, url } = useLocalSearchParams<{
    resourceId: string;
    title: string;
    url: string;
    creator?: string;
  }>();
  const router = useRouter();
  const theme = useTheme();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [iframeKey, setIframeKey] = useState(0); // bump to reload iframe

  const openInNewTab = () => {
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="flex-1 min-h-screen flex flex-col">
      <header style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <div>
          <button type="button" onClick={() => safeBack('/library')} style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: 12 }}>←</button>
          <span style={{ fontWeight: 600, fontSize: 16 }}>{title || 'Document Viewer'}</span>
        </div>
        <button
          type="button"
          onClick={() => setIsBookmarked((b) => !b)}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark document'}
          style={{
            background: isBookmarked ? `${theme.accent.action}22` : 'transparent',
            border: 'none',
            borderRadius: '9999px',
            padding: '8px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Bookmark size={18} color={isBookmarked ? theme.accent.action : theme.text.secondary} />
        </button>
      </header>

      {/* Inline iframe viewer */}
      <Box className="flex-1 overflow-hidden">
        <iframe
          key={iframeKey}
          src={url}
          title={title}
          style={
            {
              width: '100%',
              height: '100%',
              border: 'none',
              display: 'block',
            } as any
          }
          allowFullScreen
        />
      </Box>

      {/* Action bar below the iframe */}
      <HStack className="p-md gap-sm justify-center border-t border-phase-border bg-phase-surface">
        <button
          type="button"
          onClick={() => setIframeKey((k) => k + 1)}
          aria-label="Reload document"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '12px',
            border: `1px solid ${theme.border?.subtle || '#ccc'}`,
            background: 'transparent',
            color: theme.text?.primary || '#000',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          <RefreshCw size={16} />
          <span>Reload</span>
        </button>
        <button
          type="button"
          onClick={openInNewTab}
          aria-label="Open PDF in new tab"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '12px',
            border: 'none',
            background: theme.accent?.action || '#007aff',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          <ExternalLink size={16} />
          <span>Open in New Tab</span>
        </button>
      </HStack>
    </div>
  );
}
