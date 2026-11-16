import { Badge, Button, Surface, Text } from '@repo/ui/components/native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

export default function MobileEventsRoute() {
  const { t } = useTranslation();
  const router = useRouter();

  // State for daily midday meal simulation
  const [headcount, setHeadcount] = useState(120);
  const riceKg = (headcount * 0.08).toFixed(1); // 80g per child standard
  const dhalKg = (headcount * 0.02).toFixed(1); // 20g per child standard
  const estimatedMealCostLkr = headcount * 110; // 110 LKR statutory rate

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      {/* Header */}
      <View style={{ gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text kind="title" style={{ fontSize: 22, fontWeight: '700' }}>
            {t('workspace.eventsTitle', 'Institutional Programs')}
          </Text>
          <Badge label="Quiet Sanctuary" tone="lamp" />
        </View>
        <Text kind="body" tone="soft" style={{ fontSize: 13 }}>
          Daily nutritional programs, excursions, and facility schedules.
        </Text>
      </View>

      {/* Daily Midday Nutrition Program Card */}
      <Surface tone="raised" style={{ padding: 16, borderRadius: 16 }}>
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#10b981' }} />
              <Text kind="title" style={{ fontSize: 16, fontWeight: '700' }}>
                Daily Midday Nutrition
              </Text>
            </View>
            <Badge label="Daily Cadence" tone="neutral" />
          </View>

          <Text kind="caption" tone="soft" style={{ fontSize: 12 }}>
            Ministry of Education School Nutrition Grant allocation based on morning classroom
            attendance headcount.
          </Text>

          {/* Ration calculation grid */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Surface
              tone="inset"
              style={{ flex: 1, padding: 12, borderRadius: 12, gap: 4 }}
            >
              <Text kind="caption" tone="soft" style={{ fontSize: 11 }}>
                Present Students
              </Text>
              <Text kind="title" style={{ fontSize: 20, fontWeight: '700' }}>
                {headcount}
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                <Pressable
                  style={{ backgroundColor: 'rgba(0,0,0,0.06)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}
                  onPress={() => setHeadcount((c) => Math.max(10, c - 10))}
                >
                  <Text kind="caption" style={{ fontWeight: '700' }}>
                    -10
                  </Text>
                </Pressable>
                <Pressable
                  style={{ backgroundColor: 'rgba(0,0,0,0.06)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}
                  onPress={() => setHeadcount((c) => c + 10)}
                >
                  <Text kind="caption" style={{ fontWeight: '700' }}>
                    +10
                  </Text>
                </Pressable>
              </View>
            </Surface>

            <Surface
              tone="inset"
              style={{ flex: 1, padding: 12, borderRadius: 12, gap: 4 }}
            >
              <Text kind="caption" tone="soft" style={{ fontSize: 11 }}>
                Kitchen Rations
              </Text>
              <Text kind="body" style={{ fontSize: 13, fontWeight: '600' }}>
                🍚 Rice: {riceKg} kg
              </Text>
              <Text kind="body" style={{ fontSize: 13, fontWeight: '600' }}>
                🍲 Lentils: {dhalKg} kg
              </Text>
              <Text kind="caption" tone="lamp" style={{ fontSize: 12, fontWeight: '600', marginTop: 2 }}>
                Rs. {estimatedMealCostLkr.toLocaleString()} grant
              </Text>
            </Surface>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
            <Text kind="caption" tone="soft" style={{ fontSize: 11 }}>
              Funding: Ministry Midday Grant (100%)
            </Text>
            <Badge label="Stock Verified" tone="success" />
          </View>
        </View>
      </Surface>

      {/* Upcoming Programs & Events */}
      <View style={{ gap: 12, marginTop: 4 }}>
        <Text kind="title" style={{ fontSize: 16, fontWeight: '600' }}>
          Upcoming Institutional Events
        </Text>

        {/* Event 1: Excursion */}
        <Surface tone="raised" style={{ padding: 16, borderRadius: 16 }}>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text kind="title" style={{ fontSize: 14, fontWeight: '700', flex: 1 }}>
                Grade 10 Botanical & Geography Excursion
              </Text>
              <Badge label="Annual" tone="lamp" />
            </View>
            <Text kind="caption" tone="soft" style={{ fontSize: 12 }}>
              Peradeniya Botanical Gardens | 3 buses reserved | Parental consent active
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
              <Text kind="caption" style={{ fontWeight: '600' }}>
                Budget: Rs. 145,000 (SDS + Parent)
              </Text>
              <Badge label="Facility Confirmed" tone="success" />
            </View>
          </View>
        </Surface>

        {/* Event 2: Sports Meet with Clash-Detection */}
        <Surface tone="raised" style={{ padding: 16, borderRadius: 16 }}>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text kind="title" style={{ fontSize: 14, fontWeight: '700', flex: 1 }}>
                Inter-House Track & Field Meet
              </Text>
              <Badge label="School-Wide" tone="neutral" />
            </View>
            <Text kind="caption" tone="soft" style={{ fontSize: 12 }}>
              Main Athletic Grounds | Equipment: Starting blocks, hurdles, PA audio
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
              <Text kind="caption" style={{ fontWeight: '600' }}>
                Budget: Rs. 85,000 (SDS Fund)
              </Text>
              <Badge label="Grounds Reserved" tone="lamp" />
            </View>
          </View>
        </Surface>
      </View>

      {/* Quick Navigation to Inventory */}
      <View style={{ marginTop: 8 }}>
        <Button
          variant="primary"
          label="View Materials & Asset Ledgers"
          onPress={() => router.push('/workspace/inventory')}
        />
      </View>
    </ScrollView>
  );
}
