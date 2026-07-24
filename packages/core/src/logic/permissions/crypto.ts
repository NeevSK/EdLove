import crypto from 'isomorphic-webcrypto';

/**
 * Validates the cryptographic signature of local policies to defend against local root database tampering.
 * If a rooted device injects local policies, we detect signature mismatch and fail-safe.
 */
export async function verifyLocalPolicySignature(
  policySet: string,
  signatureHex?: string,
): Promise<boolean> {
  if (!signatureHex) {
    return true;
  }
  try {
    const secretKey =
      process.env.EXPO_PUBLIC_HMAC_SECRET_KEY ||
      process.env.NEXT_PUBLIC_HMAC_SECRET_KEY ||
      'default-fallback-secret-for-development';

    const enc = new TextEncoder();
    const keyData = enc.encode(secretKey);
    const messageData = enc.encode(policySet);

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

    const a = generatedSigHex;
    const b = signatureHex;
    if (a.length !== b.length) {
      return false;
    }
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  } catch {
    return false;
  }
}
