import { useCallback, useEffect, useMemo, useState } from 'react';

export type DownloadState = 'idle' | 'downloading' | 'ready' | 'error';

interface UseMediaDownloaderOptions {
  resourceId: string;
  url: string;
  mimeType?: string;
}

/**
 * useMediaDownloader - Handles local caching and native handoff for remote resources.
 * Uses modern expo-file-system API (SDK 54+) for file operations, legacy API for downloads
 * (modern API doesn't yet support progress callbacks in the same way).
 */
export function useMediaDownloader({ resourceId, url, mimeType }: UseMediaDownloaderOptions) {
  const [downloadState, setDownloadState] = useState<DownloadState>('idle');
  const [progress, setProgress] = useState(0);
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';

  const updateLRU = useCallback(async (fileName: string) => {
    try {
      const { Paths, File } = await import('expo-file-system');
      const { writeAsStringAsync } = await import('expo-file-system/legacy');
      const indexFile = new File(Paths.cache, 'gurudevi_cache_index.json');
      let index: Record<string, { lastAccess: number; size: number }> = {};
      if (indexFile.exists) {
        try {
          const txt = await indexFile.text();
          index = JSON.parse(txt);
        } catch {}
      }
      // update access time
      const file = new File(Paths.cache, fileName);
      let size = 0;
      try {
        const info = file.info();
        size = (info as { size?: number })?.size ?? 0;
      } catch {}
      index[fileName] = { lastAccess: Date.now(), size };
      // LRU eviction: keep total <500MB, 2GB-aware cap via availableDiskSpace
      try {
        const { Paths: P } = await import('expo-file-system');
        const free = (P as unknown as { availableDiskSpace?: number }).availableDiskSpace;
        const total = Object.values(index).reduce((a, b) => a + b.size, 0);
        if ((typeof free === 'number' && free < 100 * 1024 * 1024) || total > 500 * 1024 * 1024) {
          const sorted = Object.entries(index).sort((a, b) => a[1].lastAccess - b[1].lastAccess);
          for (const [name] of sorted) {
            if (name === fileName) continue;
            try {
              const f = new File(Paths.cache, name);
              if (f.exists) f.delete();
              delete index[name];
              if (Object.values(index).reduce((a, b) => a + b.size, 0) < 400 * 1024 * 1024) break;
            } catch {}
          }
        }
      } catch {}
      await writeAsStringAsync(indexFile.uri, JSON.stringify(index)).catch(() => {});
    } catch {}
  }, []);

  const checkCached = useCallback(async () => {
    if (isWeb) return;
    try {
      const { Paths, File } = await import('expo-file-system');
      const extension = mimeType === 'application/pdf' ? 'pdf' : url.split('.').pop() || 'tmp';
      const fileName = `gurudevi_${resourceId}.${extension}`;
      const file = new File(Paths.cache, fileName);
      if (file.exists) {
        setLocalUri(file.uri);
        setDownloadState('ready');
        void updateLRU(fileName);
      }
    } catch {
      // not cached
    }
  }, [resourceId, url, mimeType, isWeb, updateLRU]);

  useEffect(() => {
    checkCached().catch((e) => {
      console.error('MediaDownloader: Failed to check cache', e);
    });
  }, [checkCached]);

  const startDownload = useCallback(async () => {
    if (isWeb) {
      // For web, just open the URL in a new tab or trigger browser download
      window.open(url, '_blank');
      return;
    }

    if (!url) {
      setErrorMsg('No URL provided for this document.');
      setDownloadState('error');
      return;
    }

    setDownloadState('downloading');
    setProgress(0);
    setErrorMsg(null);

    try {
      const { Paths, File } = await import('expo-file-system');
      const FileSystem = await import('expo-file-system/legacy');
      const extension = mimeType === 'application/pdf' ? 'pdf' : url.split('.').pop() || 'tmp';
      const fileName = `gurudevi_${resourceId}.${extension}`;
      const localPath = new File(Paths.cache, fileName).uri;

      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        localPath,
        {},
        ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
          if (totalBytesExpectedToWrite > 0) {
            setProgress(totalBytesWritten / totalBytesExpectedToWrite);
          }
        },
      );
      const result = await downloadResumable.downloadAsync();
      if (result?.uri) {
        setLocalUri(result.uri);
        setDownloadState('ready');
        void updateLRU(fileName);
      } else {
        throw new Error('Download returned no URI');
      }
    } catch (error: unknown) {
      setErrorMsg(error instanceof Error ? error.message : 'Download failed');
      setDownloadState('error');
    }
  }, [url, resourceId, mimeType, isWeb, updateLRU]);

  const openInNativeViewer = useCallback(async () => {
    if (isWeb) {
      window.open(url, '_blank');
      return;
    }

    const target = localUri;
    if (!target) return;
    const Sharing = await import('expo-sharing');
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(target, { mimeType });
    }
  }, [localUri, url, mimeType, isWeb]);

  return useMemo(
    () => ({
      downloadState,
      progress,
      localUri,
      errorMsg,
      startDownload,
      openInNativeViewer,
      reset: () => {
        setDownloadState('idle');
        setLocalUri(null);
      },
    }),
    [downloadState, progress, localUri, errorMsg, startDownload, openInNativeViewer],
  );
}
