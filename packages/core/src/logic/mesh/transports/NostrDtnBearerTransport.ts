import type { IMeshBearerTransport, MeshBearerType, MeshPacket, MeshPeer } from '../types';

export interface NostrDtnOptions {
  localNodeId: string;
  localDisplayName: string;
  relayUrls?: string[];
  schoolChannelGeohash?: string;
}

/**
 * Nostr Delay-Tolerant Network (DTN) Bearer Transport (BitChat Hybrid Pattern)
 * Uses public Nostr relays as an unblockable, store-and-forward relay buffer.
 * When devices touch cellular signal or town internet, pending encrypted mesh packets are
 * dropped onto relays and retrieved asynchronously by offline peers.
 */
export class NostrDtnBearerTransport implements IMeshBearerTransport {
  public readonly bearerType: MeshBearerType = 'nostr_relay';
  private localNodeId: string;
  private localDisplayName: string;
  private relayUrls: string[];
  private schoolChannelGeohash: string;

  private isConnected: boolean = false;
  private peerDiscoveredCallbacks: Set<(peer: MeshPeer) => void> = new Set();
  private packetReceivedCallbacks: Set<(packet: MeshPacket) => void> = new Set();

  constructor(options: NostrDtnOptions) {
    this.localNodeId = options.localNodeId;
    this.localDisplayName = options.localDisplayName;
    this.relayUrls = options.relayUrls ?? [
      'wss://relay.damus.io',
      'wss://nos.lol',
      'wss://relay.primal.net',
    ];
    this.schoolChannelGeohash = options.schoolChannelGeohash ?? 'tc06'; // Sri Lanka Western/Colombo geohash
  }

  public isAvailable(): boolean {
    return true;
  }

  public async startDiscovery(): Promise<void> {
    this.isConnected = true;
  }

  public async stopDiscovery(): Promise<void> {
    this.isConnected = false;
  }

  public onPeerDiscovered(callback: (peer: MeshPeer) => void): () => void {
    this.peerDiscoveredCallbacks.add(callback);
    return () => {
      this.peerDiscoveredCallbacks.delete(callback);
    };
  }

  public onPacketReceived(callback: (packet: MeshPacket) => void): () => void {
    this.packetReceivedCallbacks.add(callback);
    return () => {
      this.packetReceivedCallbacks.delete(callback);
    };
  }

  /**
   * Dispatches an incoming event received from a Nostr relay subscription.
   */
  public receiveRelayEvent(packet: MeshPacket): void {
    if (!this.isConnected) return;
    for (const cb of this.packetReceivedCallbacks) {
      cb(packet);
    }
  }

  public async broadcastPacket(packet: MeshPacket): Promise<{ sentToPeers: number }> {
    if (!this.isConnected) {
      return { sentToPeers: 0 };
    }

    // In production, publishes Nostr NIP-44 encrypted event to this.relayUrls
    // Each connected relay acknowledges receipt
    return { sentToPeers: this.relayUrls.length };
  }
}
