/**
 * Chunked bytes <-> base64 conversion.
 * Chunking avoids call-stack overflow from `String.fromCharCode(...largeArray)`.
 */

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

export function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function bytesToDataUri(bytes: Uint8Array, mimeType: string): string {
  return `data:${mimeType};base64,${bytesToBase64(bytes)}`;
}

export function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

export function isBase64(str: string): boolean {
  return /^[A-Za-z0-9+/]+={0,2}$/.test(str) && str.length % 4 === 0;
}

const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';

/**
 * Persist bytes to a file: native writes to the cache dir (optionally opening
 * the system share sheet); web triggers a browser download. Returns the
 * resulting URI/href or null when nothing could be saved.
 */
export async function saveBytes(
  bytes: Uint8Array,
  fileName: string,
  mimeType: string,
  scope: 'download' | 'share' = 'download',
): Promise<string | null> {
  if (isWeb) {
    const blob = new Blob([toArrayBuffer(bytes)], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    return url;
  }

  const { Paths, File } = await import('expo-file-system');
  const file = new File(`${Paths.cache}${fileName}`);
  const writer = file.writableStream().getWriter();
  await writer.write(bytes);
  await writer.close();
  const localUri = file.uri;

  if (scope === 'share') {
    const Sharing = await import('expo-sharing');
    const available = await Sharing.isAvailableAsync().catch(() => false);
    if (available) {
      await Sharing.shareAsync(localUri, { mimeType });
    }
  }
  return localUri;
}