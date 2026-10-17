import type { QueuedMutation } from '@repo/core/lib/sync/types';

/**
 * ============================================================================
 * SANCTUARY MULTI-BEARER SOVEREIGN MESH NETWORKING CONTRACTS
 * ============================================================================
 *
 * DESIGN PRINCIPLES:
 * 1. Physical Layer Zero-Cost: Operates using built-in smartphone radios (Wi-Fi, BLE, Camera).
 *    Never requires cellular data plans, central servers, or ongoing dollar subscriptions.
 * 2. Tri-Bearer Adaptive Routing:
 *    - 'lan_mdns': High-speed Wi-Fi / Hotspot mDNS (20-100 MB/s). The workhorse for bulk ERP sync.
 *    - 'ble_gossip': Proximity-based Bluetooth Low Energy multi-hop gossip (BitChat style, 1-4 KB/s).
 *      Strictly used for presence beacons, sync request digests, and emergency roll calls.
 *    - 'qr_airgap': Optical animated QR sneakernet (@repo/scanner-kit). 100% radio-silent,
 *      immune to RF interference, battery friendly, zero OS background restrictions.
 *    - 'nostr_relay': Delay-tolerant asynchronous store-and-forward relay buffer across public
 *      Nostr relays when a teacher or staff member reaches cellular internet.
 *
 * 3. Commutative Safety & Cryptography:
 *    All packets carry idempotency keys and Lamport logical clocks for conflict-free
 *    convergence, and are encrypted via AES-GCM 256-bit using the school's sovereign secret.
 */

export type MeshBearerType = 'lan_mdns' | 'ble_gossip' | 'qr_airgap' | 'nostr_relay';

export interface MeshStateDigest {
  nodeId: string;
  scope: string;
  rootStateHash: string;
  lastMutationTimestamp: number;
  uncommittedMutationsCount: number;
}

export interface MeshPeer {
  peerId: string;
  displayName: string;
  bearer: MeshBearerType;
  address?: string;
  lastSeenAt: string;
  protocolVersion: string;
  stateDigest?: MeshStateDigest;
}

export interface MeshPacket {
  packetId: string;
  senderId: string;
  originTimestamp: string;
  hopCount: number;
  maxHops: number;
  mutations: QueuedMutation[];
  signature?: string;
  encryptedPayload?: string;
  stateDigest?: MeshStateDigest;
}

export interface IMeshBearerTransport {
  bearerType: MeshBearerType;
  isAvailable(): boolean;
  startDiscovery(): Promise<void>;
  stopDiscovery(): Promise<void>;
  broadcastPacket(packet: MeshPacket): Promise<{ sentToPeers: number }>;
  onPeerDiscovered(callback: (peer: MeshPeer) => void): () => void;
  onPacketReceived(callback: (packet: MeshPacket) => void): () => void;
}

export interface MeshSyncResult {
  packetId: string;
  incomingMutationsCount: number;
  newMutationsApplied: number;
  duplicateMutationsSkipped: number;
  forwardedToPeersCount: number;
}
