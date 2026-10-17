import type { QueuedMutation } from '@repo/core/lib/sync/types';
import { describe, expect, it } from 'vitest';
import { LanMdnsBearerTransport } from '../transports/LanMdnsBearerTransport';
import { NostrDtnBearerTransport } from '../transports/NostrDtnBearerTransport';
import type { MeshPacket } from '../types';
import {
  computeMeshStateDigest,
  decryptMeshPacket,
  encryptMeshPacket,
} from './MeshEncryptionEnvelope';

describe('MeshEncryptionEnvelope and Multi-Bearer Transports', () => {
  const schoolKey = 'gurudevi_school_colombo_07_secret_passphrase';

  const sampleMutations: QueuedMutation[] = [
    {
      id: 'mut_1',
      idempotencyKey: 'idem_attendance_5a_20261010',
      type: 'UPDATE',
      scope: 'classroom',
      name: 'recordAttendance',
      variables: { grade: '5A', presentCount: 38 },
      timestamp: 1760000000000,
      retryCount: 0,
    },
    {
      id: 'mut_2',
      idempotencyKey: 'idem_meal_voucher_20261010',
      type: 'CREATE',
      scope: 'institutional',
      name: 'dispatchNutritionRations',
      variables: { riceKg: 3.04, dhalKg: 0.76 },
      timestamp: 1760000001000,
      retryCount: 0,
    },
  ];

  it('computes deterministic state digests invariant to mutation input order', async () => {
    const digestA = await computeMeshStateDigest('node_1', 'classroom', sampleMutations);
    const digestB = await computeMeshStateDigest(
      'node_2',
      'classroom',
      [...sampleMutations].reverse(),
    );

    expect(digestA.rootStateHash).toBe(digestB.rootStateHash);
    expect(digestA.rootStateHash).toMatch(/^[0-9a-f]{64}$/);
    expect(digestA.uncommittedMutationsCount).toBe(2);
    expect(digestA.lastMutationTimestamp).toBe(1760000001000);
  });

  it('encrypts mutations into AES-GCM envelope and strips plain mutations in transit', async () => {
    const packet: MeshPacket = {
      packetId: 'pkt_101',
      senderId: 'teacher_sunil_phone',
      originTimestamp: '2026-10-10T10:00:00Z',
      hopCount: 0,
      maxHops: 3,
      mutations: sampleMutations,
    };

    const encrypted = await encryptMeshPacket(packet, schoolKey);

    expect(encrypted.mutations).toHaveLength(0); // Zeroed in plain transit
    expect(encrypted.encryptedPayload).toBeDefined();
    expect(encrypted.signature).toBeDefined();

    // Verify envelope fields
    const parsedEnvelope = JSON.parse(encrypted.encryptedPayload!);
    expect(parsedEnvelope.ivHex).toBeDefined();
    expect(parsedEnvelope.cipherTextHex).toBeDefined();

    // Decrypt with correct school key
    const decrypted = await decryptMeshPacket(encrypted, schoolKey);
    expect(decrypted.mutations).toHaveLength(2);
    expect(decrypted.mutations[0]?.idempotencyKey).toBe('idem_attendance_5a_20261010');
    expect(decrypted.mutations[1]?.idempotencyKey).toBe('idem_meal_voucher_20261010');
  });

  it('fails decryption when untrusted third party supplies wrong key', async () => {
    const packet: MeshPacket = {
      packetId: 'pkt_102',
      senderId: 'teacher_sunil_phone',
      originTimestamp: '2026-10-10T10:00:00Z',
      hopCount: 0,
      maxHops: 3,
      mutations: sampleMutations,
    };

    const encrypted = await encryptMeshPacket(packet, schoolKey);

    await expect(decryptMeshPacket(encrypted, 'attacker_wrong_passphrase')).rejects.toThrow();
  });

  it('manages LanMdnsBearerTransport peer discovery and packet broadcasting', async () => {
    const lanTransport = new LanMdnsBearerTransport({
      localNodeId: 'node_alpha',
      localDisplayName: 'Staff Room Wi-Fi Node',
    });

    let discoveredCount = 0;
    lanTransport.onPeerDiscovered(() => {
      discoveredCount++;
    });

    lanTransport.registerPeer({
      peerId: 'node_beta',
      displayName: 'Principal Office Laptop',
      bearer: 'lan_mdns',
      lastSeenAt: new Date().toISOString(),
      protocolVersion: '1.0.0',
    });

    expect(discoveredCount).toBe(1);

    await lanTransport.startDiscovery();
    const broadcastResult = await lanTransport.broadcastPacket({
      packetId: 'pkt_lan_1',
      senderId: 'node_alpha',
      originTimestamp: new Date().toISOString(),
      hopCount: 0,
      maxHops: 3,
      mutations: sampleMutations,
    });

    expect(broadcastResult.sentToPeers).toBe(1);
    await lanTransport.stopDiscovery();
  });

  it('handles NostrDtnBearerTransport delay-tolerant event relay', async () => {
    const nostrTransport = new NostrDtnBearerTransport({
      localNodeId: 'node_gamma',
      localDisplayName: 'Village School Outpost Node',
    });

    await nostrTransport.startDiscovery();

    let receivedPacket: MeshPacket | null = null;
    nostrTransport.onPacketReceived((pkt) => {
      receivedPacket = pkt;
    });

    nostrTransport.receiveRelayEvent({
      packetId: 'pkt_nostr_1',
      senderId: 'zonal_director_phone',
      originTimestamp: new Date().toISOString(),
      hopCount: 1,
      maxHops: 5,
      mutations: sampleMutations,
    });

    expect(receivedPacket).not.toBeNull();
    expect(receivedPacket!.packetId).toBe('pkt_nostr_1');
  });
});
