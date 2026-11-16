import { Badge, Surface, Text } from '@repo/ui/components/native';
import { ScrollView, View } from 'react-native';

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
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      {/* Header */}
      <View style={{ gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text kind="title" style={{ fontSize: 22, fontWeight: '700' }}>
            Economic Passport
          </Text>
          <Badge label="13-Year Trajectory" tone="success" />
        </View>
        <Text kind="body" tone="soft" style={{ fontSize: 13 }}>
          Temporal welfare eligibility, Aswesuma waivers, and sibling concessions.
        </Text>
      </View>

      {/* Student Welfare Profile Card */}
      <Surface tone="raised" style={{ padding: 16, borderRadius: 16 }}>
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text kind="title" style={{ fontSize: 16, fontWeight: '700' }}>
                {student.name}
              </Text>
              <Text kind="caption" tone="soft" style={{ fontSize: 12 }}>
                {student.grade} | {student.school}
              </Text>
            </View>
            <Badge label={`Aswesuma: ${student.welfare.tier.toUpperCase()}`} tone="success" />
          </View>

          <Surface tone="inset" style={{ padding: 12, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text kind="caption" tone="soft" style={{ fontSize: 11 }}>Statutory Fee Waiver</Text>
              <Text kind="title" tone="lamp" style={{ fontSize: 18, fontWeight: '700' }}>
                {student.welfare.statutoryWaiverPct}% Exemption
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text kind="caption" tone="soft" style={{ fontSize: 11 }}>Validity Expiration</Text>
              <Text kind="body" style={{ fontSize: 12, fontWeight: '600' }}>
                {student.welfare.expiresAt}
              </Text>
            </View>
          </Surface>

          <View style={{ gap: 4, paddingTop: 4 }}>
            <Text kind="caption" tone="soft" style={{ fontSize: 11, fontFamily: 'monospace' }}>
              Cert Hash: {student.welfare.certificateHash}
            </Text>
            <Text kind="caption" tone="soft" style={{ fontSize: 12 }}>
              Statutory zero-fee protection: Funded via Ministry Educational Welfare Subsidies.
              Zero phantom debt recognized.
            </Text>
          </View>
        </View>
      </Surface>

      {/* Sibling Cascade Concessions */}
      <View style={{ gap: 8 }}>
        <Text kind="title" style={{ fontSize: 15, fontWeight: '600' }}>
          Household Sibling Cascade Order
        </Text>
        <Text kind="caption" tone="soft" style={{ fontSize: 12 }}>
          Derived deterministically from birthdates across enrolled school-going children.
        </Text>

        {student.siblings.map((sib, index) => (
          <Surface key={index} tone="raised" style={{ padding: 12, borderRadius: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text kind="title" style={{ fontSize: 14, fontWeight: '600' }}>{sib.name}</Text>
                <Text kind="caption" tone="soft" style={{ fontSize: 12 }}>Grade {sib.grade}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                {sib.discountPct > 0 && (
                  <Badge label={`-${sib.discountPct}% Sibling`} tone="neutral" />
                )}
                <Badge label="100% Waived" tone="success" />
              </View>
            </View>
          </Surface>
        ))}
      </View>

      {/* 13-Year Longitudinal Progress */}
      <Surface tone="raised" style={{ padding: 14, borderRadius: 12 }}>
        <View style={{ gap: 10 }}>
          <Text kind="title" style={{ fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Longitudinal School Trajectory
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#10b981' }} />
            <Text kind="caption" style={{ fontSize: 12, fontWeight: '500' }}>
              Primary (Grades 1-5): Subsidized & Completed
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#3b82f6' }} />
            <Text kind="caption" style={{ fontSize: 12, fontWeight: '500' }}>
              Junior Secondary (Grades 6-9): Subsidized & Completed
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#f59e0b' }} />
            <Text kind="caption" style={{ fontSize: 12, fontWeight: '500' }}>
              Senior Secondary O-Level (Grade 10): Active Term
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(0,0,0,0.2)' }} />
            <Text kind="caption" tone="soft" style={{ fontSize: 12 }}>
              Collegiate A-Level (Grades 12-13): Planned
            </Text>
          </View>
        </View>
      </Surface>
    </ScrollView>
  );
}
