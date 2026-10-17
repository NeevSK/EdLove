import type { QueuedMutation } from '@repo/core/lib/sync/types';
import type { IMeshBearerTransport, MeshPacket, MeshPeer, MeshSyncResult } from './types';

export interface LocalMeshSyncEngineOptions {
  nodeId: string;
  nodeDisplayName: string;
  defaultMaxHops?: number;
  transports: IMeshBearerTransport[];
  onApplyMutation?: (mutation: QueuedMutation) => Promise<void> | void;
}

export class LocalMeshSyncEngine {
  private nodeId: string;
  private nodeDisplayName: string;
  private defaultMaxHops: number;
  private transports: IMeshBearerTransport[];
  private onApplyMutation?: (mutation: QueuedMutation) => Promise<void> | void;

  private peers: Map<string, MeshPeer> = new Map();
  private processedPacketIds: Set<string> = new Set();
  private knownIdempotencyKeys: Set<string> = new Set();
  private peerListeners: Set<(peers: MeshPeer[]) => void> = new Set();

  constructor(options: LocalMeshSyncEngineOptions) {
    this.nodeId = options.nodeId;
    this.nodeDisplayName = options.nodeDisplayName;
    this.defaultMaxHops = options.defaultMaxHops ?? 3;
    this.transports = options.transports;
    this.onApplyMutation = options.onApplyMutation;

    this.setupTransportListeners();
  }

  private setupTransportListeners(): void {
    for (const transport of this.transports) {
      transport.onPeerDiscovered((peer) => {
        this.peers.set(peer.peerId, peer);
        this.notifyPeerListeners();
      });

      transport.onPacketReceived((packet) => {
        void this.handleIncomingPacket(packet);
      });
    }
  }

  public getDiscoveredPeers(): MeshPeer[] {
    return Array.from(this.peers.values());
  }

  public onPeersChanged(listener: (peers: MeshPeer[]) => void): () => void {
    this.peerListeners.add(listener);
    listener(this.getDiscoveredPeers());
    return () => {
      this.peerListeners.delete(listener);
    };
  }

  private notifyPeerListeners(): void {
    const list = this.getDiscoveredPeers();
    for (const listener of this.peerListeners) {
      listener(list);
    }
  }

  public recordKnownIdempotencyKey(key: string): void {
    this.knownIdempotencyKeys.add(key);
  }

  /**
   * Starts discovery across all available bearer transports.
   */
  public async startMeshDiscovery(): Promise<void> {
    const active = this.transports.filter((t) => t.isAvailable());
    await Promise.all(active.map((t) => t.startDiscovery()));
  }

  /**
   * Stops discovery across all bearers to save power.
   */
  public async stopMeshDiscovery(): Promise<void> {
    await Promise.all(this.transports.map((t) => t.stopDiscovery()));
  }

  /**
   * Broadcasts a batch of local mutations to all nearby peers.
   */
  public async broadcastLocalMutations(
    mutations: QueuedMutation[],
  ): Promise<{ packetId: string; totalSent: number }> {
    if (mutations.length === 0) {
      return { packetId: '', totalSent: 0 };
    }

    const packetId = `pkt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const packet: MeshPacket = {
      packetId,
      senderId: this.nodeId,
      originTimestamp: new Date().toISOString(),
      hopCount: 0,
      maxHops: this.defaultMaxHops,
      mutations,
    };

    this.processedPacketIds.add(packetId);
    for (const m of mutations) {
      this.knownIdempotencyKeys.add(m.idempotencyKey);
    }

    let totalSent = 0;
    const active = this.transports.filter((t) => t.isAvailable());
    for (const transport of active) {
      const res = await transport.broadcastPacket(packet);
      totalSent += res.sentToPeers;
    }

    return { packetId, totalSent };
  }

  /**
   * Processes a packet received from a peer, deduplicating mutations and relaying if needed.
   */
  public async handleIncomingPacket(packet: MeshPacket): Promise<MeshSyncResult> {
    // 1. Loop detection: if packet was already handled, ignore
    if (this.processedPacketIds.has(packet.packetId)) {
      return {
        packetId: packet.packetId,
        incomingMutationsCount: packet.mutations.length,
        newMutationsApplied: 0,
        duplicateMutationsSkipped: packet.mutations.length,
        forwardedToPeersCount: 0,
      };
    }

    this.processedPacketIds.add(packet.packetId);

    // 2. Process mutations with idempotency deduplication
    let newCount = 0;
    let duplicateCount = 0;

    for (const mutation of packet.mutations) {
      if (this.knownIdempotencyKeys.has(mutation.idempotencyKey)) {
        duplicateCount++;
      } else {
        this.knownIdempotencyKeys.add(mutation.idempotencyKey);
        newCount++;
        if (this.onApplyMutation) {
          await this.onApplyMutation(mutation);
        }
      }
    }

    // 3. Multi-Hop Epidemic Gossip Relay (Bitchat style)
    let forwardedCount = 0;
    const nextHop = packet.hopCount + 1;

    if (nextHop <= packet.maxHops && newCount > 0) {
      const relayedPacket: MeshPacket = {
        ...packet,
        hopCount: nextHop,
      };

      const active = this.transports.filter((t) => t.isAvailable());
      for (const transport of active) {
        const res = await transport.broadcastPacket(relayedPacket);
        forwardedCount += res.sentToPeers;
      }
    }

    return {
      packetId: packet.packetId,
      incomingMutationsCount: packet.mutations.length,
      newMutationsApplied: newCount,
      duplicateMutationsSkipped: duplicateCount,
      forwardedToPeersCount: forwardedCount,
    };
  }
}
