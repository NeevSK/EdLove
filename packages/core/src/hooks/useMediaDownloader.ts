import { Paths, File } from 'expo-file-system';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

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

  const extension = mimeType === 'application/pdf' ? 'pdf' : url.split('.').pop() || 'tmp';
  const fileName = `gurudevi_${resourceId}.${extension}`;
  const localPath = `${Paths.cache}${fileName}`;

  const checkCached = useCallback(async () => {
    if (Platform.OS === 'web') return;
    try {
      // Using modern API - check if file exists via File class
      const { File } = await import('expo-file-system');
      const file = new File(localPath);
      if (file.exists) {
        setLocalUri(localPath);
        setDownloadState('ready');
      }
    } catch {
      // not cached
    }
  }, [localPath]);

  useEffect(() => {
    checkCached().catch((e) => {
      console.error('MediaDownloader: Failed to check cache', e);
    });
  }, [checkCached]);

  const startDownload = useCallback(async () => {
    if (Platform.OS === 'web') {
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
      // Using legacy API for download (modern API doesn't support progress callbacks yet)
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
  }, [url, localPath]);

  const openInNativeViewer = useCallback(async () => {
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
      return;
    }

    const target = localUri;
    if (!target) return;
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(target, { mimeType });
    }
  }, [localUri, url, mimeType]);

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
