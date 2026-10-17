import {
  Badge,
  BadgeText,
  Heading,
  HStack,
  ScrollView,
  Text,
  View,
  VStack,
} from '@repo/ui/primitives';

export default function MobileWelfareRoute() {
  const student = {
    name: 'Kavindi Senanayake',
    grade: 'Grade 10-B',
    school: 'Ananda Balika National School',
    welfare: {
      tier: 'poor',
      status: 'active',
      expiresAt: '2026-12-31',
      certificateHash: 'welfare_bb_sha256_9f81a',
      statutoryWaiverPct: 100,
    },
    siblings: [
      { name: 'Kavindi Senanayake (Self)', grade: 10, discountPct: 0, waiverPct: 100 },
      { name: 'Tharindu Senanayake (Sibling 2)', grade: 7, discountPct: 25, waiverPct: 100 },
      { name: 'Nethmi Senanayake (Sibling 3)', grade: 3, discountPct: 50, waiverPct: 100 },
    ],
  };

  return (
    <ScrollView className="flex-1 bg-phase-canvas">
      <VStack className="p-4 gap-4">
        {/* Header */}
        <VStack className="gap-1">
          <HStack className="items-center justify-between">
            <Heading size="xl" className="text-phase-world font-bold">
              Economic Passport
            </Heading>
            <Badge className="bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1">
              <BadgeText className="text-emerald-600 text-xs font-semibold">
                13-Year Trajectory
              </BadgeText>
            </Badge>
          </HStack>
          <Text className="text-phase-muted text-sm">
            Temporal welfare eligibility, Aswesuma waivers, and sibling concessions.
          </Text>
        </VStack>

        {/* Student Welfare Profile Card */}
        <View className="bg-phase-surface border border-phase-border/40 rounded-2xl p-4">
          <VStack className="gap-3">
            <HStack className="items-center justify-between">
              <VStack>
                <Heading size="md" className="text-phase-world font-bold">
                  {student.name}
                </Heading>
                <Text className="text-xs text-phase-muted">
                  {student.grade} | {student.school}
                </Text>
              </VStack>
              <Badge className="bg-emerald-500/10 rounded-full px-2.5 py-1">
                <BadgeText className="text-emerald-600 text-xs font-bold">
                  Aswesuma: {student.welfare.tier.toUpperCase()}
                </BadgeText>
              </Badge>
            </HStack>

            <HStack className="bg-phase-canvas/70 p-3 rounded-xl border border-phase-border/30 justify-between items-center">
              <VStack>
                <Text className="text-xs text-phase-muted">Statutory Fee Waiver</Text>
                <Text className="text-lg font-bold text-emerald-600">
                  {student.welfare.statutoryWaiverPct}% Exemption
                </Text>
              </VStack>
              <VStack className="items-end">
                <Text className="text-xs text-phase-muted">Validity Expiration</Text>
                <Text className="text-xs font-semibold text-phase-world">
                  {student.welfare.expiresAt}
                </Text>
              </VStack>
            </HStack>

            <VStack className="gap-1 pt-1">
              <Text className="text-[11px] text-phase-muted font-mono">
                Cert Hash: {student.welfare.certificateHash}
              </Text>
              <Text className="text-xs text-phase-muted">
                Statutory zero-fee protection: Funded via Ministry Educational Welfare Subsidies.
                Zero phantom debt recognized.
              </Text>
            </VStack>
          </VStack>
        </View>

        {/* Sibling Cascade Concessions */}
        <VStack className="gap-2">
          <Heading size="sm" className="text-phase-world font-semibold">
            Household Sibling Cascade Order
          </Heading>
          <Text className="text-xs text-phase-muted">
            Derived deterministically from birthdates across enrolled school-going children.
          </Text>

          {student.siblings.map((sib, index) => (
            <View
              key={index}
              className="bg-phase-surface border border-phase-border/30 rounded-xl p-3"
            >
              <HStack className="items-center justify-between">
                <VStack>
                  <Text className="text-sm font-semibold text-phase-world">{sib.name}</Text>
                  <Text className="text-xs text-phase-muted">Grade {sib.grade}</Text>
                </VStack>
                <HStack className="gap-2 items-center">
                  {sib.discountPct > 0 && (
                    <Badge className="bg-blue-500/10 rounded px-2 py-0.5">
                      <BadgeText className="text-blue-600 text-xs">
                        -{sib.discountPct}% Sibling
                      </BadgeText>
                    </Badge>
                  )}
                  <Badge className="bg-emerald-500/10 rounded px-2 py-0.5">
                    <BadgeText className="text-emerald-600 text-xs">100% Waived</BadgeText>
                  </Badge>
                </HStack>
              </HStack>
            </View>
          ))}
        </VStack>

        {/* 13-Year Longitudinal Progress */}
        <View className="bg-phase-surface/80 border border-phase-border/30 rounded-xl p-3">
          <VStack className="gap-2">
            <Heading size="xs" className="text-phase-world font-bold uppercase tracking-wider">
              Longitudinal School Trajectory
            </Heading>
            <HStack className="items-center gap-2">
              <View className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <Text className="text-xs text-phase-world font-medium">
                Primary (Grades 1-5): Subsidized & Completed
              </Text>
            </HStack>
            <HStack className="items-center gap-2">
              <View className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <Text className="text-xs text-phase-world font-medium">
                Junior Secondary (Grades 6-9): Subsidized & Completed
              </Text>
            </HStack>
            <HStack className="items-center gap-2">
              <View className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <Text className="text-xs text-phase-world font-medium">
                Senior Secondary O-Level (Grade 10): Active Term
              </Text>
            </HStack>
            <HStack className="items-center gap-2">
              <View className="w-2.5 h-2.5 rounded-full bg-phase-muted/40" />
              <Text className="text-xs text-phase-muted">
                Collegiate A-Level (Grades 12-13): Planned
              </Text>
            </HStack>
          </VStack>
        </View>
      </VStack>
    </ScrollView>
  );
}
