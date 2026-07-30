import crypto from 'isomorphic-webcrypto';

/** Validates a server-signed local Cedar policy bundle. */
export async function verifyLocalPolicySignature(
  policySet: string,
  signature?: string,
): Promise<boolean> {
  if (!signature?.startsWith('ed25519:')) return false;
  try {
    const publicKey =
      process.env.EXPO_PUBLIC_SNAPSHOT_SIGNING_PUBLIC_KEY ||
      process.env.NEXT_PUBLIC_SNAPSHOT_SIGNING_PUBLIC_KEY;
    if (!publicKey) return false;
    const decode = (value: string) => {
      const binary = globalThis.atob(value);
      return Uint8Array.from(binary, (character) => character.charCodeAt(0));
    };
    const importedKey = await crypto.subtle.importKey(
      'raw',
      decode(publicKey),
      { name: 'Ed25519' },
      false,
      ['verify'],
    );
    return await crypto.subtle.verify(
      { name: 'Ed25519' },
      importedKey,
      decode(signature.slice('ed25519:'.length)),
      new TextEncoder().encode(policySet),
    );
  } catch {
    return false;
  }
}
