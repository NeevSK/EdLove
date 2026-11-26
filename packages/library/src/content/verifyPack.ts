import type { PackFile } from './packManifest';

/**
 * Checks the files of a pack on the device before the content opens: each must be present, the
 * right size, and match its SHA-256. Hashing is a port: expo-crypto on mobile, WebCrypto on the
 * web. A file that fails is named, so only it is fetched again.
 */

export type VerifyProblem = {
  readonly path: string;
  readonly code: 'missing' | 'size_mismatch' | 'hash_mismatch';
};

export interface VerifyPorts {
  read(path: string): Promise<Uint8Array | undefined>;
  sha256(bytes: Uint8Array): Promise<string>;
}

export async function verifyPack(
  files: readonly PackFile[],
  ports: VerifyPorts,
): Promise<readonly VerifyProblem[]> {
  const problems: VerifyProblem[] = [];
  for (const file of files) {
    const bytes = await ports.read(file.path);
    if (bytes === undefined) problems.push({ path: file.path, code: 'missing' });
    else if (bytes.byteLength !== file.bytes)
      problems.push({ path: file.path, code: 'size_mismatch' });
    else if ((await ports.sha256(bytes)).toLowerCase() !== file.sha256)
      problems.push({ path: file.path, code: 'hash_mismatch' });
  }
  return problems;
}

/** SHA-256 through WebCrypto, available in browsers and in Node; on mobile pass expo-crypto instead. */
export async function webCryptoSha256(bytes: Uint8Array): Promise<string> {
  // A copy backed by a plain ArrayBuffer, which WebCrypto requires (not a SharedArrayBuffer).
  const digest = await globalThis.crypto.subtle.digest('SHA-256', new Uint8Array(bytes));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
