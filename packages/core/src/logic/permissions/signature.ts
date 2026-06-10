import crypto from 'isomorphic-webcrypto';

/**
 * Verifies the cryptographic signature of the PowerSync synced PermissionSnapshot.
 * Shared across local evaluators and react permission stores.
 */
export async function verifySnapshotSignature(snapshot: {
  userId: string;
  schoolId: string;
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
      schoolId: snapshot.schoolId,
      permissions: JSON.parse(snapshot.permissions),
      temporalHints: snapshot.temporalHints ? JSON.parse(snapshot.temporalHints) : {},
    };

    const secretKey =
      process.env.EXPO_PUBLIC_HMAC_SECRET_KEY ||
      process.env.NEXT_PUBLIC_HMAC_SECRET_KEY ||
      'default-fallback-secret-for-development';

    // 2. Perform SubtleCrypto HMAC verification
    const enc = new TextEncoder();
    const keyData = enc.encode(secretKey);
    const messageData = enc.encode(JSON.stringify(payload));

    const importedKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: { name: 'SHA-256' } },
      false,
      ['sign', 'verify'],
    );

    const generatedSigBuffer = await crypto.subtle.sign('HMAC', importedKey, messageData);

    const generatedSigArray = Array.from(new Uint8Array(generatedSigBuffer));
    const generatedSigHex = generatedSigArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    return generatedSigHex === snapshot.signature;
  } catch (err) {
    console.error('[Signature] Signature verification system error:', err);
    return false;
  }
}
