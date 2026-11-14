import * as fs from 'fs';
import * as path from 'path';
import { describe, expect, it } from 'vitest';

describe('Mesh Peer Sync Safety & Sanctuary Architecture', () => {
  const peersRoutePath = path.resolve(__dirname, '../../../app/(tabs)/workspace/peers.tsx');
  const content = fs.readFileSync(peersRoutePath, 'utf-8');

  it('exposes the full 4-tier multi-bearer mesh transports', () => {
    expect(content).toContain('lan_mdns');
    expect(content).toContain('ble_gossip');
    expect(content).toContain('nostr_relay');
    expect(content).toContain('Air-Gapped Optical Sneakernet');
  });

  it('provides zero-data Staff Room High-Speed Hotspot guidance', () => {
    expect(content).toContain('Staff Room High-Speed Hotspot');
    expect(content).toContain('EdLove-Sanctuary');
    expect(content).toContain('zero mobile data');
  });

  it('integrates BitChat BLE gossip and Nostr delay-tolerant routing', () => {
    expect(content).toContain('BitChat');
    expect(content).toContain('BLE Gossip');
    expect(content).toContain('Nostr Relay');
    expect(content).toContain('wss://relay.damus.io');
  });

  it('strictly adheres to the Quiet Cultivation covenant with zero commercial fluff', () => {
    expect(content).not.toMatch(/fundraising|crowdfunding|sponsor\s*tier|patron|donate\s*now/i);
  });
});
