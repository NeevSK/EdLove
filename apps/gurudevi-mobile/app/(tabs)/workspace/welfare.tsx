import { Badge, Group, Surface, Text } from '@repo/ui/components/native';
import { View } from 'react-native';
import { MarkedLine, RoomPage } from '@/components/shell/RoomPage';

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

  const trajectory = [
    { stage: 'Primary (Grades 1-5)', state: 'Subsidized & Completed', tone: 'success' as const },
    {
      stage: 'Junior Secondary (Grades 6-9)',
      state: 'Subsidized & Completed',
      tone: 'success' as const,
    },
    { stage: 'Senior Secondary O-Level (Grade 10)', state: 'Active Term', tone: 'lamp' as const },
    { stage: 'Collegiate A-Level (Grades 12-13)', state: 'Planned', tone: 'neutral' as const },
  ];
  return (
    <RoomPage
      title="Economic Passport"
      intro="Temporal welfare eligibility, Aswesuma waivers, and sibling concessions."
      mark={{ label: '13-Year Trajectory', tone: 'success' }}
    >
      <Surface tone="raised" style={{ padding: 18, gap: 14 }}>
        <MarkedLine
          title={student.name}
          detail={`${student.grade} | ${student.school}`}
          mark={{ label: `Aswesuma: ${student.welfare.tier.toUpperCase()}`, tone: 'success' }}
        />
        <Surface
          tone="inset"
          style={{ padding: 14, flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}
        >
          <View style={{ gap: 2 }}>
            <Text kind="caption" tone="soft">
              Statutory Fee Waiver
            </Text>
            <Text kind="value">{student.welfare.statutoryWaiverPct}% Exemption</Text>
          </View>
          <View style={{ gap: 2, alignItems: 'flex-end' }}>
            <Text kind="caption" tone="soft">
              Validity Expiration
            </Text>
            <Text kind="label">{student.welfare.expiresAt}</Text>
          </View>
        </Surface>
        <Text kind="caption" tone="faint">
          Cert Hash: {student.welfare.certificateHash}
        </Text>
        <Text kind="caption" tone="soft">
          Statutory zero-fee protection: Funded via Ministry Educational Welfare Subsidies. Zero
          phantom debt recognized.
        </Text>
      </Surface>

      <Group
        label="Household Sibling Cascade Order"
        footer="Derived deterministically from birthdates across enrolled school-going children."
      >
        {student.siblings.map((sib) => (
          <View
            key={sib.name}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10 }}
          >
            <View style={{ flex: 1 }}>
              <Text kind="label">{sib.name}</Text>
              <Text kind="caption" tone="soft">
                Grade {sib.grade}
              </Text>
            </View>
            {sib.discountPct > 0 ? (
              <Badge label={`-${sib.discountPct}% Sibling`} tone="lamp" />
            ) : null}
            <Badge label={`${sib.waiverPct}% Waived`} tone="success" />
          </View>
        ))}
      </Group>

      <Group label="Longitudinal School Trajectory">
        {trajectory.map((step) => (
          <View key={step.stage} style={{ paddingVertical: 8 }}>
            <MarkedLine title={step.stage} mark={{ label: step.state, tone: step.tone }} />
          </View>
        ))}
      </Group>
    </RoomPage>
  );
}
