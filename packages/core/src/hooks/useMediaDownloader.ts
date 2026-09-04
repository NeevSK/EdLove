import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type DownloadState = 'idle' | 'downloading' | 'ready' | 'error';

interface UseMediaDownloaderOptions {
  resourceId: string;
  url: string;
  mimeType?: string;
}

type CacheIndex = Record<string, { lastAccess: number; size: number }>;

const SAFE_CACHE_FILE_PATTERN = /^gurudevi_[A-Za-z0-9%._-]{1,180}\.[A-Za-z0-9]{1,12}$/;
const CACHE_INDEX_FILE_NAME = 'gurudevi_cache_index.json';

export function isSafeCacheFileName(fileName: string): boolean {
  return (
    fileName !== CACHE_INDEX_FILE_NAME &&
    SAFE_CACHE_FILE_PATTERN.test(fileName) &&
    !fileName.includes('..') &&
    !fileName.includes('/') &&
    !fileName.includes('\\')
  );
}

export function createCacheFileName(resourceId: string, url: string, mimeType?: string): string {
  const safeResourceId = resourceId.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 120) || 'resource';
  const urlPath = url.split(/[?#]/, 1)[0] ?? '';
  const urlExtension = urlPath.split('.').pop()?.toLowerCase() ?? 'tmp';
  const extension =
    mimeType === 'application/pdf'
      ? 'pdf'
      : /^[a-z0-9]{1,12}$/.test(urlExtension)
        ? urlExtension
        : 'tmp';
  return `gurudevi_${safeResourceId}.${extension}`;
}

export function parseCacheIndex(raw: string): CacheIndex {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

    return Object.fromEntries(
      Object.entries(parsed)
        .filter(([, value]) => {
          if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
          const entry = value as { lastAccess?: unknown; size?: unknown };
          return (
            typeof entry.lastAccess === 'number' &&
            Number.isFinite(entry.lastAccess) &&
            entry.lastAccess > 0 &&
            typeof entry.size === 'number' &&
            Number.isFinite(entry.size) &&
            entry.size >= 0
          );
        })
        .filter(([fileName]) => isSafeCacheFileName(fileName)),
    ) as CacheIndex;
  } catch {
    return {};
  }
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
  const mountedRef = useRef(true);
  const activeDownloadRef = useRef<{ cancelAsync: () => Promise<void> } | null>(null);
  const downloadSequenceRef = useRef(0);

  const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';

  const updateLRU = useCallback(async (fileName: string) => {
    try {
      const { Paths, File } = await import('expo-file-system');
      const { writeAsStringAsync } = await import('expo-file-system/legacy');
      const indexFile = new File(Paths.cache, 'gurudevi_cache_index.json');
      let index: CacheIndex = {};
      if (indexFile.exists) {
        try {
          const txt = await indexFile.text();
          index = parseCacheIndex(txt);
        } catch {
          index = {};
        }
      }
      // update access time
      const file = new File(Paths.cache, fileName);
      let size = 0;
      try {
        const info = file.info();
        size = (info as { size?: number })?.size ?? 0;
      } catch {
        // Ignore stat inspection failures and fallback to zero size
      }
      if (!isSafeCacheFileName(fileName)) return;
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
            } catch {
              // Best-effort eviction failure; continue to next entry
            }
          }
        }
      } catch {
        // Disk capacity check failed; proceed without eviction
      }
      await writeAsStringAsync(indexFile.uri, JSON.stringify(index));
    } catch (error) {
      console.warn('[MediaDownloader] Cache index update failed', error);
    }
  }, []);
  const checkCached = useCallback(async () => {
    if (isWeb) return;
    try {
      const { Paths, File } = await import('expo-file-system');
      const fileName = createCacheFileName(resourceId, url, mimeType);
      const file = new File(Paths.cache, fileName);
      if (file.exists) {
        if (mountedRef.current) {
          setLocalUri(file.uri);
          setDownloadState('ready');
        }
        void updateLRU(fileName);
      }
    } catch {
      // not cached
    }
  }, [resourceId, url, mimeType, isWeb, updateLRU]);

  useEffect(() => {
    checkCached().catch((e) => {
      if (mountedRef.current) {
        setErrorMsg(e instanceof Error ? e.message : 'Failed to inspect cached media');
        setDownloadState('error');
      }
    });
  }, [checkCached]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      downloadSequenceRef.current += 1;
      void activeDownloadRef.current?.cancelAsync().catch(() => undefined);
    };
  }, []);

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

    if (downloadState === 'downloading') return;
    const sequence = ++downloadSequenceRef.current;

    setDownloadState('downloading');
    setProgress(0);
    setErrorMsg(null);

    try {
      const { Paths, File } = await import('expo-file-system');
      const FileSystem = await import('expo-file-system/legacy');
      const fileName = createCacheFileName(resourceId, url, mimeType);
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
      activeDownloadRef.current = downloadResumable;
      const result = await downloadResumable.downloadAsync();
      if (!mountedRef.current || sequence !== downloadSequenceRef.current) return;
      if (result?.uri) {
        setLocalUri(result.uri);
        setDownloadState('ready');
        void updateLRU(fileName);
      } else {
        throw new Error('Download returned no URI');
      }
    } catch (error: unknown) {
      if (!mountedRef.current) return;
      setErrorMsg(error instanceof Error ? error.message : 'Download failed');
      setDownloadState('error');
    } finally {
      activeDownloadRef.current = null;
    }
  }, [url, resourceId, mimeType, isWeb, updateLRU, downloadState]);

  const openInNativeViewer = useCallback(async () => {
    if (isWeb) {
      window.open(url, '_blank');
      return;
    }

    const target = localUri;
    if (!target) return;
    try {
      const Sharing = await import('expo-sharing');
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        if (mountedRef.current) setErrorMsg('Native sharing is unavailable on this device.');
        return;
      }
      await Sharing.shareAsync(target, { mimeType });
    } catch (error: unknown) {
      if (mountedRef.current) {
        setErrorMsg(error instanceof Error ? error.message : 'Unable to open the document');
      }
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
        downloadSequenceRef.current += 1;
        void activeDownloadRef.current?.cancelAsync().catch(() => undefined);
        activeDownloadRef.current = null;
        setDownloadState('idle');
        setLocalUri(null);
        setProgress(0);
        setErrorMsg(null);
      },
    }),
    [downloadState, progress, localUri, errorMsg, startDownload, openInNativeViewer],
  );
}
