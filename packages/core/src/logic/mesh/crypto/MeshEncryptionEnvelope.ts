import type { QueuedMutation } from '@repo/core/lib/sync/types';
import crypto from 'isomorphic-webcrypto';
import type { MeshPacket, MeshStateDigest } from '../types';

export interface EncryptedPayloadEnvelope {
  ivHex: string;
  cipherTextHex: string;
  authTagLength: number;
}

/**
 * Derives a CryptoKey for AES-GCM 256-bit from a human/institution secret passphrase or school ID.
 */
async function deriveAesKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const rawData = encoder.encode(secret);
  const hash = await crypto.subtle.digest('SHA-256', toArrayBuffer(rawData));

  return crypto.subtle.importKey('raw', hash, { name: 'AES-GCM', length: 256 }, false, [
    'encrypt',
    'decrypt',
  ]);
}

function bufferToHex(buffer: ArrayBuffer | Uint8Array): string {
  const arr = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

/**
 * Computes a deterministic SHA-256 state digest representing a node's local dataset.
 * Peers exchange this 32-byte digest over BLE or mDNS to instantly determine if out of sync.
 */
export async function computeMeshStateDigest(
  nodeId: string,
  scope: string,
  mutations: QueuedMutation[],
): Promise<MeshStateDigest> {
  const sortedKeys = mutations
    .map((m) => m.idempotencyKey)
    .sort()
    .join(':');

  const encoder = new TextEncoder();
  const digestBuffer = await crypto.subtle.digest(
    'SHA-256',
    toArrayBuffer(encoder.encode(`${scope}:${sortedKeys}`)),
  );

  const rootStateHash = bufferToHex(digestBuffer);
  const latestTimestamp = mutations.reduce((max, m) => Math.max(max, m.timestamp), 0);

  return {
    nodeId,
    scope,
    rootStateHash,
    lastMutationTimestamp: latestTimestamp,
    uncommittedMutationsCount: mutations.length,
  };
}

/**
 * Encrypts the sensitive mutations array of a MeshPacket using AES-GCM with a school secret key.
 * Allows safe relay over untrusted radios (BLE broadcast or public open Wi-Fi).
 */
export async function encryptMeshPacket(
  packet: MeshPacket,
  schoolSecretKey: string,
): Promise<MeshPacket> {
  const key = await deriveAesKey(schoolSecretKey);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const plaintext = encoder.encode(JSON.stringify(packet.mutations));

  const ciphertextBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: toArrayBuffer(iv),
    },
    key,
    toArrayBuffer(plaintext),
  );

  const envelope: EncryptedPayloadEnvelope = {
    ivHex: bufferToHex(iv),
    cipherTextHex: bufferToHex(ciphertextBuffer),
    authTagLength: 128,
  };

  // Compute integrity signature over header + encrypted payload
  const sigRaw = `${packet.packetId}:${packet.senderId}:${packet.originTimestamp}:${envelope.cipherTextHex}`;
  const sigBuffer = await crypto.subtle.digest('SHA-256', toArrayBuffer(encoder.encode(sigRaw)));

  return {
    ...packet,
    mutations: [], // Zeroed in outer transit
    encryptedPayload: JSON.stringify(envelope),
    signature: bufferToHex(sigBuffer),
  };
}

/**
 * Decrypts a received MeshPacket using the school secret key, verifying authenticity.
 */
export async function decryptMeshPacket(
  packet: MeshPacket,
  schoolSecretKey: string,
): Promise<MeshPacket> {
  if (!packet.encryptedPayload) {
    return packet; // Unencrypted packet
  }

  const envelope: EncryptedPayloadEnvelope = JSON.parse(packet.encryptedPayload);
  const key = await deriveAesKey(schoolSecretKey);
  const iv = hexToBuffer(envelope.ivHex);
  const ciphertext = hexToBuffer(envelope.cipherTextHex);

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: toArrayBuffer(iv),
    },
    key,
    toArrayBuffer(ciphertext),
  );

  const decoder = new TextDecoder();
  const mutations: QueuedMutation[] = JSON.parse(decoder.decode(decryptedBuffer));

  return {
    ...packet,
    mutations,
    encryptedPayload: undefined,
  };
}
