import { Badge, Button, Surface, Text } from '@repo/ui/components/native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

interface NearbySanctuaryPeer {
  id: string;
  name: string;
  role: string;
  bearer: 'lan_mdns' | 'ble_gossip' | 'nostr_relay';
  rssi?: string;
  pendingChanges: number;
  lastSeen: string;
}

export default function MobilePeersRoute() {
  const [isScanning, setIsScanning] = useState(false);
  const [syncedState, setSyncedState] = useState<string | null>(null);
  const [showQrSneakernet, setShowQrSneakernet] = useState(false);

  const discoveredPeers: NearbySanctuaryPeer[] = [
    {
      id: 'peer_kitchen_01',
      name: 'Central Kitchen Terminal',
      role: 'Midday Meal Dispensary',
      bearer: 'lan_mdns',
      pendingChanges: 2,
      lastSeen: 'Active (School Hotspot - 54 Mbps)',
    },
    {
      id: 'peer_teacher_bandara',
      name: 'Teacher S. Bandara',
      role: 'Grade 10 Section Head',
      bearer: 'ble_gossip',
      rssi: '-64 dBm (12m)',
      pendingChanges: 1,
      lastSeen: 'Active (BitChat BLE Gossip)',
    },
    {
      id: 'peer_principal_desk',
      name: 'Principal Office Sanctuary Node',
      role: 'Institutional Anchor',
      bearer: 'lan_mdns',
      pendingChanges: 0,
      lastSeen: 'Active (Local Subnet)',
    },
    {
      id: 'peer_zonal_outpost',
      name: 'Piliyandala Zonal Director Outpost',
      role: 'Delay-Tolerant Buffer',
      bearer: 'nostr_relay',
      pendingChanges: 4,
      lastSeen: 'Nostr Relay (wss://relay.damus.io)',
    },
  ];

  const handleTriggerSync = () => {
    setIsScanning(true);
    setSyncedState(null);

    setTimeout(() => {
      setIsScanning(false);
      setSyncedState('Synced 3 mutations (Morning Meal & Grade 10 Roll-Call) with 2 nearby peers');
    }, 1200);
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      {/* Header */}
      <View style={{ gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text kind="title" style={{ fontSize: 22, fontWeight: '700' }}>
            Nearby Sanctuary Peers
          </Text>
          <Badge label="Multi-Bearer Mesh" tone="success" />
        </View>
        <Text kind="body" tone="soft" style={{ fontSize: 13 }}>
          High-speed local Wi-Fi, BitChat BLE multi-hop gossip, Nostr DTN, & optical sneakernet.
        </Text>
      </View>

      {/* 4-Tier Transport Matrix */}
      <Surface tone="raised" style={{ padding: 16, borderRadius: 16 }}>
        <View style={{ gap: 12 }}>
          <Text kind="caption" tone="soft" style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Active Mesh Transports
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1, backgroundColor: 'rgba(59,130,246,0.08)', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(59,130,246,0.2)' }}>
              <Text kind="caption" style={{ fontSize: 10, fontWeight: '700', color: '#2563eb', textTransform: 'uppercase' }}>Wi-Fi LAN</Text>
              <Text kind="body" style={{ fontSize: 12, fontWeight: '700', marginTop: 2 }}>54 Mbps</Text>
              <Text kind="caption" tone="soft" style={{ fontSize: 10, marginTop: 2 }}>High-Speed</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: 'rgba(168,85,247,0.08)', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(168,85,247,0.2)' }}>
              <Text kind="caption" style={{ fontSize: 10, fontWeight: '700', color: '#9333ea', textTransform: 'uppercase' }}>BLE Gossip</Text>
              <Text kind="body" style={{ fontSize: 12, fontWeight: '700', marginTop: 2 }}>BitChat</Text>
              <Text kind="caption" tone="soft" style={{ fontSize: 10, marginTop: 2 }}>Presence</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: 'rgba(245,158,11,0.08)', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)' }}>
              <Text kind="caption" style={{ fontSize: 10, fontWeight: '700', color: '#d97706', textTransform: 'uppercase' }}>Nostr DTN</Text>
              <Text kind="body" style={{ fontSize: 12, fontWeight: '700', marginTop: 2 }}>Store-Fwd</Text>
              <Text kind="caption" tone="soft" style={{ fontSize: 10, marginTop: 2 }}>Async</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: 'rgba(16,185,129,0.08)', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)' }}>
              <Text kind="caption" style={{ fontSize: 10, fontWeight: '700', color: '#059669', textTransform: 'uppercase' }}>Optical QR</Text>
              <Text kind="body" style={{ fontSize: 12, fontWeight: '700', marginTop: 2 }}>Air-Gap</Text>
              <Text kind="caption" tone="soft" style={{ fontSize: 10, marginTop: 2 }}>Silent</Text>
            </View>
          </View>

          <Button
            variant="primary"
            label={isScanning ? 'Syncing Across All Bearers...' : 'Sync Workspace Now'}
            disabled={isScanning}
            onPress={handleTriggerSync}
          />

          {syncedState && (
            <View style={{ backgroundColor: 'rgba(16,185,129,0.1)', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)' }}>
              <Text kind="caption" tone="lamp" style={{ fontSize: 12, fontWeight: '600' }}>{syncedState}</Text>
            </View>
          )}
        </View>
      </Surface>

      {/* Discovered Peers List */}
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text kind="title" style={{ fontSize: 15, fontWeight: '600' }}>
            Discovered School Nodes ({discoveredPeers.length})
          </Text>
          <Text kind="caption" tone="soft" style={{ fontSize: 12 }}>Auto-discovered nearby</Text>
        </View>

        {discoveredPeers.map((peer) => (
          <Surface key={peer.id} tone="raised" style={{ padding: 14, borderRadius: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, marginRight: 8, gap: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text kind="title" style={{ fontSize: 14, fontWeight: '700' }}>{peer.name}</Text>
                  {peer.bearer === 'ble_gossip' && <Badge label="BLE" tone="lamp" />}
                  {peer.bearer === 'lan_mdns' && <Badge label="LAN Hotspot" tone="neutral" />}
                  {peer.bearer === 'nostr_relay' && <Badge label="Nostr Relay" tone="lamp" />}
                </View>
                <Text kind="caption" tone="soft" style={{ fontSize: 12 }}>{peer.role}</Text>
                <Text kind="caption" tone="soft" style={{ fontSize: 11, fontFamily: 'monospace' }}>
                  {peer.lastSeen} {peer.rssi ? `| ${peer.rssi}` : ''}
                </Text>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                {peer.pendingChanges > 0 ? (
                  <Badge label={`${peer.pendingChanges} Pending`} tone="lamp" />
                ) : (
                  <Badge label="Synced" tone="success" />
                )}
              </View>
            </View>
          </Surface>
        ))}
      </View>

      {/* Staff Room Hotspot Instructions */}
      <Surface tone="raised" style={{ padding: 14, borderRadius: 12 }}>
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text kind="title" style={{ fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Staff Room High-Speed Hotspot
            </Text>
            <Badge label="Recommended" tone="neutral" />
          </View>
          <Text kind="caption" tone="soft" style={{ fontSize: 12 }}>
            Any teacher can toggle phone Personal Hotspot named "EdLove-Sanctuary". All nearby
            teachers connect with zero mobile data used. Syncs 1,000+ attendance records in &lt;1
            second.
          </Text>
        </View>
      </Surface>

      {/* Air-Gapped Optical Sneakernet Trigger */}
      <Surface tone="raised" style={{ padding: 14, borderRadius: 12 }}>
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text kind="title" style={{ fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Air-Gapped Optical Sneakernet
            </Text>
            <Pressable
              onPress={() => setShowQrSneakernet(!showQrSneakernet)}
              style={{ backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}
            >
              <Text kind="caption" tone="lamp" style={{ fontSize: 12, fontWeight: '600' }}>
                {showQrSneakernet ? 'Hide QR Stream' : 'Transmit via QR'}
              </Text>
            </Pressable>
          </View>
          <Text kind="caption" tone="soft" style={{ fontSize: 12 }}>
            100% radio-silent transfer. The screen cycles animated high-density QR frames at 20
            fps. The receiver scans with their camera to transfer signed mutation batches without
            Wi-Fi or Bluetooth.
          </Text>

          {showQrSneakernet && (
            <View style={{ borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 4 }}>
              <Text kind="title" style={{ fontSize: 12, fontWeight: '700', marginBottom: 4 }}>
                Transmitting Signed Mutation Batch (Frame 1/4)
              </Text>
              <Text kind="caption" tone="soft" style={{ fontSize: 11, fontFamily: 'monospace', marginBottom: 8 }}>
                Payload: MEAL_VOUCHERS + ATTENDANCE_5B
              </Text>
              <View style={{ width: 192, height: 192, backgroundColor: '#ffffff', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', alignItems: 'center', justifyContent: 'center', padding: 8 }}>
                <Text kind="caption" style={{ fontSize: 10, textAlign: 'center', fontFamily: 'monospace', color: '#000000' }}>
                  MESH:batch_91a:1/4:eyJzY29wZSI6ImNsYXNzcm9vbSIsImlkZW1wb3RlbmN5S2V5IjoiaWRlbV81YiJ9...
                </Text>
              </View>
              <Text kind="caption" tone="lamp" style={{ fontSize: 11, fontWeight: '600', marginTop: 8 }}>
                Streaming at 20 frames/sec | Optical Handshake Active
              </Text>
            </View>
          )}
        </View>
      </Surface>
    </ScrollView>
  );
}
