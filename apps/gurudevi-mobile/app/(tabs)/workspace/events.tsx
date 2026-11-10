import { Button, Divider, Group, NumberStepper, Surface, Text } from '@repo/ui/components/native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { MarkedLine, RoomPage } from '@/components/shell/RoomPage';

const EVENTS = [
  {
    title: 'Grade 10 Botanical & Geography Excursion',
    kind: 'Annual',
    detail: 'Peradeniya Botanical Gardens | 3 buses reserved | Parental consent active',
    budget: 'Budget: Rs. 145,000 (SDS + Parent)',
    status: 'Facility Confirmed',
  },
  {
    title: 'Inter-House Track & Field Meet',
    kind: 'School-Wide',
    detail: 'Main Athletic Grounds | Equipment: Starting blocks, hurdles, PA audio',
    budget: 'Budget: Rs. 85,000 (SDS Fund)',
    status: 'Grounds Reserved',
  },
] as const;

export default function MobileEventsRoute() {
  const { t } = useTranslation();
  const router = useRouter();

  // Daily midday meal: rations follow the morning headcount.
  const [headcount, setHeadcount] = useState(120);
  const riceKg = (headcount * 0.08).toFixed(1); // 80g per child standard
  const dhalKg = (headcount * 0.02).toFixed(1); // 20g per child standard
  const estimatedMealCostLkr = headcount * 110; // 110 LKR statutory rate

  return (
    <RoomPage
      title={t('workspace.eventsTitle', 'Institutional Programs')}
      intro="Daily nutritional programs, excursions, and facility schedules."
      mark={{ label: 'Quiet Sanctuary', tone: 'success' }}
    >
      <Surface tone="raised" style={{ padding: 18, gap: 14 }}>
        <MarkedLine
          title="Daily Midday Nutrition"
          detail="Ministry of Education School Nutrition Grant allocation based on morning classroom attendance headcount."
          mark={{ label: 'Daily Cadence', tone: 'lamp' }}
        />
        <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
          <Surface tone="inset" style={{ flex: 1, minWidth: 150, padding: 14, gap: 8 }}>
            <NumberStepper
              label="Present Students"
              value={headcount}
              min={10}
              max={5000}
              step={10}
              onChange={setHeadcount}
            />
          </Surface>
          <Surface tone="inset" style={{ flex: 1, minWidth: 150, padding: 14, gap: 4 }}>
            <Text kind="caption" tone="soft">
              Kitchen Rations
            </Text>
            <Text kind="label">Rice: {riceKg} kg</Text>
            <Text kind="label">Lentils: {dhalKg} kg</Text>
            <Text kind="caption" tone="lamp">
              Rs. {estimatedMealCostLkr.toLocaleString()} grant
            </Text>
          </Surface>
        </View>
        <MarkedLine
          title="Funding: Ministry Midday Grant (100%)"
          mark={{ label: 'Stock Verified', tone: 'success' }}
        />
      </Surface>

      <Group label="Upcoming Institutional Events">
        {EVENTS.map((event, i) => (
          <View key={event.title} style={{ gap: 8, paddingVertical: 12 }}>
            {i > 0 ? <Divider style={{ marginBottom: 12 }} /> : null}
            <MarkedLine title={event.title} detail={event.detail} mark={{ label: event.kind }} />
            <MarkedLine title={event.budget} mark={{ label: event.status, tone: 'success' }} />
          </View>
        ))}
      </Group>

      <Button
        label="View Materials & Asset Ledgers"
        variant="primary"
        fullWidth
        onPress={() => router.push('/workspace/inventory')}
      />
    </RoomPage>
  );
}
