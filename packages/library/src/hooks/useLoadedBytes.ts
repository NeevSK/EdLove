import { base64ToBytes } from '@repo/library/utils/bytes';
import { detectFormat } from '@repo/library/utils/format-detection';
import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * Resolve document bytes from route params (`uri`, `dataUri`, `base64` or a
 * raw `csv` payload) shared by the document-powerhouse screens.
 * Returns the bytes plus detected format metadata.
 */
export function useLoadedBytes(params: Record<string, string | string[] | undefined>) {
  const uri = takeString(params.uri);
  const dataUri = takeString(params.dataUri);
  const base64 = takeString(params.base64);
  const csv = takeString(params.csv);
  const name = takeString(params.name);

  const [bytes, setBytes] = useState<Uint8Array | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      if (dataUri) {
        const comma = dataUri.indexOf(',');
        const payload = comma >= 0 ? dataUri.slice(comma + 1) : dataUri;
        setBytes(base64ToBytes(payload));
        return;
      }
      if (base64) {
        setBytes(base64ToBytes(base64));
        return;
      }
      if (csv !== undefined) {
        setBytes(new TextEncoder().encode(csv));
        return;
      }
      if (uri) {
        const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';
        if (isWeb) {
          const response = await fetch(uri);
          if (!response.ok) throw new Error(`Could not fetch "${uri}"`);
          const buffer = await response.arrayBuffer();
          setBytes(new Uint8Array(buffer));
        } else {
          const FileSystem = await import('expo-file-system/legacy');
          const base64Payload = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          setBytes(base64ToBytes(base64Payload));
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not load document');
    }
  }, [uri, dataUri, base64, csv]);

  useEffect(() => {
    if (uri || dataUri || base64 || csv !== undefined) {
      setLoading(true);
      load()
        .catch(() => undefined)
        .finally(() => setLoading(false));
    }
  }, [load, uri, dataUri, base64, csv]);

  const detected = useMemo(() => (bytes ? detectFormat(bytes) : null), [bytes]);

  return {
    bytes,
    loading,
    error,
    fileName: name ?? (detected ? `document.${detected.extension}` : 'document'),
    detected,
    reload: () => {
      setLoading(true);
      return load()
        .catch(() => undefined)
        .finally(() => setLoading(false));
    },
  };
}

function takeString(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}