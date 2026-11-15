import { Badge, Button, Grid, Group, Notice, Surface, Text } from '@repo/ui/components/native';
import { useState } from 'react';
import { View } from 'react-native';
import { MarkedLine, RoomPage } from '@/components/shell/RoomPage';

const BEARER_LABEL = {
  lan_mdns: 'LAN Hotspot',
  ble_gossip: 'BLE',
  nostr_relay: 'Nostr Relay',
} as const;

const TRANSPORTS = [
  { name: 'Wi-Fi LAN', value: '54 Mbps', note: 'High-Speed' },
  { name: 'BLE Gossip', value: 'BitChat', note: 'Presence' },
  { name: 'Nostr DTN', value: 'Store-Fwd', note: 'Asynchronous' },
  { name: 'Optical QR', value: 'Air-Gap', note: 'Radio-Silent' },
] as const;

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
    <RoomPage
      title="Nearby Sanctuary Peers"
      intro="High-speed local Wi-Fi, BitChat BLE multi-hop gossip, Nostr DTN, & optical sneakernet."
      mark={{ label: 'Multi-Bearer Mesh', tone: 'success' }}
    >
      <Surface tone="raised" style={{ padding: 18, gap: 14 }}>
        <Text kind="label" tone="soft">
          Active Mesh Transports
        </Text>
        <Grid min="sm" max={4} gap="inside">
          {TRANSPORTS.map((tr) => (
            <Surface key={tr.name} tone="inset" style={{ padding: 10, gap: 2 }}>
              <Text kind="caption" tone="lamp">
                {tr.name}
              </Text>
              <Text kind="label">{tr.value}</Text>
              <Text kind="caption" tone="soft">
                {tr.note}
              </Text>
            </Surface>
          ))}
        </Grid>
        <Button
          label={isScanning ? 'Syncing Across All Bearers...' : 'Sync Workspace Now'}
          variant="primary"
          fullWidth
          loading={isScanning}
          disabled={isScanning}
          onPress={handleTriggerSync}
        />
        {syncedState ? <Notice tone="success" message={syncedState} /> : null}
      </Surface>

      <Group
        label={`Discovered School Nodes (${discoveredPeers.length})`}
        footer="Auto-discovered nearby"
      >
        {discoveredPeers.map((peer) => (
          <View key={peer.id} style={{ gap: 4, paddingVertical: 12 }}>
            <MarkedLine
              title={peer.name}
              detail={peer.role}
              mark={
                peer.pendingChanges > 0
                  ? { label: `${peer.pendingChanges} Pending`, tone: 'lamp' }
                  : { label: 'Synced', tone: 'success' }
              }
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Badge label={BEARER_LABEL[peer.bearer]} />
              <Text kind="caption" tone="faint" style={{ flexShrink: 1 }}>
                {peer.lastSeen} {peer.rssi ? `| ${peer.rssi}` : ''}
              </Text>
            </View>
          </View>
        ))}
      </Group>

      <Notice
        tone="lamp"
        title="Staff Room High-Speed Hotspot"
        message={
          'Any teacher can toggle phone Personal Hotspot named "EdLove-Sanctuary". All nearby teachers connect with zero mobile data used. Syncs 1,000+ attendance records in <1 second.'
        }
      />

      <Surface tone="raised" style={{ padding: 18, gap: 12 }}>
        <MarkedLine
          title="Air-Gapped Optical Sneakernet"
          detail="100% radio-silent transfer. The screen cycles animated high-density QR frames at 20 fps. The receiver scans with their camera to transfer signed mutation batches without Wi-Fi or Bluetooth."
        />
        <Button
          label={showQrSneakernet ? 'Hide QR Stream' : 'Transmit via QR'}
          variant="secondary"
          onPress={() => setShowQrSneakernet(!showQrSneakernet)}
        />
        {showQrSneakernet ? (
          <Surface tone="inset" style={{ padding: 16, gap: 8, alignItems: 'center' }}>
            <Text kind="label">Transmitting Signed Mutation Batch (Frame 1/4)</Text>
            <Text kind="caption" tone="soft">
              Payload: MEAL_VOUCHERS + ATTENDANCE_5B
            </Text>
            <Surface
              tone="plain"
              style={{ width: 192, height: 192, padding: 8, justifyContent: 'center' }}
            >
              <Text kind="caption" align="center">
                MESH:batch_91a:1/4:eyJzY29wZSI6ImNsYXNzcm9vbSIsImlkZW1wb3RlbmN5S2V5IjoiaWRlbV81YiJ9...
              </Text>
            </Surface>
            <Text kind="caption" tone="lamp">
              Streaming at 20 frames/sec | Optical Handshake Active
            </Text>
          </Surface>
        ) : null}
      </Surface>
    </RoomPage>
  );
}
