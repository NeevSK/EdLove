'use client';

import {
  buildPlayerDocument,
  parseBridgeMessage,
  readH5PEvent,
} from '@repo/library/h5p';
import type { H5pAdapterProps } from '@repo/ui/theme';
import { useEffect, useId, useMemo, useState } from 'react';

const H5P_ASSETS = {
  mainJs: '/h5p-player/main.bundle.js',
  frameJs: '/h5p-player/frame.bundle.js',
  frameCss: '/h5p-player/styles/h5p.css',
} as const;

/**
 * Sandboxed same-origin iframe host for `h5p-standalone`, wired to `@repo/library/h5p`'s
 * CSP-hardened `buildPlayerDocument` and `parseBridgeMessage` / `parseH5PEvent`.
 */
export function H5pIframeHost({
  packageUrl,
  librariesUrl,
  previousState,
  title = 'Interactive H5P activity',
  onReady,
  onXapi,
  onStateChange,
  onError,
}: H5pAdapterProps) {
  const playerId = useId();
  const [height, setHeight] = useState(420);

  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://sanctuary.gurudevi.app';

  const normalizedPackageUrl = packageUrl.endsWith('/') ? packageUrl : `${packageUrl}/`;

  const srcDoc = useMemo(
    () =>
      buildPlayerDocument({
        playerId,
        packageUrl: normalizedPackageUrl,
        librariesUrl,
        assets: H5P_ASSETS,
        origin,
        parentOrigin: origin,
        previousState,
      }),
    [playerId, normalizedPackageUrl, librariesUrl, origin, previousState],
  );

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== origin && event.origin !== 'null') return;
      const parsed = parseBridgeMessage(event.data, playerId);
      if (!parsed.ok) return;

      switch (parsed.message.type) {
        case 'ready':
          onReady?.();
          break;
        case 'resize':
          setHeight(Math.max(240, parsed.message.height));
          break;
        case 'state':
          onStateChange?.(parsed.message.state);
          break;
        case 'xapi': {
          const res = readH5PEvent(parsed.message.statement, () => new Date());
          onXapi?.(res.ok ? res.event : parsed.message.statement);
          break;
        }
        case 'error':
          onError?.(parsed.message.message);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [origin, playerId, onReady, onXapi, onStateChange, onError]);

  return (
    <iframe
      title={title}
      srcDoc={srcDoc}
      sandbox="allow-scripts allow-same-origin"
      style={{
        width: '100%',
        height: `${height}px`,
        border: '1px solid rgba(104, 94, 85, 0.2)',
        borderRadius: '0.75rem',
        background: '#ffffff',
      }}
    />
  );
}
