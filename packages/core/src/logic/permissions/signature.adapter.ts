import {
  AUTHORIZATION_ACTIONS,
  AUTHORIZATION_RESOURCES,
} from '@repo/policies/authorizationRegistry';
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

    const valid = await crypto.subtle.verify(
      { name: 'Ed25519' },
      importedKey,
      signatureBytes as unknown as BufferSource,
      messageData,
    );
    if (valid) return true;

    // The legacy generator emits the registry order and empty temporal hints.
    // Restore that order after JSONB storage without discarding any signed data.
    if (
      !payload.permissions ||
      typeof payload.permissions !== 'object' ||
      Array.isArray(payload.permissions) ||
      !payload.temporalHints ||
      typeof payload.temporalHints !== 'object' ||
      Array.isArray(payload.temporalHints) ||
      Object.keys(payload.temporalHints).length !== 0
    )
      return false;
    const resourceNames = Object.keys(payload.permissions);
    if (
      resourceNames.some((name) => !(AUTHORIZATION_RESOURCES as readonly string[]).includes(name))
    )
      return false;
    const permissions: Record<string, Record<string, boolean>> = {};
    for (const resource of AUTHORIZATION_RESOURCES) {
      if (!Object.hasOwn(payload.permissions, resource)) continue;
      const actions = payload.permissions[resource];
      if (!actions || typeof actions !== 'object' || Array.isArray(actions)) return false;
      if (
        Object.keys(actions).some(
          (name) =>
            !(AUTHORIZATION_ACTIONS as readonly string[]).includes(name) ||
            typeof actions[name] !== 'boolean',
        )
      )
        return false;
      permissions[resource] = {};
      for (const action of AUTHORIZATION_ACTIONS) {
        if (Object.hasOwn(actions, action)) permissions[resource][action] = actions[action];
      }
    }
    const recovered = {
      ...payload,
      generatedAt: new Date(payload.generatedAt).toISOString(),
      expiresAt: new Date(payload.expiresAt).toISOString(),
      permissions,
    };
    return await crypto.subtle.verify(
      { name: 'Ed25519' },
      importedKey,
      signatureBytes as unknown as BufferSource,
      enc.encode(JSON.stringify(recovered)),
    );
  } catch (err) {
    console.error('[Signature] Signature verification system error:', err);
    return false;
  }
}
