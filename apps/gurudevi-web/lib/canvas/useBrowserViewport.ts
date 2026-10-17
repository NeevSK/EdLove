'use client';

import { resolveWorkspaceRendererPlatform } from '@repo/core/logic/workspace/renderer';
import { useEffect, useState } from 'react';

export type BrowserViewportKind = 'mobile' | 'tablet' | 'desktop';

export function resolveBrowserViewport(width: number): BrowserViewportKind {
  const platform = resolveWorkspaceRendererPlatform({ runtimePlatform: 'web', width });
  return platform === 'web' ? 'desktop' : platform;
}

export function useBrowserViewport(): BrowserViewportKind {
  const [viewport, setViewport] = useState<BrowserViewportKind>('desktop');

  useEffect(() => {
    const updateViewport = () => setViewport(resolveBrowserViewport(window.innerWidth));

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  return viewport;
}
