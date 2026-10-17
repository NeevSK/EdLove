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
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function MobileEventsRoute() {
  const { t } = useTranslation();
  const router = useRouter();

  // State for daily midday meal simulation
  const [headcount, setHeadcount] = useState(120);
  const riceKg = (headcount * 0.08).toFixed(1); // 80g per child standard
  const dhalKg = (headcount * 0.02).toFixed(1); // 20g per child standard
  const estimatedMealCostLkr = headcount * 110; // 110 LKR statutory rate

  return (
    <ScrollView className="flex-1 bg-phase-canvas">
      <VStack className="p-4 gap-4">
        {/* Header */}
        <VStack className="gap-1">
          <HStack className="items-center justify-between">
            <Heading size="xl" className="text-phase-world font-bold">
              {t('workspace.eventsTitle', 'Institutional Programs')}
            </Heading>
            <Badge className="bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1">
              <BadgeText className="text-emerald-600 text-xs font-semibold">
                Quiet Sanctuary
              </BadgeText>
            </Badge>
          </HStack>
          <Text className="text-phase-muted text-sm">
            Daily nutritional programs, excursions, and facility schedules.
          </Text>
        </VStack>

        {/* Daily Midday Nutrition Program Card */}
        <View className="bg-phase-surface border border-phase-border/40 rounded-2xl p-4">
          <VStack className="gap-3">
            <HStack className="items-center justify-between">
              <HStack className="items-center gap-2">
                <View className="w-3 h-3 rounded-full bg-emerald-500" />
                <Heading size="md" className="text-phase-world font-bold">
                  Daily Midday Nutrition
                </Heading>
              </HStack>
              <Badge className="bg-blue-500/10 rounded-full px-2 py-0.5">
                <BadgeText className="text-blue-600 text-xs font-medium">Daily Cadence</BadgeText>
              </Badge>
            </HStack>

            <Text className="text-phase-muted text-xs">
              Ministry of Education School Nutrition Grant allocation based on morning classroom
              attendance headcount.
            </Text>

            {/* Ration calculation grid */}
            <HStack className="gap-3">
              <VStack className="flex-1 bg-phase-canvas/60 p-3 rounded-xl border border-phase-border/30">
                <Text className="text-phase-muted text-xs">Present Students</Text>
                <Heading size="lg" className="text-phase-world font-bold">
                  {headcount}
                </Heading>
                <HStack className="gap-2 mt-2">
                  <Pressable
                    className="bg-phase-border/40 px-2 py-1 rounded"
                    onPress={() => setHeadcount((c) => Math.max(10, c - 10))}
                  >
                    <Text className="text-xs font-bold text-phase-world">-10</Text>
                  </Pressable>
                  <Pressable
                    className="bg-phase-border/40 px-2 py-1 rounded"
                    onPress={() => setHeadcount((c) => c + 10)}
                  >
                    <Text className="text-xs font-bold text-phase-world">+10</Text>
                  </Pressable>
                </HStack>
              </VStack>

              <VStack className="flex-1 bg-phase-canvas/60 p-3 rounded-xl border border-phase-border/30">
                <Text className="text-phase-muted text-xs">Kitchen Rations</Text>
                <Text className="text-sm font-semibold text-phase-world mt-1">
                  🍚 Rice: {riceKg} kg
                </Text>
                <Text className="text-sm font-semibold text-phase-world mt-0.5">
                  🍲 Lentils: {dhalKg} kg
                </Text>
                <Text className="text-xs text-emerald-600 font-medium mt-1">
                  Rs. {estimatedMealCostLkr.toLocaleString()} grant
                </Text>
              </VStack>
            </HStack>

            <HStack className="justify-between items-center pt-1">
              <Text className="text-xs text-phase-muted">
                Funding: Ministry Midday Grant (100%)
              </Text>
              <Badge className="bg-emerald-500/10 rounded px-2 py-0.5">
                <BadgeText className="text-emerald-600 text-xs font-medium">
                  Stock Verified
                </BadgeText>
              </Badge>
            </HStack>
          </VStack>
        </View>

        {/* Upcoming Programs & Events */}
        <VStack className="gap-3 mt-1">
          <Heading size="md" className="text-phase-world font-semibold">
            Upcoming Institutional Events
          </Heading>

          {/* Event 1: Excursion */}
          <View className="bg-phase-surface border border-phase-border/40 rounded-2xl p-4">
            <VStack className="gap-2">
              <HStack className="items-center justify-between">
                <Heading size="sm" className="text-phase-world font-bold">
                  Grade 10 Botanical & Geography Excursion
                </Heading>
                <Badge className="bg-amber-500/10 rounded px-2 py-0.5">
                  <BadgeText className="text-amber-600 text-xs font-medium">Annual</BadgeText>
                </Badge>
              </HStack>
              <Text className="text-phase-muted text-xs">
                Peradeniya Botanical Gardens | 3 buses reserved | Parental consent active
              </Text>
              <HStack className="justify-between items-center pt-2 border-t border-phase-border/30">
                <Text className="text-xs font-medium text-phase-world">
                  Budget: Rs. 145,000 (SDS + Parent)
                </Text>
                <Badge className="bg-emerald-500/10 rounded px-2 py-0.5">
                  <BadgeText className="text-emerald-600 text-xs">Facility Confirmed</BadgeText>
                </Badge>
              </HStack>
            </VStack>
          </View>

          {/* Event 2: Sports Meet with Clash-Detection */}
          <View className="bg-phase-surface border border-phase-border/40 rounded-2xl p-4">
            <VStack className="gap-2">
              <HStack className="items-center justify-between">
                <Heading size="sm" className="text-phase-world font-bold">
                  Inter-House Track & Field Meet
                </Heading>
                <Badge className="bg-purple-500/10 rounded px-2 py-0.5">
                  <BadgeText className="text-purple-600 text-xs font-medium">School-Wide</BadgeText>
                </Badge>
              </HStack>
              <Text className="text-phase-muted text-xs">
                Main Athletic Grounds | Equipment: Starting blocks, hurdles, PA audio
              </Text>
              <HStack className="justify-between items-center pt-2 border-t border-phase-border/30">
                <Text className="text-xs font-medium text-phase-world">
                  Budget: Rs. 85,000 (SDS Fund)
                </Text>
                <Badge className="bg-blue-500/10 rounded px-2 py-0.5">
                  <BadgeText className="text-blue-600 text-xs">Grounds Reserved</BadgeText>
                </Badge>
              </HStack>
            </VStack>
          </View>
        </VStack>

        {/* Quick Navigation to Inventory */}
        <Button
          className="bg-phase-primary rounded-xl h-12 mt-2"
          onPress={() => router.push('/workspace/inventory')}
        >
          <ButtonText className="text-white font-semibold">
            View Materials & Asset Ledgers
          </ButtonText>
        </Button>
      </VStack>
    </ScrollView>
  );
}
