import { parseInstitutionalQR } from '@repo/scanner-kit';
import { Button, Group, SegmentedControl, Surface, Text } from '@repo/ui/components/native';
import { useState } from 'react';
import { View } from 'react-native';
import { MarkedLine, RoomPage } from '@/components/shell/RoomPage';

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
    <RoomPage
      title="Materials & Asset Ledgers"
      intro="Statutory Board of Survey equipment and continuous consumable stock."
      mark={{ label: 'ERP Substrate' }}
    >
      <SegmentedControl
        label="Ledger"
        value={activeTab}
        options={[
          { value: 'durable', label: 'Durable Equipment' },
          { value: 'consumable', label: 'Consumable Stock' },
        ]}
        onChange={setActiveTab}
      />

      <Surface
        tone="raised"
        style={{ padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}
      >
        <View style={{ flex: 1, gap: 2 }}>
          <Text kind="caption" tone="soft">
            Fast Asset Barcode Lookup
          </Text>
          <Text kind="label">{scannedFeedback || 'Ready to scan QR / barcode'}</Text>
        </View>
        <Button label="Scan Tag" variant="primary" size="sm" onPress={handleSimulateQRScan} />
      </Surface>

      {activeTab === 'durable' ? (
        <Group label="Tracked Equipment & Board of Survey Audit">
          {durables.map((item) => (
            <View key={item.id} style={{ gap: 6, paddingVertical: 12 }}>
              <MarkedLine
                title={item.name}
                mark={{
                  label: item.condition,
                  tone: item.condition === 'serviceable' ? 'success' : 'lamp',
                }}
              />
              <Text kind="caption" tone="soft">
                Location: {item.location}
              </Text>
              <Text kind="caption" tone="soft">
                Custodian: {item.custodian}
              </Text>
              <MarkedLine title={item.lastSurvey} mark={{ label: 'Form 47 Verified' }} />
            </View>
          ))}
        </Group>
      ) : (
        <Group label="Operational Consumables & Reorder Alerts">
          {consumables.map((item) => {
            const isLow = item.quantity <= item.reorderLevel;
            return (
              <View key={item.id} style={{ gap: 6, paddingVertical: 12 }}>
                <MarkedLine
                  title={item.name}
                  mark={{
                    label: isLow ? 'Low Stock' : 'Adequate',
                    tone: isLow ? 'danger' : 'success',
                  }}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                  <Text kind="value">
                    {item.quantity} {item.unit}
                  </Text>
                  <Text kind="caption" tone="soft">
                    Reorder Min: {item.reorderLevel} {item.unit}
                  </Text>
                </View>
                <Text kind="caption" tone="soft">
                  {item.location}
                </Text>
              </View>
            );
          })}
        </Group>
      )}
    </RoomPage>
  );
}
