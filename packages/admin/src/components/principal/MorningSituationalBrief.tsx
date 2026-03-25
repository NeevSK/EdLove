/**
 * MorningSituationalBrief
 *
 * First thing the principal sees each morning:
 *  - Staff presence strip (X of Y teachers present)
 *  - Student attendance pulse (today % + delta vs yesterday)
 *  - At-risk student count badge
 *  - Pending leave approvals badge
 */

import React, { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Box, HStack, VStack, Text, SkeletonCard, useThemedColors } from '@repo/ui';
import { Theme } from '@repo/ui';
import { approvalsAPI } from '../../approvals';
import {
  staffOperationsAPI,
  type StaffPresenceSummary,
  type StudentAttendancePulse,
} from '@repo/people';

interface MorningSituationalBriefProps {
  schoolId: string;
  onViewStaff?: () => void;
  onViewApprovals?: () => void;
}

function presenceColor(present: number, total: number): string {
  if (total === 0) return '#888';
  const pct = present / total;
  if (pct >= 0.9) return Theme.colors.sageGreen ?? '#4caf50';
  if (pct >= 0.7) return Theme.colors.amberGlow ?? '#ffc107';
  return Theme.colors.emberRed ?? '#f44336';
}

export default function MorningSituationalBrief({
  schoolId,
  onViewStaff,
  onViewApprovals,
}: MorningSituationalBriefProps) {
  const colors = useThemedColors();
  const [loading, setLoading] = useState(true);
  const [presence, setPresence] = useState<StaffPresenceSummary | null>(null);
  const [pulse, setPulse] = useState<StudentAttendancePulse | null>(null);
  const [pendingLeaves, setPendingLeaves] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const [pres, puls, leaves] = await Promise.all([
        staffOperationsAPI.getStaffPresenceSummary(schoolId),
        staffOperationsAPI.getStudentAttendancePulse(schoolId),
        approvalsAPI.listPendingLeaveApprovals(schoolId),
      ]);
      if (!mounted) return;
      setPresence(pres);
      setPulse(puls);
      setPendingLeaves(leaves.length);
      setLoading(false);
    }
    load();
    return () => {
      mounted = false;
    };
  }, [schoolId]);

  if (loading) {
    return (
      <VStack sx={{ gap: Theme.spacing.sm }}>
        <SkeletonCard height={56} />
        <SkeletonCard height={56} />
      </VStack>
    );
  }

  const dotColor = presence ? presenceColor(presence.present, presence.total) : colors.textSecondary;
  const attendanceDelta = pulse ? pulse.todayRate - pulse.yesterdayRate : 0;
  const deltaLabel =
    attendanceDelta > 0 ? `+${attendanceDelta}% vs yesterday` : attendanceDelta < 0 ? `${attendanceDelta}% vs yesterday` : 'same as yesterday';

  return (
    <VStack sx={{ gap: Theme.spacing.sm }}>
      <TouchableOpacity onPress={onViewStaff} activeOpacity={0.8}>
        <Box
          sx={{
            backgroundColor: colors.primary,
            borderRadius: Theme.corners.comfortable,
            padding: Theme.spacing.md,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <HStack sx={{ alignItems: 'center', gap: Theme.spacing.sm }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: dotColor,
              }}
            />
            <Text sx={{ flex: 1, fontSize: 14, color: colors.text, fontWeight: '600' }}>
              {presence ? `${presence.present} of ${presence.total} teachers present today` : 'No attendance data yet'}
            </Text>
            {onViewStaff && <Text sx={{ fontSize: 12, color: colors.textSecondary }}>View</Text>}
          </HStack>
        </Box>
      </TouchableOpacity>

      <HStack sx={{ gap: Theme.spacing.sm }}>
        <Box
          sx={{
            flex: 1,
            backgroundColor: colors.primary,
            borderRadius: Theme.corners.comfortable,
            padding: Theme.spacing.md,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text sx={{ fontSize: 12, color: colors.textSecondary, marginBottom: 2 }}>Student Attendance</Text>
          <Text sx={{ fontSize: 22, fontWeight: '700', color: colors.text }}>{pulse ? `${pulse.todayRate}%` : '-'}</Text>
          <Text
            sx={{
              fontSize: 11,
              color: attendanceDelta >= 0 ? (Theme.colors.sageGreen ?? '#4caf50') : (Theme.colors.emberRed ?? '#f44336'),
            }}
          >
            {pulse ? deltaLabel : ''}
          </Text>
        </Box>

        <Box
          sx={{
            flex: 1,
            backgroundColor: colors.primary,
            borderRadius: Theme.corners.comfortable,
            padding: Theme.spacing.md,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text sx={{ fontSize: 12, color: colors.textSecondary, marginBottom: 2 }}>At-Risk Students</Text>
          <Text
            sx={{
              fontSize: 22,
              fontWeight: '700',
              color: (pulse?.atRiskCount ?? 0) > 0 ? (Theme.colors.amberGlow ?? '#ffc107') : colors.text,
            }}
          >
            {pulse?.atRiskCount ?? 0}
          </Text>
          <Text sx={{ fontSize: 11, color: colors.textSecondary }}>{'attendance < 75%'}</Text>
        </Box>

        <TouchableOpacity onPress={onViewApprovals} activeOpacity={0.8} style={{ flex: 1 }}>
          <Box
            sx={{
              flex: 1,
              backgroundColor: colors.primary,
              borderRadius: Theme.corners.comfortable,
              padding: Theme.spacing.md,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text sx={{ fontSize: 12, color: colors.textSecondary, marginBottom: 2 }}>Pending Leaves</Text>
            <Text
              sx={{
                fontSize: 22,
                fontWeight: '700',
                color: pendingLeaves > 0 ? (Theme.colors.amberGlow ?? '#ffc107') : colors.text,
              }}
            >
              {pendingLeaves}
            </Text>
            {onViewApprovals && <Text sx={{ fontSize: 11, color: colors.textSecondary }}>Tap to review</Text>}
          </Box>
        </TouchableOpacity>
      </HStack>
    </VStack>
  );
}
