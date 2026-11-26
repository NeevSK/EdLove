'use client';

import {
  type AssetCachePolicy,
  DEFAULT_ASSET_CACHE_POLICY,
  webCryptoSha256,
} from '@repo/library/content';
import { useCallback, useEffect, useState } from 'react';
import {
  getCachedBlobBySha256,
  getCachedPackEntry,
  putCachedPackEntry,
  removeCachedPackEntry,
} from '../storage/assetIndexedDb';

export type OfflineDownloadStatus = 'checking' | 'remote' | 'downloading' | 'cached' | 'error';

/**
 * Downloads an asset to IndexedDB, verifies its SHA-256 (when provided) via WebCrypto,
 * enforces the configurable `AssetCachePolicy` (TTL + LRU), and serves a verified `blob:` URL offline.
 */
export function usePackDownloader(options: {
  readonly cacheKey: string;
  readonly remoteUri: string;
  readonly expectedSha256?: string;
  readonly mime?: string;
  readonly policy?: AssetCachePolicy;
}) {
  const { cacheKey, remoteUri, expectedSha256, mime = 'application/octet-stream', policy = DEFAULT_ASSET_CACHE_POLICY } =
    options;
  const [status, setStatus] = useState<OfflineDownloadStatus>('checking');
  const [cachedUri, setCachedUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    (async () => {
      try {
        const entry =
          (await getCachedPackEntry(cacheKey)) ??
          (expectedSha256 ? await getCachedBlobBySha256(expectedSha256) : undefined);
        if (!active) return;
        if (entry) {
          objectUrl = URL.createObjectURL(entry.blob);
          setCachedUri(objectUrl);
          setStatus('cached');
        } else {
          setCachedUri(null);
          setStatus('remote');
        }
      } catch {
        if (active) setStatus('remote');
      }
    })();

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [cacheKey]);

  const downloadOffline = useCallback(async () => {
    setStatus('downloading');
    setError(null);
    try {
      const res = await fetch(remoteUri);
      if (!res.ok) throw new Error(`Download failed (${res.status})`);
      const blob = await res.blob();
      const bytes = new Uint8Array(await blob.arrayBuffer());
      const sha256 = await webCryptoSha256(bytes);

      if (expectedSha256 && sha256.toLowerCase() !== expectedSha256.toLowerCase()) {
        throw new Error('Downloaded file failed SHA-256 verification.');
      }

      await putCachedPackEntry(
        {
          key: cacheKey,
          sha256,
          bytes: bytes.byteLength,
          mime: blob.type || mime,
          blob,
          lastAccessedAt: Date.now(),
          pinned: true,
        },
        policy,
      );

      setCachedUri((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
      setStatus('cached');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Offline download failed');
      setStatus('error');
    }
  }, [cacheKey, remoteUri, expectedSha256, mime, policy]);

  const removeOffline = useCallback(async () => {
    await removeCachedPackEntry(cacheKey);
    setCachedUri((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setStatus('remote');
  }, [cacheKey]);

  return {
    status,
    effectiveUri: cachedUri ?? remoteUri,
    isCachedOffline: status === 'cached',
    error,
    downloadOffline,
    removeOffline,
  };
}
