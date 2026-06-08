import * as FileSystem from 'expo-file-system';
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
 */
export function useMediaDownloader({ resourceId, url, mimeType }: UseMediaDownloaderOptions) {
  const [downloadState, setDownloadState] = useState<DownloadState>('idle');
  const [progress, setProgress] = useState(0);
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const extension = mimeType === 'application/pdf' ? 'pdf' : url.split('.').pop() || 'tmp';
  const fileName = `gurudevi_${resourceId}.${extension}`;
  const fileSystem = FileSystem as typeof FileSystem & {
    cacheDirectory?: string;
    documentDirectory?: string;
  };
  const baseDirectory = fileSystem.cacheDirectory ?? fileSystem.documentDirectory ?? '';
  const localPath = `${baseDirectory}${fileName}`;

  const checkCached = useCallback(async () => {
    if (Platform.OS === 'web') return;
    try {
      const info = await FileSystem.getInfoAsync(localPath);
      if (info.exists) {
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
