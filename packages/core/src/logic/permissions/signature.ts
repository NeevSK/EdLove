import crypto from 'isomorphic-webcrypto';

function decodeBase64(value: string): Uint8Array {
  const binary = globalThis.atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

/**
 * Verifies the cryptographic signature of the PowerSync synced PermissionSnapshot.
 * Shared across local evaluators and react permission stores.
 */
export async function verifySnapshotSignature(snapshot: {
  userId: string;
  activeBondId: string;
  activeEntityId: string;
  activeEntityType: string;
  schoolId: string | null;
  policyVersion: string;
  generatedAt: string;
  expiresAt: string;
  permissions: string;
  temporalHints: string | null;
  signature: string;
}): Promise<boolean> {
  try {
    // 1. Reconstruct the exact JSON payload generated on the server (preserving order of keys)
    const payload = {
      generatedAt: snapshot.generatedAt,
      expiresAt: snapshot.expiresAt,
      userId: snapshot.userId,
      activeBondId: snapshot.activeBondId,
      activeEntityId: snapshot.activeEntityId,
      activeEntityType: snapshot.activeEntityType,
      schoolId: snapshot.schoolId,
      policyVersion: snapshot.policyVersion,
      permissions: JSON.parse(snapshot.permissions),
      temporalHints: snapshot.temporalHints ? JSON.parse(snapshot.temporalHints) : {},
    };

    const publicKey =
      process.env.EXPO_PUBLIC_SNAPSHOT_SIGNING_PUBLIC_KEY ||
      process.env.NEXT_PUBLIC_SNAPSHOT_SIGNING_PUBLIC_KEY;
    if (!publicKey || !snapshot.signature.startsWith('ed25519:')) return false;

    // 2. Verify with a public key shipped in the client. The private key never
    // leaves the server/operator environment.
    const enc = new TextEncoder();
    const messageData = enc.encode(JSON.stringify(payload));
    const signatureBytes = decodeBase64(snapshot.signature.slice('ed25519:'.length));

    const importedKey = await crypto.subtle.importKey(
      'raw',
      decodeBase64(publicKey) as unknown as BufferSource,
      { name: 'Ed25519' },
      false,
      ['verify'],
    );

    return await crypto.subtle.verify(
      { name: 'Ed25519' },
      importedKey,
      signatureBytes as unknown as BufferSource,
      messageData,
    );
  } catch (err) {
    console.error('[Signature] Signature verification system error:', err);
    return false;
  }
}
