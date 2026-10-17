import { parseInstitutionalQR } from '@repo/scanner-kit';
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
    <ScrollView className="flex-1 bg-phase-canvas">
      <VStack className="p-4 gap-4">
        {/* Header */}
        <VStack className="gap-1">
          <HStack className="items-center justify-between">
            <Heading size="xl" className="text-phase-world font-bold">
              Materials & Asset Ledgers
            </Heading>
            <Badge className="bg-purple-500/10 border border-purple-500/20 rounded-full px-2.5 py-1">
              <BadgeText className="text-purple-600 text-xs font-semibold">ERP Substrate</BadgeText>
            </Badge>
          </HStack>
          <Text className="text-phase-muted text-sm">
            Statutory Board of Survey equipment and continuous consumable stock.
          </Text>
        </VStack>

        {/* Tab Switcher */}
        <HStack className="bg-phase-surface/80 p-1 rounded-xl border border-phase-border/40">
          <Pressable
            className={`flex-1 py-2 rounded-lg items-center ${
              activeTab === 'durable' ? 'bg-phase-canvas shadow-sm' : ''
            }`}
            onPress={() => setActiveTab('durable')}
          >
            <Text
              className={`text-sm font-semibold ${
                activeTab === 'durable' ? 'text-phase-world' : 'text-phase-muted'
              }`}
            >
              Durable Equipment
            </Text>
          </Pressable>
          <Pressable
            className={`flex-1 py-2 rounded-lg items-center ${
              activeTab === 'consumable' ? 'bg-phase-canvas shadow-sm' : ''
            }`}
            onPress={() => setActiveTab('consumable')}
          >
            <Text
              className={`text-sm font-semibold ${
                activeTab === 'consumable' ? 'text-phase-world' : 'text-phase-muted'
              }`}
            >
              Consumable Stock
            </Text>
          </Pressable>
        </HStack>

        {/* QR Scanner Action Bar */}
        <HStack className="bg-phase-surface p-3 rounded-xl border border-phase-border/40 items-center justify-between">
          <VStack className="flex-1 mr-2">
            <Text className="text-xs text-phase-muted">Fast Asset Barcode Lookup</Text>
            <Text className="text-sm font-semibold text-phase-world">
              {scannedFeedback || 'Ready to scan QR / barcode'}
            </Text>
          </VStack>
          <Button
            className="bg-phase-primary px-3 py-1.5 rounded-lg h-9"
            onPress={handleSimulateQRScan}
          >
            <ButtonText className="text-white text-xs font-bold">Scan Tag</ButtonText>
          </Button>
        </HStack>

        {/* Tab Content */}
        {activeTab === 'durable' ? (
          <VStack className="gap-3">
            <Heading size="sm" className="text-phase-world font-semibold">
              Tracked Equipment & Board of Survey Audit
            </Heading>
            {durables.map((item) => (
              <View
                key={item.id}
                className="bg-phase-surface border border-phase-border/40 rounded-2xl p-4"
              >
                <VStack className="gap-2">
                  <HStack className="items-center justify-between">
                    <Heading size="sm" className="text-phase-world font-bold flex-1 mr-2">
                      {item.name}
                    </Heading>
                    <Badge
                      className={`rounded px-2 py-0.5 ${
                        item.condition === 'serviceable' ? 'bg-emerald-500/10' : 'bg-amber-500/10'
                      }`}
                    >
                      <BadgeText
                        className={`text-xs font-medium ${
                          item.condition === 'serviceable' ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {item.condition}
                      </BadgeText>
                    </Badge>
                  </HStack>
                  <Text className="text-xs text-phase-muted">📍 Location: {item.location}</Text>
                  <Text className="text-xs text-phase-muted">👤 Custodian: {item.custodian}</Text>
                  <HStack className="justify-between items-center pt-2 border-t border-phase-border/30">
                    <Text className="text-xs text-phase-muted">{item.lastSurvey}</Text>
                    <Badge className="bg-purple-500/10 rounded px-2 py-0.5">
                      <BadgeText className="text-purple-600 text-xs">Form 47 Verified</BadgeText>
                    </Badge>
                  </HStack>
                </VStack>
              </View>
            ))}
          </VStack>
        ) : (
          <VStack className="gap-3">
            <Heading size="sm" className="text-phase-world font-semibold">
              Operational Consumables & Reorder Alerts
            </Heading>
            {consumables.map((item) => {
              const isLow = item.quantity <= item.reorderLevel;
              return (
                <View
                  key={item.id}
                  className="bg-phase-surface border border-phase-border/40 rounded-2xl p-4"
                >
                  <VStack className="gap-2">
                    <HStack className="items-center justify-between">
                      <Heading size="sm" className="text-phase-world font-bold flex-1 mr-2">
                        {item.name}
                      </Heading>
                      <Badge
                        className={`rounded px-2 py-0.5 ${
                          isLow ? 'bg-rose-500/10' : 'bg-emerald-500/10'
                        }`}
                      >
                        <BadgeText
                          className={`text-xs font-medium ${
                            isLow ? 'text-rose-600' : 'text-emerald-600'
                          }`}
                        >
                          {isLow ? 'Low Stock' : 'Adequate'}
                        </BadgeText>
                      </Badge>
                    </HStack>
                    <HStack className="items-center justify-between mt-1">
                      <Text className="text-base font-bold text-phase-world">
                        {item.quantity} {item.unit}
                      </Text>
                      <Text className="text-xs text-phase-muted">
                        Reorder Min: {item.reorderLevel} {item.unit}
                      </Text>
                    </HStack>
                    <Text className="text-xs text-phase-muted">📍 {item.location}</Text>
                  </VStack>
                </View>
              );
            })}
          </VStack>
        )}
      </VStack>
    </ScrollView>
  );
}
