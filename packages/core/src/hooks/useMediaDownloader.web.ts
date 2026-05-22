import { useCallback, useMemo, useState } from 'react';

export type DownloadState = 'idle' | 'downloading' | 'ready' | 'error';

interface UseMediaDownloaderOptions {
  resourceId: string;
  url: string;
  mimeType?: string;
}

export function useMediaDownloader({ url }: UseMediaDownloaderOptions) {
  const [downloadState, setDownloadState] = useState<DownloadState>('idle');
  const [progress, setProgress] = useState(0);
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const startDownload = useCallback(async () => {
    if (typeof window === 'undefined') {
      setErrorMsg('Downloads are not available in this environment.');
      setDownloadState('error');
      return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
    setLocalUri(url);
    setDownloadState('ready');
    setProgress(1);
  }, [url]);

  const openInNativeViewer = useCallback(async () => {
    if (typeof window === 'undefined') return;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [url]);

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
        setErrorMsg(null);
        setProgress(0);
      },
    }),
    [downloadState, progress, localUri, errorMsg, startDownload, openInNativeViewer],
  );
}
