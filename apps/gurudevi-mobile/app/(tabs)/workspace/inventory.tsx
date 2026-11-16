import { parseInstitutionalQR } from '@repo/scanner-kit';
import { Badge, Button, Surface, Text } from '@repo/ui/components/native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

interface MockDurableAsset {
  id: string;
  name: string;
  location: string;
  condition: 'serviceable' | 'repairable' | 'unserviceable_condemned';
  custodian: string;
  lastSurvey: string;
}

interface MockConsumableItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  reorderLevel: number;
  location: string;
}

export default function MobileInventoryRoute() {
  const [activeTab, setActiveTab] = useState<'durable' | 'consumable'>('durable');
  const [scannedFeedback, setScannedFeedback] = useState<string | null>(null);

  const durables: MockDurableAsset[] = [
    {
      id: 'eq_microscope_01',
      name: 'Compound Optical Microscope (Lab #2)',
      location: 'Senior Bio Lab A',
      condition: 'serviceable',
      custodian: 'P. Jayawardena (Lab Officer)',
      lastSurvey: '2026-01-15 (Survey General 47)',
    },
    {
      id: 'eq_pa_audio_system',
      name: 'Yamaha PA Portable Audio System',
      location: 'Main Auditorium',
      condition: 'serviceable',
      custodian: 'W. Perera (Music Dept)',
      lastSurvey: '2026-01-15 (Survey General 47)',
    },
    {
      id: 'eq_bench_lathe_04',
      name: 'Mechanical Bench Lathe (Metalwork)',
      location: 'Technical Workshop',
      condition: 'repairable',
      custodian: 'K. Silva (Tech Instructor)',
      lastSurvey: '2026-01-15 (Maintenance Pending)',
    },
  ];

  const consumables: MockConsumableItem[] = [
    {
      id: 'st_rice_samba',
      name: 'Samba Rice (Midday Meal)',
      unit: 'kg',
      quantity: 180,
      reorderLevel: 50,
      location: 'Central Kitchen Pantry',
    },
    {
      id: 'st_lentils_dhal',
      name: 'Red Split Lentils (Midday Meal)',
      unit: 'kg',
      quantity: 18,
      reorderLevel: 25, // Low stock!
      location: 'Central Kitchen Pantry',
    },
    {
      id: 'st_a4_paper_ream',
      name: 'White A4 Paper 80gsm (Term Tests)',
      unit: 'boxes',
      quantity: 45,
      reorderLevel: 10,
      location: 'School Stationery Store',
    },
  ];

  const handleSimulateQRScan = () => {
    const mockQR = 'ASSET:eq_microscope_01';
    const parsed = parseInstitutionalQR(mockQR);
    if (parsed.kind === 'asset') {
      const found = durables.find((d) => d.id === parsed.assetId);
      if (found) {
        setScannedFeedback(
          `Scanned Asset: ${found.name} (${found.location}) - Condition: ${found.condition}`,
        );
      } else {
        setScannedFeedback(`Scanned Asset ID: ${parsed.assetId}`);
      }
    }
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      {/* Header */}
      <View style={{ gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text kind="title" style={{ fontSize: 22, fontWeight: '700' }}>
            Materials & Asset Ledgers
          </Text>
          <Badge label="ERP Substrate" tone="lamp" />
        </View>
        <Text kind="body" tone="soft" style={{ fontSize: 13 }}>
          Statutory Board of Survey equipment and continuous consumable stock.
        </Text>
      </View>

      {/* Tab Switcher */}
      <Surface tone="raised" style={{ flexDirection: 'row', padding: 4, borderRadius: 12 }}>
        <Pressable
          style={{
            flex: 1,
            paddingVertical: 8,
            borderRadius: 8,
            alignItems: 'center',
            backgroundColor: activeTab === 'durable' ? 'rgba(0,0,0,0.06)' : 'transparent',
          }}
          onPress={() => setActiveTab('durable')}
        >
          <Text
            kind="body"
            style={{ fontSize: 13, fontWeight: '600' }}
            tone={activeTab === 'durable' ? 'ink' : 'soft'}
          >
            Durable Equipment
          </Text>
        </Pressable>
        <Pressable
          style={{
            flex: 1,
            paddingVertical: 8,
            borderRadius: 8,
            alignItems: 'center',
            backgroundColor: activeTab === 'consumable' ? 'rgba(0,0,0,0.06)' : 'transparent',
          }}
          onPress={() => setActiveTab('consumable')}
        >
          <Text
            kind="body"
            style={{ fontSize: 13, fontWeight: '600' }}
            tone={activeTab === 'consumable' ? 'ink' : 'soft'}
          >
            Consumable Stock
          </Text>
        </Pressable>
      </Surface>

      {/* QR Scanner Action Bar */}
      <Surface tone="raised" style={{ padding: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, marginRight: 8, gap: 2 }}>
          <Text kind="caption" tone="soft" style={{ fontSize: 11 }}>
            Fast Asset Barcode Lookup
          </Text>
          <Text kind="body" style={{ fontSize: 13, fontWeight: '600' }}>
            {scannedFeedback || 'Ready to scan QR / barcode'}
          </Text>
        </View>
        <Button
          size="sm"
          variant="primary"
          label="Scan Tag"
          onPress={handleSimulateQRScan}
        />
      </Surface>

      {/* Tab Content */}
      {activeTab === 'durable' ? (
        <View style={{ gap: 12 }}>
          <Text kind="title" style={{ fontSize: 15, fontWeight: '600' }}>
            Tracked Equipment & Board of Survey Audit
          </Text>
          {durables.map((item) => (
            <Surface key={item.id} tone="raised" style={{ padding: 16, borderRadius: 16 }}>
              <View style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text kind="title" style={{ fontSize: 14, fontWeight: '700', flex: 1, marginRight: 8 }}>
                    {item.name}
                  </Text>
                  <Badge
                    label={item.condition}
                    tone={item.condition === 'serviceable' ? 'success' : 'lamp'}
                  />
                </View>
                <Text kind="caption" tone="soft" style={{ fontSize: 12 }}>
                  📍 Location: {item.location}
                </Text>
                <Text kind="caption" tone="soft" style={{ fontSize: 12 }}>
                  👤 Custodian: {item.custodian}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: 8,
                    borderTopWidth: 1,
                    borderTopColor: 'rgba(0,0,0,0.06)',
                  }}
                >
                  <Text kind="caption" tone="soft" style={{ fontSize: 11 }}>
                    {item.lastSurvey}
                  </Text>
                  <Badge label="Form 47 Verified" tone="neutral" />
                </View>
              </View>
            </Surface>
          ))}
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          <Text kind="title" style={{ fontSize: 15, fontWeight: '600' }}>
            Operational Consumables & Reorder Alerts
          </Text>
          {consumables.map((item) => {
            const isLow = item.quantity <= item.reorderLevel;
            return (
              <Surface key={item.id} tone="raised" style={{ padding: 16, borderRadius: 16 }}>
                <View style={{ gap: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text kind="title" style={{ fontSize: 14, fontWeight: '700', flex: 1, marginRight: 8 }}>
                      {item.name}
                    </Text>
                    <Badge
                      label={isLow ? 'Low Stock' : 'Adequate'}
                      tone={isLow ? 'danger' : 'success'}
                    />
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                    <Text kind="title" style={{ fontSize: 16, fontWeight: '700' }}>
                      {item.quantity} {item.unit}
                    </Text>
                    <Text kind="caption" tone="soft" style={{ fontSize: 12 }}>
                      Reorder Min: {item.reorderLevel} {item.unit}
                    </Text>
                  </View>
                  <Text kind="caption" tone="soft" style={{ fontSize: 12 }}>
                    📍 {item.location}
                  </Text>
                </View>
              </Surface>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}
