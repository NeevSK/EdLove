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

  const checkCached = useCallback(async () => {
    if (isWeb) return;
    try {
      const { Paths, File } = await import('expo-file-system');
      const extension = mimeType === 'application/pdf' ? 'pdf' : url.split('.').pop() || 'tmp';
      const fileName = `gurudevi_${resourceId}.${extension}`;
      const localPath = `${Paths.cache}${fileName}`;

      const file = new File(localPath);
      if (file.exists) {
        setLocalUri(localPath);
        setDownloadState('ready');
      }
    } catch {
      // not cached
    }
  }, [resourceId, url, mimeType, isWeb]);

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
      const { Paths } = await import('expo-file-system');
      const FileSystem = await import('expo-file-system/legacy');
      const extension = mimeType === 'application/pdf' ? 'pdf' : url.split('.').pop() || 'tmp';
      const fileName = `gurudevi_${resourceId}.${extension}`;
      const localPath = `${Paths.cache}${fileName}`;

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
      } else {
        throw new Error('Download returned no URI');
      }
    } catch (error: unknown) {
      setErrorMsg(error instanceof Error ? error.message : 'Download failed');
      setDownloadState('error');
    }
  }, [url, resourceId, mimeType, isWeb]);

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
