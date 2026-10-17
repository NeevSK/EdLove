import type { QueuedMutation } from '@repo/core/lib/sync/types';
import { describe, expect, it, vi } from 'vitest';
import { LocalMeshSyncEngine } from './LocalMeshSyncEngine';
import type { IMeshBearerTransport, MeshPacket, MeshPeer } from './types';

class MockBearerTransport implements IMeshBearerTransport {
  public bearerType = 'lan_mdns' as const;
  public isAvailableFlag = true;
  private peerDiscoveredCb?: (peer: MeshPeer) => void;
  private packetReceivedCb?: (packet: MeshPacket) => void;
  public broadcastedPackets: MeshPacket[] = [];

  isAvailable(): boolean {
    return this.isAvailableFlag;
  }
  async startDiscovery(): Promise<void> {}
  async stopDiscovery(): Promise<void> {}
  async broadcastPacket(packet: MeshPacket): Promise<{ sentToPeers: number }> {
    this.broadcastedPackets.push(packet);
    return { sentToPeers: 1 };
  }
  onPeerDiscovered(cb: (peer: MeshPeer) => void): () => void {
    this.peerDiscoveredCb = cb;
    return () => {};
  }
  onPacketReceived(cb: (packet: MeshPacket) => void): () => void {
    this.packetReceivedCb = cb;
    return () => {};
  }

  // Test helpers
  simulatePeer(peer: MeshPeer): void {
    this.peerDiscoveredCb?.(peer);
  }
  simulatePacket(packet: MeshPacket): void {
    this.packetReceivedCb?.(packet);
  }
}

describe('LocalMeshSyncEngine', () => {
  it('discovers peers and notifies listeners', () => {
    const transport = new MockBearerTransport();
    const engine = new LocalMeshSyncEngine({
      nodeId: 'node_teacher_a',
      nodeDisplayName: 'Teacher Kamal',
      transports: [transport],
    });

    const listener = vi.fn();
    engine.onPeersChanged(listener);

    expect(listener).toHaveBeenCalledWith([]);

    transport.simulatePeer({
      peerId: 'node_kitchen_b',
      displayName: 'School Kitchen Terminal',
      bearer: 'lan_mdns',
      lastSeenAt: '2026-10-10T08:30:00Z',
      protocolVersion: '1.0.0',
    });

    expect(engine.getDiscoveredPeers()).toHaveLength(1);
    expect(listener).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ peerId: 'node_kitchen_b' })]),
    );
  });

  it('broadcasts local mutations to active transports', async () => {
    const transport = new MockBearerTransport();
    const engine = new LocalMeshSyncEngine({
      nodeId: 'node_teacher_a',
      nodeDisplayName: 'Teacher Kamal',
      transports: [transport],
    });

    const mockMutation: QueuedMutation = {
      id: 'mut_1',
      idempotencyKey: 'idem_attendance_g10_today',
      type: 'CREATE',
      scope: 'classroom',
      name: 'submitDailyAttendance',
      variables: { grade: 10, presentCount: 42 },
      timestamp: Date.now(),
      retryCount: 0,
    };

    const res = await engine.broadcastLocalMutations([mockMutation]);
    expect(res.totalSent).toBe(1);
    expect(transport.broadcastedPackets).toHaveLength(1);
    expect(transport.broadcastedPackets[0]?.mutations[0]?.idempotencyKey).toBe(
      'idem_attendance_g10_today',
    );
    expect(transport.broadcastedPackets[0]?.hopCount).toBe(0);
  });

  it('applies new incoming mutations and relays packet with incremented hopCount', async () => {
    const transport = new MockBearerTransport();
    const appliedMutations: QueuedMutation[] = [];

    const engine = new LocalMeshSyncEngine({
      nodeId: 'node_relay_middle',
      nodeDisplayName: 'Relay Tablet',
      defaultMaxHops: 3,
      transports: [transport],
      onApplyMutation: (m) => {
        appliedMutations.push(m);
      },
    });

    const packet: MeshPacket = {
      packetId: 'pkt_100',
      senderId: 'node_teacher_a',
      originTimestamp: '2026-10-10T08:30:00Z',
      hopCount: 1,
      maxHops: 3,
      mutations: [
        {
          id: 'mut_meal_ration',
          idempotencyKey: 'idem_meal_120_students',
          type: 'CREATE',
          scope: 'erp',
          name: 'recordMiddayMealRation',
          variables: { headcount: 120, riceKg: 9.6 },
          timestamp: Date.now(),
          retryCount: 0,
        },
      ],
    };

    const result = await engine.handleIncomingPacket(packet);

    expect(result.newMutationsApplied).toBe(1);
    expect(result.duplicateMutationsSkipped).toBe(0);
    expect(result.forwardedToPeersCount).toBe(1);
    expect(appliedMutations).toHaveLength(1);

    // Relayed packet must have hopCount = 2
    expect(transport.broadcastedPackets).toHaveLength(1);
    expect(transport.broadcastedPackets[0]?.hopCount).toBe(2);
  });

  it('deduplicates packets and skips already processed mutations', async () => {
    const transport = new MockBearerTransport();
    const appliedMutations: QueuedMutation[] = [];

    const engine = new LocalMeshSyncEngine({
      nodeId: 'node_node_end',
      nodeDisplayName: 'Principal Office',
      transports: [transport],
      onApplyMutation: (m) => {
        appliedMutations.push(m);
      },
    });

    const packet: MeshPacket = {
      packetId: 'pkt_200',
      senderId: 'node_teacher_a',
      originTimestamp: '2026-10-10T08:30:00Z',
      hopCount: 1,
      maxHops: 3,
      mutations: [
        {
          id: 'mut_test',
          idempotencyKey: 'idem_test_key',
          type: 'CREATE',
          scope: 'test',
          name: 'testAction',
          variables: {},
          timestamp: Date.now(),
          retryCount: 0,
        },
      ],
    };

    // First receive
    await engine.handleIncomingPacket(packet);
    expect(appliedMutations).toHaveLength(1);

    // Second receive of same packet: completely skipped
    const secondResult = await engine.handleIncomingPacket(packet);
    expect(secondResult.newMutationsApplied).toBe(0);
    expect(secondResult.duplicateMutationsSkipped).toBe(1);
    expect(appliedMutations).toHaveLength(1);
  });

  it('halts epidemic relay when packet reaches maxHops', async () => {
    const transport = new MockBearerTransport();
    const engine = new LocalMeshSyncEngine({
      nodeId: 'node_final',
      nodeDisplayName: 'Final Node',
      defaultMaxHops: 2,
      transports: [transport],
    });

    const packet: MeshPacket = {
      packetId: 'pkt_300',
      senderId: 'node_origin',
      originTimestamp: '2026-10-10T08:30:00Z',
      hopCount: 2, // Reached maxHops
      maxHops: 2,
      mutations: [
        {
          id: 'mut_final',
          idempotencyKey: 'idem_final_key',
          type: 'CREATE',
          scope: 'test',
          name: 'finalAction',
          variables: {},
          timestamp: Date.now(),
          retryCount: 0,
        },
      ],
    };

    const res = await engine.handleIncomingPacket(packet);
    expect(res.newMutationsApplied).toBe(1);
    expect(res.forwardedToPeersCount).toBe(0); // Not forwarded because hopCount + 1 > maxHops
    expect(transport.broadcastedPackets).toHaveLength(0);
  });
});
