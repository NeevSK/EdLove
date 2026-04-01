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
import { api } from '@repo/core';
import {
  staffOperationsAPI,
  type StaffPresenceSummary,
  type StudentAttendancePulse,
} from '@repo/people';

interface MorningSituationalBriefProps {
  schoolId: string;
  principalId?: string;
  viewDate?: string;
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
  principalId,
  viewDate,
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
      try {
        const [pres, puls, leaves] = await Promise.all([
          staffOperationsAPI.getStaffPresenceSummary(schoolId),
          api.attendance.getSchoolAttendancePulse(schoolId, undefined, viewDate, {
            actorId: principalId,
            accessKind: 'institutional_read',
            reason: 'principal_morning_brief',
          }),
          approvalsAPI.listPendingLeaveApprovals(schoolId),
        ]);
        if (!mounted) return;
        setPresence(pres);
        setPulse(puls);
        setPendingLeaves(leaves?.length || 0);
      } catch (error) {
        console.error('Error loading morning brief data:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [principalId, schoolId, viewDate]);

  if (loading) {
    return (
      <VStack sx={{ gap: Theme.spacing.sm }}>
        <SkeletonCard height={56} />
        <SkeletonCard height={56} />
      </VStack>
    );
  }

  const dotColor = presence ? presenceColor(presence.present, presence.total) : (colors?.textSecondary || '#aaa');
  const attendanceDelta = pulse ? pulse.todayRate - pulse.yesterdayRate : 0;
  const deltaLabel = attendanceDelta > 0 
    ? `+${attendanceDelta}% vs yesterday` 
    : attendanceDelta < 0 
      ? `${attendanceDelta}% vs yesterday` 
      : 'same as yesterday';

  return (
    <VStack sx={{ gap: Theme.spacing.sm }}>
      {/* Staff Presence Strip */}
      <TouchableOpacity 
        onPress={onViewStaff} 
        activeOpacity={0.8}
        disabled={!onViewStaff}
      >
        <Box
          sx={{
            backgroundColor: colors?.primary || Theme.colors.ink,
            borderRadius: Theme.corners.comfortable,
            padding: Theme.spacing.md,
            borderWidth: 1,
            borderColor: colors?.border || 'rgba(255,255,255,0.1)',
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
            <Text sx={{ flex: 1, fontSize: 14, color: colors?.text || '#fff', fontWeight: '600' }}>
              {presence ? `${presence.present} of ${presence.total} teachers present today` : 'No attendance data yet'}
            </Text>
            {onViewStaff && (
              <Text sx={{ fontSize: 12, color: colors?.textSecondary || '#aaa' }}>View</Text>
            )}
          </HStack>
        </Box>
      </TouchableOpacity>

      {/* Row of 3 stats */}
      <HStack sx={{ gap: Theme.spacing.sm }}>
        {/* Student Attendance */}
        <Box
          sx={{
            flex: 1,
            backgroundColor: colors?.primary || Theme.colors.ink,
            borderRadius: Theme.corners.comfortable,
            padding: Theme.spacing.md,
            borderWidth: 1,
            borderColor: colors?.border || 'rgba(255,255,255,0.1)',
          }}
        >
          <Text sx={{ fontSize: 12, color: colors?.textSecondary || '#aaa', marginBottom: 2 }}>
            Student Attendance
          </Text>
          <Text sx={{ fontSize: 22, fontWeight: '700', color: colors?.text || '#fff' }}>
            {pulse ? `${pulse.todayRate}%` : '-'}
          </Text>
          <Text
            sx={{
              fontSize: 11,
              color: attendanceDelta >= 0 
                ? (Theme.colors.sageGreen ?? '#4caf50') 
                : (Theme.colors.emberRed ?? '#f44336'),
            }}
          >
            {pulse ? deltaLabel : ''}
          </Text>
        </Box>

        {/* At-Risk Students */}
        <Box
          sx={{
            flex: 1,
            backgroundColor: colors?.primary || Theme.colors.ink,
            borderRadius: Theme.corners.comfortable,
            padding: Theme.spacing.md,
            borderWidth: 1,
            borderColor: colors?.border || 'rgba(255,255,255,0.1)',
          }}
        >
          <Text sx={{ fontSize: 12, color: colors?.textSecondary || '#aaa', marginBottom: 2 }}>
            At-Risk Students
          </Text>
          <Text
            sx={{
              fontSize: 22,
              fontWeight: '700',
              color: (pulse?.atRiskCount ?? 0) > 0 ? (Theme.colors.amberGlow ?? '#ffc107') : (colors?.text || '#fff'),
            }}
          >
            {pulse?.atRiskCount ?? 0}
          </Text>
          <Text sx={{ fontSize: 11, color: colors?.textSecondary || '#aaa' }}>
            {'attendance < 75%'}
          </Text>
        </Box>

        {/* Pending Leaves */}
        <TouchableOpacity 
          onPress={onViewApprovals} 
          activeOpacity={0.8} 
          style={{ flex: 1 }}
          disabled={!onViewApprovals}
        >
          <Box
            sx={{
              flex: 1,
              backgroundColor: colors?.primary || Theme.colors.ink,
              borderRadius: Theme.corners.comfortable,
              padding: Theme.spacing.md,
              borderWidth: 1,
              borderColor: colors?.border || 'rgba(255,255,255,0.1)',
            }}
          >
            <Text sx={{ fontSize: 12, color: colors?.textSecondary || '#aaa', marginBottom: 2 }}>
              Pending Leaves
            </Text>
            <Text
              sx={{
                fontSize: 22,
                fontWeight: '700',
                color: pendingLeaves > 0 ? (Theme.colors.amberGlow ?? '#ffc107') : (colors?.text || '#fff'),
              }}
            >
              {pendingLeaves}
            </Text>
            {onViewApprovals && (
              <Text sx={{ fontSize: 11, color: colors?.textSecondary || '#aaa' }}>
                Tap to review
              </Text>
            )}
          </Box>
        </TouchableOpacity>
      </HStack>
    </VStack>
  );
}
