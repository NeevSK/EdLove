import {
  Badge,
  BadgeText,
  Button,
  ButtonText,
  Heading,
  HStack,
  Pressable,
  ScrollView,
  Text,
  View,
  VStack,
} from '@repo/ui/primitives';
import { useState } from 'react';

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
    <ScrollView className="flex-1 bg-phase-canvas">
      <VStack className="p-4 gap-4">
        {/* Header */}
        <VStack className="gap-1">
          <HStack className="items-center justify-between">
            <Heading size="xl" className="text-phase-world font-bold">
              Nearby Sanctuary Peers
            </Heading>
            <Badge className="bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1">
              <BadgeText className="text-emerald-600 text-xs font-semibold">
                Multi-Bearer Mesh
              </BadgeText>
            </Badge>
          </HStack>
          <Text className="text-phase-muted text-sm">
            High-speed local Wi-Fi, BitChat BLE multi-hop gossip, Nostr DTN, & optical sneakernet.
          </Text>
        </VStack>

        {/* 4-Tier Transport Matrix */}
        <View className="bg-phase-surface border border-phase-border/40 rounded-2xl p-4">
          <VStack className="gap-3">
            <Text className="text-xs font-bold uppercase tracking-wider text-phase-muted">
              Active Mesh Transports
            </Text>
            <HStack className="justify-between gap-2">
              <View className="flex-1 bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20">
                <Text className="text-[10px] text-blue-600 font-bold uppercase">Wi-Fi LAN</Text>
                <Text className="text-xs font-bold text-phase-world mt-0.5">54 Mbps</Text>
                <Text className="text-[10px] text-phase-muted mt-0.5">High-Speed</Text>
              </View>
              <View className="flex-1 bg-purple-500/10 p-2.5 rounded-xl border border-purple-500/20">
                <Text className="text-[10px] text-purple-600 font-bold uppercase">BLE Gossip</Text>
                <Text className="text-xs font-bold text-phase-world mt-0.5">BitChat</Text>
                <Text className="text-[10px] text-phase-muted mt-0.5">Presence</Text>
              </View>
              <View className="flex-1 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                <Text className="text-[10px] text-amber-600 font-bold uppercase">Nostr DTN</Text>
                <Text className="text-xs font-bold text-phase-world mt-0.5">Store-Fwd</Text>
                <Text className="text-[10px] text-phase-muted mt-0.5">Asynchronous</Text>
              </View>
              <View className="flex-1 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                <Text className="text-[10px] text-emerald-600 font-bold uppercase">Optical QR</Text>
                <Text className="text-xs font-bold text-phase-world mt-0.5">Air-Gap</Text>
                <Text className="text-[10px] text-phase-muted mt-0.5">Radio-Silent</Text>
              </View>
            </HStack>

            <Button
              className="bg-phase-primary rounded-xl h-11 mt-1"
              onPress={handleTriggerSync}
              isDisabled={isScanning}
            >
              <ButtonText className="text-white font-semibold">
                {isScanning ? 'Syncing Across All Bearers...' : 'Sync Workspace Now'}
              </ButtonText>
            </Button>

            {syncedState && (
              <View className="bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                <Text className="text-xs text-emerald-700 font-medium">{syncedState}</Text>
              </View>
            )}
          </VStack>
        </View>

        {/* Discovered Peers List */}
        <VStack className="gap-3">
          <HStack className="items-center justify-between">
            <Heading size="sm" className="text-phase-world font-semibold">
              Discovered School Nodes ({discoveredPeers.length})
            </Heading>
            <Text className="text-xs text-phase-muted">Auto-discovered nearby</Text>
          </HStack>

          {discoveredPeers.map((peer) => (
            <View
              key={peer.id}
              className="bg-phase-surface border border-phase-border/30 rounded-xl p-3.5"
            >
              <HStack className="items-center justify-between">
                <VStack className="flex-1 mr-2">
                  <HStack className="items-center gap-1.5">
                    <Text className="text-sm font-bold text-phase-world">{peer.name}</Text>
                    {peer.bearer === 'ble_gossip' && (
                      <Badge className="bg-purple-500/10 rounded px-1.5 py-0.5">
                        <BadgeText className="text-purple-600 text-[10px]">BLE</BadgeText>
                      </Badge>
                    )}
                    {peer.bearer === 'lan_mdns' && (
                      <Badge className="bg-blue-500/10 rounded px-1.5 py-0.5">
                        <BadgeText className="text-blue-600 text-[10px]">LAN Hotspot</BadgeText>
                      </Badge>
                    )}
                    {peer.bearer === 'nostr_relay' && (
                      <Badge className="bg-amber-500/10 rounded px-1.5 py-0.5">
                        <BadgeText className="text-amber-600 text-[10px]">Nostr Relay</BadgeText>
                      </Badge>
                    )}
                  </HStack>
                  <Text className="text-xs text-phase-muted mt-0.5">{peer.role}</Text>
                  <Text className="text-[11px] text-phase-muted mt-1 font-mono">
                    {peer.lastSeen} {peer.rssi ? `| ${peer.rssi}` : ''}
                  </Text>
                </VStack>

                <VStack className="items-end gap-1">
                  {peer.pendingChanges > 0 ? (
                    <Badge className="bg-amber-500/10 rounded px-2 py-0.5">
                      <BadgeText className="text-amber-600 text-xs">
                        {peer.pendingChanges} Pending
                      </BadgeText>
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-500/10 rounded px-2 py-0.5">
                      <BadgeText className="text-emerald-600 text-xs">Synced</BadgeText>
                    </Badge>
                  )}
                </VStack>
              </HStack>
            </View>
          ))}
        </VStack>

        {/* Staff Room Hotspot Instructions */}
        <View className="bg-phase-surface/80 border border-blue-500/20 rounded-xl p-3.5">
          <VStack className="gap-2">
            <HStack className="items-center justify-between">
              <Heading size="xs" className="text-blue-600 font-bold uppercase tracking-wider">
                Staff Room High-Speed Hotspot
              </Heading>
              <Badge className="bg-blue-500/10 rounded px-2 py-0.5">
                <BadgeText className="text-blue-600 text-[10px]">Recommended</BadgeText>
              </Badge>
            </HStack>
            <Text className="text-xs text-phase-muted">
              Any teacher can toggle phone Personal Hotspot named "EdLove-Sanctuary". All nearby
              teachers connect with zero mobile data used. Syncs 1,000+ attendance records in &lt;1
              second.
            </Text>
          </VStack>
        </View>

        {/* Air-Gapped Optical Sneakernet Trigger */}
        <View className="bg-phase-surface/60 border border-phase-border/30 rounded-xl p-3.5">
          <VStack className="gap-2.5">
            <HStack className="items-center justify-between">
              <Heading size="xs" className="text-phase-world font-bold uppercase tracking-wider">
                Air-Gapped Optical Sneakernet
              </Heading>
              <Pressable
                onPress={() => setShowQrSneakernet(!showQrSneakernet)}
                className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1"
              >
                <Text className="text-emerald-600 text-xs font-semibold">
                  {showQrSneakernet ? 'Hide QR Stream' : 'Transmit via QR'}
                </Text>
              </Pressable>
            </HStack>
            <Text className="text-xs text-phase-muted">
              100% radio-silent transfer. The screen cycles animated high-density QR frames at 20
              fps. The receiver scans with their camera to transfer signed mutation batches without
              Wi-Fi or Bluetooth.
            </Text>

            {showQrSneakernet && (
              <View className="bg-phase-surface border border-emerald-500/30 p-4 rounded-xl items-center mt-1">
                <Text className="text-xs font-bold text-phase-world mb-1">
                  Transmitting Signed Mutation Batch (Frame 1/4)
                </Text>
                <Text className="text-[11px] font-mono text-phase-muted mb-2">
                  Payload: MEAL_VOUCHERS + ATTENDANCE_5B
                </Text>
                <View className="w-48 h-48 bg-white border border-black/10 rounded-lg items-center justify-center p-2">
                  <Text className="text-[10px] text-center font-mono text-black break-all">
                    MESH:batch_91a:1/4:eyJzY29wZSI6ImNsYXNzcm9vbSIsImlkZW1wb3RlbmN5S2V5IjoiaWRlbV81YiJ9...
                  </Text>
                </View>
                <Text className="text-[11px] text-emerald-600 font-semibold mt-2">
                  Streaming at 20 frames/sec | Optical Handshake Active
                </Text>
              </View>
            )}
          </VStack>
        </View>
      </VStack>
    </ScrollView>
  );
}
